import { useMutation } from "@tanstack/react-query";
import { searchMedicineApi, MedicineInfoResult } from "../api/scanApi";
import { useRecordsStore } from "../store";

export function useMedicineSearch() {
  const saveMedSearchHistory = useRecordsStore((state) => state.saveMedSearchHistory);

  const mutation = useMutation({
    mutationFn: (params: { query: string; imageBase64?: string; mimeType?: string }) =>
      searchMedicineApi(params),
    onSuccess: (data: MedicineInfoResult, variables) => {
      saveMedSearchHistory({
        id: `med-hist-${Date.now()}`,
        query: variables.query.trim() || "Ảnh bao bì thuốc",
        name: data.name,
        dosage: data.dosage,
        purpose: data.purpose,
        foodAdvice: data.foodAdvice,
        summary: data.summary,
        sources: data.sources,
        date: "Hôm nay, " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
    }
  });

  return mutation;
}
