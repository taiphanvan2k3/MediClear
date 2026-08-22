import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  FileText,
  Maximize2,
  Pill,
  Printer,
  QrCode,
  Stethoscope
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { HistoryRecord, PrescriptionScanResult, UserProfile } from "../types";
import { generateQRCodeCanvas } from "../utils/qr";

interface PrescriptionSlipViewProps {
  record: HistoryRecord | PrescriptionScanResult;
  userProfile: UserProfile;
  onBack: () => void;
  isLargeText: boolean;
  setAlertMessage: (msg: string | null) => void;
  onOpenLightbox?: (url: string, title: string) => void;
}

type SlipMode = "PHARMACY" | "DOCTOR";

export const PrescriptionSlipView: React.FC<PrescriptionSlipViewProps> = ({
  record,
  userProfile,
  onBack,
  isLargeText,
  setAlertMessage,
  onOpenLightbox
}) => {
  const [activeMode, setActiveMode] = useState<SlipMode>("PHARMACY");
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const uTitle = userProfile.userTitle || "Bác";
  const patientName = userProfile.nickname ? `${uTitle} ${userProfile.nickname}` : `${uTitle} Bệnh nhân`;
  const patientAge = userProfile.age
    ? `${userProfile.age} tuổi`
    : userProfile.birthYear
      ? `Sinh năm ${userProfile.birthYear}`
      : "";
  const patientConditions =
    userProfile.conditions.length > 0 ? userProfile.conditions.join(", ") : "Không có tiền sử bệnh lý đặc biệt";

  // Chuẩn hóa dữ liệu từ HistoryRecord hoặc PrescriptionScanResult
  const title = record?.title || "Đơn thuốc & Phiếu khám";
  const dateStr = ("date" in record ? record.date : null) || new Date().toLocaleDateString("vi-VN");
  const facility = record?.facility || "Cơ sở y tế điều trị";
  const doctor = record?.doctor || "Bác sĩ điều trị";
  const diagnosis = record?.diagnosis || "Theo dõi điều trị định kỳ";
  const advice = record?.advice || "";
  const warning = record?.warning || "";

  // Trích xuất danh sách thuốc
  interface MedItem {
    name: string;
    dosage: string;
    purpose?: string;
    foodAdvice?: string;
  }

  const medications: MedItem[] = React.useMemo(() => {
    if (!record) return [];
    if ("medications" in record && Array.isArray(record.medications)) {
      return record.medications;
    }
    if ("details" in record && Array.isArray(record.details)) {
      return record.details.map((d) => ({
        name: d.label,
        dosage: d.value,
        purpose: "",
        foodAdvice: ""
      }));
    }
    return [];
  }, [record]);

  // Ảnh đơn gốc nếu có
  const images: string[] = React.useMemo(() => {
    if (!record) return [];
    if ("imageUrls" in record && record.imageUrls && record.imageUrls.length > 0) {
      return record.imageUrls;
    }
    if ("imageUrl" in record && record.imageUrl) {
      return [record.imageUrl];
    }
    return [];
  }, [record]);

  // Sinh QR Code
  useEffect(() => {
    if (qrCanvasRef.current) {
      const qrSummary = `MEDICLEAR - ĐƠN THUỐC: ${title}\nBN: ${patientName} (${patientAge})\nChẩn đoán: ${diagnosis}\nThuốc: ${medications.map((m) => `${m.name} (${m.dosage})`).join("; ")}`;
      generateQRCodeCanvas(qrCanvasRef.current, qrSummary, { size: 200, colorDark: "#1C1917" });
    }
  }, [activeMode, showQR, record]);

  // 1. Sao chép nội dung văn bản chuẩn Y tế gửi Zalo/SMS
  const handleCopyFormattedText = () => {
    const divider = "------------------------------------";
    let text = "";

    if (activeMode === "PHARMACY") {
      text = `📋 PHIẾU MUA THUỐC TÂY • MEDICLEAR\n${divider}\n👤 Bệnh nhân: ${patientName} ${patientAge ? `(${patientAge})` : ""}\n🩺 Bệnh nền: ${patientConditions}\n🏥 Nơi kê đơn: ${facility}\n📅 Ngày khám: ${dateStr}\n\n💊 DANH SÁCH THUỐC CẦN MUA (${medications.length} loại):\n`;
      medications.forEach((m, idx) => {
        text += `\n${idx + 1}. ${m.name}\n   - Liều dùng & Cách uống: ${m.dosage}`;
        if (m.foodAdvice) text += `\n   - Lưu ý: ${m.foodAdvice}`;
      });
      if (warning) text += `\n\n⚠️ CẢNH BÁO: ${warning}`;
      text += `\n\n(Dược sĩ vui lòng tư vấn kỹ liều dùng và cách bảo quản khi giao thuốc)`;
    } else {
      text = `🩺 PHIẾU TÓM TẮT ĐƠN THUỐC GỬI BÁC SĨ TÁI KHÁM\n${divider}\n👤 Bệnh nhân: ${patientName} ${patientAge ? `(${patientAge})` : ""}\n🩺 Tiền sử bệnh nền: ${patientConditions}\n🏥 Đơn thuốc từ: ${facility} ${doctor ? `- BS. ${doctor}` : ""}\n📅 Ngày kê: ${dateStr}\n🔍 Chẩn đoán: ${diagnosis}\n\n💊 CÁC THUỐC ĐANG SỬ DỤNG:\n`;
      medications.forEach((m, idx) => {
        text += `\n${idx + 1}. ${m.name}: ${m.dosage}`;
      });
      if (advice) text += `\n\n💡 Lời dặn trước đó: ${advice}`;
      if (warning) text += `\n⚠️ Lưu ý đặc biệt: ${warning}`;
      text += `\n\n(Tạo tự động từ Sổ Y Tế MediClear)`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setAlertMessage("✅ Đã sao chép nội dung phiếu thuốc! Bạn có thể dán vào Zalo để gửi ngay.");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // 2. In Phiếu Thuốc (Print / PDF)
  const handlePrint = () => {
    window.print();
  };

  // 3. Tải Ảnh Phiếu Thuốc HD (PNG) bằng Canvas
  const handleDownloadHDImage = () => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGeneratingImage(false);
      return;
    }

    const width = 1080;
    const padding = 60;
    const headerHeight = 220;
    const itemHeight = 115;
    const totalHeight = Math.max(1400, headerHeight + medications.length * itemHeight + 540);

    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    // Nền trắng chuẩn y tế
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, totalHeight);

    // Header gradient
    const isPharmacy = activeMode === "PHARMACY";
    const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
    if (isPharmacy) {
      headerGrad.addColorStop(0, "#065F46"); // Emerald
      headerGrad.addColorStop(1, "#059669");
    } else {
      headerGrad.addColorStop(0, "#1E3A8A"); // Cerulean
      headerGrad.addColorStop(1, "#2563EB");
    }
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, headerHeight);

    // Tiêu đề App & Tên phiếu
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("MEDICLEAR • SỔ Y TẾ THÔNG MINH", padding, 70);

    ctx.font = "bold 44px sans-serif";
    const modeTitle = isPharmacy ? "PHIẾU MUA THUỐC TÂY (PHARMACY SLIP)" : "PHIẾU ĐƠN THUỐC TÁI KHÁM (DOCTOR CARD)";
    ctx.fillText(modeTitle, padding, 135);

    ctx.font = "28px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(`Ngày tạo: ${dateStr} • Đơn: ${title.slice(0, 30)}`, padding, 185);

    // Khung Thông tin Bệnh nhân
    let curY = headerHeight + 40;
    ctx.fillStyle = "#F8FAFC";
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(padding, curY, width - padding * 2, 200, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(`Bệnh nhân: ${patientName} ${patientAge ? `(${patientAge})` : ""}`, padding + 30, curY + 55);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`Tiền sử bệnh nền: ${patientConditions}`, padding + 30, curY + 105);
    ctx.fillText(`Nơi kê đơn: ${facility} ${doctor ? `(BS. ${doctor})` : ""}`, padding + 30, curY + 155);

    // Tiêu đề Danh sách thuốc
    curY += 260;
    ctx.fillStyle = isPharmacy ? "#065F46" : "#1E3A8A";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(`DANH SÁCH THUỐC CẦN MUA / SỬ DỤNG (${medications.length} LOẠI)`, padding, curY);

    // Đường kẻ ngang
    curY += 20;
    ctx.strokeStyle = isPharmacy ? "#065F46" : "#1E3A8A";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padding, curY);
    ctx.lineTo(padding + 320, curY);
    ctx.stroke();

    // Render từng loại thuốc
    curY += 40;
    medications.forEach((med, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(padding, curY, width - padding * 2, 105, 16);
      ctx.fill();
      ctx.stroke();

      // Số thứ tự
      ctx.fillStyle = isPharmacy ? "#065F46" : "#1E3A8A";
      ctx.beginPath();
      ctx.roundRect(padding + 16, curY + 22, 50, 50, 12);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(idx + 1), padding + 41, curY + 58);
      ctx.textAlign = "left";

      // Tên thuốc
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(med.name, padding + 85, curY + 46);

      // Liều dùng
      ctx.fillStyle = "#334155";
      ctx.font = "24px sans-serif";
      ctx.fillText(`Liều & Cách uống: ${med.dosage}`, padding + 85, curY + 82);

      curY += 125;
    });

    // Phần Cảnh báo & Lưu ý
    if (warning || advice) {
      curY += 20;
      ctx.fillStyle = "#FFFBEB";
      ctx.strokeStyle = "#FDE68A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(padding, curY, width - padding * 2, 130, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#92400E";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("⚠️ LƯU Ý DÙNG THUỐC & CẢNH BÁO:", padding + 30, curY + 45);

      ctx.fillStyle = "#78350F";
      ctx.font = "24px sans-serif";
      const noteText = warning || advice;
      ctx.fillText(noteText.slice(0, 75) + (noteText.length > 75 ? "..." : ""), padding + 30, curY + 90);
      curY += 160;
    }

    // Footer
    ctx.fillStyle = "#64748B";
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Ứng dụng MediClear • Sổ Y Tế Thông Minh & Hỗ Trợ Đọc Đơn Thuốc", width / 2, totalHeight - 40);

    // Xuất file PNG
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Phieu_Don_Thuoc_${activeMode}_${patientName.replace(/\s+/g, "_")}.png`;
    link.href = dataUrl;
    link.click();

    setIsGeneratingImage(false);
    setAlertMessage("🎉 Đã tải Ảnh Phiếu Thuốc HD thành công về thiết bị!");
  };

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";

  return (
    <div className="space-y-4 px-4 py-3 animate-in slide-in-from-right duration-200 max-w-md mx-auto min-h-[85vh] flex flex-col">
      {/* Hidden Canvas to export HD Image */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Push App Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-extrabold text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#B85B43]" />
          <span>Quay lại Lịch sử</span>
        </button>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            activeMode === "PHARMACY"
              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
              : "bg-sky-100 text-sky-900 border border-sky-300"
          }`}
        >
          {activeMode === "PHARMACY" ? "Dành cho Dược sĩ" : "Dành cho Bác sĩ"}
        </span>
      </div>

      {/* Tiêu đề trang */}
      <div className="space-y-1">
        <h2 className={`${titleClass} text-stone-900 font-extrabold flex items-center gap-2`}>
          {activeMode === "PHARMACY" ? (
            <Pill className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <Stethoscope className="w-6 h-6 text-sky-600 shrink-0" />
          )}
          <span>{activeMode === "PHARMACY" ? "Phiếu Đem Đi Mua Thuốc" : "Phiếu Đơn Thuốc Tái Khám"}</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          {activeMode === "PHARMACY"
            ? "Mở màn hình này đưa Dược sĩ tại quầy thuốc tây đọc và lấy thuốc chính xác"
            : "Đưa Bác sĩ xem nhanh chẩn đoán cũ, các thuốc đang uống và tiền sử bệnh"}
        </p>
      </div>

      {/* Segmented Switch Buttons (Ra tiệm mua thuốc vs Bác sĩ tái khám) */}
      <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        <button
          type="button"
          onClick={() => setActiveMode("PHARMACY")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === "PHARMACY"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>1. Ra tiệm mua thuốc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("DOCTOR")}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === "DOCTOR"
              ? "bg-sky-700 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>2. Bác sĩ tái khám</span>
        </button>
      </div>

      {/* Thẻ Thông Tin Bệnh Nhân */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-soft space-y-2.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <span className={`${subTitleClass} text-stone-900 font-extrabold`}>{patientName}</span>
            {patientAge && (
              <span className="text-[11px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                {patientAge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            {dateStr}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-0.5">
            <span className="text-stone-500 font-semibold block text-[11px]">Tiền sử bệnh nền:</span>
            <span className="font-bold text-stone-900">{patientConditions}</span>
          </div>

          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-0.5">
            <span className="text-stone-500 font-semibold block text-[11px]">Nơi kê đơn & Bác sĩ:</span>
            <span className="font-bold text-stone-900">
              {facility} {doctor && doctor !== "Bác sĩ điều trị" ? `(BS. ${doctor})` : ""}
            </span>
          </div>
        </div>

        {diagnosis && (
          <div className="bg-[#FDF8F3] border border-[#F4DCD3] p-2.5 rounded-xl text-xs space-y-0.5">
            <span className="text-[#B85B43] font-semibold block text-[11px]">Chẩn đoán ban đầu:</span>
            <span className="font-extrabold text-stone-900">{diagnosis}</span>
          </div>
        )}
      </div>

      {/* Danh Sách Thuốc */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Pill className={`w-4 h-4 ${activeMode === "PHARMACY" ? "text-emerald-600" : "text-sky-600"}`} />
            Danh sách {medications.length} loại thuốc cần lấy:
          </h3>

          <span className="text-[11px] font-bold text-stone-500">
            {activeMode === "PHARMACY" ? "Dược sĩ kiểm tra liều" : "Thuốc đang uống"}
          </span>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-stone-300">
            <Pill className="w-8 h-8 text-stone-400 mx-auto mb-1.5" />
            <p className="text-xs text-stone-500 font-medium">Chưa có thông tin thuốc trong đơn này.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {medications.map((med, idx) => (
              <div
                key={idx}
                className={`bg-white border rounded-2xl p-4 shadow-soft space-y-2 transition-all ${
                  activeMode === "PHARMACY"
                    ? "border-stone-200 border-l-4 border-l-emerald-600"
                    : "border-stone-200 border-l-4 border-l-sky-600"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        activeMode === "PHARMACY"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <h4 className={`${subTitleClass} text-stone-900 font-extrabold`}>{med.name}</h4>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-stone-700 pl-9">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">Liều dùng & Cách uống:</strong> {med.dosage}
                    </span>
                  </div>

                  {med.foodAdvice && (
                    <div className="flex items-start gap-1.5 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-950">Lưu ý:</strong> {med.foodAdvice}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cảnh báo & Lưu ý dùng thuốc */}
      {(warning || advice) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1 shadow-2xs">
          <span className="font-extrabold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Lưu ý quan trọng từ đơn thuốc:
          </span>
          <p className="leading-relaxed font-medium">{warning || advice}</p>
        </div>
      )}

      {/* Đối Chiếu Ảnh Đơn Gốc */}
      {images.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-soft space-y-2">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#B85B43]" />
            Ảnh chụp đơn gốc (để Dược sĩ / Bác sĩ đối chiếu con dấu, chữ ký):
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => onOpenLightbox && onOpenLightbox(imgUrl, `Ảnh đơn gốc ${idx + 1}`)}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 cursor-pointer shrink-0 shadow-2xs group"
              >
                <img src={imgUrl} alt={`Ảnh gốc ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/0 flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mã QR Tra Cứu */}
      {showQR && (
        <div className="p-4 bg-white border border-stone-200 rounded-2xl text-center space-y-2 shadow-soft animate-in fade-in duration-200">
          <canvas ref={qrCanvasRef} className="mx-auto rounded-xl shadow-xs border border-stone-200 bg-white p-2" />
          <p className="text-xs text-stone-600 font-medium">
            Dược sĩ / Bác sĩ có thể dùng Camera quét mã này để xem tóm tắt đơn thuốc ngay lập tức.
          </p>
        </div>
      )}

      {/* Hộp Công Cụ Hành Động Đa Kênh (Action Toolbar) */}
      <div className="pt-2 pb-6 space-y-2.5 mt-auto">
        {/* Dòng 1: Tải Ảnh HD & Sao chép Zalo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadHDImage}
            disabled={isGeneratingImage}
            className={`py-3.5 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all text-white shadow-sm active:scale-98 cursor-pointer ${
              activeMode === "PHARMACY" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-sky-700 hover:bg-sky-800"
            }`}
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isGeneratingImage ? "Đang tạo ảnh..." : "Tải Ảnh Thẻ (PNG)"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFormattedText}
            className="py-3.5 px-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-soft active:scale-98 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
            <span>{copied ? "Đã chép vào Zalo!" : "Sao chép gửi Zalo"}</span>
          </button>
        </div>

        {/* Dòng 2: In giấy / PDF & Toggle QR Code */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>In Phiếu / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="py-3 px-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-stone-500" />
            <span>{showQR ? "Ẩn mã QR" : "Hiện mã QR"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
