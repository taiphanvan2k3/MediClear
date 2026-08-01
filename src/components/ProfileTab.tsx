import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Check, 
  LogIn, 
  LogOut, 
  Sliders, 
  Plus, 
  Loader2, 
  Save, 
  Phone, 
  Type, 
  HeartPulse,
  Settings,
  X,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  UserProfile, 
  USER_TITLE_OPTIONS, 
  AI_TITLE_OPTIONS, 
  PRESET_CONDITIONS 
} from '../types';

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

  const uTitle = userProfile.userTitle || 'Bác';
  const aiTitle = userProfile.aiTitle || 'Cháu';
  const userDisplayName = userProfile.nickname ? userProfile.nickname : (user?.displayName ? user.displayName : uTitle);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const descClass = isLargeText ? "text-sm" : "text-xs";

  const handleSaveAndCloseModal = () => {
    onSaveProfile();
    setTimeout(() => {
      setIsSettingsModalOpen(false);
    }, 600);
  };

  return (
    <div className="space-y-5 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-emerald-600" />
            <h2 className={`${titleClass} text-slate-800`}>Hồ sơ cá nhân</h2>
          </div>
          <p className={`${descClass} text-slate-500`}>
            Thông tin sức khỏe & Cấu hình Trợ lý AI
          </p>
        </div>

        {/* Setting Modal Trigger */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 shrink-0"
        >
          <Settings className="w-4 h-4 text-emerald-600" />
          <span>Cài đặt</span>
        </button>
      </div>

      {/* Account Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-emerald-500" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200 shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
          )}
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className={`${titleClass} text-slate-900 font-bold truncate`}>
              {user ? (user.displayName || userDisplayName) : "Chưa đăng nhập"}
            </h3>
            <p className={`${descClass} text-slate-500 font-medium truncate`}>
              {user?.email || "Đăng nhập để đồng bộ thông tin & lịch nhắc"}
            </p>
            {user ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3 text-emerald-600" />
                Đã đồng bộ Google Cloud
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                💡 Lưu trên thiết bị (Offline)
              </span>
            )}
          </div>
        </div>

        {/* Auth Buttons */}
        {!user ? (
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-4 font-bold text-xs transition-all shadow-xs active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập bằng Google
          </button>
        ) : (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2 px-4 font-bold text-xs transition-all"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            Đăng xuất tài khoản
          </button>
        )}
      </div>

      {/* HEALTH & CONVERSATION SUMMARY CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className={`${subTitleClass} text-slate-900 font-bold`}>
              Thông tin theo dõi
            </h3>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            Chỉnh sửa <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs text-slate-700 font-medium">
          {/* Pronouns & Nickname */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-bold">Xưng hô AI:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {uTitle} ↔ {aiTitle} ({userDisplayName})
            </span>
          </div>

          {/* Age & Birth Year */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-bold">Độ tuổi:</span>
            <span className="font-bold text-slate-800">
              {userProfile.age ? `${userProfile.age} tuổi` : 'Chưa cập nhật'} {userProfile.birthYear ? `(Sinh năm ${userProfile.birthYear})` : ''}
            </span>
          </div>

          {/* Health Conditions */}
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-bold block">Bệnh nền đang theo dõi:</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {userProfile.conditions && userProfile.conditions.length > 0 ? (
                userProfile.conditions.map((cond, idx) => (
                  <span key={idx} className="bg-white text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-2xs">
                    {cond}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">Chưa chọn bệnh nền nào</span>
              )}
            </div>
          </div>

          {/* Emergency SOS contact */}
          <div className="flex items-center justify-between bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
            <span className="text-rose-900 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Người thân SOS:
            </span>
            <span className="font-bold text-rose-950">
              {userProfile.emergencyName || 'Chưa cài đặt'} ({userProfile.emergencyPhone || '---'})
            </span>
          </div>
        </div>
      </div>

      {/* QUICK SETTINGS CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          TÙY CHỈNH GIAO DIỆN & CÀI ĐẶT:
        </h3>

        {/* 1. Open Setting Modal Button Row */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                Cài đặt Xưng hô & Bệnh nền
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Thay đổi cách gọi, độ tuổi và người thân khẩn cấp
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2. Large Text Switch Row */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                Cỡ chữ to dễ đọc
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tăng kích thước chữ cho người cao tuổi
              </span>
            </div>
          </div>

          <button 
            onClick={onToggleLargeText}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
              isLargeText ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              isLargeText ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Emergency SOS Call Button */}
      <button 
        onClick={() => setAlertMessage(`${aiTitle} đang thực hiện cuộc gọi khẩn cấp đến người thân của ${uTitle}: ${userProfile.emergencyName} (${userProfile.emergencyPhone})!`)}
        className="w-full flex items-center justify-center gap-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl p-4 text-base font-bold active:scale-98 transition-all shadow-sm"
      >
        <Phone className="w-5 h-5" />
        ☎️ GỌI NGƯỜI THÂN KHẨN CẤP ({userProfile.emergencyName || 'SOS'})
      </button>

      {/* SETTINGS MODAL / SLIDE DIALOG */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base text-white">Cài đặt Hồ sơ & Xưng hô</h3>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors"
                title="Đóng cài đặt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
              {/* 1. Pronouns Selection */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. XƯNG HÔ NÓI CHUYỆN VỚI AI:
                </label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">AI gọi {uTitle} là:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {USER_TITLE_OPTIONS.map((title) => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => setUserProfile(prev => ({ ...prev, userTitle: title }))}
                          className={`px-3 py-1 rounded-xl font-bold text-xs transition-all border ${
                            userProfile.userTitle === title
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {userProfile.userTitle === title && <Check className="w-3 h-3 inline mr-1" />}
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Trợ lý AI tự xưng là:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {AI_TITLE_OPTIONS.map((aiOpt) => (
                        <button
                          key={aiOpt}
                          type="button"
                          onClick={() => setUserProfile(prev => ({ ...prev, aiTitle: aiOpt }))}
                          className={`px-3 py-1 rounded-xl font-bold text-xs transition-all border ${
                            userProfile.aiTitle === aiOpt
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {userProfile.aiTitle === aiOpt && <Check className="w-3 h-3 inline mr-1" />}
                          {aiOpt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Nickname */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  2. TÊN HOẶC BIỆT DANH THÂN MẬT:
                </label>
                <input 
                  type="text"
                  value={userProfile.nickname}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder={`Ví dụ: ${uTitle} Tám, ${uTitle} Nam...`}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* 3. Age & Birth Year */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    ĐỘ TUỔI (TUỔI):
                  </label>
                  <input 
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="68"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    NĂM SINH:
                  </label>
                  <input 
                    type="number"
                    value={userProfile.birthYear}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                    placeholder="1958"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 4. Health Conditions */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
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
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 text-emerald-700" /> : <Plus className="w-3 h-3" />}
                        {cond}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Condition Add */}
                <div className="flex gap-2 pt-1">
                  <input 
                    type="text"
                    value={customConditionInput}
                    onChange={(e) => setCustomConditionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onAddCustomCondition()}
                    placeholder="Thêm bệnh nền khác..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    type="button"
                    onClick={onAddCustomCondition}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
              </div>

              {/* 5. Emergency Contact */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  5. NGƯỜI THÂN KHẨN CẤP (NÚT SOS):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text"
                    value={userProfile.emergencyName}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, emergencyName: e.target.value }))}
                    placeholder="Tên người thân"
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="tel"
                    value={userProfile.emergencyPhone}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    placeholder="Số điện thoại"
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
              <button 
                type="button"
                onClick={handleSaveAndCloseModal}
                disabled={isSavingProfile}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-bold text-sm transition-all shadow-xs active:scale-98 ${
                  profileSavedSuccess
                    ? 'bg-sky-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSavingProfile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : profileSavedSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {profileSavedSuccess ? 'Đã lưu cấu hình thành công!' : 'LƯU VÀ ĐÓNG CÀI ĐẶT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

