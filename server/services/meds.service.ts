import { getGeminiClient } from "./gemini";
import { config } from "../config/env";
import { MED_SYSTEM_INSTRUCTION, buildMedPromptText } from "../prompts";
import { webSearchService, WebSearchResult } from "./webSearch.service";

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
  genericName?: string;
  dosage: string[];
  purpose: string[];
  foodAdvice: string[];
  summary: string;
  sources: GroundingSource[];
}

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
   * Tra cứu thông tin thuốc bằng văn bản (kết hợp Tavily Search) hoặc ảnh chụp vỏ hộp (1-Shot Direct Multimodal Vision)
   */
  async searchMed(input: SearchMedInput): Promise<MedSearchResult> {
    const { query, imageBase64, mimeType } = input;
    const ai = getGeminiClient();

    // 1. Nếu người dùng nhập từ khóa tìm kiếm -> chạy Tavily / Web Search để lấy tài liệu y tế
    let webResults: WebSearchResult[] = [];
    if (query) {
      webResults = await webSearchService.searchMedicine(query);
    }

    const webContext = webResults.length > 0
      ? webResults.map((r) => `[${r.title}] (${r.uri}): ${r.snippet}`).join("\n\n")
      : undefined;

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
      text: buildMedPromptText(query, webContext),
    });

    let response: any;
    let groundingChunks: any[] = [];

    // Chọn model tối ưu tốc độ phản hồi: Ưu tiên gemini-3.1-flash-lite cho 1-Shot Vision
    const targetModel = config.gemini.fallbackModel || "gemini-3.1-flash-lite";

    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: MED_SYSTEM_INSTRUCTION,
        },
      });
      groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    } catch (err1: any) {
      console.warn(`[MedsService Primary Fail] ${targetModel} -> Thử sang gemini-3.5-flash:`, err1.message || err1);
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: MED_SYSTEM_INSTRUCTION,
          },
        });
      } catch (err2: any) {
        console.error("[MedsService Fatal Error]:", err2);
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

    // Kiểm tra guardrail tính hợp lệ y tế
    if (parsedData?.isValidMed === false) {
      throw new Error(
        parsedData.errorMessage ||
          "Hình ảnh không phải là vỏ hộp thuốc, vỉ thuốc hoặc sản phẩm y tế. Bác vui lòng chụp lại rõ nét bao bì thuốc để MediClear hỗ trợ chính xác nhé!"
      );
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

    // Kết hợp nguồn từ Google Search Grounding và Custom Web Search Engine
    const sourcesMap = new Map<string, string>();

    // Nguồn từ Google native grounding
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sourcesMap.set(chunk.web.uri, chunk.web.title || chunk.web.uri);
      }
    }

    // Nguồn từ Custom Medical Web Search
    for (const webItem of webResults) {
      if (webItem.uri && !sourcesMap.has(webItem.uri)) {
        sourcesMap.set(webItem.uri, webItem.title);
      }
    }

    // Nếu nguồn chưa có (trường hợp người dùng chỉ chụp ảnh mà không nhập chữ),
    // tự động tra cứu nhanh trên Tavily/Medical Search theo tên hoạt chất y tế (genericName)
    const targetSearchDrug = parsedData?.genericName || parsedData?.name;
    if (sourcesMap.size === 0 && targetSearchDrug) {
      try {
        const autoResults = await webSearchService.searchMedicine(targetSearchDrug);
        for (const item of autoResults) {
          if (item.uri && !sourcesMap.has(item.uri)) {
            sourcesMap.set(item.uri, item.title);
          }
        }
      } catch (e) {
        console.warn("[MedsService] Không thể tự động lấy nguồn web:", e);
      }
    }

    const sources: GroundingSource[] = Array.from(sourcesMap.entries())
      .map(([uri, title]) => ({ title, uri }))
      .slice(0, 4);

    return {
      name: parsedData.name || query || "Thuốc cần tra cứu",
      genericName: parsedData.genericName ? String(parsedData.genericName).replace(/\*\*/g, "").trim() : undefined,
      dosage: cleanItems(parsedData.dosage),
      purpose: cleanItems(parsedData.purpose),
      foodAdvice: cleanItems(parsedData.foodAdvice),
      summary: parsedData.summary ? String(parsedData.summary).replace(/\*\*/g, "").trim() : "",
      sources,
    };
  }
}

export const medsService = new MedsService();
