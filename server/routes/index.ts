import { Router } from "express";
import { medsRouter } from "./meds";
import { scanRouter } from "./scan";

export const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "MediClear API",
    timestamp: new Date().toISOString(),
  });
});

// Mount feature routers
apiRouter.use("/meds", medsRouter);
apiRouter.use("/scan", scanRouter);

