import React, { useState } from "react";
import {
  X,
  PhoneCall,
  ShieldAlert,
  MapPin,
  Pill,
  HeartPulse,
  Send,
  Loader2,
  Check,
  AlertTriangle,
  Building,
  UserCheck,
  Info
} from "lucide-react";
import { UserProfile, HistoryRecord } from "../types";

interface MedicalIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  historyRecords: HistoryRecord[];
  isLargeText: boolean;
  setAlertMessage: (msg: string | null) => void;
}

export const MedicalIDModal: React.FC<MedicalIDModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  historyRecords,
  isLargeText,
  setAlertMessage,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const uTitle = userProfile.userTitle || "Bác";
  const patientName = userProfile.nickname ? `${uTitle} ${userProfile.nickname}` : uTitle;
  const emergencyPhone = userProfile.emergencyPhone || "";
  const emergencyName = userProfile.emergencyName || "Người thân SOS";

  // Lấy các thuốc đang dùng từ history
  const activeMeds = historyRecords
    .filter((r) => r.type === "prescription")
    .flatMap((r) => r.details)
    .slice(0, 5);

  const handleCall115 = () => {
    window.location.href = "tel:115";
  };

  const handleCallEmergencyContact = () => {
    if (!emergencyPhone) {
      setAlertMessage("Chưa có số điện thoại người thân SOS! Vui lòng cài đặt trong mục Hồ sơ.");
      return;
    }
    window.location.href = `tel:${emergencyPhone.replace(/\s+/g, "")}`;
  };

  const handleSendLocationSMS = () => {
    if (!emergencyPhone) {
      setAlertMessage("Chưa có số điện thoại người thân SOS để gửi tin nhắn!");
      return;
    }

    if (!navigator.geolocation) {
      // Fallback without GPS
      triggerSMS(null, null);
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
        const { latitude, longitude } = position.coords;
        triggerSMS(latitude, longitude);
      },
      (error) => {
        setIsGettingLocation(false);
        console.warn("Lỗi lấy vị trí GPS:", error);
        triggerSMS(null, null);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const triggerSMS = (lat: number | null, lng: number | null) => {
    const conditionsStr = userProfile.conditions.length > 0 ? userProfile.conditions.join(", ") : "Đang theo dõi";
    const medsSummary = activeMeds.map((m) => m.value).join("; ") || "Xem chi tiết trên ứng dụng MediClear";
    
    let locationText = "";
    if (lat !== null && lng !== null) {
      locationText = `\n📍 Vị trí GPS hiện tại: https://maps.google.com/?q=${lat},${lng}`;
    }

    const message = `🚨 CẦN TRỢ GIÚP KHẨN CẤP!\n${patientName} đang cần hỗ trợ.${locationText}\n🩺 Bệnh nền: ${conditionsStr}\n💊 Thuốc đang uống: ${medsSummary}\n(Tin nhắn khẩn cấp tự động từ MediClear)`;

    const cleanPhone = emergencyPhone.replace(/\s+/g, "");
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    
    setAlertMessage(`✅ Đang mở tin nhắn SMS gửi vị trí và thông tin thuốc tới ${emergencyName} (${emergencyPhone})!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Thẻ Y Tế Cấp Cứu • Medical ID</h3>
              <p className="text-xs text-rose-100 font-medium">Thông tin sống còn cho bác sĩ & người cứu hộ</p>
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
          {/* Thông tin bệnh nhân */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-bold text-stone-500">Bệnh nhân:</span>
              <span className="font-extrabold text-stone-900 text-sm">{patientName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-bold text-stone-500">Tuổi & Năm sinh:</span>
              <span className="font-extrabold text-stone-900">
                {userProfile.birthYear ? `Sinh năm ${userProfile.birthYear}` : userProfile.age ? `${userProfile.age} tuổi` : "Chưa cập nhật"}
              </span>
            </div>

            <div className="space-y-1 pt-0.5">
              <span className="font-bold text-stone-500 block">Bệnh nền đang theo dõi:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {userProfile.conditions.length > 0 ? (
                  userProfile.conditions.map((cond, idx) => (
                    <span key={idx} className="bg-white border border-stone-200 px-2.5 py-0.5 rounded-full font-bold text-stone-800 text-xs shadow-2xs">
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400 italic">Chưa chọn bệnh nền</span>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách thuốc đang dùng */}
          <div className="bg-white border border-stone-200/90 border-l-4 border-l-[#B85B43] rounded-2xl p-4 shadow-soft space-y-2">
            <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#B85B43]" />
              Thuốc đang điều trị (Trích xuất từ đơn AI):
            </h4>

            {activeMeds.length > 0 ? (
              <div className="space-y-1.5 text-xs text-stone-700">
                {activeMeds.map((m, idx) => (
                  <div key={idx} className="bg-[#FDF8F3] p-2 rounded-xl border border-[#F4DCD3] flex items-start gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#B85B43] shrink-0 mt-1.5" />
                    <span><strong className="text-stone-900">{m.label}:</strong> {m.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Chưa có đơn thuốc nào được lưu. Hãy quét đơn thuốc trong mục Sổ Khám để tự động cập nhật vào đây.
              </p>
            )}
          </div>

          {/* Danh sách Hành Động Khẩn Cấp 1-Touch */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Hành động khẩn cấp:</h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCall115}
                className="py-3 px-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <PhoneCall className="w-6 h-6 animate-pulse" />
                <span className="text-xs">GỌI 115 CẤP CỨU</span>
              </button>

              <button
                type="button"
                onClick={handleCallEmergencyContact}
                className="py-3 px-2 bg-stone-900 hover:bg-black text-white font-extrabold rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <PhoneCall className="w-6 h-6 text-emerald-400" />
                <span className="text-xs truncate max-w-full">GỌI {emergencyName.toUpperCase()}</span>
              </button>
            </div>

            {/* Send GPS Location via SMS Button */}
            <button
              type="button"
              disabled={isGettingLocation}
              onClick={handleSendLocationSMS}
              className="w-full py-3 bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] text-[#B85B43] font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-xs"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#B85B43]" />
                  <span>Đang lấy vị trí GPS...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-[#B85B43]" />
                  <span>Gửi Tọa Độ GPS & Đơn Thuốc qua SMS cho Người Thân</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
