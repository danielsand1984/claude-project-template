-- The migration runner creates `schema_migrations` itself before running,
-- but we record it as 001 so the migration history makes sense.

BEGIN;

-- (table already created by the runner; this is a no-op for documentation)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    varchar(255) PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now(),
  checksum   varchar(64)
);

COMMIT;
