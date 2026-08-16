import { getGeminiClient } from "./gemini";
import { config } from "../config/env";
import { SCAN_SYSTEM_INSTRUCTION, SCAN_USER_PROMPT } from "../prompts";

export interface ScannedMedication {
  name: string;
  dosage: string;
  purpose: string;
  foodAdvice: string;
  reminderTime?: string;
}

export interface ScannedLabResult {
  label: string;
  value: string;
  status: "normal" | "high" | "warning";
  advice?: string;
}

export interface PrescriptionScanResult {
  title: string;
  type: "prescription" | "lab";
  facility?: string;
  doctor?: string;
  diagnosis?: string;
  badge: string;
  badgeType: "info" | "warning" | "success";
  summary: string;
  medications: ScannedMedication[];
  labResults: ScannedLabResult[];
  advice: string;
  warning?: string;
}

function cleanText(text?: string): string {
  if (!text) return "";
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim();
}

export class ScanService {
  /**
   * Phân tích ảnh đơn thuốc hoặc phiếu xét nghiệm thực tế qua Google Gemini 2.5 Flash Vision
   */
  async analyzePrescription(imagesBase64: string[]): Promise<PrescriptionScanResult> {
    if (!imagesBase64 || imagesBase64.length === 0) {
      throw new Error("Không có hình ảnh nào được gửi lên để phân tích.");
    }

    const contents: any[] = [];

    // Đưa tất cả các trang ảnh vào contents của Gemini Multimodal
    for (const rawImage of imagesBase64) {
      const cleanBase64 = rawImage.replace(/^data:image\/\w+;base64,/, "");
      // Detect mime type
      const mimeMatch = rawImage.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType,
        },
      });
    }

    contents.push({
      text: SCAN_USER_PROMPT,
    });

    const ai = getGeminiClient();

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: config.gemini.primaryGroundingModel || "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SCAN_SYSTEM_INSTRUCTION,
        },
      });
    } catch (err1: any) {
      console.warn("[ScanService Tier 1 Fail] -> Thử lại với fallback model:", err1.message || err1);
      response = await ai.models.generateContent({
        model: config.gemini.fallbackModel || "gemini-2.5-flash-lite",
        contents,
        config: {
          systemInstruction: SCAN_SYSTEM_INSTRUCTION,
        },
      });
    }

    const responseText = response?.text || "";

    // Parse JSON
    let parsed: any = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("[ScanService] Lỗi parse JSON từ Gemini OCR:", e);
    }

    if (!parsed) {
      return {
        title: `Đơn khám (${imagesBase64.length} trang ảnh)`,
        type: "prescription",
        badge: "Đã ghi nhận",
        badgeType: "info",
        summary: `Đã đọc ${imagesBase64.length} ảnh thực tế. Vui lòng tuân thủ chỉ dẫn của bác sĩ.`,
        medications: [],
        labResults: [],
        advice: "Bác nhớ uống thuốc đúng giờ, tái khám theo hẹn và giữ gìn sức khỏe nhé ạ.",
      };
    }

    // Format & Clean parsed data
    const medications: ScannedMedication[] = Array.isArray(parsed.medications)
      ? parsed.medications.map((m: any) => ({
          name: cleanText(m.name) || "Thuốc kê đơn",
          dosage: cleanText(m.dosage) || "Uống theo chỉ định",
          purpose: cleanText(m.purpose) || "Điều trị theo chỉ định",
          foodAdvice: cleanText(m.foodAdvice) || "Uống với nước lọc sau ăn",
          reminderTime: m.reminderTime || "08:00",
        }))
      : [];

    const labResults: ScannedLabResult[] = Array.isArray(parsed.labResults)
      ? parsed.labResults.map((l: any) => ({
          label: cleanText(l.label) || "Chỉ số xét nghiệm",
          value: cleanText(l.value) || "Đạt chuẩn",
          status: l.status === "high" || l.status === "warning" ? l.status : "normal",
          advice: cleanText(l.advice),
        }))
      : [];

    return {
      title: cleanText(parsed.title) || `Đơn khám (${imagesBase64.length} trang ảnh)`,
      type: parsed.type === "lab" ? "lab" : "prescription",
      facility: cleanText(parsed.facility),
      doctor: cleanText(parsed.doctor),
      diagnosis: cleanText(parsed.diagnosis),
      badge: cleanText(parsed.badge) || (medications.length > 0 ? "Đang dùng" : "Đã ghi nhận"),
      badgeType: parsed.badgeType === "warning" || parsed.badgeType === "success" ? parsed.badgeType : "info",
      summary: cleanText(parsed.summary) || `Đã đọc thành công ${imagesBase64.length} ảnh thực tế.`,
      medications,
      labResults,
      advice: cleanText(parsed.advice) || "Bác nhớ uống thuốc đều đặn và nghỉ ngơi hợp lý ạ.",
      warning: cleanText(parsed.warning),
    };
  }
}

export const scanService = new ScanService();
