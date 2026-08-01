import React, { useEffect } from "react";
import { HelpCircle, CheckCircle2, X } from "lucide-react";

interface AlertDialogsProps {
  alertMessage: string | null;
  onCloseAlert: () => void;
  confirmDialog: { message: string; onConfirm: () => void } | null;
  onCloseConfirm: () => void;
  aiTitle: string;
  userTitle: string;
}

export const AlertDialogs: React.FC<AlertDialogsProps> = ({
  alertMessage,
  onCloseAlert,
  confirmDialog,
  onCloseConfirm
}) => {
  // Tự động ẩn thông báo Toast sau 3.5 giây
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        onCloseAlert();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alertMessage, onCloseAlert]);

  return (
    <>
      {/* Toast Notification - Clinical Modern Wellness (Mobile Ready & High Accessibility) */}
      {alertMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-white/98 text-slate-900 p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 border-l-4 border-l-emerald-500 backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug tracking-tight">
              {alertMessage}
            </p>
          </div>
          <button
            onClick={onCloseAlert}
            className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 transition-colors active:scale-95"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Confirmation Dialog Modal - Clinical Modern Wellness */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-xs sm:max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-sky-100">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Xác nhận thao tác</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={onCloseConfirm}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-3 rounded-xl transition-all text-xs sm:text-sm active:scale-98"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-3 rounded-xl shadow-xs transition-all active:scale-98 text-xs sm:text-sm"
              >
                Đồng ý thực hiện
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
