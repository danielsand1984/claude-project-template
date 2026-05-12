import type { ErrorRequestHandler } from 'express';

interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, req, res, _next) => {
  const status = err.status ?? 500;
  const correlationId = (req as { correlationId?: string }).correlationId ?? 'unknown';

  console.error(JSON.stringify({
    level: 'error',
    msg: err.message,
    code: err.code,
    status,
    correlationId,
    stack: status >= 500 ? err.stack : undefined,
  }));

  res.status(status).json({
    error: err.message || 'Internal error',
    code: err.code ?? 'INTERNAL_ERROR',
    correlationId,
    details: err.details,
    timestamp: new Date().toISOString(),
  });
};
