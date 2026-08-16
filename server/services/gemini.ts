import { GoogleGenAI } from "@google/genai";
import { config } from "../config/env";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    if (!config.gemini.apiKey) {
      console.warn("[Gemini] CẢNH BÁO: Biến môi trường GEMINI_API_KEY chưa được thiết lập!");
    }

    aiInstance = new GoogleGenAI({
      apiKey: config.gemini.apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}
