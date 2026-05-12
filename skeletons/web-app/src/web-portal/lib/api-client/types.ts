export interface ApiClientOptions {
  baseUrl?: string;
  /** JWT or dev token (e.g. `dev-admin`). The client adds `Bearer ` prefix. */
  token?: string;
  /** Org UUID. Required by every authenticated /v1/ route. */
  orgId?: string;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  /** Stringified as JSON. Triggers Content-Type: application/json. */
  body?: unknown;
  /** Pass-through to fetch. Default 'no-store' to avoid Next caching surprises. */
  cache?: RequestCache;
  /** Next.js fetch options (revalidate, tags). */
  next?: { revalidate?: number | false; tags?: string[] };
  /** AbortController signal. */
  signal?: AbortSignal;
  /** Sets Idempotency-Key header for POST/PUT/PATCH. */
  idempotencyKey?: string;
}

/** Standard error response shape from the API. */
export interface ApiErrorBody {
  error: string;
  code: string;
  correlationId?: string;
  details?: unknown;
  timestamp?: string;
}
