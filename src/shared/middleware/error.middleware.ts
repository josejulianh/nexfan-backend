import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code || "ERROR", message: err.message },
    });
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `Route ${req.path} not found` } });
};
