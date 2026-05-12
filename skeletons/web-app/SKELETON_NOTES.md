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
- Delete `src/workers/` if no Python is needed.
- **Write a fresh `README.md`** based on the interview.
- For web-app/api projects, **fill in** `docs/ai-instructions/ARCHITECTURE.md` and `TECH_STACK.md` placeholders (they're justified for projects of this size).
- Pick **one** styling system (TailwindCSS already wired) and stick with it.

## Dev commands (after init)

```bash
npm install
npm run dev:api          # API on :3000
npm run dev:web          # Web on :3002
npm run db:migrate       # apply migrations
npm test                 # Playwright E2E
```
