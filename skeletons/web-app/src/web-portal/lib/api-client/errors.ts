import type { ApiErrorBody } from './types.js';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId?: string;
  readonly details?: unknown;

  constructor(status: number, body: unknown) {
    const parsed = isApiErrorBody(body) ? body : null;
    super(parsed?.error ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = parsed?.code ?? `HTTP_${status}`;
    this.correlationId = parsed?.correlationId;
    this.details = parsed?.details ?? body;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'code' in value &&
    typeof (value as { error: unknown }).error === 'string'
  );
}
