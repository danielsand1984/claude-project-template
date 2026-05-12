# {{PROJECT_TITLE}}

{{PROJECT_DESCRIPTION}}

## Quick Navigation

| Need | File |
|------|------|
| Current work & pending tasks | `bd list` (Beads) — or `docs/ACTIVE_TASKS.md` |
| Completed phases & history | `docs/IMPLEMENTATION_HISTORY.md` |
| Coding standards | `docs/coding-principles.md` |
| Architecture (if non-trivial) | `docs/ai-instructions/ARCHITECTURE.md` |
| Patterns reference | `docs/ai-instructions/PATTERNS.md` |
| Non-negotiable rules | `docs/ai-instructions/RULES.md` |

## Architecture

<!--
KEEP THIS SHORT. A diagram or 5-line summary, not an essay.
Delete this section entirely if the project is a single binary / CLI / library.
-->

```
{{ASCII_DIAGRAM_OR_BULLETS}}
```

## Tech Stack

| Layer | Stack |
|-------|-------|
| {{LAYER_1}} | {{STACK_1}} |
| {{LAYER_2}} | {{STACK_2}} |

## Project Structure

```
{{PROJECT_TREE}}
```

## Critical Rules

<!--
Only keep rules that actually apply to this project.
Delete the ones that don't — empty rules erode authority of the ones that remain.
-->

1. **Files under 200 lines** — split when larger; classes under 5 public methods.
2. **No `any` types** in TypeScript — use Zod / typed schemas at boundaries.
3. **Parameterized SQL only** — never interpolate user input. (Delete if no DB.)
4. **Every query includes `org_id`** — multi-tenant isolation. (Delete if single-tenant.)
5. **All UI text through `t('key', 'Fallback')`** — support i18n from day one. (Delete if no UI or English-only by design.)
6. **Forward-only migrations** — never modify existing migration files. (Delete if no DB migrations.)
7. **Soft delete only** — use `deleted_at`, never hard delete. (Delete if not applicable.)
8. **Structured logs** — JSON with correlation IDs. Never log secrets.
9. **Use `bd` for tasks** — never create TODO.md files or use TodoWrite.
10. **Update docs after structural changes** — `INDEX.md` in each service.

## Key Patterns

<!-- Add only the patterns that are non-obvious AND repeated. -->

## Development Commands

```bash
{{DEV_COMMANDS}}
```

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Folders | kebab-case | `api-bff`, `audio-ingest` |
| TS files | camelCase | `llmClient.ts` |
| TS classes | PascalCase | `ApiBffClient` |
| TS functions | camelCase | `createRouter()` |
| Python files | snake_case | `azure_provider.py` |
| Python functions | snake_case | `get_provider()` |
| DB tables/columns | snake_case | `org_role`, `created_at` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |
| Error codes | UPPER_SNAKE | `RATE_LIMITED` |

## Workflow

1. Check `bd list` for current priorities (or `docs/ACTIVE_TASKS.md`).
2. Read the relevant `INDEX.md` before modifying a service / module.
3. Follow patterns in `docs/ai-instructions/PATTERNS.md`.
4. Run tests after changes.
5. Close the Beads issue with `bd close <id>` once done.
