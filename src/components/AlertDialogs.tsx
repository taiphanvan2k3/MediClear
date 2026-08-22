import React, { useEffect } from "react";
import { HelpCircle, CheckCircle2, X } from "lucide-react";
import { useUIStore } from "../store";

export const AlertDialogs: React.FC = () => {
  const alertMessage = useUIStore((state) => state.alertMessage);
  const setAlertMessage = useUIStore((state) => state.setAlertMessage);
  const confirmDialog = useUIStore((state) => state.confirmDialog);
  const setConfirmDialog = useUIStore((state) => state.setConfirmDialog);

  // Tự động ẩn thông báo Toast sau 3.5 giây
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alertMessage, setAlertMessage]);

  return (
    <>
      {/* Toast Notification - Warm Skin Tone Clinical Wellness */}
      {alertMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-white/98 text-stone-900 p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-stone-900/10 border border-stone-200/90 border-l-4 border-l-[#B85B43] backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FBF0EC] text-[#B85B43] flex items-center justify-center shrink-0 shadow-xs border border-[#F4DCD3]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-stone-900 leading-snug tracking-tight">
              {alertMessage}
            </p>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center shrink-0 transition-colors active:scale-95 cursor-pointer"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      )}

      {/* Confirmation Dialog Modal - Warm Skin Tone Clinical Wellness */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-xs sm:max-w-sm w-full shadow-2xl border border-stone-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-[#FBF0EC] text-[#B85B43] rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-[#F4DCD3]">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">Xác nhận thao tác</h3>
              <p className="text-sm font-medium text-stone-600 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 px-3 rounded-xl transition-all text-xs sm:text-sm active:scale-98 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="w-full bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold py-3 px-3 rounded-xl shadow-xs transition-all active:scale-98 text-xs sm:text-sm cursor-pointer"
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
