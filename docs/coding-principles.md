# Coding Principles

Distilled from the Proat / AI Transcriber platform. Keep these even when other docs go stale — they're the foundation.

## 1) Project structure and ownership

Keep code in clear top-level areas, even if you only have one of them today:

- `src/` — all source code
  - `src/apps/` — end-user clients (web, mobile, desktop)
  - `src/services/` — edge HTTP/WS services (REST API, WebSocket)
  - `src/workers/` — queue-driven background processors
  - `src/cli/` — CLI entry points
  - `src/lib/` — shared utilities consumed by multiple services
- `ops/` — operations
  - `ops/infra/` — infrastructure as code
  - `ops/scripts/` — dev/CI helper scripts
- `docs/` — design docs, ADRs, contracts, principles
- `test/` — automated tests

Don't move code "for symmetry" if you don't need the folder yet. But when a second deployable shows up, **immediately** restructure rather than letting `src/index.ts` grow forever.

## 2) Naming conventions

| Context | Convention | Example |
|---|---|---|
| Folders / packages | kebab-case | `api-bff`, `asr-worker` |
| TypeScript files | camelCase | `llmClient.ts` |
| TypeScript classes | PascalCase | `ConversationService` |
| TypeScript functions | camelCase | `resolveRetention()` |
| Python files | snake_case | `conversation_service.py` |
| Python functions | snake_case | `resolve_retention()` |
| DB tables | snake_case plural | `conversations` |
| DB columns | snake_case | `org_id`, `created_at` |
| API endpoints | plural resources | `/projects`, `/conversations` |
| API actions | explicit verb suffix | `:start`, `:stop`, `:undo` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |
| Error codes | UPPER_SNAKE | `INSUFFICIENT_CREDITS` |

## 3) Small files, small classes, clear boundaries

- Prefer **small, single-purpose files** over large multi-purpose modules.
- Rule of thumb: file > **200 lines** OR class > **5 public methods** → refactor.
- Split by responsibility (validation / persistence / orchestration) or by domain.
- Keep controllers/routers thin. Business logic lives in a service layer.

## 4) Inline documentation

- Every public function/class has a docstring with: **what it does, inputs/outputs, error conditions, any tenancy/scoping expectations**.
- Add inline comments only when intent is not obvious from the code.
- Comment the **why**, not the **what** — well-named identifiers explain the what.

## 5) `INDEX.md` per major area (required)

Each major service / worker has an `INDEX.md` listing:
- what the area does
- key entrypoints (main module, routers, handlers)
- key domain modules
- where to change behavior for common tasks

Plus a repo-level `docs/ARCHITECTURE_MAP.md` if the project has > 1 deployable.

## 6) Multi-tenancy and data safety (if applicable)

- **No query without `org_id`** when multi-tenant. Defense-in-depth: enforce at both API and DB layer.
- **Soft delete only** — use `deleted_at`, never hard delete.
- Tombstone immediately, purge later.

## 7) Scalability

Write code as if 1000+ users could hit it tomorrow:
- Avoid in-memory singletons for state that must survive restarts.
- Idempotent message processing.
- DB indexes aligned with access patterns (composite `(org_id, ...)`).
- No N+1 queries; batch and paginate.
- Stream/chunk large payloads.
- Workers are stateless and horizontally scalable.

## 8) Error handling and observability

- Structured JSON logs with correlation IDs (`requestId`, `orgId`, `userId`, `jobId`).
- Errors must be actionable: include context. **Never log secrets.**
- Surface error codes (`UPPER_SNAKE`) so the frontend can translate them.

## 9) Testing

- Unit tests for each function.
- Integration tests for each endpoint.
- E2E tests for each major use case (Playwright for web).
- Python workers use `pytest`.
- Tests fail before the feature ships — not after.

## 10) CI/CD quality gates

CI must fail if any of these fail:
- lint
- type check
- unit tests
- integration / E2E tests

Run **the exact same checks locally before pushing**.

## 11) Change management

- Small, reviewable PRs.
- Add an ADR in `docs/adr/` for major decisions (only when it's actually a decision worth recording).
- Keep `docs/ARCHITECTURE_MAP.md` and `INDEX.md` files current.

## 12) Containerization and Kubernetes-readiness (mandatory for services and workers)

Every deployable in `src/services/` and `src/workers/` runs in a container, both locally and in production. CLI tools (`src/cli/`) ship a Dockerfile as an optional convenience.

### Dockerfile requirements

- **Multi-stage build** — separate build / runtime layers, smaller final image.
- **Non-root user** — final stage runs as a `USER` other than root.
- **Pinned base image** — `node:20.18-alpine`, `python:3.11-slim`, not `:latest`.
- **Reproducible** — `npm ci` / `pip install -r requirements.txt`, not `npm install` / `pip install <pkg>`.
- **`.dockerignore`** — exclude `node_modules`, `.venv`, `.git`, tests, dev data.
- **`HEALTHCHECK`** instruction OR documented health endpoint.

### 12-factor app principles

- Config via **environment variables**, not files in the image.
- Secrets via env or mounted volumes — **never** baked into the image.
- Logs to **stdout/stderr** in structured JSON.
- **Stateless** processes — disk is ephemeral. Persistence goes to Postgres / object storage.
- **Disposability** — handle `SIGTERM` gracefully (drain queues, close DB pools, finish in-flight requests with a deadline).
- **One concern per process** — API, worker, scheduled jobs are separate Deployments/Jobs.

### Health endpoints (required for HTTP services)

- `GET /healthz` — **liveness**: process is up. Returns 200 OK without external checks.
- `GET /readyz` — **readiness**: ready to serve traffic. Checks DB pool, Redis ping. Returns 503 during startup or when a dependency is down.
- Workers expose readiness via the queue heartbeat (last successful consume timestamp), not HTTP.

### Kubernetes manifests

Keep deployment manifests in `ops/infra/k8s/` with:

- `livenessProbe` hitting `/healthz`, `readinessProbe` hitting `/readyz`
- `resources.requests` and `resources.limits` set (not optional)
- `securityContext.runAsNonRoot: true`, no privileged containers
- ConfigMap for non-secret env, Secret for secrets
- One Deployment per service, one Deployment per worker type
- `replicas: 1` in template; scale via HPA or KEDA in real deploys

### Local dev

`docker compose up` should bring up the **full stack** — infra (Postgres, Redis) AND the application services — so any contributor can run the system without local Node/Python installs. Hot-reload via volume mounts is fine.

## 13) AI / agent conventions

- Track work in **Beads (`bd`)**, not TODO files, not TodoWrite, not markdown checklists.
- All user-facing strings go through a translation hook (`t('key', 'Fallback')`) — Dutch + English minimum.
- Use **Zod / Pydantic** at every system boundary (HTTP, queue, file). No `any`/`dict[str, Any]` past the boundary.
- Credentials from DB-first with env var fallback (5-min cache) — not hardcoded.

## What NOT to do

- ❌ Hard delete records.
- ❌ Skip `org_id` in any tenant-scoped query.
- ❌ Use `any`/untyped dicts in business logic.
- ❌ Modify an existing DB migration after it has been applied anywhere.
- ❌ Commit secrets, even temporarily.
- ❌ Log secrets, tokens, or PII.
- ❌ Create generic "utils.ts" / "helpers.py" dumping grounds.
- ❌ Add "for future use" abstractions.
- ❌ Skip tests because "it's just a small change".
