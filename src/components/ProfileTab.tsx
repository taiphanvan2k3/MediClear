import React, { useState } from "react";
import {
  User as UserIcon,
  Check,
  LogIn,
  LogOut,
  Plus,
  Loader2,
  Save,
  Phone,
  Type,
  HeartPulse,
  Settings,
  X,
  ShieldAlert,
  Sparkles,
  Lock,
  ShieldCheck,
  Cloud,
  Edit3,
  UserCheck
} from "lucide-react";
import { User } from "firebase/auth";
import { UserProfile, USER_TITLE_OPTIONS, AI_TITLE_OPTIONS, PRESET_CONDITIONS } from "../types";

interface ProfileTabProps {
  user: User | null;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  customConditionInput: string;
  setCustomConditionInput: (val: string) => void;
  isSavingProfile: boolean;
  profileSavedSuccess: boolean;
  onSaveProfile: (p?: UserProfile) => void;
  onToggleCondition: (cond: string) => void;
  onAddCustomCondition: () => void;
  onLogin: () => void;
  onLogout: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  setAlertMessage: (msg: string | null) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  userProfile,
  setUserProfile,
  customConditionInput,
  setCustomConditionInput,
  isSavingProfile,
  profileSavedSuccess,
  onSaveProfile,
  onToggleCondition,
  onAddCustomCondition,
  onLogin,
  onLogout,
  isLargeText,
  onToggleLargeText,
  setAlertMessage
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const uTitle = userProfile.userTitle || "Bác";
  const aiTitle = userProfile.aiTitle || "Cháu";
  const userDisplayName = userProfile.nickname ? userProfile.nickname : user?.displayName ? user.displayName : uTitle;

  const titleClass = isLargeText ? "text-2xl font-extrabold tracking-tight" : "text-xl font-extrabold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const descClass = isLargeText ? "text-sm" : "text-xs";

  const isProfileEmpty =
    !userProfile.age && (!userProfile.conditions || userProfile.conditions.length === 0) && !userProfile.emergencyName;

  const handleSaveAndCloseModal = () => {
    onSaveProfile();
    setTimeout(() => {
      setIsSettingsModalOpen(false);
    }, 600);
  };

  const handleEmergencyCall = () => {
    if (userProfile.emergencyPhone) {
      const contactLabel = userProfile.emergencyName
        ? `${userProfile.emergencyName} (${userProfile.emergencyPhone})`
        : userProfile.emergencyPhone;
      setAlertMessage(
        `🚨 ${aiTitle} đang kết nối cuộc gọi khẩn cấp tới người thân: ${contactLabel}. Màn hình gọi điện sẽ xuất hiện ngay lập tức.`
      );
      window.location.href = `tel:${userProfile.emergencyPhone.replace(/\s+/g, "")}`;
    } else {
      setAlertMessage(`Vui lòng cập nhật số điện thoại người thân trong mục Cài đặt trước khi thực hiện cuộc gọi SOS!`);
      setIsSettingsModalOpen(true);
    }
  };

