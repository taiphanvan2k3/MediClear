import React, { useState } from 'react';
import { Pill, Search, Clock, Calendar, Check } from 'lucide-react';

interface MedsTabProps {
  userTitle: string;
  aiTitle: string;
  isLargeText: boolean;
  onSetCalendarReminder: (medName: string, time: string) => void;
}

export const MedsTab: React.FC<MedsTabProps> = ({
  userTitle,
  aiTitle,
  isLargeText,
  onSetCalendarReminder
}) => {
  const [medQuery, setMedQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<{
    name: string;
    dosage: string;
    purpose: string;
    foodAdvice: string;
  } | null>({
    name: 'Amlodipin 5mg',
    dosage: ' Uống 1 viên vào lúc 8 giờ sáng hàng ngày',
    purpose: ' Giúp hạ và kiểm soát huyết áp luôn ổn định',
    foodAdvice: ' Uống sau khi ăn sáng. Không uống chung với nước ép bưởi!'
  });

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";

  const handleSearchMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medQuery.trim()) return;
    
    setSelectedMed({
      name: medQuery.trim(),
      dosage: `1 viên / ngày (Uống theo chỉ định của bác sĩ)`,
      purpose: `Hỗ trợ điều trị & kiểm soát các triệu chứng`,
      foodAdvice: `Nên uống sau khi ăn no 30 phút cùng nước ấm.`
    });
  };

  return (
    <div className="space-y-5 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Pill className="w-6 h-6 text-emerald-600" />
        <h2 className={`${titleClass} text-slate-800`}>Tra cứu cách dùng thuốc:</h2>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchMed} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={medQuery}
            onChange={(e) => setMedQuery(e.target.value)}
            placeholder="Gõ tên thuốc (ví dụ: Paracetamol, Amlodipin)..." 
            className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
        <button 
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-2xl text-xs transition-all active:scale-95 shadow-xs"
        >
          Tra cứu
        </button>
      </form>

      {/* Selected Medicine Detail Card */}
      {selectedMed && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className={`${subTitleClass} text-slate-900 font-bold flex items-center gap-2`}>
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Pill className="w-5 h-5" />
              </span>
              Thuốc: {selectedMed.name}
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Khuyên dùng
            </span>
          </div>

          <div className="space-y-2 text-slate-700 font-medium text-xs leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="font-bold text-slate-900 shrink-0">Liều dùng:</span>
              <span>{selectedMed.dosage}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-slate-900 shrink-0">Công dụng:</span>
              <span>{selectedMed.purpose}</span>
            </p>
            <p className="flex items-start gap-2 text-rose-800 font-semibold bg-rose-50/80 p-2.5 rounded-xl border border-rose-100">
              <span className="font-bold shrink-0">⚠️ Lưu ý:</span>
              <span>{selectedMed.foodAdvice}</span>
            </p>
          </div>

          {/* Create Reminder Action Box */}
          <div className="pt-2 border-t border-slate-100">
            <button 
              onClick={() => onSetCalendarReminder(selectedMed.name, "08:00")}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 px-3 font-bold text-xs transition-all shadow-xs active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              TẠO LỊCH NHẮC NHỞ UỐNG THUỐC 8:00 SÁNG
            </button>
          </div>
        </div>
      )}

      {/* Common Medicines Quick Grid */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          MỘT SỐ THUỐC PHỔ BIẾN HÀNG NGÀY:
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Amlodipin 5mg', tag: 'Huyết áp' },
            { name: 'Metformin 500mg', tag: 'Tiểu đường' },
            { name: 'Paracetamol 500mg', tag: 'Giảm đau' },
            { name: 'Omeprazol 20mg', tag: 'Dạ dày' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedMed({
                  name: item.name,
                  dosage: `1-2 viên / ngày tùy chỉ định của Bác sĩ`,
                  purpose: `Hỗ trợ điều trị chuyên biệt cho nhóm ${item.tag}`,
                  foodAdvice: `Nên uống đúng giờ cố định hàng ngày để mang lại hiệu quả tốt nhất.`
                });
              }}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 text-left transition-all shadow-2xs group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block truncate">
                {item.name}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Chữa {item.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
