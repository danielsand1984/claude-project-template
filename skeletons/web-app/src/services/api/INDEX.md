# api — INDEX

REST API. Express 5 + TypeScript.

## Entry points

- `src/index.ts` — bootstrap, middleware stack, route mounting
- `src/routes/*.ts` — route factories (`createXxxRouter`)
- `src/middleware/*.ts` — cross-cutting (auth, correlation id, error handler)

## Where to change

| Task | File |
|------|------|
| Add a route | `src/routes/<name>.ts` then mount in `src/index.ts` |
| Add auth | new middleware in `src/middleware/auth.ts` |
| Add DB | `src/db.ts` with a `pg.Pool` |
| Add validation | Zod schemas next to each route |