  // Trạng thái khi CHƯA ĐĂNG NHẬP: Hiển thị màn hình Yêu cầu đăng nhập tập trung
  if (!user) {
    return (
      <div className="space-y-5 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <UserIcon className="w-6 h-6 text-[#B85B43]" />
          <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Hồ sơ cá nhân</h2>
        </div>

        {/* Khung Yêu cầu Đăng nhập */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8 text-[#B85B43]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-stone-900">Yêu cầu đăng nhập tài khoản</h3>
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed max-w-xs mx-auto">
              Để bảo mật hồ sơ sức khỏe cá nhân, tùy chỉnh xưng hô Trợ lý AI và tự động đồng bộ trên Google Cloud, vui
              lòng đăng nhập tài khoản Google.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 text-left space-y-2">
            <div className="flex items-start gap-2.5 text-xs font-semibold text-stone-700">
              <ShieldCheck className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>Bảo mật 100% dữ liệu sức khỏe & người thân khẩn cấp</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs font-semibold text-stone-700">
              <Sparkles className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>Tùy chỉnh xưng hô Trợ lý AI phù hợp lứa tuổi</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs font-semibold text-stone-700">
              <Cloud className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>Tự động đồng bộ lịch nhắc uống thuốc trên Google Calendar</span>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#B85B43] hover:bg-[#A34E37] text-white rounded-xl py-3.5 px-4 font-bold text-sm transition-all shadow-xs active:scale-98"
          >
            <LogIn className="w-5 h-5 text-white" />
            Đăng nhập ngay bằng Google
          </button>
        </div>

        {/* Cài đặt Nhanh Cỡ Chữ */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FBF0EC] text-[#B85B43] rounded-lg">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-stone-900 text-sm block">Cỡ chữ to dễ đọc</span>
                <span className="text-xs text-stone-500 font-medium">Tăng kích thước chữ cho người cao tuổi</span>
              </div>
            </div>

            <button
              onClick={onToggleLargeText}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                isLargeText ? "bg-[#B85B43]" : "bg-stone-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isLargeText ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái khi ĐÃ ĐĂNG NHẬP: Giao diện Clinical Modern Wellness Tông Da Ấm
  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* 1. Header Trang Hồ Sơ với Single Primary Action */}
      <div className="flex items-center justify-between pb-1 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#B85B43]" />
            <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Hồ sơ cá nhân</h2>
          </div>
          <p className={`${descClass} text-stone-500 font-medium`}>Thông tin sức khỏe & Cấu hình Trợ lý AI</p>
        </div>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B85B43] hover:bg-[#A34E37] text-white rounded-xl font-extrabold text-xs transition-all shadow-xs active:scale-95 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-white" />
          <span>Chỉnh sửa hồ sơ</span>
        </button>
      </div>

      {/* 2. Thẻ Tài Khoản Google (Warm Skin Tone Card) */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-4.5 shadow-soft relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-13 h-13 rounded-full border-2 border-[#B85B43] object-cover shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-[#FBF0EC] text-[#B85B43] flex items-center justify-center font-extrabold text-xl border border-[#F4DCD3] shrink-0 shadow-xs">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <h3 className={`${subTitleClass} text-stone-900 font-extrabold truncate leading-tight`}>
                {user.displayName || userDisplayName}
              </h3>
              <p className={`${descClass} text-stone-500 font-medium truncate`}>{user.email || "Google Account"}</p>
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B85B43] bg-[#FBF0EC] border border-[#F4DCD3] px-2.5 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-[#B85B43] shrink-0" />
                  Đồng bộ Google Cloud
                </span>
              </div>
            </div>
          </div>

          {/* Minimalist Logout Button */}
          <button
            onClick={onLogout}
            title="Đăng xuất tài khoản Google"
            className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-stone-200/60 hover:border-rose-200 transition-all active:scale-95 shrink-0"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 3. Thẻ Hồ sơ Y tế & Xưng hô AI (Clinical Health & Persona Card) */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FBF0EC] text-[#B85B43] rounded-xl border border-[#F4DCD3]">
              <HeartPulse className="w-5 h-5 text-[#B85B43]" />
            </div>
            <div>
              <h3 className={`${subTitleClass} text-stone-900 font-extrabold`}>Hồ sơ Y tế & Xưng hô AI</h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Cấu hình tương tác Trợ lý AI và theo dõi bệnh nền
              </p>
            </div>
          </div>
        </div>

        {/* Guidance Alert Banner if profile is empty */}
        {isProfileEmpty && (
          <div className="bg-[#FBF0EC] border border-[#F4DCD3] rounded-2xl p-3.5 text-xs text-stone-900 flex items-start gap-2.5 shadow-2xs">
            <Sparkles className="w-4.5 h-4.5 text-[#B85B43] shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <p className="font-extrabold text-stone-900">Bổ sung thông tin để AI tư vấn chính xác</p>
              <p className="text-stone-700 font-medium leading-relaxed">
                Vui lòng bấm nút <b>"Chỉnh sửa hồ sơ"</b> phía trên để thêm độ tuổi, bệnh nền và SĐT người thân SOS!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 text-xs text-stone-700">
          {/* Pronoun Badge Row */}
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
            <span className="text-stone-600 font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#B85B43]" />
              Cách xưng hô AI:
            </span>
            <span className="font-extrabold text-[#B85B43] bg-[#FBF0EC] border border-[#F4DCD3] px-3 py-1 rounded-full shadow-2xs text-xs">
              AI xưng là <b>{aiTitle}</b> • Gọi là <b>{uTitle}</b>{" "}
              {userProfile.nickname ? `(${userProfile.nickname})` : ""}
            </span>
          </div>

          {/* Birth Year & Age Summary */}
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
            <span className="text-stone-600 font-bold">Năm sinh & Độ tuổi:</span>
            <span className="font-extrabold text-stone-900 text-xs">
              {userProfile.birthYear ? (
                `Sinh năm ${userProfile.birthYear}${userProfile.age ? ` (${userProfile.age} tuổi)` : ""}`
              ) : userProfile.age ? (
                `${userProfile.age} tuổi`
              ) : (
                <span className="text-stone-400 italic font-medium">Chưa cập nhật</span>
              )}
            </span>
          </div>

          {/* Health Conditions Pill List */}
          <div className="space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
            <span className="text-stone-600 font-bold block">Bệnh nền đang theo dõi:</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {userProfile.conditions && userProfile.conditions.length > 0 ? (
                userProfile.conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-stone-800 border border-stone-200 px-3 py-1 rounded-full font-bold text-xs shadow-2xs"
                  >
                    {cond}
                  </span>
                ))
              ) : (
                <span className="text-stone-400 italic font-medium">Chưa chọn bệnh nền nào</span>
              )}
            </div>
          </div>

          {/* Emergency SOS Contact Pill */}
          <div className="flex items-center justify-between bg-rose-50/80 p-3 rounded-2xl border border-rose-200/80">
            <span className="text-rose-900 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Người thân SOS:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-rose-950 text-xs">
                {userProfile.emergencyName ? (
                  `${userProfile.emergencyName} (${userProfile.emergencyPhone || "Chưa có SĐT"})`
                ) : (
                  <span className="text-rose-400 italic font-medium">Chưa cài đặt</span>
                )}
              </span>
              {userProfile.emergencyPhone && (
                <button
                  onClick={handleEmergencyCall}
                  title="Gọi thử nghiệm SOS"
                  className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Inside Card */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl font-bold text-xs text-stone-700 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Settings className="w-4 h-4 text-[#B85B43]" />
          <span>Cấu hình chi tiết Hồ sơ & Xưng hô</span>
        </button>
      </div>

      {/* 4. Tùy chọn Giao diện & Ứng dụng */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-4.5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FBF0EC] text-[#B85B43] rounded-xl border border-[#F4DCD3]">
              <Type className="w-5 h-5 text-[#B85B43]" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-sm block">Cỡ chữ to dễ đọc</span>
              <span className="text-xs text-stone-500 font-medium">Tăng kích thước chữ cho người cao tuổi</span>
            </div>
          </div>

          <button
            onClick={onToggleLargeText}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
              isLargeText ? "bg-[#B85B43]" : "bg-stone-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isLargeText ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Slide Modal Cài đặt */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#B85B43] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-100" />
                <h3 className="font-extrabold text-base text-white">Cài đặt Hồ sơ & Xưng hô</h3>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 bg-black/15 hover:bg-black/30 text-white rounded-xl transition-colors"
                title="Đóng cài đặt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form cài đặt */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-stone-800">
              {/* Xưng hô Dynamic Matrix */}
              <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    1. XƯNG HÔ NÓI CHUYỆN VỚI AI:
                  </label>
                  <span className="text-[11px] font-bold text-[#B85B43] bg-[#FBF0EC] border border-[#F4DCD3] px-2.5 py-0.5 rounded-full">
                    AI xưng <b>{aiTitle}</b> • Gọi là <b>{uTitle}</b>
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-stone-600 block">AI gọi bạn/bác là:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {USER_TITLE_OPTIONS.map((title) => {
                        const isSelected = userProfile.userTitle === title;
                        return (
                          <button
                            key={title}
                            type="button"
                            onClick={() => {
                              const isYoung = title === "Anh" || title === "Chị";
                              const newAiTitle = isYoung ? "Em" : userProfile.aiTitle === "Con" ? "Con" : "Cháu";
                              setUserProfile((prev) => ({
                                ...prev,
                                userTitle: title,
                                aiTitle: newAiTitle
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1 ${
                              isSelected
                                ? "bg-[#B85B43] text-white border-[#B85B43] shadow-xs"
                                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                            {title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-stone-200/80">
                    <span className="text-[11px] font-bold text-stone-600 block">Trợ lý AI tự xưng là:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(userProfile.userTitle === "Anh" || userProfile.userTitle === "Chị"
                        ? ["Em"]
                        : ["Cháu", "Con"]
                      ).map((aiOpt) => {
                        const isSelected = userProfile.aiTitle === aiOpt;
                        return (
                          <button
                            key={aiOpt}
                            type="button"
                            onClick={() => setUserProfile((prev) => ({ ...prev, aiTitle: aiOpt }))}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1 ${
                              isSelected
                                ? "bg-[#B85B43] text-white border-[#B85B43] shadow-xs"
                                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                            {aiOpt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nickname */}
              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  2. TÊN HOẶC BIỆT DANH THÂN MẬT:
                </label>
                <input
                  type="text"
                  value={userProfile.nickname}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, nickname: e.target.value }))}
                  placeholder={`Ví dụ: ${uTitle} Tám, ${uTitle} Nam...`}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#B85B43] transition-all"
                />
              </div>

              {/* Birth Year Input Only */}
              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">3. NĂM SINH:</label>
                <input
                  type="number"
                  value={userProfile.birthYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    const currentYear = new Date().getFullYear();
                    let calcAge = "";
                    if (val && !isNaN(Number(val)) && val.length === 4) {
                      const yr = parseInt(val, 10);
                      if (yr > 1900 && yr <= currentYear) {
                        calcAge = String(currentYear - yr);
                      }
                    }
                    setUserProfile((prev) => ({
                      ...prev,
                      birthYear: val,
                      age: calcAge || (val === "" ? "" : prev.age)
                    }));
                  }}
                  placeholder="Ví dụ: 1958, 2003..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#B85B43] transition-all"
                />
              </div>

              {/* Health Conditions */}
              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  4. BỆNH NỀN / TIỀN SỬ SỨC KHỎE THEO DÕI:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CONDITIONS.map((cond) => {
                    const isSelected = userProfile.conditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => onToggleCondition(cond)}
                        className={`px-2.5 py-1 rounded-full font-bold text-xs transition-all border flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#FBF0EC] text-[#B85B43] border-[#F4DCD3] shadow-2xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 text-[#B85B43]" /> : <Plus className="w-3 h-3" />}
                        {cond}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Condition */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customConditionInput}
                    onChange={(e) => setCustomConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAddCustomCondition()}
                    placeholder="Thêm bệnh nền khác..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#B85B43]"
                  />
                  <button
                    type="button"
                    onClick={onAddCustomCondition}
                    className="bg-[#FBF0EC] hover:bg-[#F4DCD3] text-[#B85B43] border border-[#F4DCD3] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  5. NGƯỜI THÂN KHẨN CẤP (NÚT SOS):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={userProfile.emergencyName}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, emergencyName: e.target.value }))}
                    placeholder="Tên người thân"
                    className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#B85B43]"
                  />
                  <input
                    type="tel"
                    value={userProfile.emergencyPhone}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                    placeholder="Số điện thoại"
                    className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#B85B43]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={handleSaveAndCloseModal}
                disabled={isSavingProfile}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-extrabold text-sm transition-all shadow-xs active:scale-98 ${
                  profileSavedSuccess ? "bg-stone-800 text-white" : "bg-[#B85B43] hover:bg-[#A34E37] text-white"
                }`}
              >
                {isSavingProfile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : profileSavedSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {profileSavedSuccess ? "Đã lưu cấu hình thành công!" : "LƯU VÀ ĐÓNG CÀI ĐẶT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
