-- Multi-tenant foundation: organizations + users + membership.
-- Required by the auth + org-scope middleware shipped with this skeleton.

BEGIN;

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
  deleted_at  timestamptz,
  CONSTRAINT users_email_unique UNIQUE (email)
);

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

-- citext for case-insensitive email comparisons
CREATE EXTENSION IF NOT EXISTS citext;

COMMIT;
