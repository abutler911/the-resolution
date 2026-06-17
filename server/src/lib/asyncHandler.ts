import type { NextFunction, Request, Response } from "express";

// Express 4 doesn't forward rejected promises to error middleware.
// Wrap async handlers so thrown/rejected errors reach errorHandler.
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
