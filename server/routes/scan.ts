import { Router } from "express";
import { scanController } from "../controllers/scan.controller";

export const scanRouter = Router();

// POST /api/scan/prescription & POST /api/scan - Phân tích đơn thuốc / phiếu xét nghiệm bằng Gemini Vision
scanRouter.post("/prescription", (req, res, next) => scanController.scan(req, res, next));
scanRouter.post("/", (req, res, next) => scanController.scan(req, res, next));
