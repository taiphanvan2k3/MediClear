import { useMutation } from "@tanstack/react-query";
import { scanPrescriptionApi } from "../api/scanApi";
import { useScanStore, useUIStore } from "../store";

export function useScanPrescription() {
  const setScanResult = useScanStore((state) => state.setScanResult);
  const setScanState = useScanStore((state) => state.setScanState);
  const setSelectedImages = useScanStore((state) => state.setSelectedImages);
  const setActiveImageIndex = useScanStore((state) => state.setActiveImageIndex);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);

  const mutation = useMutation({
    mutationFn: (images: string[]) => scanPrescriptionApi(images),
    onMutate: (images) => {
      setSelectedImages(images);
      setActiveImageIndex(0);
      setScanState("ANALYZING");
    },
    onSuccess: (data) => {
      setScanResult(data);
      setScanState("RESULT");
    },
    onError: (err: any) => {
      console.error("Lỗi khi phân tích đơn thuốc qua Gemini Vision:", err);
      setAlertMessage(err.message || "Không thể phân tích ảnh đơn thuốc. Vui lòng thử lại!");
      setScanState("IDLE");
    }
  });

  const scanImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files) as File[];
    const validFiles = fileArray.filter((f) => f && f.type && f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      setAlertMessage("Vui lòng chọn hoặc chụp tệp hình ảnh hợp lệ (JPG, PNG)!");
      return;
    }

    const readPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((images) => {
      mutation.mutate(images);
    });
  };

  return {
    ...mutation,
    scanImages,
    isAnalyzing: mutation.isPending
  };
}
