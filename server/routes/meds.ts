import { Router } from "express";
import { getGeminiClient } from "../services/gemini";

export const medsRouter = Router();

let searchModelToggle = false;

medsRouter.post("/search", async (req, res) => {
  try {
    const { query, imageBase64, mimeType } = req.body;

    if (!query && !imageBase64) {
      return res.status(400).json({ error: "Vui lòng nhập tên thuốc hoặc chụp/tải ảnh vỏ hộp thuốc." });
    }

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

    const promptText = query
      ? `Hãy tra cứu thông tin chi tiết về thuốc "${query}".`
      : "Hãy đọc chữ trên ảnh vỏ hộp/vỉ/đơn thuốc này và tra cứu thông tin chi tiết về loại thuốc được chụp.";

    const systemInstruction = `Bạn là Trợ lý Y tế Dược học chuyên nghiệp cho người cao tuổi Việt Nam. 
Hãy tra cứu thông tin bằng Google Search Grounding để đưa ra thông tin thuốc ngắn gọn, siêu dễ đọc.

Yêu cầu định dạng QUAN TRỌNG:
1. TUYỆT ĐỐI KHÔNG dùng ký tự Markdown như **, ##, *.
2. Trả về mảng danh sách ngắn gọn (Array of strings) cho các mục dosage, purpose, foodAdvice. Mỗi phần tử là 1 câu ngắn gọn 1 dòng.
3. Không viết khối văn bản dài dính chùm.

Chỉ phản hồi một chuỗi định dạng JSON hợp lệ (không kèm Markdown block) có cấu trúc:
{
  "name": "Tên thuốc ngắn gọn (ví dụ: Omeprazol 20mg - Thuốc trị dạ dày)",
  "dosage": [
    "Uống 1 viên vào buổi sáng trước khi ăn 30 phút",
    "Uống liên tục từ 4 - 8 tuần theo chỉ định bác sĩ"
  ],
  "purpose": [
    "Giảm tiết axit dạ dày",
    "Điều trị viêm loét dạ dày & trào ngược thực quản"
  ],
  "foodAdvice": [
    "Uống nguyên viên với nước lọc, không nhai nát",
    "Tuyệt đối không uống cùng rượu bia, cà phê hoặc đồ quá chua"
  ],
  "summary": "Thuốc điều trị đau dạ dày, nên uống 1 viên buổi sáng trước ăn."
}`;

    contents.push({
      text: `${promptText}\n\nTrả về JSON chuẩn.`,
    });

    const ai = getGeminiClient();
    let response: any;
    let groundingChunks: any[] = [];

    // Xoay vòng luân phiên giữa gemini-2.5-flash-lite (<1s) và gemini-2.5-flash (~3s) để tối ưu quota Search Grounding
    const primaryGroundingModel = searchModelToggle ? "gemini-2.5-flash" : "gemini-2.5-flash-lite";
    const secondaryGroundingModel = searchModelToggle ? "gemini-2.5-flash-lite" : "gemini-2.5-flash";
    searchModelToggle = !searchModelToggle;

    try {
      // Tier 1: Thử model Grounding xoay vòng primary
      response = await ai.models.generateContent({
        model: primaryGroundingModel,
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    } catch (err1: any) {
      console.warn(`[Tier 1 Grounding Fail] ${primaryGroundingModel} -> Thử sang Tier 2 (${secondaryGroundingModel}):`, err1.message || err1);
      try {
        // Tier 2: Thử model Grounding xoay vòng secondary
        response = await ai.models.generateContent({
          model: secondaryGroundingModel,
          contents,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
          },
        });
        groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      } catch (err2: any) {
        console.warn(`[Tier 2 Grounding Fail] ${secondaryGroundingModel} -> Fallback sang gemini-3.5-flash-lite:`, err2.message || err2);
        // Tier 3: Fallback sang gemini-3.5-flash-lite không dùng Search Grounding
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents,
          config: {
            systemInstruction,
          },
        });
      }
    }

    const responseText = response.text || "";

    // Parse JSON
    let parsedData: any = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("JSON parse fallback:", e);
    }

    const cleanItems = (val: any): string[] => {
      if (Array.isArray(val)) {
        return val
          .map(i => String(i).replace(/\*\*/g, '').replace(/\*/g, '').replace(/^[•\-\s]+/g, '').trim())
          .filter(Boolean);
      }
      if (typeof val === 'string') {
        return val
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .split(/(?:\r?\n|•)/)
          .map(i => i.replace(/^[•\-\s]+/g, '').trim())
          .filter(Boolean);
      }
      return [];
    };

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
    const sources = groundingChunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({
        title: w.title || w.uri,
        uri: w.uri,
      }));

    return res.json({
      name: parsedData.name || query || "Thuốc cần tra cứu",
      dosage: cleanItems(parsedData.dosage),
      purpose: cleanItems(parsedData.purpose),
      foodAdvice: cleanItems(parsedData.foodAdvice),
      summary: parsedData.summary ? String(parsedData.summary).replace(/\*\*/g, '') : "",
      sources: sources.slice(0, 4),
    });
  } catch (error: any) {
    console.error("Lỗi API /api/meds/search:", error);
    return res.status(500).json({
      error: "Không thể tra cứu thông tin thuốc vào lúc này. Vui lòng kiểm tra kết nối và thử lại!",
    });
  }
});
