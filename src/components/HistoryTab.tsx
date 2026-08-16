import React, { useState } from "react";
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
  ExternalLink,
  Search,
  Filter,
  X,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { User } from "firebase/auth";
import { HistoryRecord, MedSearchHistoryItem } from "../types";

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
  const [activeSubTab, setActiveSubTab] = useState<"RECORDS" | "MEDS">("RECORDS");
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [selectedMedItem, setSelectedMedItem] = useState<MedSearchHistoryItem | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [recordFilter, setRecordFilter] = useState<"ALL" | "WARNING" | "SUCCESS">("ALL");

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";

  const handleFileInputChange = (recordId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddPhotosToRecord(recordId, e.target.files);
    }
  };

  // Filtered Medical Records
  const filteredRecords = historyRecords.filter((record) => {
    // 1. Status Filter
    if (recordFilter === "WARNING" && record.badgeType !== "warning") return false;
    if (recordFilter === "SUCCESS" && record.badgeType !== "success" && record.badgeType !== "normal") return false;

    // 2. Search Query Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchTitle = record.title.toLowerCase().includes(q);
    const matchSummary = record.summary.toLowerCase().includes(q);
    const matchBadge = record.badge.toLowerCase().includes(q);
    const matchFacility = record.facility?.toLowerCase().includes(q);
    const matchDoctor = record.doctor?.toLowerCase().includes(q);
    const matchDetails = record.details?.some(
      (d) => d.label.toLowerCase().includes(q) || d.value.toLowerCase().includes(q)
    );

    return matchTitle || matchSummary || matchBadge || matchFacility || matchDoctor || matchDetails;
  });

  // Filtered Medicine Search History
  const filteredMeds = medSearchHistory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = item.name.toLowerCase().includes(q);
    const matchQuery = item.query.toLowerCase().includes(q);
    const matchDosage = Array.isArray(item.dosage)
      ? item.dosage.some((d) => String(d).toLowerCase().includes(q))
      : String(item.dosage || "")
          .toLowerCase()
          .includes(q);
    const matchFood = Array.isArray(item.foodAdvice)
      ? item.foodAdvice.some((f) => String(f).toLowerCase().includes(q))
      : String(item.foodAdvice || "")
          .toLowerCase()
          .includes(q);

    return matchName || matchQuery || matchDosage || matchFood;
  });

  // Unauthenticated screen
  if (!user) {
    return (
      <div className="space-y-5 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <Clock className="w-6 h-6 text-[#B85B43]" />
          <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Lịch sử lưu trữ</h2>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8 text-[#B85B43]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-stone-900">Yêu cầu đăng nhập tài khoản</h3>
            <p className="text-xs text-stone-600 font-medium leading-relaxed max-w-xs mx-auto">
              Để bảo mật thông tin y tế cá nhân và lưu trữ nhật ký khám bệnh, tra cứu đơn thuốc lâu dài, vui lòng đăng
              nhập tài khoản Google.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 text-left space-y-2">
            <div className="flex items-start gap-2 text-xs font-semibold text-stone-700">
              <ShieldCheck className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>Bảo mật 100% dữ liệu sức khỏe trên Google Cloud</span>
            </div>
            <div className="flex items-start gap-2 text-xs font-semibold text-stone-700">
              <Sparkles className="w-4 h-4 text-[#B85B43] shrink-0 mt-0.5" />
              <span>Xem lại kết quả đọc đơn thuốc & tra cứu AI bất kỳ lúc nào</span>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#B85B43] hover:bg-[#A34E37] text-white rounded-xl py-3.5 px-4 font-bold text-sm transition-all shadow-xs active:scale-98"
          >
            <LogIn className="w-5 h-5 text-white" />
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  // Detailed view of a selected Medical Record
  if (selectedRecord) {
    const images =
      selectedRecord.imageUrls && selectedRecord.imageUrls.length > 0
        ? selectedRecord.imageUrls
        : selectedRecord.imageUrl
          ? [selectedRecord.imageUrl]
          : [];

    return (
      <div className="space-y-4 px-4 py-4 animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
        <button
          onClick={() => setSelectedRecord(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách Lịch sử</span>
        </button>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-soft space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="space-y-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  selectedRecord.badgeType === "warning"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : selectedRecord.badgeType === "success"
                      ? "bg-stone-100 text-stone-900 border border-stone-300"
                      : "bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3]"
                }`}
              >
                {selectedRecord.badge}
              </span>
              <h2 className={`${subTitleClass} text-stone-900 font-extrabold leading-snug pt-1`}>
                {selectedRecord.title}
              </h2>
              <p className="text-xs font-medium text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
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
            <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 text-xs font-medium text-stone-700 space-y-1">
              {selectedRecord.facility && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{selectedRecord.facility}</span>
                </div>
              )}
              {selectedRecord.doctor && (
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Bác sĩ phụ trách: {selectedRecord.doctor}</span>
                </div>
              )}
            </div>
          )}

          {/* Photos Gallery (If available) */}
          {images.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#B85B43]" />
                Ảnh chụp phiếu gốc ({images.length} ảnh):
              </span>

              <div className="grid grid-cols-2 gap-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenLightbox(imgUrl, `${selectedRecord.title} (Ảnh ${idx + 1})`)}
                    className="relative rounded-xl overflow-hidden border border-stone-200 h-28 bg-stone-900 cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/10 transition-colors flex items-center justify-center">
                      <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details list */}
          {selectedRecord.details && selectedRecord.details.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Chi tiết chỉ số / Đơn thuốc:
              </h4>
              <div className="space-y-1.5">
                {selectedRecord.details.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-start justify-between text-xs"
                  >
                    <span className="font-semibold text-stone-600">{item.label}:</span>
                    <span
                      className={`font-bold text-right max-w-[60%] ${
                        item.status === "high" || item.status === "warning" ? "text-amber-900" : "text-stone-900"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Advice */}
          {selectedRecord.advice && (
            <div className="bg-[#FDF8F3] border-l-4 border-l-[#B85B43] rounded-r-xl p-3 text-xs text-stone-800 space-y-1 border border-stone-200/60">
              <span className="font-extrabold text-stone-900 block">Lời khuyên từ Trợ lý AI:</span>
              <p className="leading-relaxed font-medium">{selectedRecord.advice}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view of a selected Medicine Search Item
  if (selectedMedItem) {
    return (
      <div className="space-y-4 px-4 py-4 animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
        <button
          onClick={() => setSelectedMedItem(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-3 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Lịch sử tra cứu thuốc</span>
        </button>

        <div className="bg-white border border-stone-200 border-l-4 border-l-[#B85B43] rounded-2xl p-4 shadow-soft space-y-3.5">
          <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="space-y-1 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FBF0EC] text-[#B85B43] border border-[#F4DCD3]">
                Tra cứu thuốc AI
              </span>
              <h2 className={`${subTitleClass} text-stone-900 font-extrabold leading-snug pt-1 truncate`}>
                {selectedMedItem.name}
              </h2>
              <p className="text-xs font-medium text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {selectedMedItem.date}
              </p>
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

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#B85B43]" /> Liều dùng & Cách dùng:
            </h4>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs font-semibold text-stone-900 leading-relaxed">
              {Array.isArray(selectedMedItem.dosage) ? selectedMedItem.dosage.join(" • ") : selectedMedItem.dosage}
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-stone-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Lưu ý ăn uống & Cảnh báo:
            </h4>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs font-semibold text-amber-950 leading-relaxed">
              {Array.isArray(selectedMedItem.foodAdvice)
                ? selectedMedItem.foodAdvice.join(" • ")
                : selectedMedItem.foodAdvice}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSetCalendarReminder(selectedMedItem.name, "08:00")}
              className="w-full bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Tạo lịch nhắc uống thuốc hàng ngày (Google Calendar)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN HISTORY LIST VIEW WITH SEARCH & FILTERS
  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
        <Clock className="w-6 h-6 text-[#B85B43]" />
        <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Lịch sử lưu trữ</h2>
      </div>

      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-2 gap-1.5 bg-stone-200/70 p-1 rounded-2xl border border-stone-200">
        <button
          onClick={() => {
            setActiveSubTab("RECORDS");
            setSearchQuery("");
          }}
          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === "RECORDS"
              ? "bg-[#B85B43] text-white shadow-xs"
              : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sổ khám & Đơn thuốc ({historyRecords.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("MEDS");
            setSearchQuery("");
          }}
          className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === "MEDS"
              ? "bg-[#B85B43] text-white shadow-xs"
              : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Tra cứu thuốc ({medSearchHistory.length})</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="space-y-2">
        {/* Search Bar Input */}
        <div className="bg-white border border-stone-200/90 focus-within:border-[#B85B43] rounded-2xl p-1.5 shadow-soft flex items-center gap-2 transition-all">
          <Search className="w-4.5 h-4.5 text-stone-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === "RECORDS" ? "Tìm phiếu khám, chỉ số, bác sĩ..." : "Tìm tên thuốc, từ khóa tra cứu..."
            }
            className="w-full bg-transparent border-none text-stone-900 font-semibold text-xs placeholder-stone-400 focus:outline-none py-1.5 pr-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-full mr-1 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Chips for RECORDS tab */}
        {activeSubTab === "RECORDS" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-bold text-stone-400 shrink-0">Lọc:</span>
            {[
              { id: "ALL", label: "Tất cả", icon: <Filter className="w-3.5 h-3.5" /> },
              { id: "WARNING", label: "Cần chú ý", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
              { id: "SUCCESS", label: "Bình thường", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> }
            ].map((chip) => {
              const isActive = recordFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setRecordFilter(chip.id as any)}
                  className={`px-2.5 py-1 rounded-full font-bold text-[11px] shrink-0 transition-all border flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#B85B43] text-white border-[#B85B43] shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span className={isActive ? "text-white" : ""}>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtab 1: Medical Records List */}
      {activeSubTab === "RECORDS" && (
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 text-center text-stone-500 text-xs font-medium space-y-2">
              <FileText className="w-8 h-8 text-stone-400 mx-auto" />
              <p>
                {searchQuery || recordFilter !== "ALL"
                  ? `Không tìm thấy phiếu khám hoặc đơn thuốc nào phù hợp với bộ lọc.`
                  : `Chưa có bản ghi lịch sử khám bệnh hoặc đơn thuốc nào.`}
              </p>
              {(searchQuery || recordFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRecordFilter("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-3 py-1.5 rounded-xl font-bold text-xs transition-all mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="bg-white border border-stone-200/90 hover:border-[#B85B43] rounded-2xl p-3.5 shadow-soft hover:shadow-md transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          record.badgeType === "warning" ? "bg-amber-100 text-amber-900" : "bg-[#FBF0EC] text-[#B85B43]"
                        }`}
                      >
                        {record.badge}
                      </span>
                      <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {record.date}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-stone-900 group-hover:text-[#B85B43] transition-colors truncate">
                      {record.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-medium">{record.summary}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subtab 2: Medicine Search History List */}
      {activeSubTab === "MEDS" && (
        <div className="space-y-3">
          {filteredMeds.length === 0 ? (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 text-center text-stone-500 text-xs font-medium space-y-2">
              <Pill className="w-8 h-8 text-stone-400 mx-auto" />
              <p>
                {searchQuery
                  ? `Không tìm thấy từ khóa tra cứu thuốc nào phù hợp với '${searchQuery}'.`
                  : `Chưa có lịch sử tra cứu thông tin thuốc nào.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1.5 text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-3 py-1.5 rounded-xl font-bold text-xs transition-all mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa từ khóa tìm kiếm
                </button>
              )}
            </div>
          ) : (
            filteredMeds.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedItem(item)}
                className="bg-white border border-stone-200/90 hover:border-[#B85B43] rounded-2xl p-3.5 shadow-soft hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#B85B43] bg-[#FBF0EC] border border-[#F4DCD3] px-2 py-0.5 rounded-full">
                      Tra cứu: {item.query}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">{item.date}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900 group-hover:text-[#B85B43] transition-colors truncate">
                    {item.name}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
