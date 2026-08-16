import type { Request, Response, NextFunction } from "express";
import { medsService } from "../services/meds.service";

export class MedsController {
  /**
   * Handler API POST /api/meds/search
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, imageBase64, mimeType } = req.body;

      if (!query && !imageBase64) {
        res.status(400).json({
          error: "Vui lòng nhập tên thuốc hoặc chụp/tải ảnh vỏ hộp thuốc.",
        });
        return;
      }

      const result = await medsService.searchMed({
        query: query ? String(query).trim() : undefined,
        imageBase64,
        mimeType,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const medsController = new MedsController();
