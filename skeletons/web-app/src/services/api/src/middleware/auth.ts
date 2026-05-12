import type { Request, Response, NextFunction } from 'express';
import { devCredentialsProvider } from '../lib/devCredentialsProvider.js';

/**
 * Request context attached by auth middleware. Every authenticated /v1/
 * request has this populated; routes can rely on it.
 */
export interface RequestContext {
  userId: string;
  orgId: string;
  role: 'admin' | 'member';
  email?: string;
  isPlatformAdmin?: boolean;
}

declare module 'express-serve-static-core' {
  // Augment Express's Request with our context. No more `as any`.
  interface Request {
    ctx?: RequestContext;
  }
}

/**
 * Routes that don't require auth. Keep this list short and explicit.
 */
const PUBLIC_ROUTES = new Set<string>([
  '/healthz',
  '/readyz',
]);

export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.has(path);
}

/**
 * Auth middleware. Two modes controlled by AUTH_MODE env var:
 *
 *   - `dev`  (default): credentials provider. Reads `X-Org-Id` and `Authorization: Bearer dev-<userId>`
 *            and resolves them via devCredentialsProvider. Never enable in production.
 *   - `oidc`           : verifies a JWT signed by the configured OIDC issuer.
 *                        (Stub — wire up jose / jsonwebtoken when you adopt a real IdP.)
 *
 * Requires `X-Org-Id` header on every authenticated request. Returns:
 *   - 401 if the token is missing or invalid
 *   - 400 if `X-Org-Id` is missing or malformed
 *
 * Membership + role enforcement is a separate concern — see `orgScope.ts`.
 */
export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (isPublicRoute(req.path)) {
    next();
    return;
  }

  const orgId = req.header('x-org-id');
  if (!orgId || !/^[0-9a-f-]{36}$/i.test(orgId)) {
    res.status(400).json({
      error: 'Missing or invalid X-Org-Id header',
      code: 'BAD_REQUEST',
    });
    return;
  }

  const token = parseBearer(req.header('authorization'));
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token', code: 'UNAUTHORIZED' });
    return;
  }

  try {
    const mode = (process.env.AUTH_MODE ?? 'dev').toLowerCase();
    const principal =
      mode === 'oidc'
        ? await verifyOidcToken(token)
        : await devCredentialsProvider(token);

    req.ctx = {
      userId: principal.userId,
      orgId,
      role: principal.role ?? 'member',
      email: principal.email,
      isPlatformAdmin: principal.isPlatformAdmin ?? false,
    };
    next();
  } catch (err) {
    res.status(401).json({
      error: err instanceof Error ? err.message : 'Authentication failed',
      code: 'UNAUTHORIZED',
    });
  }
}

function parseBearer(header: string | undefined): string | null {
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header);
  return m ? m[1].trim() : null;
}

/**
 * OIDC JWT verification stub. Replace with `jose.jwtVerify` against your
 * issuer's JWKS endpoint. Throws if the token is invalid or expired.
 */
async function verifyOidcToken(_token: string): Promise<{
  userId: string;
  role?: 'admin' | 'member';
  email?: string;
  isPlatformAdmin?: boolean;
}> {
  throw new Error('OIDC verification not implemented — set AUTH_MODE=dev or wire up jose');
}
