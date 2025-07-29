import { Request, Response, NextFunction } from 'express';

/**
 * Async handler to wrap async controller functions
 * Eliminates the need for try-catch blocks in controllers
 * Automatically passes errors to the next middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}; 