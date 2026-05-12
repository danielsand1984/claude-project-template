import type { Request, Response, NextFunction } from 'express';
import type { Pool } from 'pg';

/**
 * Org-scope middleware. After `auth` has populated `req.ctx.{userId, orgId}`,
 * this verifies the user is actually a member of that org and loads their
 * org-level role. Runs before any /v1/ route handler.
 *
 * Returns:
 *   - 403 if the user is not a member of the org
 *   - 503 if the org-membership query fails (fail closed for safety)
 *
 * Caching: a small in-process LRU could be added per (userId, orgId) for
 * latency, but the membership table is so cheap that it's usually fine to
 * query every time. Add caching when the profile says you need it.
 */
export function orgScope(deps: { db: Pool }) {
  return async function orgScopeMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!req.ctx) {
      // No ctx means the request hit a public route or auth was skipped.
      return next();
    }
    const { userId, orgId } = req.ctx;
    try {
      const result = await deps.db.query<{ role: 'admin' | 'member' }>(
        `SELECT role
           FROM user_org_membership
          WHERE user_id = $1
            AND org_id = $2
            AND deleted_at IS NULL`,
        [userId, orgId],
      );
      if (result.rowCount === 0) {
        res.status(403).json({
          error: 'User is not a member of this organization',
          code: 'FORBIDDEN',
        });
        return;
      }
      // Override with the canonical role from DB (auth middleware sets a default).
      req.ctx.role = result.rows[0].role;
      next();
    } catch (err) {
      // Fail closed — better to 503 than to let a request through unauthorized
      // because the membership table is unreachable.
      console.error(JSON.stringify({ level: 'error', msg: 'org_scope.db_error', err: String(err) }));
      res.status(503).json({
        error: 'Cannot verify org membership at the moment',
        code: 'MEMBERSHIP_UNAVAILABLE',
      });
    }
  };
}
