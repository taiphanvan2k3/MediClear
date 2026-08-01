import React, { useState } from 'react';
import { 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  Pill, 
  Camera, 
  Maximize2, 
  Calendar, 
  UserCheck, 
  Building, 
  Info, 
  Trash2, 
  Plus,
  LogIn,
  ShieldCheck,
  Cloud,
  Lock,
  Sparkles,
  Check,
  AlertTriangle,
  Activity,
  ExternalLink
} from 'lucide-react';
import { User } from 'firebase/auth';
import { HistoryRecord, MedSearchHistoryItem } from '../types';

interface HistoryTabProps {
  user: User | null;
  onLogin: () => void;
  historyRecords: HistoryRecord[];
  medSearchHistory: MedSearchHistoryItem[];
  onDeleteRecord: (id: string) => void;
  onDeleteMedSearchItem: (id: string) => void;
  onOpenLightbox: (url: string, title: string) => void;
  userTitle: string;
  aiTitle: string;
  isLargeText: boolean;
  onAddPhotosToRecord: (recordId: string, files: FileList | File[]) => void;
  onSetCalendarReminder: (medName: string, time: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  user,
  onLogin,
  historyRecords,
  medSearchHistory,
  onDeleteRecord,
  onDeleteMedSearchItem,
  onOpenLightbox,
  userTitle,
  aiTitle,
  isLargeText,
  onAddPhotosToRecord,
  onSetCalendarReminder
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'RECORDS' | 'MEDS'>('RECORDS');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [selectedMedItem, setSelectedMedItem] = useState<MedSearchHistoryItem | null>(null);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";

  const renderFormattedList = (items: string[] | string | undefined, bulletColor: string = "bg-emerald-500", textColor: string = "text-slate-800") => {
    if (!items) return null;
    let list: string[] = [];

    if (Array.isArray(items)) {
      list = items.map(s => String(s).replace(/\*\*/g, '').replace(/\*/g, '').replace(/^[•\-\s]+/g, '').trim()).filter(Boolean);
    } else if (typeof items === 'string') {
      list = items
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .split(/(?:\r?\n|•)/)
        .map(s => s.replace(/^[•\-\s]+/g, '').trim())
        .filter(Boolean);
    }

    if (list.length === 0) return null;

    return (
      <div className="space-y-1.5 mt-1.5">
        {list.map((item, idx) => (
          <div key={idx} className="bg-white/90 border border-slate-200/80 rounded-xl p-2.5 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${bulletColor} shrink-0 mt-1.5`} />
            <span className={`${textColor} leading-relaxed`}>{item}</span>
          </div>
        ))}
      </div>
    );
  };

  // Unauthenticated screen state
  if (!user) {
    return (
      <div className="space-y-4 px-4 py-6 animate-in fade-in duration-300 max-w-md mx-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className={`${titleClass} text-slate-800`}>Lịch sử khám & Tra cứu</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-900">
              Yêu cầu đăng nhập tài khoản
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
              Để bảo mật thông tin y tế cá nhân và lưu trữ nhật ký khám bệnh, tra cứu đơn thuốc lâu dài, {userTitle} vui lòng đăng nhập tài khoản Google.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-left space-y-2">
            <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Bảo mật 100% dữ liệu y tế riêng tư của {userTitle}</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
              <Cloud className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Đồng bộ nhật ký khám bệnh & tra cứu thuốc trên mọi thiết bị</span>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3.5 px-4 font-bold text-sm transition-all shadow-md active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập bằng Google ngay
          </button>
        </div>
      </div>
    );
  }

  // Detailed view of a selected Medical Record (Khám bệnh)
  if (selectedRecord) {
    const images = selectedRecord.imageUrls && selectedRecord.imageUrls.length > 0 
      ? selectedRecord.imageUrls 
      : (selectedRecord.imageUrl ? [selectedRecord.imageUrl] : []);

    return (
      <div className="space-y-4 px-4 py-4 animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
        <button
          onClick={() => setSelectedRecord(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách Lịch sử</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                selectedRecord.badgeType === 'warning' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                selectedRecord.badgeType === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                'bg-sky-100 text-sky-900 border border-sky-300'
              }`}>
                {selectedRecord.badge}
              </span>
              <h2 className={`${subTitleClass} text-slate-900 font-bold leading-snug pt-1`}>
                {selectedRecord.title}
              </h2>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {selectedRecord.date}
              </p>
            </div>

            <button
              onClick={() => {
                onDeleteRecord(selectedRecord.id);
                setSelectedRecord(null);
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 shrink-0"
              title="Xóa bản ghi này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {(selectedRecord.facility || selectedRecord.doctor) && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs font-medium text-slate-700 space-y-1">
              {selectedRecord.facility && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedRecord.facility}</span>
                </div>
              )}
              {selectedRecord.doctor && (
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Bác sĩ phụ trách: {selectedRecord.doctor}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Ảnh chụp phiếu gốc ({images.length} ảnh):
              </span>

              <label className="cursor-pointer text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all">
                <Plus className="w-3 h-3" /> Chụp thêm
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      onAddPhotosToRecord(selectedRecord.id, e.target.files);
                    }
                  }}
                />
              </label>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenLightbox(imgUrl, `${selectedRecord.title} - Ảnh ${idx + 1}`)}
                    className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer group shadow-xs"
                  >
                    <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                      <div className="p-1.5 bg-white/30 backdrop-blur-md rounded-full text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Chạm phóng to
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500 font-medium">
                Chưa có ảnh chụp thực tế gắn kèm bản ghi này.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            CHI TIẾT CHỈ SỐ TRÍCH XUẤT:
          </h3>
          <div className="space-y-2">
            {selectedRecord.details.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                <span className={`text-sm font-bold ${
                  item.status === 'high' ? 'text-rose-700' :
                  item.status === 'warning' ? 'text-amber-700' :
                  'text-slate-900'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 shadow-sm space-y-1.5">
          <h3 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-sky-600" />
            Lời khuyên sinh hoạt từ {aiTitle}:
          </h3>
          <p className={`${bodyClass} text-sky-950 font-medium`}>
            {selectedRecord.advice}
          </p>
        </div>
      </div>
    );
  }

  // Detailed view of a selected Medicine Search Item (Tra cứu thuốc)
  if (selectedMedItem) {
    return (
      <div className="space-y-4 px-4 py-4 animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
        <button
          onClick={() => setSelectedMedItem(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Lịch sử tra cứu thuốc</span>
        </button>

        <div className="bg-white border border-slate-200/90 border-l-4 border-l-emerald-500 rounded-2xl p-4 shadow-soft space-y-3.5 animate-in zoom-in-98 duration-200">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Pill className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className={`${subTitleClass} text-slate-900 font-bold truncate`}>{selectedMedItem.name}</h3>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {selectedMedItem.date}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onDeleteMedSearchItem(selectedMedItem.id);
                setSelectedMedItem(null);
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 shrink-0"
              title="Xóa lịch sử tra cứu này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {selectedMedItem.summary && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs font-semibold text-emerald-950 leading-relaxed">
              💡 {selectedMedItem.summary}
            </div>
          )}

          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="p-1.5 bg-emerald-100/70 text-emerald-700 rounded-lg shrink-0 border border-emerald-200/50 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 block mb-0.5">Liều dùng khuyến nghị:</span>
                {renderFormattedList(selectedMedItem.dosage, "bg-emerald-500", "text-slate-700")}
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="p-1.5 bg-sky-100/70 text-sky-700 rounded-lg shrink-0 border border-sky-200/50 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 block mb-0.5">Tác dụng & Công dụng:</span>
                {renderFormattedList(selectedMedItem.purpose, "bg-sky-500", "text-slate-700")}
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-rose-50/90 p-3.5 rounded-xl border border-rose-200/80 text-rose-950">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5 border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-rose-950 block mb-0.5">Lưu ý quan trọng khi dùng:</span>
                {renderFormattedList(selectedMedItem.foodAdvice, "bg-rose-500", "text-rose-900 font-semibold")}
              </div>
            </div>

            {selectedMedItem.sources && selectedMedItem.sources.length > 0 && (
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nguồn tra cứu uy tín từ Google Search:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMedItem.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-full text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onSetCalendarReminder(selectedMedItem.name, "08:00")}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-3.5 px-4 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98"
            >
              <Calendar className="w-4.5 h-4.5 text-white shrink-0" />
              <span>Tạo lịch nhắc uống thuốc 8:00 sáng trên Google Calendar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main List View with 2 Sub-Tabs
  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className={`${titleClass} text-slate-800`}>Lịch sử khám & Tra cứu</h2>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveSubTab('RECORDS')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'RECORDS'
              ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Khám bệnh ({historyRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('MEDS')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'MEDS'
              ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4 text-emerald-600" />
          <span>Tra cứu thuốc ({medSearchHistory.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Lịch sử Khám Bệnh & Đơn Thuốc */}
      {activeSubTab === 'RECORDS' && (
        <div className="space-y-3">
          {historyRecords.length > 0 ? (
            historyRecords.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedRecord(item)}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 shadow-soft active:scale-99 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                      {item.type === 'prescription' ? (
                        <Pill className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    item.badgeType === 'warning' ? 'bg-amber-100 text-amber-900' :
                    item.badgeType === 'success' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-sky-100 text-sky-900'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 truncate">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between pt-1 text-xs font-bold text-emerald-700">
                  <span className="flex items-center gap-1 text-slate-500 font-normal">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    {(item.imageUrls?.length || (item.imageUrl ? 1 : 0))} ảnh kèm
                  </span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Xem chi tiết <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-2 shadow-soft">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Chưa có lịch sử khám bệnh nào</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Lịch sử Tra Cứu Thuốc */}
      {activeSubTab === 'MEDS' && (
        <div className="space-y-3">
          {medSearchHistory.length > 0 ? (
            medSearchHistory.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedMedItem(item)}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 shadow-soft active:scale-99 transition-all cursor-pointer space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Pill className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {item.date}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMedSearchItem(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Xóa mục này khỏi lịch sử"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.summary && (
                  <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    💡 {item.summary}
                  </p>
                )}

                <div className="flex items-center justify-between pt-0.5 text-xs font-bold text-emerald-700">
                  <span className="flex items-center gap-1 text-slate-500 font-normal">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Đã lưu chi tiết liều dùng
                  </span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Xem chi tiết thuốc <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-2 shadow-soft">
              <Pill className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Chưa có lịch sử tra cứu thuốc nào</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {userTitle} hãy sang tab "Tra thuốc" để tra cứu công dụng & liều dùng thuốc nhé!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
