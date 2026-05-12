#!/usr/bin/env node
// migrate.mjs — tiny forward-only SQL migration runner.
//
// Reads NNN_*.sql files from ops/infra/db/migrations/ in lexical order
// and applies any that haven't been applied yet. Tracks applied versions
// in a `schema_migrations` table.
//
// Usage:
//   node ops/scripts/migrate.mjs              # apply pending
//   node ops/scripts/migrate.mjs --status     # show pending + applied
//   node ops/scripts/migrate.mjs --version    # show current version
//
// Convention: every migration is wrapped in `BEGIN; ... COMMIT;` so
// failures don't leave partial state.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
// In Docker we set MIGRATIONS_DIR explicitly. Locally fall back to the
// repo layout (ops/scripts/migrate.mjs reads from ops/infra/db/migrations/).
const MIGRATIONS_DIR =
  process.env.MIGRATIONS_DIR ?? join(__dirname, '..', 'infra', 'db', 'migrations');

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

try {
  await client.query(SCHEMA_MIGRATIONS_SQL);

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
    [...applied].sort().forEach((v) => console.log(`  ✓ ${v}`));
    console.log(`Pending: ${pending.length}`);
    pending.forEach((v) => console.log(`  · ${v}`));
    process.exit(0);
  }

  if (pending.length === 0) {
    console.log('No pending migrations.');
    process.exit(0);
  }

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    if (!/^\s*BEGIN\s*;/im.test(sql) || !/COMMIT\s*;\s*$/im.test(sql)) {
      console.error(`✗ ${file}: must be wrapped in BEGIN; ... COMMIT;`);
      process.exit(1);
    }
    process.stdout.write(`Applying ${file}... `);
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      console.log('OK');
    } catch (err) {
      console.error(`\n✗ ${file} failed:`, err.message ?? err);
      process.exit(1);
    }
  }

  console.log(`\nApplied ${pending.length} migration(s).`);
} finally {
  await client.end();
}
