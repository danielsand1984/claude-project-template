import express from 'express';
import { createHealthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { correlationId } from './middleware/correlationId.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '5mb' }));
app.use(correlationId);

// Health endpoints — /healthz (liveness) and /readyz (readiness).
// Add real readiness checks here once you have a DB pool / Redis client.
app.use(
  createHealthRouter([
    // Example:
    // { name: 'postgres', check: async () => ({ ok: await db.query('SELECT 1').then(() => true).catch(() => false) }) },
    // { name: 'redis',    check: async () => ({ ok: (await redis.ping()) === 'PONG' }) },
  ]),
);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'api listening', port }));
});

// Graceful shutdown — drain in-flight requests, close server, exit.
// Kubernetes sends SIGTERM, then waits terminationGracePeriodSeconds (default 30s) before SIGKILL.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(JSON.stringify({ level: 'info', msg: 'shutdown.signal', signal }));
    server.close(() => {
      console.log(JSON.stringify({ level: 'info', msg: 'shutdown.complete' }));
      process.exit(0);
    });
    // Hard exit after 25s if connections won't drain
    setTimeout(() => process.exit(1), 25_000).unref();
  });
}
