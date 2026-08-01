import React from 'react';
import { Info, HelpCircle } from 'lucide-react';

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
  onCloseConfirm,
  aiTitle,
  userTitle
}) => {
  return (
    <>
      {/* Alert Message Dialog Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Thông báo cho {userTitle}</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {alertMessage}
              </p>
            </div>
            <button
              onClick={onCloseAlert}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all active:scale-98 text-sm"
            >
              {aiTitle} đã rõ rồi ạ
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Xác nhận thao tác</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onCloseConfirm}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl transition-all text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all active:scale-98 text-xs"
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
