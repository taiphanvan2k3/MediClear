import { PrescriptionScanResult } from "../types";

export interface MedicineInfoResult {
  name: string;
  dosage: string[] | string;
  purpose: string[] | string;
  foodAdvice: string[] | string;
  summary?: string;
  sources?: { title: string; uri: string }[];
  genericName?: string;
}

export async function scanPrescriptionApi(images: string[]): Promise<PrescriptionScanResult> {
  const response = await fetch("/api/scan/prescription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Không thể phân tích đơn thuốc vào lúc này.");
  }

  return data as PrescriptionScanResult;
}

export async function searchMedicineApi(params: {
  query: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<MedicineInfoResult> {
  const response = await fetch("/api/scan/medicine-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: params.query.trim(),
      imageBase64: params.imageBase64,
      mimeType: params.mimeType || "image/jpeg"
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Không thể tìm kiếm thông tin thuốc lúc này.");
  }

  return data as MedicineInfoResult;
}
