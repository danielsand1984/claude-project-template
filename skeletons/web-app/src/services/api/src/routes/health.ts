import { Router } from 'express';

/**
 * Health endpoints for container orchestration.
 *
 * /healthz — liveness: the process is up. Cheap, no external checks.
 *            Kubernetes restarts the pod if this fails.
 * /readyz  — readiness: ready to serve traffic. Checks downstream deps
 *            (DB pool, Redis ping). Kubernetes pulls the pod out of the
 *            Service LB if this fails, without restarting it.
 *
 * Pass in `checks` — an array of named async checks. Each check returns
 * { ok: boolean, detail?: string }. /readyz fails 503 if any returns ok=false.
 */
export type ReadinessCheck = { name: string; check: () => Promise<{ ok: boolean; detail?: string }> };

export function createHealthRouter(checks: ReadinessCheck[] = []): Router {
  const router = Router();

  router.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  router.get('/readyz', async (_req, res) => {
    const results = await Promise.all(
      checks.map(async ({ name, check }) => {
        try {
          const r = await check();
          return { name, ok: r.ok, detail: r.detail };
        } catch (err) {
          return { name, ok: false, detail: err instanceof Error ? err.message : String(err) };
        }
      }),
    );
    const allOk = results.every((r) => r.ok);
    res.status(allOk ? 200 : 503).json({
      status: allOk ? 'ready' : 'not_ready',
      checks: results,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
