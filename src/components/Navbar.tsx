import React from 'react';
import { Stethoscope, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { TabType } from '../types';

interface NavbarProps {
  user: User | null;
  userTitle: string;
  isLargeText?: boolean;
  onToggleLargeText?: () => void;
  onLogin: () => void;
  onLogout: () => void;
  activeTab?: TabType;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userTitle,
  onLogin,
  onLogout,
  activeTab
}) => {
  const showNavbarLoginButton = !user && activeTab !== 'PROFILE' && activeTab !== 'HISTORY';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight text-slate-900 tracking-tight">
              Trợ lý Y tế AI
            </h1>
            <p className="text-[11px] font-semibold text-emerald-700 leading-none">
              Dành cho {userTitle} & Gia đình
            </p>
          </div>
        </div>

        {/* User Account / Authentication Area */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {/* User Profile Avatar & Name Chip */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full pl-1.5 pr-3 py-1 shadow-2xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate leading-none">
                  {user.displayName || "Thành viên"}
                </span>
              </div>

              {/* Explicit Logout Icon Button */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            showNavbarLoginButton && (
              <button
                onClick={onLogin}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-white" />
                <span>Đăng nhập</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};

