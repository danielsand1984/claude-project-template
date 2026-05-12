# Web App Skeleton

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

- Rename `{{PROJECT_NAME}}` in `package.json`, `package.template.json`, `README.md`.
- Delete `workers/` if no Python is needed.
- Delete `docker-compose.yml` if you're not using local Postgres/Redis.
- Pick **one** styling system (TailwindCSS already wired) and stick with it.

## Dev commands (after init)

```bash
npm install
npm run dev:api          # API on :3000
npm run dev:web          # Web on :3002
npm run db:migrate       # apply migrations
npm test                 # Playwright E2E
```
