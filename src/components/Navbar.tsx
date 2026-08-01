import React from 'react';
import { Stethoscope, LogIn, LogOut, Type, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  userTitle: string;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userTitle,
  isLargeText,
  onToggleLargeText,
  onLogin,
  onLogout
}) => {
  return (
    <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs flex items-center justify-center border border-white/20">
            <Stethoscope className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              Trợ lý Y tế AI
            </h1>
            <p className="text-[11px] font-medium text-emerald-100/90 leading-none">
              Dành cho {userTitle} & Gia đình
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Font Size Toggle Button */}
          <button
            onClick={onToggleLargeText}
            className={`p-2 rounded-xl transition-all border text-xs font-bold flex items-center gap-1 ${
              isLargeText
                ? 'bg-emerald-800 text-emerald-100 border-emerald-600'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title={isLargeText ? "Đang bật Chữ to" : "Bật Chữ to dễ đọc"}
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">{isLargeText ? "Chữ to" : "Chữ vừa"}</span>
          </button>

          {/* Login / User Status Button */}
          {user ? (
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 bg-emerald-800/80 hover:bg-emerald-900 border border-emerald-600 rounded-xl text-xs font-bold text-emerald-100 flex items-center gap-1.5 transition-all shadow-xs"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5 text-emerald-200" />
              <span className="max-w-[70px] truncate">{user.displayName || "Thành viên"}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
