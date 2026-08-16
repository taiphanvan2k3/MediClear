import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const { method, originalUrl } = req;

  // CHỈ log các request thực sự đến Backend API (/api/...), bỏ qua toàn bộ file tĩnh Vite/HMR
  if (!originalUrl.startsWith("/api")) {
    return next();
  }

  const start = Date.now();

  // Log khi response kết thúc
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    const statusCategory = Math.floor(statusCode / 100);
    const logPrefix = statusCategory === 2 || statusCategory === 3 ? "✓" : "✗";

    console.log(`[API ${logPrefix}] ${method.padEnd(6)} ${originalUrl} -> ${statusCode} (${duration}ms)`);
  });

  next();
}
