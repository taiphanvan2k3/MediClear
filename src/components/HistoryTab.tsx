import React, { useState } from 'react';
import { 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  Pill, 
  Camera, 
  Maximize2, 
  ZoomIn, 
  Calendar, 
  UserCheck, 
  Building, 
  AlertCircle, 
  Info, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryTabProps {
  historyRecords: HistoryRecord[];
  onDeleteRecord: (id: string) => void;
  onOpenLightbox: (url: string, title: string) => void;
  userTitle: string;
  aiTitle: string;
  isLargeText: boolean;
  onAddPhotosToRecord: (recordId: string, files: FileList | File[]) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  historyRecords,
  onDeleteRecord,
  onOpenLightbox,
  userTitle,
  aiTitle,
  isLargeText,
  onAddPhotosToRecord
}) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";

  // Detailed view of a single selected record
  if (selectedRecord) {
    const images = selectedRecord.imageUrls && selectedRecord.imageUrls.length > 0 
      ? selectedRecord.imageUrls 
      : (selectedRecord.imageUrl ? [selectedRecord.imageUrl] : []);

    return (
      <div className="space-y-4 px-4 py-4 animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
        {/* Back Button Header */}
        <button
          onClick={() => setSelectedRecord(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách Lịch sử</span>
        </button>

        {/* Record Header Card */}
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

          {/* Facility & Doctor Info */}
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

          {/* Actual Photos Gallery */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Ảnh chụp phiếu gốc ({images.length} ảnh):
              </span>

              {/* Add photo input */}
              <label className="cursor-pointer text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all">
                <Plus className="w-3 h-3" /> Chụp thêm
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  capture="environment"
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

        {/* Detailed Extraction List */}
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

        {/* Doctor / AI Advice Box */}
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

  // List View of History Records
  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className={`${titleClass} text-slate-800`}>Lịch sử khám & Đơn thuốc</h2>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {historyRecords.length} kết quả
        </span>
      </div>

      <div className="space-y-3">
        {historyRecords.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedRecord(item)}
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 shadow-soft active:scale-99 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  {item.type === 'prescription' ? (
                    <Pill className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
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
        ))}
      </div>
    </div>
  );
};
