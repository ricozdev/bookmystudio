import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log server errors
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled server error:', err);
  }

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: `Invalid identifier: ${err.value}`,
      code: 'INVALID_ID',
    });
    return;
  }

  // Handle MongoDB duplicate key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      error: `An entry with this ${field} already exists.`,
      code: 'DUPLICATE_ENTRY',
      field,
    });
    return;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details: Record<string, string> = {};
    for (const key in err.errors) {
      details[key] = err.errors[key].message;
    }
    res.status(422).json({
      success: false,
      error: 'Data validation failed',
      details,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

