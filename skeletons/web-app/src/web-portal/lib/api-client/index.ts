/**
 * Thin typed wrapper around fetch for the BFF API. Conventions:
 *
 *   - Base URL from NEXT_PUBLIC_API_URL (or relative /api/bff via next rewrite).
 *   - JSON in, JSON out. Throws ApiError on non-2xx with `{code, status, message, details}`.
 *   - Auth headers are passed by the caller — this client is stateless. The
 *     auth provider (next-auth, your custom hook) owns the token + orgId
 *     and supplies them per request.
 *
 * Use in:
 *   - Server Components (RSC): `await apiClient({ token, orgId }).get('/v1/recipes')`
 *   - Client Components: same shape, ideally via React Query / SWR.
 */

import { ApiError } from './errors.js';
import type { ApiClientOptions, RequestOptions } from './types.js';

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? '/api/bff';

export function apiClient(opts: ApiClientOptions = {}) {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;

  async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.orgId ? { 'X-Org-Id': opts.orgId } : {}),
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
      ...options.headers,
    };

    const res = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? 'no-store',
      next: options.next,
      signal: options.signal,
    });

    if (!res.ok) {
      let body: unknown;
      try { body = await res.json(); } catch { body = await res.text(); }
      throw new ApiError(res.status, body);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  return {
    get:    <T>(path: string, options?: RequestOptions) => request<T>('GET',    path, options),
    post:   <T>(path: string, body: unknown, options?: RequestOptions) => request<T>('POST',   path, { ...options, body }),
    put:    <T>(path: string, body: unknown, options?: RequestOptions) => request<T>('PUT',    path, { ...options, body }),
    patch:  <T>(path: string, body: unknown, options?: RequestOptions) => request<T>('PATCH',  path, { ...options, body }),
    delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
  };
}

export { ApiError } from './errors.js';
export type { ApiClientOptions, RequestOptions } from './types.js';
