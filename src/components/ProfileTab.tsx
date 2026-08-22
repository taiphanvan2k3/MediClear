import {
  Check,
  ChevronRight,
  Cloud,
  Download,
  Edit3,
  HeartPulse,
  Info,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Phone,
  Plus,
  Save,
  Settings,
  Share,
  ShieldCheck,
  Smartphone,
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
  const deferredInstallPrompt = useUIStore((state) => state.deferredInstallPrompt);
  const setDeferredInstallPrompt = useUIStore((state) => state.setDeferredInstallPrompt);
  const isAppInstalled = useUIStore((state) => state.isAppInstalled);
  const setIsAppInstalled = useUIStore((state) => state.setIsAppInstalled);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showPwaGuideModal, setShowPwaGuideModal] = useState(false);

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

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        setIsAppInstalled(true);
      }
      setDeferredInstallPrompt(null);
    } else {
      setShowPwaGuideModal(true);
    }
  };

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-1 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-[#B85B43]" />
          <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Hồ sơ cá nhân</h2>
        </div>
      </div>

      {/* 1. MAIN CONTENT: Switch between Unauthenticated & Authenticated */}
      {!user ? (
        /* =================== CHƯA ĐĂNG NHẬP (UNAUTHENTICATED) =================== */
        <div className="space-y-4">
          {/* Khung Yêu cầu Đăng nhập */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 text-center space-y-4 shadow-soft">
            <div className="w-16 h-16 bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8 text-[#B85B43]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-stone-900">Yêu cầu đăng nhập tài khoản</h3>
              <p className="text-xs text-stone-600 font-medium leading-relaxed max-w-xs mx-auto">
                Để đồng bộ hồ sơ bệnh lý, cài đặt xưng hô và quản lý sổ khám của gia đình lâu dài, vui lòng đăng nhập
                tài khoản Google.
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

          {/* Group Cài Đặt Chung Khi Chưa Đăng Nhập */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider px-1">
              Cài đặt & Tiện ích ứng dụng
            </span>

            <div className="bg-white border border-stone-200/90 rounded-3xl shadow-soft divide-y divide-stone-100 overflow-hidden">
              {/* Cài đặt PWA */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">
                      Cài đặt MediClear
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block truncate">
                      {isAppInstalled ? "Đã cài đặt trên máy" : "Ghim ra màn hình chính để mở nhanh"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer flex items-center gap-1 ${
                    isAppInstalled
                      ? "bg-stone-100 text-stone-600 border border-stone-200"
                      : "bg-[#B85B43] hover:bg-[#A34E37] text-white"
                  }`}
                >
                  {isAppInstalled ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã cài</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Cài đặt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cỡ chữ to */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center shrink-0">
                    <Type className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">Cỡ chữ to dễ đọc</span>
                    <span className="text-[11px] text-stone-500 font-medium block truncate">
                      Phóng to chữ cho người lớn tuổi
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={isLargeText} onChange={onToggleLargeText} className="sr-only peer" />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B85B43]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =================== ĐÃ ĐĂNG NHẬP (AUTHENTICATED) =================== */
        <div className="space-y-4">
          {/* HERO PROFILE CARD: User Info & AI Persona Badge */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-4 shadow-soft space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-[#B85B43] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-[#FBF0EC] text-[#B85B43] border-2 border-[#F4DCD3] flex items-center justify-center font-extrabold text-lg shadow-xs shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-extrabold text-stone-900 text-base leading-snug truncate">{userDisplayName}</h3>
                  <p className="text-xs text-stone-500 font-medium truncate">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onLogout()}
                className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* AI Persona Box Inside Hero Card */}
            <div className="bg-[#FAF6F0] border border-[#F4DCD3] rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-[#FBF0EC] rounded-xl text-[#B85B43] shrink-0 border border-[#F4DCD3]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Cách xưng hô AI
                  </span>
                  <p className="text-xs font-bold text-stone-800 truncate">
                    {aiTitle} xưng hô: <span className="text-[#B85B43] font-extrabold">{uTitle}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-[11px] font-bold text-[#B85B43] hover:text-[#A34E37] bg-white border border-[#F4DCD3] px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Thay đổi
              </button>
            </div>
          </div>

          {/* HEALTH & MEDICAL CONDITIONS CARD */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-4 shadow-soft space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FBF0EC] rounded-xl text-[#B85B43] border border-[#F4DCD3]">
                  <HeartPulse className="w-4 h-4 text-[#B85B43]" />
                </div>
                <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">
                  Bệnh nền đang theo dõi
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-xs font-bold text-[#B85B43] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Sửa
              </button>
            </div>

            {userProfile.conditions && userProfile.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {userProfile.conditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="bg-[#FAF6F0] border border-[#F4DCD3] text-stone-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs inline-flex items-center gap-1"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 rounded-2xl p-3 text-center text-xs text-stone-500 font-medium">
                Chưa cập nhật bệnh nền. Chạm vào{" "}
                <strong className="text-[#B85B43] cursor-pointer" onClick={() => setIsSettingsModalOpen(true)}>
                  "Sửa"
                </strong>{" "}
                để AI cảnh báo thuốc chính xác nhất.
              </div>
            )}
          </div>

          {/* GROUPED PREFERENCES & APP SETTINGS (INSET LIST CARD) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider px-1">
              Cài đặt & Tiện ích ứng dụng
            </span>

            <div className="bg-white border border-stone-200/90 rounded-3xl shadow-soft divide-y divide-stone-100 overflow-hidden">
              {/* Row 1: SĐT Người Thân Gọi SOS PWA */}
              <div
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">
                      Phím tắt gọi SOS khẩn cấp
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block truncate">
                      {userProfile.emergencyPhone
                        ? `${userProfile.emergencyName || "Người thân"}: ${userProfile.emergencyPhone}`
                        : "Chưa cài đặt SĐT người thân"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>

              {/* Row 2: Cài Đặt Ứng Dụng PWA */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">
                      Cài đặt MediClear
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block truncate">
                      {isAppInstalled ? "Đã cài đặt trên máy" : "Ghim ra màn hình chính để mở nhanh"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer flex items-center gap-1 ${
                    isAppInstalled
                      ? "bg-stone-100 text-stone-600 border border-stone-200"
                      : "bg-[#B85B43] hover:bg-[#A34E37] text-white"
                  }`}
                >
                  {isAppInstalled ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã cài</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Cài đặt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Row 3: Cỡ Chữ To Dễ Đọc */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center shrink-0">
                    <Type className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">Cỡ chữ to dễ đọc</span>
                    <span className="text-[11px] text-stone-500 font-medium block truncate">
                      Phóng to chữ cho người lớn tuổi
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" checked={isLargeText} onChange={onToggleLargeText} className="sr-only peer" />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B85B43]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* SECURITY & CLOUD SYNC FOOTNOTE */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-center gap-1.5 text-stone-500 text-[11px] font-medium text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hồ sơ y tế được bảo mật & đồng bộ trên Google Cloud</span>
          </div>
        </div>
      )}

      {/* =================== SHARED MODALS (LUÔN RENDER DÙ ĐÃ ĐĂNG NHẬP HAY CHƯA) =================== */}
      {/* MODAL HƯỚNG DẪN CÀI ĐẶT PWA LÊN MÀN HÌNH CHÍNH (IOS / ANDROID) */}
      {showPwaGuideModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FBF0EC] text-[#B85B43] rounded-xl border border-[#F4DCD3]">
                  <Smartphone className="w-5 h-5 text-[#B85B43]" />
                </div>
                <h3 className="font-extrabold text-base text-stone-900">Cách cài đặt MediClear</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaGuideModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 leading-relaxed font-medium">
              {/* iPhone / Safari */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                  🍎 Dành cho iPhone / iPad (Safari):
                </span>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Chạm biểu tượng{" "}
                    <strong>
                      Chia sẻ <Share className="w-3.5 h-3.5 inline text-sky-600" />
                    </strong>{" "}
                    ở thanh dưới trình duyệt Safari.
                  </li>
                  <li>
                    Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen) ➕</strong>.
                  </li>
                  <li>
                    Bấm <strong>Thêm</strong> ở góc trên bên phải.
                  </li>
                </ol>
              </div>

              {/* Android / Chrome */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                  🤖 Dành cho Android (Chrome / Cốc Cốc):
                </span>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Chạm biểu tượng <strong>Menu 3 chấm ⋮</strong> ở góc trên bên phải.
                  </li>
                  <li>
                    Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.
                  </li>
                </ol>
              </div>

              <div className="p-2.5 bg-[#FBF0EC] border border-[#F4DCD3] rounded-xl flex items-start gap-2 text-stone-800">
                <Info className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
                <span className="text-[11px]">
                  Sau khi cài đặt, bạn có thể <strong>đè giữ icon MediClear</strong> ngoài màn hình chính để gọi SOS
                  khẩn cấp 1-touch!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPwaGuideModal(false)}
              className="w-full py-2.5 bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

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

              {/* SĐT Người thân cho Phím tắt Cấp cứu PWA */}
              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    5. SĐT NGƯỜI THÂN (PHÍM TẮT PWA SOS):
                  </label>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Số này sẽ được gọi trực tiếp khi đè giữ icon MediClear ngoài màn hình chính.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={userProfile.emergencyName || ""}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, emergencyName: e.target.value }))}
                    placeholder="Tên người thân (VD: Con Trang)"
                    className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#B85B43]"
                  />
                  <input
                    type="tel"
                    value={userProfile.emergencyPhone || ""}
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
