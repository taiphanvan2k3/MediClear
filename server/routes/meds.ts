import { Router } from "express";
import { medsController } from "../controllers/meds.controller";

export const medsRouter = Router();

// POST /api/meds/search - Tra cứu thông tin thuốc bằng văn bản hoặc ảnh
medsRouter.post("/search", (req, res, next) => medsController.search(req, res, next));
