import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.header('x-correlation-id') ?? randomUUID()).slice(0, 128);
  res.setHeader('x-correlation-id', id);
  (req as Request & { correlationId: string }).correlationId = id;
  next();
}
