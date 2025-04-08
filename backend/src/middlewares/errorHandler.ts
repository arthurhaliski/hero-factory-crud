import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';
import logger from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction // `next` is required for Express error handlers, even if unused.
): void => {
  
  logger.error(
    {
      err: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        ...(err instanceof AppError && { statusCode: err.statusCode, isOperational: err.isOperational })
      },
    },
    `Error occurred: ${err.message}`
  );

  if (err instanceof ZodError) {
    // Erro de validação Zod (geralmente tratado antes em validateRequest)
    res.status(400).json({
      status: 'error',
      message: 'Invalid input data',
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    // Erro operacional conhecido
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Erro inesperado/não operacional
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
}; 