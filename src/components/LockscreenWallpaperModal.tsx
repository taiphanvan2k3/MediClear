import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Download, 
  Sparkles, 
  ShieldAlert, 
  Smartphone, 
  Check, 
  Info, 
  Palette, 
  Eye, 
  QrCode, 
  Phone 
} from "lucide-react";
import { UserProfile, HistoryRecord } from "../types";
import { generateQRCodeCanvas } from "../utils/qr";

interface LockscreenWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  historyRecords: HistoryRecord[];
  isLargeText: boolean;
}

type ThemeType = "terracotta" | "dark" | "emergency";

export const LockscreenWallpaperModal: React.FC<LockscreenWallpaperModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  historyRecords,
  isLargeText,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("terracotta");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const uTitle = userProfile.userTitle || "Bác";
  const patientName = userProfile.nickname || "Bệnh nhân";
  const emergencyName = userProfile.emergencyName || "Người thân";
  const emergencyPhone = userProfile.emergencyPhone || "115";
  const conditionsText = userProfile.conditions.length > 0 
    ? userProfile.conditions.join(" • ") 
    : "Đang theo dõi sức khỏe tổng quát";

  // Lấy các thuốc đang dùng từ history
  const activeMeds = historyRecords
    .filter(r => r.type === "prescription")
    .flatMap(r => r.details.filter(d => d.label.toLowerCase().includes("thuốc") || d.label.toLowerCase().includes("tên")))
    .map(d => d.value)
    .slice(0, 3);

  const medsText = activeMeds.length > 0 ? activeMeds.join(", ") : "Theo dõi đơn thuốc định kỳ";

  useEffect(() => {
    if (!isOpen) return;
    renderWallpaper();
  }, [isOpen, selectedTheme, userProfile, historyRecords]);

  const renderWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background Gradient
    if (selectedTheme === "dark") {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#0F172A");
      grad.addColorStop(0.5, "#1E293B");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
    } else if (selectedTheme === "emergency") {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#881337");
      grad.addColorStop(0.5, "#4C0519");
      grad.addColorStop(1, "#1E020A");
      ctx.fillStyle = grad;
    } else {
      // Terracotta Warm Medical Theme
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#FAF6F0");
      grad.addColorStop(0.4, "#F4DCD3");
      grad.addColorStop(1, "#E8BAA9");
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Lock Screen Clock Representation (Top Area)
    const isDarkBg = selectedTheme === "dark" || selectedTheme === "emergency";
    const primaryTextColor = isDarkBg ? "#FFFFFF" : "#1C1917";
    const secondaryTextColor = isDarkBg ? "#CBD5E1" : "#57534E";
    const accentColor = selectedTheme === "emergency" ? "#FF4D4D" : selectedTheme === "dark" ? "#38BDF8" : "#B85B43";

    ctx.fillStyle = primaryTextColor;
    ctx.font = "bold 130px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("09:41", width / 2, 280);

    ctx.fillStyle = secondaryTextColor;
    ctx.font = "500 42px sans-serif";
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
    ctx.fillText(dateStr, width / 2, 360);

    // 3. Emergency Card Box
    const cardX = 80;
    const cardY = 460;
    const cardW = width - 160;
    const cardH = 1360;
    const radius = 60;

    // Card Background
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    ctx.fillStyle = isDarkBg ? "rgba(30, 41, 59, 0.85)" : "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fill();
    ctx.restore();

    // Card Border
    ctx.strokeStyle = selectedTheme === "emergency" ? "#FF4D4D" : selectedTheme === "dark" ? "rgba(255,255,255,0.15)" : "#E7E5E4";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.stroke();

    // 4. Card Header: 🚨 THẺ Y TẾ CẤP CỨU
    const headerH = 180;
    ctx.fillStyle = selectedTheme === "emergency" ? "#E11D48" : selectedTheme === "dark" ? "#1E293B" : "#B85B43";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, headerH, [radius, radius, 0, 0]);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 46px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🚨 THẺ Y TẾ CẤP CỨU • MEDICAL ID", width / 2, cardY + 80);

    ctx.font = "500 32px sans-serif";
    ctx.fillStyle = isDarkBg ? "#94A3B8" : "#FDE8E1";
    ctx.fillText("Dành cho Bác sĩ & Người trợ giúp khi khẩn cấp", width / 2, cardY + 135);

    // 5. Patient Information Section
    const textStartY = cardY + 260;
    ctx.textAlign = "left";

    // Name & Age
    ctx.fillStyle = primaryTextColor;
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(`👤 Bệnh nhân: ${uTitle} ${patientName}`, cardX + 60, textStartY);

    if (userProfile.birthYear || userProfile.age) {
      ctx.font = "500 34px sans-serif";
      ctx.fillStyle = secondaryTextColor;
      const ageStr = userProfile.birthYear 
        ? `Sinh năm ${userProfile.birthYear}${userProfile.age ? ` (${userProfile.age} tuổi)` : ""}`
        : `${userProfile.age} tuổi`;
      ctx.fillText(`🎂 ${ageStr}`, cardX + 60, textStartY + 60);
    }

    // Conditions
    ctx.fillStyle = primaryTextColor;
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("🩺 Bệnh nền đang theo dõi:", cardX + 60, textStartY + 140);

    ctx.fillStyle = accentColor;
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(conditionsText, cardX + 60, textStartY + 195);

    // Emergency Contact Box (Highlighted)
    const sosBoxY = textStartY + 250;
    const sosBoxH = 160;
    ctx.fillStyle = isDarkBg ? "rgba(225, 29, 72, 0.2)" : "#FFF1F2";
    ctx.beginPath();
    ctx.roundRect(cardX + 40, sosBoxY, cardW - 80, sosBoxH, 30);
    ctx.fill();

    ctx.strokeStyle = "#FDA4AF";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#E11D48";
    ctx.font = "900 36px sans-serif";
    ctx.fillText(`📞 NGƯỜI THÂN SOS: ${emergencyName.toUpperCase()}`, cardX + 70, sosBoxY + 65);

    ctx.font = "900 52px monospace";
    ctx.fillText(`SĐT: ${emergencyPhone}`, cardX + 70, sosBoxY + 125);

    // 6. QR Code Section (Center Bottom of Card)
    const qrSize = 420;
    const qrX = (width - qrSize) / 2;
    const qrY = sosBoxY + sosBoxH + 60;

    // Draw QR Code on helper canvas first
    const qrCanvas = document.createElement("canvas");
    const qrPayload = `TEL:${emergencyPhone};PATIENT:${encodeURIComponent(patientName)};CONDITIONS:${encodeURIComponent(conditionsText)};MEDS:${encodeURIComponent(medsText)}`;
    generateQRCodeCanvas(qrCanvas, qrPayload, { size: qrSize, colorDark: "#000000", colorLight: "#FFFFFF" });

    // Draw White Border around QR
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 40);
    ctx.fill();
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw QR Image onto Canvas
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // 7. Bystander Instructions
    ctx.textAlign = "center";
    ctx.fillStyle = accentColor;
    ctx.font = "900 36px sans-serif";
    ctx.fillText("👉 DÙNG CAMERA ĐIỆN THOẠI QUÉT MÃ", width / 2, qrY + qrSize + 80);

    ctx.fillStyle = secondaryTextColor;
    ctx.font = "500 30px sans-serif";
    ctx.fillText("Xem danh sách thuốc đang uống & vị trí hỗ trợ", width / 2, qrY + qrSize + 130);

    // Update preview data URL
    setPreviewDataUrl(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const a = document.createElement("a");
    a.href = previewDataUrl;
    a.download = `MediClear_Medical_Lockscreen_${userProfile.nickname || "Wallpaper"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#B85B43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Xuất Hình Nền Cấp Cứu Màn Hình Khóa</h3>
              <p className="text-xs text-amber-100 font-medium">Cứu hộ ngay cả khi điện thoại bị khóa mật khẩu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black/15 hover:bg-black/30 text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Information Tip */}
          <div className="bg-[#FDF8F3] border border-[#F4DCD3] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-stone-800">
            <Info className="w-5 h-5 text-[#B85B43] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Khi người già gặp sự cố ngoài đường, người đi đường hoặc bác sĩ cấp cứu chỉ cần <b>dùng điện thoại của họ quét mã QR trên màn hình khóa</b> để biết ngay số điện thoại người nhà và các loại thuốc đang uống!
            </p>
          </div>

          {/* Theme Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#B85B43]" /> Chọn màu sắc hình nền:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTheme("terracotta")}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  selectedTheme === "terracotta"
                    ? "bg-[#FBF0EC] border-[#B85B43] text-[#B85B43] shadow-xs"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-[#B85B43]" />
                <span>Ấm áp</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme("dark")}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  selectedTheme === "dark"
                    ? "bg-slate-900 border-slate-700 text-white shadow-xs"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
                <span>Tối hiện đại</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme("emergency")}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  selectedTheme === "emergency"
                    ? "bg-rose-50 border-rose-600 text-rose-700 shadow-xs"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-600" />
                <span>Khẩn cấp</span>
              </button>
            </div>
          </div>

          {/* Live Mobile Wallpaper Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#B85B43]" /> Bản xem trước trên điện thoại:
            </label>

            <div className="flex justify-center bg-stone-900/5 p-4 rounded-3xl border border-stone-200">
              {/* Phone Mockup Frame */}
              <div className="relative w-56 aspect-9/16 rounded-[32px] overflow-hidden border-4 border-stone-800 shadow-2xl bg-black">
                {/* Dynamic Screen Image */}
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Lockscreen Wallpaper Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs">
                    Đang tạo hình nền...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden Canvas used for generating high-res image */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Setup Guide */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-700 space-y-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Hướng dẫn cài đặt sau khi tải:
            </h4>
            <p className="pl-5 leading-relaxed font-medium">
              Vào ứng dụng <b>Ảnh (Photos)</b> trên điện thoại &gt; Chọn ảnh vừa tải &gt; Bấm <b>Cài làm Hình nền Màn hình khóa (Set as Lockscreen)</b>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-3.5 bg-[#B85B43] hover:bg-[#A34E37] active:scale-98 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-5 h-5 text-white" />
            <span>TẢI ẢNH HÌNH NỀN VỀ MÁY (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
