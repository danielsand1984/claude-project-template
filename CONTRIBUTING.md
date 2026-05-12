# Contributing

Thanks for considering a contribution. This project is small and opinionated; please read this before opening a PR.

## Workflow

1. **Pick or create an issue** — Beads (`bd list`) or GitHub Issues. PRs without a tracked issue may be closed.
2. **Branch** from `main`: `git checkout -b <type>/<short-description>`. Types: `feat`, `fix`, `chore`, `refactor`, `docs`.
3. **Code** following the rules below.
4. **Test** — `npm test` / `pytest -q` must pass locally before pushing.
5. **Open the PR** using the template. Link the Beads issue: `closes webapp-test-abc`.

## Coding rules

Read [`docs/coding-principles.md`](docs/coding-principles.md) and [`docs/ai-instructions/RULES.md`](docs/ai-instructions/RULES.md). Highlights:

- Files under 200 lines, classes under 5 public methods. Split when larger.
- No `any` types. Use Zod / Pydantic at boundaries.
- Parameterized SQL only. Every tenant-scoped query includes `org_id`.
- Soft delete only (`deleted_at`). Forward-only migrations.
- Containerized + k8s-ready: services run as non-root, expose `/healthz` + `/readyz`.

## Commit messages

Conventional commits in the imperative: `feat: add recipe import endpoint`, `fix: handle empty tags array`, `chore: bump deps`.

## Architecture decisions

Significant decisions (DB choice, auth provider, framework upgrade) get an ADR in [`docs/adr/`](docs/adr/). See the README in that folder for when to write one.

## Pre-commit

The project uses pre-commit hooks for lint + format + secret scanning. They install automatically when you run `npm install` (Node) or `pre-commit install` (Python). If a hook fails, **fix the underlying issue** — don't `--no-verify`.

## Questions

Open a GitHub Discussion for design questions, an Issue for bugs/features.
