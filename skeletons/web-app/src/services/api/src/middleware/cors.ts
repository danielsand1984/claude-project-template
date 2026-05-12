import type { Request, Response, NextFunction } from 'express';

/**
 * CORS middleware. Whitelist origins via the CORS_ORIGINS env var
 * (comma-separated).
 *
 * Security note: Access-Control-Allow-Credentials is set only when
 * CORS_ORIGINS is an explicit allowlist. Using `*` is allowed for purely
 * public/non-credentialed APIs but the middleware will NOT echo
 * `Allow-Credentials: true` in that case — the combination "echo any
 * origin + send credentials" is exactly the cross-origin CSRF footgun
 * the spec forbids.
 *
 * Returns 204 for preflight (OPTIONS) requests and sets the standard
 * Access-Control-* headers for actual responses.
 */
const allowList = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowAll = allowList.includes('*');

const ALLOWED_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'Idempotency-Key',
  'X-Org-Id',
  'X-Correlation-Id',
].join(', ');

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

export function cors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.header('origin');

  if (origin && (allowAll || allowList.includes(origin))) {
    if (allowAll) {
      // Wildcard mode: NO credentials. Reflect '*' so any origin works
      // for non-credentialed requests.
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      // Explicit allowlist: safe to echo origin + credentials.
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
    res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
    res.setHeader('Access-Control-Max-Age', '600');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}
