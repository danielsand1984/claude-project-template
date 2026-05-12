#!/usr/bin/env node
// seed.mjs — local development seed data.
//
// Idempotent: re-running won't duplicate rows. Only runs when NODE_ENV !== 'production'.
//
// Creates two dev users matching devCredentialsProvider:
//   - admin@dev.local  (org admin)
//   - member@dev.local (org member)

import pg from 'pg';

const { Client } = pg;

if (process.env.NODE_ENV === 'production') {
  console.error('Seed must not run in production.');
  process.exit(1);
}

const ORG_ID = '00000000-0000-0000-0000-000000000010';
const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const MEMBER_ID = '00000000-0000-0000-0000-000000000002';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query('BEGIN');

  await client.query(
    `INSERT INTO organizations (id, name) VALUES ($1, $2)
     ON CONFLICT (id) DO NOTHING`,
    [ORG_ID, 'Dev Organization'],
  );

  await client.query(
    `INSERT INTO users (id, email, display_name) VALUES
       ($1, 'admin@dev.local',  'Dev Admin'),
       ($2, 'member@dev.local', 'Dev Member')
     ON CONFLICT (id) DO NOTHING`,
    [ADMIN_ID, MEMBER_ID],
  );

  await client.query(
    `INSERT INTO user_org_membership (user_id, org_id, role) VALUES
       ($1, $3, 'admin'),
       ($2, $3, 'member')
     ON CONFLICT (user_id, org_id) DO NOTHING`,
    [ADMIN_ID, MEMBER_ID, ORG_ID],
  );

  await client.query('COMMIT');
  console.log(`Seeded org ${ORG_ID} with 2 dev users.`);
  console.log(`Use these in dev: Authorization: Bearer dev-admin | dev-member  +  X-Org-Id: ${ORG_ID}`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message ?? err);
  process.exit(1);
} finally {
  await client.end();
}
