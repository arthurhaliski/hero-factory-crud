import { Request, Response, NextFunction, RequestHandler } from 'express';

// Define o tipo para a função assíncrona do controller
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>; 

/**
 * Envolve uma função de controller assíncrona para capturar erros 
 * e passá-los para o middleware de erro (next).
 */
export const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 