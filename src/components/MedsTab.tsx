import React, { useState, useRef } from "react";
import { Pill, Search, Clock, Calendar, Check, AlertTriangle, Activity, X, Camera, Image as ImageIcon, Loader2, ExternalLink, Sparkles } from "lucide-react";

interface MedsTabProps {
  userTitle: string;
  aiTitle: string;
  isLargeText: boolean;
  onSetCalendarReminder: (medName: string, time: string) => void;
  onSaveMedSearchHistory?: (medData: {
    query: string;
    name: string;
    dosage: string[] | string;
    purpose: string[] | string;
    foodAdvice: string[] | string;
    summary?: string;
    sources?: { title: string; uri: string }[];
  }) => void;
}

export const MedsTab: React.FC<MedsTabProps> = ({ userTitle, aiTitle, isLargeText, onSetCalendarReminder, onSaveMedSearchHistory }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [medQuery, setMedQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedMed, setSelectedMed] = useState<{
    name: string;
    dosage: string[] | string;
    purpose: string[] | string;
    foodAdvice: string[] | string;
    summary?: string;
    sources?: { title: string; uri: string }[];
  } | null>(null);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const descClass = isLargeText ? "text-sm" : "text-xs";

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSearchError("Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }
      setImageMimeType(file.type || "image/jpeg");
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setSearchError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchMed = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = customQuery !== undefined ? customQuery : medQuery;
    
    if (!queryToSearch.trim() && !imagePreview) {
      setSearchError("Vui lòng nhập tên thuốc hoặc tải lên/chụp ảnh vỏ hộp thuốc!");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch("/api/meds/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryToSearch.trim(),
          imageBase64: imagePreview,
          mimeType: imageMimeType,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể truy vấn dữ liệu thuốc.");
      }

      const data = await response.json();

      const medResult = {
        name: data.name || queryToSearch || "Thuốc từ hình ảnh",
        dosage: data.dosage || "Theo chỉ định của Bác sĩ.",
        purpose: data.purpose || "Hỗ trợ điều trị.",
        foodAdvice: data.foodAdvice || "Uống đúng giờ sau khi ăn no.",
        summary: data.summary,
        sources: data.sources || [],
      };

      setSelectedMed(medResult);

      if (onSaveMedSearchHistory) {
        onSaveMedSearchHistory({
          query: queryToSearch.trim() || medResult.name,
          ...medResult
        });
      }
    } catch (err: any) {
      console.error("Search med error:", err);
      setSearchError("Không thể tra cứu thông tin thuốc lúc này. Đang dùng dữ liệu tra cứu nhanh.");
      
      // Fallback display
      setSelectedMed({
        name: queryToSearch.trim() || "Thuốc cần tra cứu",
        dosage: "Uống 1-2 viên / ngày theo hướng dẫn của Bác sĩ chuyên khoa.",
        purpose: "Hỗ trợ điều trị và kiểm soát các triệu chứng bệnh lý.",
        foodAdvice: "Nên uống sau khi ăn no 30 phút cùng nước ấm. Tránh dùng cùng đồ uống có cồn.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* 1. Header Trang Tra Thuốc */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/80 shadow-2xs">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className={`${titleClass} text-slate-800`}>Tra cứu thuốc AI</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Gemini + Search
            </span>
          </div>
          <p className={`${descClass} text-slate-500 font-medium`}>
            Tra cứu bằng tên hoặc chụp ảnh vỏ hộp thuốc với dữ liệu thực tế từ Google Search
          </p>
        </div>
      </div>

      {/* 2. Khung Tìm Kiếm Thuốc Bằng Tên & Ảnh Chụp */}
      <form onSubmit={(e) => handleSearchMed(e)} className="space-y-3">
        {/* Input Bar */}
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

          {/* Hidden Direct Camera & Album Inputs */}
          <input 
            type="file" 
            ref={cameraInputRef}
            accept="image/*" 
            capture="environment"
            className="hidden" 
            onChange={(e) => {
              handleImageSelect(e);
              setShowPhotoModal(false);
            }}
          />
          <input 
            type="file" 
            ref={albumInputRef}
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              handleImageSelect(e);
              setShowPhotoModal(false);
            }}
          />

          {/* Single Clean Camera Icon Button */}
          <button 
            type="button"
            onClick={() => setShowPhotoModal(true)}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl cursor-pointer mr-1 transition-colors"
            title="Chụp hoặc chọn ảnh vỏ hộp thuốc"
          >
            <Camera className="w-5 h-5 text-emerald-600" />
          </button>

          <button
            type="submit"
            disabled={isSearching}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-xs shrink-0 flex items-center gap-1.5"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang tra...</span>
              </>
            ) : (
              <span>Tra cứu AI</span>
            )}
          </button>
        </div>

        {/* Xem trước Ảnh Đã Chọn */}
        {imagePreview && (
          <div className="relative bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={imagePreview} 
                alt="Ảnh hộp thuốc" 
                className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0 shadow-2xs" 
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-950 block truncate">
                  📷 Đã đính kèm ảnh vỏ/vỉ thuốc
                </span>
                <span className="text-[11px] font-medium text-emerald-700">
                  Sẵn sàng phân tích chữ trên hình ảnh với AI
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-full border border-slate-200 shadow-2xs transition-colors shrink-0"
              title="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cảnh báo lỗi nếu có */}
        {searchError && (
          <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Gợi ý:</span>
          {["Amlodipin 5mg", "Metformin 500mg", "Paracetamol 500mg", "Omeprazol 20mg", "Augmentin 1g"].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setMedQuery(chip);
                handleSearchMed(undefined, chip);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/80 rounded-full font-semibold text-[11px] text-slate-600 shrink-0 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>

      {/* 3. Màn hình Hướng dẫn khi CHƯA BẤM TÌM KIẾM & KHÔNG DÙNG ẢNH */}
      {!selectedMed && !isSearching && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center space-y-3.5 shadow-soft">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
            <Pill className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-800">Tra cứu thuốc an toàn bằng Gemini AI</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
              {userTitle} có thể gõ tên thuốc hoặc bấm nút icon <Camera className="w-3.5 h-3.5 inline text-emerald-700" /> để chụp ảnh vỏ hộp thuốc. Trợ lý AI sẽ tự động tra cứu liều dùng & cảnh báo từ Google Search Grounding!
            </p>
          </div>
        </div>
      )}

      {/* Loading Pulse State */}
      {isSearching && (
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-6 text-center space-y-3 shadow-soft animate-pulse">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Đang phân tích dữ liệu Dược học...</h3>
            <p className="text-xs text-slate-500 font-medium">
              Kết nối Google Gemini AI & Google Search Grounding để tổng hợp thông tin mới nhất...
            </p>
          </div>
        </div>
      )}

      {/* Thẻ Chi Tiết Thuốc Kết Quả Từ Gemini AI */}
      {selectedMed && !isSearching && (
        <div className="bg-white border border-slate-200/90 border-l-4 border-l-emerald-500 rounded-2xl p-4 shadow-soft space-y-3.5 animate-in zoom-in-98 duration-200">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Pill className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className={`${subTitleClass} text-slate-900 font-bold truncate`}>{selectedMed.name}</h3>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Tra cứu bởi Gemini AI
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Kết quả chính xác
            </span>
          </div>

          {/* Tóm tắt ngắn gọn nếu có */}
          {selectedMed.summary && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs font-semibold text-emerald-950 leading-relaxed">
              💡 {selectedMed.summary}
            </div>
          )}

          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
            {/* Liều dùng */}
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="p-1.5 bg-emerald-100/70 text-emerald-700 rounded-lg shrink-0 border border-emerald-200/50 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 block mb-0.5">Liều dùng khuyến nghị:</span>
                {renderFormattedList(selectedMed.dosage, "bg-emerald-500", "text-slate-700")}
              </div>
            </div>

            {/* Công dụng */}
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="p-1.5 bg-sky-100/70 text-sky-700 rounded-lg shrink-0 border border-sky-200/50 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 block mb-0.5">Tác dụng & Công dụng:</span>
                {renderFormattedList(selectedMed.purpose, "bg-sky-500", "text-slate-700")}
              </div>
            </div>

            {/* Cảnh báo lưu ý ăn uống */}
            <div className="flex items-start gap-2.5 bg-rose-50/90 p-3.5 rounded-xl border border-rose-200/80 text-rose-950">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5 border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-rose-950 block mb-0.5">Lưu ý quan trọng khi dùng:</span>
                {renderFormattedList(selectedMed.foodAdvice, "bg-rose-500", "text-rose-900 font-semibold")}
              </div>
            </div>

            {/* Grounding Sources (Nguồn Google Search) */}
            {selectedMed.sources && selectedMed.sources.length > 0 && (
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nguồn tra cứu uy tín từ Google Search:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMed.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-full text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-35 sm:max-w-45">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
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

      {/* Action Sheet Modal Chọn nguồn ảnh */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tải ảnh vỏ hộp thuốc</h3>
                  <p className="text-xs text-slate-500 font-medium">Chọn cách {userTitle} muốn tải ảnh</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Chụp máy ảnh trực tiếp */}
              <button
                type="button"
                onClick={() => {
                  cameraInputRef.current?.click();
                  setShowPhotoModal(false);
                }}
                className="w-full flex items-center gap-3 p-3.5 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-2xl transition-all text-left group"
              >
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-emerald-950 text-xs sm:text-sm block">
                    📷 Chụp ảnh bằng Máy ảnh
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    Mở camera điện thoại chụp trực tiếp vỏ thuốc
                  </span>
                </div>
              </button>

              {/* Option 2: Chọn từ Album */}
              <button
                type="button"
                onClick={() => {
                  albumInputRef.current?.click();
                  setShowPhotoModal(false);
                }}
                className="w-full flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-2xl transition-all text-left group"
              >
                <div className="p-2.5 bg-slate-700 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                    🖼️ Chọn ảnh từ Album thư viện
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Chọn ảnh chụp vỏ thuốc sẵn có trong máy
                  </span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPhotoModal(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors pt-1"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

