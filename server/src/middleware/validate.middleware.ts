import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({
          message: error.errors[0]?.message || 'Validation error',
          errors: errorMessages,
        });
        return;
      }
      next(error);
    }
  };
};
