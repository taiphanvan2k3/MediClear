import { useMutation } from "@tanstack/react-query";
import { saveRecordToFirestore } from "../api/firebaseApi";
import { HistoryRecord } from "../types";
import { useScanStore, useAuthStore, useRecordsStore, useUIStore } from "../store";

export function useSavePrescriptionRecord() {
  const scanResult = useScanStore((state) => state.scanResult);
  const selectedImages = useScanStore((state) => state.selectedImages);
  const user = useAuthStore((state) => state.user);
  const userProfile = useAuthStore((state) => state.userProfile);
  const addRecord = useRecordsStore((state) => state.addRecord);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!scanResult) return null;

      const details: { label: string; value: string; status?: "normal" | "high" | "warning" }[] = [];
      if (scanResult.medications && scanResult.medications.length > 0) {
        for (const med of scanResult.medications) {
          details.push({
            label: med.name,
            value: `${med.dosage}${med.foodAdvice ? ` (Lưu ý: ${med.foodAdvice})` : ""}`,
            status: "normal"
          });
        }
      }
      if (scanResult.labResults && scanResult.labResults.length > 0) {
        for (const lab of scanResult.labResults) {
          details.push({
            label: lab.label,
            value: lab.value,
            status: lab.status
          });
        }
      }

      const newRecord: HistoryRecord = {
        id: `rec-${Date.now()}`,
        title: scanResult.title || `Sổ khám mới (${selectedImages.length} trang)`,
        date: new Date().toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }),
        type: scanResult.type || "prescription",
        badge: scanResult.badge || "Đang dùng",
        badgeType: scanResult.badgeType || "info",
        summary: scanResult.summary || `Đã phân tích ${selectedImages.length} ảnh thực tế.`,
        facility: scanResult.facility,
        doctor: scanResult.doctor,
        diagnosis: scanResult.diagnosis,
        imageUrls: selectedImages,
        details: details.length > 0 ? details : [{ label: "Thông tin", value: scanResult.summary }],
        advice: scanResult.advice || "Bác nhớ uống thuốc đúng giờ và đều đặn nhé ạ.",
        warning: scanResult.warning
      };

      if (user) {
        await saveRecordToFirestore(user.uid, newRecord);
      }

      return newRecord;
    },
    onSuccess: (newRecord) => {
      if (!newRecord) return;
      addRecord(newRecord);
      const userGreeting = userProfile.userTitle || "Bác";
      setAlertMessage(
        `Đã lưu thành công ${selectedImages.length} ảnh và kết quả vào phần Lịch sử! ${userGreeting} có thể mở xem lại bất cứ lúc nào.`
      );
    },
    onError: (err: any) => {
      console.error("Lỗi khi lưu kết quả:", err);
      setAlertMessage("Lưu không thành công, vui lòng thử lại sau nhé!");
    }
  });

  return mutation;
}
