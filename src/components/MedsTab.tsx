import React, { useState } from "react";
import { Pill, Search, Clock, Calendar, Check, AlertTriangle, Activity, X } from "lucide-react";

interface MedsTabProps {
  userTitle: string;
  aiTitle: string;
  isLargeText: boolean;
  onSetCalendarReminder: (medName: string, time: string) => void;
}

export const MedsTab: React.FC<MedsTabProps> = ({ userTitle, aiTitle, isLargeText, onSetCalendarReminder }) => {
  const [medQuery, setMedQuery] = useState("");
  const [selectedMed, setSelectedMed] = useState<{
    name: string;
    dosage: string;
    purpose: string;
    foodAdvice: string;
  } | null>(null);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";
  const descClass = isLargeText ? "text-sm" : "text-xs";

  const handleSearchMed = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!medQuery.trim()) return;

    setSelectedMed({
      name: medQuery.trim(),
      dosage: `1 viên / ngày (Uống theo chỉ định của Bác sĩ)`,
      purpose: `Hỗ trợ điều trị & kiểm soát các triệu chứng`,
      foodAdvice: `Nên uống sau khi ăn no 30 phút cùng nước ấm. Tránh uống cùng đồ uống có cồn hoặc nước ngọt.`
    });
  };

  return (
    <div className="space-y-5 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* 1. Header Trang Tra Thuốc */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/80 shadow-2xs">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`${titleClass} text-slate-800`}>Tra cứu & Nhắc lịch uống thuốc</h2>
          <p className={`${descClass} text-slate-500 font-medium`}>
            Tra cứu liều dùng, cảnh báo & tự động đồng bộ Google Calendar
          </p>
        </div>
      </div>

      {/* 2. Thanh Tìm Kiếm Thuốc Hiện Đại */}
      <form onSubmit={handleSearchMed} className="space-y-2">
        <div className="relative flex items-center bg-white border border-slate-300 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all overflow-hidden p-1">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={medQuery}
            onChange={(e) => setMedQuery(e.target.value)}
            placeholder="Gõ tên thuốc (vd: Paracetamol, Amlodipin)..."
            className="w-full bg-transparent border-none text-slate-800 font-semibold text-sm placeholder-slate-400 focus:outline-none py-2 pr-2"
          />
          {medQuery && (
            <button
              type="button"
              onClick={() => setMedQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full mr-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-xs shrink-0"
          >
            Tra cứu
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Gợi ý:</span>
          {["Amlodipin", "Metformin", "Paracetamol", "Omeprazol", "Berberin"].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setMedQuery(chip);
                setSelectedMed({
                  name: `${chip} (Ví dụ)`,
                  dosage: `Uống 1-2 viên / ngày theo chỉ định bác sĩ`,
                  purpose: `Hỗ trợ điều trị chuyên biệt cho nhóm thuốc ${chip}`,
                  foodAdvice: `Nên uống đúng giờ cố định hàng ngày cùng nước lọc.`
                });
              }}
              className="px-2.5 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/80 rounded-full font-semibold text-[11px] text-slate-600 shrink-0 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>

      {/* 3. Màn hình Hướng dẫn khi CHƯA BẤM TÌM KIẾM */}
      {!selectedMed && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center space-y-3 shadow-soft">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
            <Pill className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Bắt đầu tra cứu thông tin thuốc</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
              {userTitle} hãy nhập tên thuốc vào khung trên hoặc chạm chọn thẻ gợi ý thuốc bên dưới để xem hướng dẫn
              liều dùng & tạo lịch nhắc uống thuốc nhé!
            </p>
          </div>
        </div>
      )}

      {/* Thẻ Chi Tiết Thuốc Đã Chọn (Chỉ hiện khi đã chọn hoặc tìm kiếm) */}
      {selectedMed && (
        <div className="bg-white border border-slate-200/90 border-l-4 border-l-emerald-500 rounded-2xl p-4 shadow-soft space-y-3.5 animate-in zoom-in-98 duration-200">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Pill className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className={`${subTitleClass} text-slate-900 font-bold truncate`}>{selectedMed.name}</h3>
                <span className="text-[11px] font-semibold text-emerald-700 block">Thuốc theo dõi sức khỏe</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Khuyên dùng
            </span>
          </div>

          <div className="space-y-2.5 text-slate-700 text-xs sm:text-sm leading-relaxed">
            {/* Liều dùng */}
            <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="p-1 bg-white text-emerald-600 rounded-md shrink-0 border border-slate-200 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Liều dùng khuyến nghị:</span>
                <span className="text-slate-700 font-medium">{selectedMed.dosage}</span>
              </div>
            </div>

            {/* Công dụng */}
            <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="p-1 bg-white text-sky-600 rounded-md shrink-0 border border-slate-200 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Tác dụng & Công dụng:</span>
                <span className="text-slate-700 font-medium">{selectedMed.purpose}</span>
              </div>
            </div>

            {/* Cảnh báo lưu ý ăn uống */}
            <div className="flex items-start gap-2.5 bg-rose-50/80 p-3 rounded-xl border border-rose-200/80 text-rose-950">
              <div className="p-1 bg-rose-100 text-rose-700 rounded-md shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-rose-900 block">Lưu ý quan trọng khi dùng:</span>
                <span className="font-semibold text-rose-900">{selectedMed.foodAdvice}</span>
              </div>
            </div>
          </div>

          {/* Action Button: Lên lịch Google Calendar */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onSetCalendarReminder(selectedMed.name, "08:00")}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-3.5 px-4 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98"
            >
              <Calendar className="w-4.5 h-4.5 text-white shrink-0" />
              <span>Tạo lịch nhắc uống thuốc 8:00 sáng trên Google Calendar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
