import React, { useState } from "react";
import { PhoneCall, ShieldAlert, X, Check, AlertTriangle, UserCheck, Phone } from "lucide-react";
import { UserProfile } from "../types";

interface SOSButtonProps {
  userProfile: UserProfile;
  onSaveProfile: (newProfile: UserProfile) => Promise<void> | void;
  isLargeText?: boolean;
  setAlertMessage: (msg: string | null) => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ userProfile, onSaveProfile, isLargeText, setAlertMessage }) => {
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [tempName, setTempName] = useState(userProfile.emergencyName || "");
  const [tempPhone, setTempPhone] = useState(userProfile.emergencyPhone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const uTitle = userProfile.userTitle || "Bác";
  const aiTitle = userProfile.aiTitle || "Cháu";

  const hasPhone = Boolean(userProfile.emergencyPhone && userProfile.emergencyPhone.trim().length > 0);

  const handleSOSClick = () => {
    if (hasPhone) {
      triggerCall(userProfile.emergencyName, userProfile.emergencyPhone);
    } else {
      // Open Quick Setup Modal immediately
      setTempName(userProfile.emergencyName || "");
      setTempPhone(userProfile.emergencyPhone || "");
      setSetupError(null);
      setIsQuickSetupOpen(true);
    }
  };

  const triggerCall = (name: string, phone: string) => {
    const contactLabel = name ? `${name} (${phone})` : phone;
    setAlertMessage(
      `🚨 ${aiTitle} đang kết nối cuộc gọi khẩn cấp tới người thân: ${contactLabel}. Trình gọi điện thoại sẽ xuất hiện ngay lập tức.`
    );

    // Trigger direct tel link
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
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
        triggerCall(updatedProfile.emergencyName, updatedProfile.emergencyPhone);
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
        {/* Compact Floating SOS Circle Button */}
        <button
          onClick={handleSOSClick}
          aria-label="Nút Gọi Khẩn Cấp SOS"
          title={
            hasPhone
              ? `Gọi ngay cho ${userProfile.emergencyName || "Người thân"} (${userProfile.emergencyPhone})`
              : "Cài đặt nhanh Số Điện Thoại SOS"
          }
          className={`relative rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-rose-500/40 transition-all duration-200 group-hover:scale-105 ${
            isLargeText ? "w-15 h-15" : "w-13 h-13"
          }`}
        >
          {/* Subtle Outer Ping Ripple Animation */}
          <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30" />

          <div className="relative flex flex-col items-center justify-center">
            <PhoneCall className={`${isLargeText ? "w-6 h-6" : "w-5.5 h-5.5"} text-white animate-pulse`} />
            <span className="text-[9px] font-black tracking-tighter leading-none mt-0.5 uppercase">SOS</span>
          </div>
        </button>
      </div>

      {/* Quick SOS Setup Modal */}
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
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
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
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <PhoneCall className="w-5 h-5 text-white" />
                  <span>LƯU SỐ & GỌI KHẨN CẤP NGAY</span>
                </button>

                <div className="flex gap-2">
                  <button
                    disabled={isSaving}
                    onClick={() => handleSaveAndCall(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4 text-[#B85B43]" />
                    <span>Chỉ lưu số SĐT</span>
                  </button>

                  <button
                    disabled={isSaving}
                    onClick={() => setIsQuickSetupOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl transition-all"
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
