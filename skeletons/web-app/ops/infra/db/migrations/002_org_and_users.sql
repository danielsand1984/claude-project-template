-- Multi-tenant foundation: organizations + users + membership.
-- Required by the auth + org-scope middleware shipped with this skeleton.

BEGIN;

-- Extensions FIRST: citext is used below for case-insensitive emails.
CREATE EXTENSION IF NOT EXISTS citext;
-- (pgcrypto is included on PG 13+ by default; uncomment if your PG version needs it
-- explicitly for gen_random_uuid())
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(255) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       citext NOT NULL,
  display_name varchar(255),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- Partial unique index: only active (non-soft-deleted) emails must be unique.
-- A soft-deleted alice@x.com does not block a new signup with the same email.
CREATE UNIQUE INDEX users_email_active_uniq
  ON users (email) WHERE deleted_at IS NULL;

CREATE TABLE user_org_membership (
  user_id     uuid NOT NULL REFERENCES users(id),
  org_id      uuid NOT NULL REFERENCES organizations(id),
  role        varchar(32) NOT NULL CHECK (role IN ('admin', 'member')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  PRIMARY KEY (user_id, org_id)
);

CREATE INDEX user_org_membership_org_idx ON user_org_membership (org_id) WHERE deleted_at IS NULL;
CREATE INDEX user_org_membership_user_idx ON user_org_membership (user_id) WHERE deleted_at IS NULL;

COMMIT;
