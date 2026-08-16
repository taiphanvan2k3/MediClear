import type { Request, Response, NextFunction } from "express";
import { scanService } from "../services/scan.service";

export class ScanController {
  /**
   * Handler API POST /api/scan/prescription hoặc POST /api/scan
   */
  async scan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { images } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        res.status(400).json({
          error: "Vui lòng cung cấp ít nhất một hình ảnh đơn thuốc / phiếu xét nghiệm hợp lệ.",
        });
        return;
      }

      const result = await scanService.analyzePrescription(images);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const scanController = new ScanController();
