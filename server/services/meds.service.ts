import { getGeminiClient } from "./gemini";
import { config } from "../config/env";
import { MED_SYSTEM_INSTRUCTION, buildMedPromptText } from "../prompts";

export interface SearchMedInput {
  query?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MedSearchResult {
  name: string;
  dosage: string[];
  purpose: string[];
  foodAdvice: string[];
  summary: string;
  sources: GroundingSource[];
}

let searchModelToggle = false;

function cleanItems(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val
      .map((i) =>
        String(i)
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/^[•\-\s]+/g, "")
          .trim()
      )
      .filter(Boolean);
  }
  if (typeof val === "string") {
    return val
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .split(/(?:\r?\n|•)/)
      .map((i) => i.replace(/^[•\-\s]+/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

export class MedsService {
  /**
   * Tra cứu thông tin thuốc bằng văn bản hoặc ảnh chụp vỏ hộp qua Google Gemini AI + Search Grounding
   */
  async searchMed(input: SearchMedInput): Promise<MedSearchResult> {
    const { query, imageBase64, mimeType } = input;

    const contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg",
        },
      });
    }

    contents.push({
      text: buildMedPromptText(query),
    });

    const ai = getGeminiClient();
    let response: any;
    let groundingChunks: any[] = [];

    // Xoay vòng luân phiên giữa primary & secondary model để tối ưu quota
    const primaryModel = searchModelToggle
      ? config.gemini.primaryGroundingModel
      : config.gemini.secondaryGroundingModel;
    const secondaryModel = searchModelToggle
      ? config.gemini.secondaryGroundingModel
      : config.gemini.primaryGroundingModel;
    searchModelToggle = !searchModelToggle;

    try {
      // Tier 1: Thử model xoay vòng chính có Search Grounding
      response = await ai.models.generateContent({
        model: primaryModel,
        contents,
        config: {
          systemInstruction: MED_SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });
      groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    } catch (err1: any) {
      console.warn(`[Tier 1 Fail] ${primaryModel} -> Thử sang Tier 2 (${secondaryModel}):`, err1.message || err1);
      try {
        // Tier 2: Thử model xoay vòng phụ có Search Grounding
        response = await ai.models.generateContent({
          model: secondaryModel,
          contents,
          config: {
            systemInstruction: MED_SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
          },
        });
        groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      } catch (err2: any) {
        console.warn(`[Tier 2 Fail] ${secondaryModel} -> Fallback sang ${config.gemini.fallbackModel} (No Grounding):`, err2.message || err2);
        // Tier 3: Fallback sang model không dùng Search Grounding
        response = await ai.models.generateContent({
          model: config.gemini.fallbackModel,
          contents,
          config: {
            systemInstruction: MED_SYSTEM_INSTRUCTION,
          },
        });
      }
    }

    const responseText = response?.text || "";

    // Parse JSON
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("[MedsService] Lỗi parse JSON từ Gemini response:", e);
    }

    if (!parsedData) {
      parsedData = {
        name: query || "Thuốc từ ảnh chụp",
        dosage: ["Uống 1 viên/ngày theo chỉ định của Bác sĩ chuyên khoa."],
        purpose: ["Hỗ trợ điều trị & kiểm soát các triệu chứng chỉ định."],
        foodAdvice: ["Nên uống sau khi ăn no cùng nước lọc ấm."],
        summary: "Thuốc dùng theo chỉ định bác sĩ.",
      };
    }

    // Extract Grounding sources
    const sources: GroundingSource[] = groundingChunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({
        title: w.title || w.uri,
        uri: w.uri,
      }))
      .slice(0, 4);

    return {
      name: parsedData.name || query || "Thuốc cần tra cứu",
      dosage: cleanItems(parsedData.dosage),
      purpose: cleanItems(parsedData.purpose),
      foodAdvice: cleanItems(parsedData.foodAdvice),
      summary: parsedData.summary ? String(parsedData.summary).replace(/\*\*/g, "").trim() : "",
      sources,
    };
  }
}

export const medsService = new MedsService();
