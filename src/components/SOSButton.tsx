import React, { useState } from "react";
import { 
  PhoneCall, 
  ShieldAlert, 
  X, 
  Check, 
  AlertTriangle, 
  UserCheck, 
  Phone, 
  MapPin, 
  Smartphone, 
  IdCard, 
  Loader2 
} from "lucide-react";
import { UserProfile, HistoryRecord } from "../types";

interface SOSButtonProps {
  userProfile: UserProfile;
  historyRecords?: HistoryRecord[];
  onSaveProfile: (newProfile: UserProfile) => Promise<void> | void;
  isLargeText?: boolean;
  setAlertMessage: (msg: string | null) => void;
  onOpenMedicalID?: () => void;
  onOpenLockscreenWallpaper?: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ 
  userProfile, 
  historyRecords = [],
  onSaveProfile, 
  isLargeText, 
  setAlertMessage,
  onOpenMedicalID,
  onOpenLockscreenWallpaper
}) => {
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [tempName, setTempName] = useState(userProfile.emergencyName || "");
  const [tempPhone, setTempPhone] = useState(userProfile.emergencyPhone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const uTitle = userProfile.userTitle || "Bác";
  const aiTitle = userProfile.aiTitle || "Cháu";
  const patientName = userProfile.nickname ? `${uTitle} ${userProfile.nickname}` : uTitle;

  const hasPhone = Boolean(userProfile.emergencyPhone && userProfile.emergencyPhone.trim().length > 0);

  const handleSOSClick = () => {
    if (hasPhone) {
      setIsActionsModalOpen(true);
    } else {
      setTempName(userProfile.emergencyName || "");
      setTempPhone(userProfile.emergencyPhone || "");
      setSetupError(null);
      setIsQuickSetupOpen(true);
    }
  };

  const triggerCall = (phone: string, label: string) => {
    setAlertMessage(
      `🚨 ${aiTitle} đang kết nối cuộc gọi khẩn cấp tới: ${label}. Trình gọi điện sẽ xuất hiện ngay lập tức.`
    );
    setIsActionsModalOpen(false);
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  };

  const handleSendLocationSMS = () => {
    if (!hasPhone) {
      setAlertMessage("Chưa có số điện thoại người thân để gửi tin nhắn SOS!");
      return;
    }

    if (!navigator.geolocation) {
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
    const activeMeds = historyRecords
      .filter((r) => r.type === "prescription")
      .flatMap((r) => r.details)
      .slice(0, 3)
      .map((m) => m.value)
      .join("; ") || "Xem chi tiết trên ứng dụng MediClear";

    let locationText = "";
    if (lat !== null && lng !== null) {
      locationText = `\n📍 Vị trí GPS hiện tại: https://maps.google.com/?q=${lat},${lng}`;
    }

    const message = `🚨 CẦN TRỢ GIÚP KHẨN CẤP!\n${patientName} đang cần hỗ trợ.${locationText}\n🩺 Bệnh nền: ${conditionsStr}\n💊 Thuốc đang uống: ${activeMeds}\n(Tin nhắn khẩn cấp tự động từ MediClear)`;

    const cleanPhone = userProfile.emergencyPhone.replace(/\s+/g, "");
    setIsActionsModalOpen(false);
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    
    setAlertMessage(`✅ Đang mở tin nhắn SMS gửi vị trí và thông tin thuốc tới ${userProfile.emergencyName} (${userProfile.emergencyPhone})!`);
  };

  const handleSaveAndCall = async (shouldCallImmediately: boolean) => {
    const cleanPhone = tempPhone.trim();
    if (!cleanPhone) {
      setSetupError("Vui lòng nhập số điện thoại người thân để thực hiện cuộc gọi SOS!");
      return;
    }

    if (cleanPhone.length < 8) {
      setSetupError("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại đầy đủ!");
      return;
    }

    setIsSaving(true);
    setSetupError(null);

    const updatedProfile: UserProfile = {
      ...userProfile,
      emergencyName: tempName.trim() || "Người thân SOS",
      emergencyPhone: cleanPhone
    };

    try {
      await onSaveProfile(updatedProfile);
      setIsQuickSetupOpen(false);

      if (shouldCallImmediately) {
        triggerCall(updatedProfile.emergencyPhone, `${updatedProfile.emergencyName} (${updatedProfile.emergencyPhone})`);
      } else {
        setAlertMessage(
          `✅ Đã lưu thành công SĐT SOS người thân (${updatedProfile.emergencyName}: ${updatedProfile.emergencyPhone}). Bây giờ có thể chạm 1-touch nút SOS màu đỏ bất kỳ lúc nào để gọi ngay!`
        );
      }
    } catch (e) {
      console.error("Lỗi khi lưu SĐT SOS:", e);
      setSetupError("Không thể lưu thông tin. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Global Floating Emergency SOS Widget */}
      <div className="fixed bottom-21 right-3.5 z-40 flex flex-col items-end group">
        <button
          onClick={handleSOSClick}
          aria-label="Nút Gọi Khẩn Cấp SOS"
          title={
            hasPhone
              ? `Mở menu cứu hộ khẩn cấp SOS (${userProfile.emergencyName || "Người thân"})`
              : "Cài đặt nhanh Số Điện Thoại SOS"
          }
          className={`relative rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-rose-500/40 transition-all duration-200 group-hover:scale-105 cursor-pointer ${
            isLargeText ? "w-15 h-15" : "w-13 h-13"
          }`}
        >
          <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30" />

          <div className="relative flex flex-col items-center justify-center">
            <PhoneCall className={`${isLargeText ? "w-6 h-6" : "w-5.5 h-5.5"} text-white animate-pulse`} />
            <span className="text-[9px] font-black tracking-tighter leading-none mt-0.5 uppercase">SOS</span>
          </div>
        </button>
      </div>

      {/* Emergency Actions Menu Modal */}
      {isActionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-100 animate-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Trung Tâm Cứu Hộ Khẩn Cấp (SOS)</h3>
                  <p className="text-xs text-rose-100 font-medium">Hỗ trợ khẩn cấp cho {patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsActionsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Body */}
            <div className="p-4 space-y-2.5 text-stone-900">
              {/* Action 1: Call Emergency Contact (Primary) */}
              <button
                type="button"
                onClick={() => triggerCall(userProfile.emergencyPhone, `${userProfile.emergencyName} (${userProfile.emergencyPhone})`)}
                className="w-full p-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <PhoneCall className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight">GỌI NGƯỜI THÂN NGAY</h4>
                    <p className="text-xs text-rose-100 font-medium">
                      {userProfile.emergencyName || "Người thân"}: <strong className="text-white">{userProfile.emergencyPhone}</strong>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-xl shrink-0">
                  Gọi ngay
                </span>
              </button>

              {/* Action 2: Call 115 */}
              <button
                type="button"
                onClick={() => triggerCall("115", "Cấp cứu 115")}
                className="w-full p-3.5 bg-stone-900 hover:bg-black active:scale-98 text-white rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <PhoneCall className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight">GỌI CẤP CỨU Y TẾ 115</h4>
                    <p className="text-xs text-stone-400 font-medium">Tổng đài cấp cứu y tế quốc gia</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-stone-800 text-stone-200 px-3 py-1 rounded-xl">
                  115
                </span>
              </button>

              {/* Action 3: Send GPS & Meds via SMS */}
              <button
                type="button"
                disabled={isGettingLocation}
                onClick={handleSendLocationSMS}
                className="w-full p-3.5 bg-[#FBF0EC] hover:bg-[#F4DCD3] active:scale-98 border border-[#F4DCD3] text-[#B85B43] rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-[#F4DCD3] rounded-xl text-[#B85B43]">
                    {isGettingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight">Gửi Vị Trí GPS & Đơn Thuốc qua SMS</h4>
                    <p className="text-xs text-stone-600 font-medium">Tự động định vị và nhắn tin cho người thân</p>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Action 4: View Medical ID */}
                {onOpenMedicalID && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsModalOpen(false);
                      onOpenMedicalID();
                    }}
                    className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-stone-800 transition-all cursor-pointer"
                  >
                    <IdCard className="w-5 h-5 text-[#B85B43]" />
                    <span className="text-xs font-bold">Thẻ Y Tế Cấp Cứu</span>
                  </button>
                )}

                {/* Action 5: Lockscreen Wallpaper Generator */}
                {onOpenLockscreenWallpaper && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsModalOpen(false);
                      onOpenLockscreenWallpaper();
                    }}
                    className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-stone-800 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 text-[#B85B43]" />
                    <span className="text-xs font-bold">Hình Nền Khóa QR</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick SOS Setup Modal (Khi chưa có SĐT) */}
      {isQuickSetupOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Cài đặt SĐT Cấp cứu (SOS)</h3>
                  <p className="text-xs text-rose-100 font-medium">Gọi 1-touch ngay cho người thân khi xảy ra sự cố</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickSetupOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium">
                  Chưa có số điện thoại người thân SOS. Vui lòng nhập số dưới đây để khi bấm nút SOS màu đỏ, ứng
                  dụng sẽ tự động kết nối cuộc gọi ngay lập tức!
                </p>
              </div>

              {setupError && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              {/* Input Name */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block">
                  Tên người thân / Vai trò:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="VD: Con gái Trang, Bác sĩ Hùng, Con trai..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
                  <UserCheck className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Input Phone */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block">
                  Số điện thoại gọi khẩn cấp (*):
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  disabled={isSaving}
                  onClick={() => handleSaveAndCall(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5 text-white" />
                  <span>LƯU SỐ & GỌI KHẨN CẤP NGAY</span>
                </button>

                <div className="flex gap-2">
                  <button
                    disabled={isSaving}
                    onClick={() => handleSaveAndCall(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#B85B43]" />
                    <span>Chỉ lưu số SĐT</span>
                  </button>

                  <button
                    disabled={isSaving}
                    onClick={() => setIsQuickSetupOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
