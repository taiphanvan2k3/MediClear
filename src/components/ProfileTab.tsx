import {
  Check,
  Cloud,
  Edit3,
  HeartPulse,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Type,
  User as UserIcon,
  X
} from "lucide-react";
import React, { useState } from "react";
import { useAuthMutations, useProfileMutations } from "../hooks";
import { useAuthStore, useUIStore } from "../store";
import { AI_TITLE_OPTIONS, PRESET_CONDITIONS, USER_TITLE_OPTIONS } from "../types";

export const ProfileTab: React.FC = () => {
  // Auth Store
  const user = useAuthStore((state) => state.user);
  const userProfile = useAuthStore((state) => state.userProfile);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const customConditionInput = useAuthStore((state) => state.customConditionInput);
  const setCustomConditionInput = useAuthStore((state) => state.setCustomConditionInput);
  const toggleCondition = useAuthStore((state) => state.toggleCondition);
  const addCustomCondition = useAuthStore((state) => state.addCustomCondition);

  // TanStack Query Mutations
  const { saveProfile, isSavingProfile, isProfileSavedSuccess } = useProfileMutations();
  const { login: onLogin, logout: onLogout } = useAuthMutations();

  // UI Store
  const isLargeText = useUIStore((state) => state.isLargeText);
  const onToggleLargeText = useUIStore((state) => state.toggleLargeText);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const uTitle = userProfile.userTitle || "Bác";
  const aiTitle = userProfile.aiTitle || "Cháu";
  const userDisplayName = userProfile.nickname ? userProfile.nickname : user?.displayName ? user.displayName : uTitle;

  const titleClass = isLargeText ? "text-2xl font-extrabold tracking-tight" : "text-xl font-extrabold tracking-tight";

  const handleSaveAndCloseModal = () => {
    saveProfile(userProfile);
    setTimeout(() => {
      setIsSettingsModalOpen(false);
    }, 600);
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
            <p className="text-xs text-stone-600 font-medium leading-relaxed max-w-xs mx-auto">
              Để đồng bộ hồ sơ bệnh lý, cài đặt xưng hô và quản lý sổ khám của gia đình lâu dài, vui lòng đăng nhập tài
              khoản Google.
            </p>
          </div>

          {/* Lợi ích khi đăng nhập */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 text-left space-y-2">
            <div className="flex items-start gap-2 text-xs font-semibold text-stone-700">
              <ShieldCheck className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>Bảo mật 100% hồ sơ bệnh án cá nhân trên Google Cloud</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-stone-700">
              <Cloud className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>Đồng bộ hồ sơ mượt mà trên tất cả thiết bị của gia đình</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-stone-700">
              <Sparkles className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>AI tự động cá nhân hóa xưng hô dịu dàng theo ý muốn</span>
            </div>
          </div>

          {/* Nút Đăng nhập Google */}
          <button
            type="button"
            onClick={() => onLogin()}
            className="w-full flex items-center justify-center gap-2 bg-[#B85B43] hover:bg-[#A34E37] text-white rounded-xl py-3.5 px-4 font-bold text-sm transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <LogIn className="w-5 h-5 text-white" />
            Đăng nhập bằng Google
          </button>
        </div>

        {/* Tùy chọn Cỡ chữ to (Vẫn hỗ trợ khi chưa đăng nhập) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FBF0EC] text-[#B85B43] rounded-xl border border-[#F4DCD3]">
                <Type className="w-5 h-5 text-[#B85B43]" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-900 block">Cỡ chữ to dễ đọc</span>
                <span className="text-xs text-stone-500 font-medium">Hỗ trợ người cao tuổi đọc rõ ràng</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isLargeText} onChange={onToggleLargeText} className="sr-only peer" />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B85B43]"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // GIAO DIỆN CHÍNH KHI ĐÃ ĐĂNG NHẬP: Trang Thông Tin Hồ Sơ Cá Nhân Tổng Quan
  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-[#B85B43]" />
          <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Hồ sơ cá nhân</h2>
        </div>
      </div>

      {/* SECTION 1: User Account Header Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Avatar"}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#B85B43] shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#FBF0EC] text-[#B85B43] border-2 border-[#F4DCD3] flex items-center justify-center font-extrabold text-base shadow-xs">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-extrabold text-stone-900 text-base leading-tight truncate">{userDisplayName}</h3>
              <p className="text-xs text-stone-500 font-medium truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] text-[11px] font-bold px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3 text-[#B85B43]" /> {aiTitle} xưng hô: {uTitle}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onLogout()}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Đăng xuất tài khoản"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SECTION 2: Bệnh nền & Thông tin sức khỏe */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-[#B85B43]" /> Bệnh nền đang theo dõi
          </span>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-xs font-bold text-[#B85B43] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3 text-[#B85B43]" /> Thay đổi
          </button>
        </div>

        {userProfile.conditions && userProfile.conditions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {userProfile.conditions.map((cond, idx) => (
              <span
                key={idx}
                className="bg-[#FBF0EC] border border-[#F4DCD3] text-stone-800 text-xs font-bold px-3 py-1 rounded-xl shadow-2xs"
              >
                {cond}
              </span>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-xl p-3 text-center text-xs text-stone-500 font-medium">
            Chưa cập nhật bệnh nền. Hãy chạm vào{" "}
            <strong className="text-[#B85B43] cursor-pointer" onClick={() => setIsSettingsModalOpen(true)}>
              "Cài đặt & Sửa"
            </strong>{" "}
            để chọn bệnh nền giúp AI đưa ra lời khuyên chính xác nhất.
          </div>
        )}
      </div>

      {/* SECTION 3: Cỡ chữ to Accessibility Switch */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FBF0EC] text-[#B85B43] rounded-xl border border-[#F4DCD3]">
              <Type className="w-5 h-5 text-[#B85B43]" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-stone-900 block">Cỡ chữ to dễ đọc</span>
              <span className="text-xs text-stone-500 font-medium">Tự động phóng to phông chữ toàn ứng dụng</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isLargeText} onChange={onToggleLargeText} className="sr-only peer" />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B85B43]"></div>
          </label>
        </div>
      </div>

      {/* MODAL CÀI ĐẶT & CHỈNH SỬA THÔNG TIN CHI TIẾT */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#B85B43] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base">Cài đặt Hồ sơ & Cách xưng hô</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-left">
              {/* Tên gọi thân mật */}
              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  1. TÊN GỌI HOẶC TÊN THÂN MẬT:
                </label>
                <input
                  type="text"
                  value={userProfile.nickname || ""}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, nickname: e.target.value }))}
                  placeholder={`VD: ${uTitle} Năm, ${uTitle} Hùng, Mẹ Mai...`}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#B85B43]"
                />
              </div>

              {/* Danh Xưng Của Người Dùng */}
              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  2. AI NÊN GỌI BẠN LÀ:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {USER_TITLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setUserProfile((prev) => ({ ...prev, userTitle: opt }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        userProfile.userTitle === opt
                          ? "bg-[#B85B43] text-white border-[#B85B43] shadow-xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh Xưng Của AI */}
              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  3. TRỢ LÝ AI NÊN TỰ XƯNG LÀ:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AI_TITLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setUserProfile((prev) => ({ ...prev, aiTitle: opt }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        userProfile.aiTitle === opt
                          ? "bg-[#B85B43] text-white border-[#B85B43] shadow-xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bệnh Nền */}
              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  4. BỆNH NỀN ĐANG THEO DÕI:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CONDITIONS.map((cond) => {
                    const isSelected = userProfile.conditions?.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#B85B43] text-white border-[#B85B43] shadow-2xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {cond} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>

                {/* Thêm bệnh nền tùy chỉnh */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customConditionInput}
                    onChange={(e) => setCustomConditionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCustomCondition();
                    }}
                    placeholder="Bệnh nền khác (gõ rồi bấm Thêm)..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#B85B43]"
                  />
                  <button
                    type="button"
                    onClick={addCustomCondition}
                    className="bg-[#FBF0EC] hover:bg-[#F4DCD3] text-[#B85B43] border border-[#F4DCD3] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={handleSaveAndCloseModal}
                disabled={isSavingProfile}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-extrabold text-sm transition-all shadow-xs active:scale-98 cursor-pointer ${
                  isProfileSavedSuccess ? "bg-stone-800 text-white" : "bg-[#B85B43] hover:bg-[#A34E37] text-white"
                }`}
              >
                {isSavingProfile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isProfileSavedSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isProfileSavedSuccess ? "Đã lưu cấu hình thành công!" : "LƯU VÀ ĐÓNG CÀI ĐẶT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
