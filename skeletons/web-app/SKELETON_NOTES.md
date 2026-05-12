# web-app skeleton — notes for the init flow

> **Delete this file** after scaffolding. It exists only to guide `START_HERE.md` Phase 2.

Monorepo layout patterned on the Proat platform (Next.js frontend + Node API + optional Python workers). Use as the starting point for any project that has both a UI and a backend.

## Layout

```
src/
├── web-portal/             # Next.js 16 frontend (App Router)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── services/
│   └── api/                # Express 5 + TypeScript API
│       ├── src/
│       │   ├── index.ts    # Bootstrap
│       │   ├── routes/     # Route factories
│       │   ├── middleware/
│       │   └── db.ts
│       └── package.json
└── workers/                # Python workers (delete if not needed)
    └── shared/
        └── queue_consumer.py
ops/
├── infra/
│   └── db/migrations/      # Numbered SQL migrations
└── scripts/
test/
docker-compose.yml
package.json                # Root scripts: dev, build, test, migrate
```

## During init

- Rename `{{PROJECT_NAME}}` in `package.template.json` and all child packages.
- Rename `package.template.json` → `package.json` (also in `src/services/api/` and `src/web-portal/`).
- Rename `docker-compose.template.yml` → `docker-compose.yml`.
- Copy `.env.example` → `.env` and fill in real values (DATABASE_URL etc.).
- Delete `src/workers/` if no Python is needed (also delete the worker entry in `docker-compose.yml` and `ops/infra/k8s/worker-deployment.yml`).
- **Write a fresh `README.md`** based on the interview.
- For web-app/api projects, **fill in** `docs/ai-instructions/ARCHITECTURE.md` and `TECH_STACK.md` placeholders (they're justified for projects of this size).
- Tailwind 4 is already wired: `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css` ship in `src/web-portal/`.

## What ships in this skeleton

| Capability | Location |
|---|---|
| API bootstrap + middleware stack | `src/services/api/src/index.ts` |
| Auth middleware (dev + OIDC stub) | `src/services/api/src/middleware/auth.ts` |
| Org-scope middleware (multi-tenant) | `src/services/api/src/middleware/orgScope.ts` |
| CORS middleware | `src/services/api/src/middleware/cors.ts` |
| Redis sliding-window rate limit | `src/services/api/src/middleware/rateLimit.ts` |
| `/healthz` + `/readyz` with DB+Redis checks | `src/services/api/src/routes/health.ts` |
| Graceful SIGTERM shutdown | `src/services/api/src/index.ts` |
| Dev credentials provider | `src/services/api/src/lib/devCredentialsProvider.ts` |
| Typed BFF client (Server + Client Components) | `src/web-portal/lib/api-client/` |
| Example page (data fetch + form) | `src/web-portal/app/example/` |
| react-hook-form + zod example | `src/web-portal/components/example-form.tsx` |
| Tailwind 4 + globals.css | `src/web-portal/{tailwind.config.ts, postcss.config.mjs, app/globals.css}` |
| Migration runner | `ops/scripts/migrate.mjs` |
| Multi-tenant base migrations | `ops/infra/db/migrations/{001,002}*.sql` |
| Local seed data (dev users + org) | `ops/infra/db/seed.mjs` |
| Pre-commit hooks (husky + lint-staged + gitleaks) | `.husky/pre-commit`, `.gitleaks.toml` |
| K8s manifests with probes + non-root | `ops/infra/k8s/` |
| Dockerfiles per service | `src/services/api/Dockerfile`, `src/web-portal/Dockerfile`, `src/workers/Dockerfile` |

## Container / k8s readiness (mandatory)

This skeleton ships with everything needed to run in Docker and deploy to Kubernetes. Don't strip it unless the project is a one-off script.

- **Dockerfiles** in `src/services/api/`, `src/web-portal/`, `src/workers/` — multi-stage, non-root, pinned base images.
- **`docker-compose.yml`** brings up the full stack (Postgres + Redis + api + web). Uncomment the worker block per worker you add.
- **K8s manifests** in `ops/infra/k8s/` — one Deployment per service, liveness on `/healthz`, readiness on `/readyz` (or heartbeat for workers), resource limits, non-root securityContext.
- **`/healthz` + `/readyz`** are already wired in `src/services/api/src/routes/health.ts`.
- **Graceful shutdown** is already wired in `src/services/api/src/index.ts` — handles SIGTERM with a drain timeout.
- Next.js standalone output is already set in `next.config.ts`.

## Container / k8s readiness (mandatory)

This skeleton ships with everything needed to run in Docker and deploy to Kubernetes. Don't strip it unless the project is a one-off script.

- **Dockerfiles** in `src/services/api/`, `src/web-portal/`, `src/workers/` — multi-stage, non-root, pinned base images.
- **`docker-compose.yml`** brings up the full stack (Postgres + Redis + api + web). Uncomment the worker block per worker you add.
- **K8s manifests** in `ops/infra/k8s/` — one Deployment per service, liveness on `/healthz`, readiness on `/readyz` (or heartbeat for workers), resource limits, non-root securityContext.
- **`/healthz` + `/readyz`** are already wired in `src/services/api/src/routes/health.ts`. Add real readiness checks (DB pool, Redis ping) when those clients are introduced.
- **Graceful shutdown** is already wired in `src/services/api/src/index.ts` — handles SIGTERM with a drain timeout.
- For Next.js to produce a small standalone Docker image, set `output: 'standalone'` in `next.config.ts` (do this during scaffold).

## Dev commands (after init)

```bash
npm install
npm run dev:api          # API on :3000
npm run dev:web          # Web on :3002
npm run db:migrate       # apply migrations
npm test                 # Playwright E2E
```
