import React from "react";
import { Stethoscope, LogIn, User as UserIcon } from "lucide-react";
import { useAuthStore, useUIStore } from "../store";
import { useAuthMutations } from "../hooks";

export const Navbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const userTitle = useAuthStore((state) => state.userProfile.userTitle) || "Bác";
  const activeTab = useUIStore((state) => state.activeTab);
  const { login: handleLogin } = useAuthMutations();

  const showNavbarLoginButton = !user && activeTab !== "PROFILE" && activeTab !== "HISTORY";

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#B85B43] text-white rounded-xl shadow-xs flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight text-stone-900 tracking-tight">Trợ lý Y tế AI</h1>
            <p className="text-[11px] font-bold text-[#B85B43] leading-none">Dành cho {userTitle} & Gia đình</p>
          </div>
        </div>

        {/* User Account Area */}
        <div className="flex items-center gap-2">
          {user ? (
            /* User Profile Avatar & Name Chip */
            <div className="flex items-center gap-2 bg-stone-100/80 border border-stone-200/90 rounded-full pl-1.5 pr-3 py-1 shadow-2xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User Avatar"}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-[#B85B43] shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] flex items-center justify-center text-xs font-bold shrink-0">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              <span className="text-xs font-bold text-stone-800 max-w-22.5 truncate leading-none">
                {user.displayName || "Thành viên"}
              </span>
            </div>
          ) : (
            showNavbarLoginButton && (
              <button
                onClick={() => handleLogin()}
                className="px-3.5 py-1.5 bg-[#B85B43] hover:bg-[#A34E37] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
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
