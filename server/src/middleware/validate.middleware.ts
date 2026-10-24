import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema<any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = err.message;
          }
        });

        res.status(422).json({
          success: false,
          error: 'Validation failed',
          details: fieldErrors,
          message: error.errors[0]?.message || 'Invalid input data',
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema<any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = err.message;
          }
        });

        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: fieldErrors,
          message: error.errors[0]?.message || 'Invalid query parameters',
        });
        return;
      }
      next(error);
    }
  };
}
