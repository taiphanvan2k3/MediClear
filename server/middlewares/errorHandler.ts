import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau!";

  console.error(`[ErrorHandler] [${req.method}] ${req.originalUrl} - Status: ${statusCode}`, {
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    details: err.details,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { details: err.details, stack: err.stack }),
  });
}
