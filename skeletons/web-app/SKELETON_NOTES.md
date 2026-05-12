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
- Delete `src/workers/` if no Python is needed (also delete the worker entry in `docker-compose.yml` and `ops/infra/k8s/worker-deployment.yml`).
- **Write a fresh `README.md`** based on the interview.
- For web-app/api projects, **fill in** `docs/ai-instructions/ARCHITECTURE.md` and `TECH_STACK.md` placeholders (they're justified for projects of this size).
- Pick **one** styling system (TailwindCSS already wired) and stick with it.

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
