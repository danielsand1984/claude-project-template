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

// === Shared clients ====================================================
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX ?? 20),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30_000),
  connectionTimeoutMillis: 5_000,
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS ?? 30_000),
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
app.use(auth);
app.use(orgScope({ db }));
app.use(rateLimit({ redis }));

// === Routes ============================================================
// Mount /v1/* route factories here. Example:
// app.use('/v1/recipes', createRecipesRouter({ db, redis }));

// === Error handler (last) ==============================================
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'api.listening', port }));
});

// === Graceful shutdown =================================================
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(JSON.stringify({ level: 'info', msg: 'shutdown.signal', signal }));
    server.close(async () => {
      await Promise.all([db.end(), redis.quit()]).catch(() => undefined);
      console.log(JSON.stringify({ level: 'info', msg: 'shutdown.complete' }));
      process.exit(0);
    });
    // Hard exit after 25s if connections won't drain
    setTimeout(() => process.exit(1), 25_000).unref();
  });
}
