import express from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';

import { createHealthRouter } from './routes/health.js';
import { correlationId } from './middleware/correlationId.js';
import { cors } from './middleware/cors.js';
import { auth } from './middleware/auth.js';
import { orgScope } from './middleware/orgScope.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

// Trust proxy hops so req.ip reflects the real client when behind a load
// balancer / ingress / docker-compose network. Without this, the rate
// limiter keys all requests by the proxy IP and becomes a single shared
// bucket. Default 1 hop (typical docker-compose / single ingress).
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

// === Shared clients ====================================================
// statement_timeout must be set via `options` — it's not a pg.Pool option
// in node-postgres and is silently ignored if passed at the Pool level.
const stmtTimeoutMs = Number(process.env.DB_STATEMENT_TIMEOUT_MS ?? 30_000);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX ?? 20),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30_000),
  connectionTimeoutMillis: 5_000,
  options: `-c statement_timeout=${stmtTimeoutMs}`,
});

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

// === Middleware stack ==================================================
// Order matters. See docs/ai-instructions/PATTERNS.md → Middleware order.
app.use(cors);
app.use(express.json({ limit: '5mb' }));
app.use(correlationId);

// Health endpoints — register BEFORE auth so kubelet probes work.
app.use(
  createHealthRouter([
    { name: 'postgres', check: async () => ({ ok: await db.query('SELECT 1').then(() => true).catch(() => false) }) },
    { name: 'redis',    check: async () => ({ ok: (await redis.ping()) === 'PONG' }) },
  ]),
);

// Auth + org membership + rate limiting for everything else.
// rateLimit defaults to failOpen=false — Redis outages should not silently
// disable rate limiting on auth/login routes downstream projects will add.
app.use(auth);
app.use(orgScope({ db }));
app.use(rateLimit({ redis, failOpen: false }));

// === Routes ============================================================
// Mount /v1/* route factories here. Example:
// app.use('/v1/recipes', createRecipesRouter({ db, redis }));

// === Error handler (last) ==============================================
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'api.listening', port }));
});

// === Graceful shutdown =================================================
// Two-step drain to avoid the 25s deadline becoming the de-facto shutdown
// time on every redeploy:
//   1. closeIdleConnections() releases keep-alive sockets immediately so
//      the LB can stop sending new traffic.
//   2. server.close() waits for in-flight requests to finish, then we
//      close DB + Redis.
//   3. If anything hangs past 25s, hard exit.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(JSON.stringify({ level: 'info', msg: 'shutdown.signal', signal }));
    server.closeIdleConnections?.();
    server.close(async () => {
      await Promise.all([db.end(), redis.quit()]).catch(() => undefined);
      console.log(JSON.stringify({ level: 'info', msg: 'shutdown.complete' }));
      process.exit(0);
    });
    // Force-close remaining keep-alive sockets after 10s so server.close can resolve.
    setTimeout(() => server.closeAllConnections?.(), 10_000).unref();
    // Hard exit ceiling.
    setTimeout(() => process.exit(1), 25_000).unref();
  });
}
