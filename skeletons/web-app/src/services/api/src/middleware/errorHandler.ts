import type { ErrorRequestHandler } from 'express';

interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  /**
   * Set to true on errors thrown by your own application code where the
   * message and details are safe to surface to clients (e.g. validation
   * errors). Internal/uncaught errors leave this undefined and get a
   * generic response — pg errors, JSON parse failures, library internals
   * never leak SQL fragments or stack traces.
   */
  exposeToClient?: boolean;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, req, res, _next) => {
  const status = err.status ?? 500;
  const isServerError = status >= 500;
  const correlationId = (req as Request & { correlationId?: string }).correlationId ?? 'unknown';

  console.error(
    JSON.stringify({
      level: 'error',
      msg: err.message,
      code: err.code,
      status,
      correlationId,
      // Stack only on 5xx and only in the log — never in the response.
      stack: isServerError ? err.stack : undefined,
    }),
  );

  // 5xx errors and any 4xx not explicitly opted in get a generic response.
  // This prevents pg/library internals from leaking through unhandled throws.
  const safeToExpose = !isServerError && err.exposeToClient !== false;

  res.status(status).json({
    error: safeToExpose ? err.message || 'Error' : 'Internal error',
    code: err.code ?? (isServerError ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
    correlationId,
    ...(safeToExpose ? { details: err.details } : {}),
    timestamp: new Date().toISOString(),
  });
};
