import dotenv from "dotenv";

dotenv.config({ override: true });

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    primaryGroundingModel: "gemini-2.5-flash",
    secondaryGroundingModel: "gemini-2.5-flash-lite",
    fallbackModel: "gemini-2.5-flash-lite",
  },
} as const;

export type AppConfig = typeof config;
