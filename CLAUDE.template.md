# {{PROJECT_TITLE}}

{{PROJECT_DESCRIPTION}}

## Quick Navigation

| Need | File |
|------|------|
| Current work & pending tasks | `bd list` (Beads) — or `docs/ACTIVE_TASKS.md` |
| Completed phases & history | `docs/IMPLEMENTATION_HISTORY.md` |
| Coding standards | `docs/coding-principles.md` |
| Architecture decisions log | `docs/adr/` |
| Architecture (if non-trivial) | `docs/ai-instructions/ARCHITECTURE.md` |
| Patterns reference | `docs/ai-instructions/PATTERNS.md` |
| Non-negotiable rules | `docs/ai-instructions/RULES.md` |
| Required env vars | `.env.example` |
| Security policy | `SECURITY.md` |
| Contributing guidelines | `CONTRIBUTING.md` |

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
3. **Containerized + k8s-ready** — every service has a multi-stage Dockerfile, runs as non-root, exposes `/healthz` + `/readyz`, takes config via env, logs to stdout. `docker compose up` brings up the full stack. (Delete if pure local CLI/script.)
4. **Parameterized SQL only** — never interpolate user input. (Delete if no DB.)
5. **Every query includes `org_id`** — multi-tenant isolation. (Delete if single-tenant.)
6. **All UI text through `t('key', 'Fallback')`** — support i18n from day one. (Delete if no UI or English-only by design.)
7. **Forward-only migrations** — never modify existing migration files. (Delete if no DB migrations.)
8. **Soft delete only** — use `deleted_at`, never hard delete. (Delete if not applicable.)
9. **Structured logs** — JSON to stdout with correlation IDs. Never log secrets.
10. **Use `bd` for tasks** — never create TODO.md files or use TodoWrite.
11. **Update docs after structural changes** — `INDEX.md` in each service.

## Key Patterns

<!--
DO NOT duplicate patterns that already live in `docs/ai-instructions/PATTERNS.md`.
Either link to them ("See PATTERNS.md → Route Factory") or put the canonical
description here AND delete the section from PATTERNS.md.
Single source of truth. No copy-paste.
-->

See [`docs/ai-instructions/PATTERNS.md`](docs/ai-instructions/PATTERNS.md) for the canonical pattern reference (route factories, request context, queue consumer, DB conventions). Only document **project-specific** patterns in this CLAUDE.md.

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

## Team Lead Mode (mandatory for non-trivial work)

You operate as this project's team lead. Agents are installed in `.claude/agents/` — **use them**. Do not do everything yourself.

### Core loop for every non-trivial request:
1. **Analyze** — what is being asked, which disciplines does this touch?
2. **Enrich** — spawn relevant specialist agents **in parallel** to gather considerations the user didn't explicitly ask for.
3. **Plan** — synthesize enrichment into an approach. Present to the user if non-trivial.
4. **Execute** — build it yourself (most of the work) or delegate complex subtasks to specialists.
5. **Verify** — spawn reviewers (`engineering-code-reviewer`, `testing-reality-checker`) for post-build checks.

Skip the loop only for: pure exploration, git operations, trivial edits, or when the user already gave complete instructions.

### Enrichment rules — when to spawn which agent

<!--
Fill in the rules that match this project's type during init.
Delete the rules that don't apply.
-->

**Web app project — required consultations:**
- Any frontend/UI change → spawn `design-ux-architect` + `testing-accessibility-auditor` + `design-ui-designer` in parallel
- Any DB migration or query change → spawn `engineering-database-optimizer`
- Any API route change → spawn `engineering-backend-architect`
- Any auth or multi-tenant change → spawn `engineering-backend-architect` (with explicit security context)
- Any performance-sensitive change → spawn `testing-performance-benchmarker`
- Any deploy/CI/infra change → spawn `engineering-devops-automator`
- Before merging non-trivial work → spawn `engineering-code-reviewer`

**CLI project — required consultations:**
- New command or major refactor → spawn `engineering-backend-architect`
- Quick exploratory feature → spawn `engineering-rapid-prototyper`
- Before merging non-trivial work → spawn `engineering-code-reviewer`

**Universal:**
- Onboarding to an unfamiliar area of the code → spawn `engineering-codebase-onboarding-engineer`
- Verifying any claim that "this works" → spawn `testing-reality-checker`
- Git workflow / PR / branch strategy questions → spawn `engineering-git-workflow-master`
- Anything that smells like overengineering → spawn `engineering-minimal-change-engineer`

### How to spawn agents

Use the `Agent` tool with `subagent_type` set to the agent's filename (without `.md`). Run independent agents **in parallel** (multiple Agent calls in one message). Ask each agent for **max 5 concrete points** relevant to the specific change.

Example brief for a frontend change:
> "We're adding a new project-settings page at `src/web-portal/app/projects/[id]/settings/page.tsx`. Review against accessibility (WCAG AA), responsiveness, and consistency with the existing settings pattern in `src/web-portal/app/account/settings/page.tsx`. Max 5 concrete points."

### What NOT to do

- ❌ Don't do everything yourself when an agent has more context — that wastes both their value and your context window.
- ❌ Don't ask agents vague questions like "review this" — give them the file path, the change, and what specifically to evaluate.
- ❌ Don't run agents sequentially when they're independent — batch them.
- ❌ Don't ignore an agent's recommendation without explaining why in your reply.
