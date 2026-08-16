import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Log khi response kết thúc
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Phân loại màu log nhẹ nhàng qua console
    const statusCategory = Math.floor(statusCode / 100);
    const logPrefix = statusCategory === 2 || statusCategory === 3 ? "✓" : "✗";

    console.log(`[API ${logPrefix}] ${method.padEnd(6)} ${originalUrl} -> ${statusCode} (${duration}ms)`);
  });

  next();
}
