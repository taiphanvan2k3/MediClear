import type { Express } from "express";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config } from "../config/env";

/**
 * Điều phối thiết lập Frontend Middleware dựa theo môi trường thực thi
 */
export async function setupFrontendMiddleware(app: Express): Promise<void> {
  if (!config.isProduction) {
    await _setupViteDevMiddleware(app);
  } else {
    _setupStaticProductionMiddleware(app);
  }
}

/**
 * Cấu hình Vite Dev Server Middleware với HMR cho môi trường Development
 */
async function _setupViteDevMiddleware(app: Express): Promise<void> {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });

  app.use(vite.middlewares);
  console.log("[Vite] Khởi chạy ở chế độ Development (HMR Middleware Mode)");
}

/**
 * Cấu hình phục vụ file tĩnh và SPA fallback từ thư mục dist cho môi trường Production
 */
function _setupStaticProductionMiddleware(app: Express): void {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log(`[Static] Phục vụ static SPA từ thư mục: ${distPath}`);
}
