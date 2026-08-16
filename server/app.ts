import express from "express";
import type { Express } from "express";
import { apiRouter } from "./routes";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";
import { setupFrontendMiddleware } from "./middlewares/vite";

export async function createApp(): Promise<Express> {
  const app = express();

  // 1. Core Parsers & Global Middlewares
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));
  app.use(requestLogger);

  // 2. Register API Routes
  app.use("/api", apiRouter);

  // 3. Register Frontend Handling (Vite Dev Server / Static SPA)
  await setupFrontendMiddleware(app);

  // 4. Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}
