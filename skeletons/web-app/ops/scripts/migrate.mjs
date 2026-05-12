#!/usr/bin/env node
// migrate.mjs — forward-only SQL migration runner.
//
// Reads NNN_*.sql files from ops/infra/db/migrations/ in lexical order
// and applies any that haven't been applied yet. Tracks applied versions
// in a `schema_migrations` table.
//
// Concurrency: acquires a Postgres advisory lock for the duration of the
// apply loop. Two parallel migrate processes (CI race, blue/green deploy)
// serialize cleanly — the second sees the first's writes after it runs.
//
// Atomicity: each migration's SQL + the schema_migrations insert run in
// ONE runner-controlled transaction. If the process dies mid-migration,
// the DB rolls back and the next run finds the file as "pending" again.
// Migration files may include BEGIN/COMMIT (they get stripped) — the
// runner controls the transaction boundary.
//
// Usage:
//   node ops/scripts/migrate.mjs              # apply pending
//   node ops/scripts/migrate.mjs --status     # show pending + applied
//   node ops/scripts/migrate.mjs --version    # show current version

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR =
  process.env.MIGRATIONS_DIR ?? join(__dirname, '..', 'infra', 'db', 'migrations');

// Stable advisory lock id. Arbitrary but constant across runs.
// Pick something unique to this project if you run multiple apps against
// the same DB cluster (advisory locks share a namespace per database).
const ADVISORY_LOCK_ID = 4675847584758;

const SCHEMA_MIGRATIONS_SQL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version     varchar(255) PRIMARY KEY,
    applied_at  timestamptz NOT NULL DEFAULT now(),
    checksum    varchar(64)
  )
`;

const args = new Set(process.argv.slice(2));
const showStatus = args.has('--status');
const showVersion = args.has('--version');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

let lockHeld = false;
const releaseLock = async () => {
  if (lockHeld) {
    try { await client.query(`SELECT pg_advisory_unlock(${ADVISORY_LOCK_ID})`); } catch { /* nothing to do */ }
    lockHeld = false;
  }
};
process.on('SIGINT',  async () => { await releaseLock(); await client.end().catch(() => undefined); process.exit(130); });
process.on('SIGTERM', async () => { await releaseLock(); await client.end().catch(() => undefined); process.exit(143); });

try {
  await client.query(SCHEMA_MIGRATIONS_SQL);

  // Acquire advisory lock for the apply loop. Blocks until available.
  await client.query(`SELECT pg_advisory_lock(${ADVISORY_LOCK_ID})`);
  lockHeld = true;

  const applied = new Set(
    (await client.query('SELECT version FROM schema_migrations ORDER BY version')).rows.map(
      (r) => r.version,
    ),
  );

  const all = readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{3,}_.*\.sql$/.test(f))
    .sort();

  const pending = all.filter((f) => !applied.has(f));

  if (showVersion) {
    const max = [...applied].sort().pop();
    console.log(max ?? '(none applied)');
    process.exit(0);
  }

  if (showStatus) {
    console.log(`Applied: ${applied.size}`);
    [...applied].sort().forEach((v) => console.log(`  + ${v}`));
    console.log(`Pending: ${pending.length}`);
    pending.forEach((v) => console.log(`  - ${v}`));
    process.exit(0);
  }

  if (pending.length === 0) {
    console.log('No pending migrations.');
    process.exit(0);
  }

  for (const file of pending) {
    const raw = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    // Strip any file-level BEGIN/COMMIT so the runner controls the
    // transaction. The schema_migrations insert MUST be in the same
    // transaction as the migration SQL — otherwise a crash between
    // them leaves the DB ahead of the ledger.
    const body = raw
      .replace(/^\s*BEGIN\s*;?\s*/im, '')
      .replace(/\s*COMMIT\s*;?\s*$/im, '');

    process.stdout.write(`Applying ${file}... `);
    try {
      await client.query('BEGIN');
      await client.query(body);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('OK');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      console.error(`\n  X ${file} failed:`, err.message ?? err);
      process.exit(1);
    }
  }

  console.log(`\nApplied ${pending.length} migration(s).`);
} finally {
  await releaseLock();
  await client.end();
}
