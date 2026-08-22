import React from "react";
import { Smartphone, X, Share, Info } from "lucide-react";

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
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
                Chạm biểu tượng <strong>Chia sẻ <Share className="w-3.5 h-3.5 inline text-sky-600" /></strong> ở
                thanh dưới trình duyệt Safari.
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
              Sau khi cài đặt, bạn có thể <strong>đè giữ icon MediClear</strong> ngoài màn hình chính để gọi SOS khẩn
              cấp 1-touch!
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
};
