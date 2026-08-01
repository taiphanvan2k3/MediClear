import { Router } from "express";
import { getGeminiClient } from "../services/gemini";

export const medsRouter = Router();

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

    const systemInstruction = `Bạn là Trợ lý Y tế Dược học chuyên nghiệp dành cho người cao tuổi Việt Nam. 
Hãy tra cứu thông tin chính xác bằng Google Search Grounding để đưa ra thông tin thuốc cập nhật nhất.
Chỉ phản hồi một chuỗi định dạng JSON hợp lệ (không kèm Markdown block) có đúng cấu trúc sau:
{
  "name": "Tên thương mại & hoạt chất chính của thuốc",
  "dosage": "Liều dùng chuẩn và thời gian khuyến nghị (ví dụ: 1 viên/lần, 2 lần/ngày sau ăn)",
  "purpose": "Công dụng chính, bệnh lý điều trị (viết ngắn gọn, dễ hiểu)",
  "foodAdvice": "Lưu ý quan trọng khi dùng (tương tác thức ăn, đồ uống kiêng kỵ, cảnh báo an toàn)",
  "summary": "Tóm tắt 1 câu dành cho người bệnh"
}`;

    contents.push({
      text: `${promptText}\n\nTrả về JSON chuẩn.`,
    });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const responseText = response.text || "";

    // Parse JSON
    let parsedData = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("JSON parse fallback:", e);
    }

    if (!parsedData) {
      parsedData = {
        name: query || "Thuốc từ ảnh chụp",
        dosage: "Uống theo hướng dẫn của Bác sĩ chuyên khoa.",
        purpose: responseText.slice(0, 180) || "Điều trị các triệu chứng chỉ định.",
        foodAdvice: "Uống với nước lọc. Không uống với rượu bia hoặc nước ép bưởi.",
        summary: responseText.slice(0, 120),
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
      dosage: parsedData.dosage || "Theo chỉ định bác sĩ",
      purpose: parsedData.purpose || "Hỗ trợ điều trị",
      foodAdvice: parsedData.foodAdvice || "Nên uống sau ăn với nước ấm",
      summary: parsedData.summary || "",
      sources: sources.slice(0, 4),
    });
  } catch (error: any) {
    console.error("Lỗi API /api/meds/search:", error);
    return res.status(500).json({
      error: "Không thể tra cứu thông tin thuốc vào lúc này. Vui lòng kiểm tra kết nối và thử lại!",
    });
  }
});
