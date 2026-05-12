# Coding Rules

Non-negotiable rules. Violations must be flagged and fixed immediately.

> Customize this file during project init: **delete rules that don't apply** to your project. An eroded-but-real list is more useful than a complete-but-ignored one.

## Security

1. **SQL Safety**: Always use parameterized queries. Never interpolate user input into SQL.
2. **Multi-Tenant Isolation**: Every tenant-scoped query MUST filter by `org_id`. No exceptions. (Delete if single-tenant.)
3. **Auth Required**: All non-public routes require authentication. Public routes are explicitly registered.
4. **No Hardcoded Secrets**: Use env vars or a credentials table. Never commit credentials.
5. **Credential Masking**: Never return full API keys/secrets in API responses.

## Code Quality

6. **Translations**: All user-facing strings go through the translation hook. (Delete if no UI.)
7. **Type Safety**: Use Zod / Pydantic schemas for boundary validation. Avoid `any` / untyped dicts.
8. **Small Files**: Keep files under 200 lines, classes under 5 public methods. Split when larger.
9. **Thin Controllers**: Business logic belongs in service/repository layer, not route handlers.
10. **State Transitions**: Validate state changes against an explicit `VALID_TRANSITIONS` map.

## Operations

11. **Migration Safety**: Forward-only. Never modify existing migration files. Wrap in `BEGIN; ... COMMIT;`.
12. **Structured Logging**: JSON format with correlation IDs. Never log secrets.
13. **Idempotent Workers**: Workers are stateless and horizontally scalable. Process messages idempotently.

## Documentation

14. **INDEX.md Required**: Each major area has a navigation INDEX.md. Keep them current.
15. **Architecture Map**: Update `docs/ARCHITECTURE_MAP.md` when changing project structure.

## What NOT to do

- Don't create TODO files — use Beads (`bd`).
- Don't create session summaries — append to `docs/IMPLEMENTATION_HISTORY.md`.
- Don't skip `org_id` in any tenant-scoped database query.
- Don't use `any` type in TypeScript or untyped dicts in Python past validation boundaries.
- Don't hard delete records — use soft delete with `deleted_at`.
- Don't skip tests for new features.
- Don't commit without running linters.
