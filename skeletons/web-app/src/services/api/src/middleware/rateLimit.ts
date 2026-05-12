import type { Request, Response, NextFunction } from 'express';
import type Redis from 'ioredis';

const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

-- Drop entries older than window
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_ms)

local count = redis.call('ZCARD', key)
if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retry_ms = window_ms - (now - tonumber(oldest[2]))
  return { 0, count, retry_ms }
end

redis.call('ZADD', key, now, now .. '-' .. math.random())
redis.call('PEXPIRE', key, window_ms)
return { 1, count + 1, 0 }
`;

export interface RateLimitOptions {
  redis: Redis;
  windowMs?: number;          // default 60_000 (1 minute)
  limit?: number;             // default from env RATE_LIMIT_REQUESTS_PER_MINUTE, fallback 100
  keyFn?: (req: Request) => string;  // default: per IP+user+org
  failOpen?: boolean;         // default true — let traffic through when Redis is down
}

/**
 * Redis-backed sliding-window rate limiter.
 *
 * Returns 429 with Retry-After + X-RateLimit-* headers when over limit.
 * Fails open by default — if Redis is unreachable, requests are allowed.
 */
export function rateLimit(opts: RateLimitOptions) {
  const windowMs = opts.windowMs ?? 60_000;
  const limit = opts.limit ?? Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? 100);
  const keyFn =
    opts.keyFn ??
    ((req: Request): string => {
      const ip = req.ip ?? 'unknown-ip';
      const ctx = (req as Request & { ctx?: { userId?: string; orgId?: string } }).ctx;
      const user = ctx?.userId ?? 'anon';
      const org = ctx?.orgId ?? 'no-org';
      return `rl:${ip}:${user}:${org}`;
    });
  const failOpen = opts.failOpen ?? true;

  return async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const key = keyFn(req);
    const now = Date.now();
    try {
      const result = (await opts.redis.eval(
        SLIDING_WINDOW_LUA,
        1,
        key,
        String(now),
        String(windowMs),
        String(limit),
      )) as [number, number, number];
      const [allowed, count, retryMs] = result;

      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - count)));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));

      if (allowed === 0) {
        const retrySec = Math.max(1, Math.ceil(retryMs / 1000));
        res.setHeader('Retry-After', String(retrySec));
        res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
          retryAfterSeconds: retrySec,
        });
        return;
      }
      next();
    } catch (err) {
      if (failOpen) {
        console.warn(JSON.stringify({ level: 'warn', msg: 'rate_limit.redis_error', err: String(err) }));
        next();
      } else {
        next(err);
      }
    }
  };
}
