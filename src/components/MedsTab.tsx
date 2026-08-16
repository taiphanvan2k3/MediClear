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

  const renderFormattedList = (items: string[] | string | undefined, bulletColor: string = "bg-[#B85B43]", textColor: string = "text-stone-800") => {
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
          <div key={idx} className="bg-white/90 border border-stone-200/80 rounded-xl p-2.5 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-2xs">
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryToSearch.trim() || undefined,
          imageBase64: imagePreview || undefined,
          mimeType: imageMimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tra cứu thông tin thuốc lúc này.");
      }

      setSelectedMed(data);
      if (onSaveMedSearchHistory) {
        onSaveMedSearchHistory({
          query: queryToSearch || "Ảnh vỏ hộp thuốc",
          ...data,
        });
      }
    } catch (err: any) {
      console.error("Lỗi tra cứu thuốc từ AI:", err);
      setSearchError(err.message || "Không thể kết nối đến máy chủ tra cứu thuốc. Vui lòng thử lại sau!");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* 1. Header Trang Tra Thuốc */}
      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
        <Pill className="w-6 h-6 text-[#B85B43]" />
        <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Tra cứu thông tin thuốc</h2>
      </div>

      {/* 2. Thanh Tìm Kiếm Thuốc & Tải Ảnh Vỏ Hộp */}
      <form onSubmit={(e) => handleSearchMed(e)} className="space-y-2.5">
        <div className="bg-white border border-stone-200/90 focus-within:border-[#B85B43] rounded-2xl p-1.5 shadow-soft flex items-center gap-2 transition-all">
          <div className="pl-3 text-stone-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={medQuery}
            onChange={(e) => setMedQuery(e.target.value)}
            placeholder="Gõ tên thuốc (vd: Paracetamol, Amlodipin)..."
            className="w-full bg-transparent border-none text-stone-900 font-semibold text-sm placeholder-stone-400 focus:outline-none py-2 pr-2"
          />
          
          {medQuery && (
            <button
              type="button"
              onClick={() => setMedQuery("")}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-full mr-1 transition-colors"
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
            className="p-2 text-stone-500 hover:text-[#B85B43] hover:bg-[#FBF0EC] rounded-xl cursor-pointer mr-1 transition-colors"
            title="Chụp hoặc chọn ảnh vỏ hộp thuốc"
          >
            <Camera className="w-5 h-5 text-[#B85B43]" />
          </button>

          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#B85B43] hover:bg-[#A34E37] disabled:bg-stone-300 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-xs shrink-0 flex items-center gap-1.5"
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
          <div className="relative bg-[#FBF0EC] border border-[#F4DCD3] rounded-2xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={imagePreview} 
                alt="Ảnh hộp thuốc" 
                className="w-12 h-12 rounded-xl object-cover border border-[#F4DCD3] shrink-0 shadow-2xs" 
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-stone-900 block truncate">
                  📷 Đã đính kèm ảnh vỏ/vỉ thuốc
                </span>
                <span className="text-[11px] font-medium text-[#B85B43]">
                  Sẵn sàng phân tích chữ trên hình ảnh với AI
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="p-1.5 bg-white text-stone-400 hover:text-rose-600 rounded-full border border-stone-200 shadow-2xs transition-colors shrink-0"
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

      </form>

      {/* 3. Màn hình Hướng dẫn khi CHƯA BẤM TÌM KIẾM */}
      {!selectedMed && !isSearching && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 text-center space-y-3.5 shadow-soft">
          <div className="w-12 h-12 bg-[#FBF0EC] text-[#B85B43] rounded-2xl flex items-center justify-center mx-auto border border-[#F4DCD3] shadow-2xs">
            <Pill className="w-6 h-6 text-[#B85B43]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-extrabold text-stone-900">Tra cứu thuốc an toàn bằng Gemini AI</h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed font-medium">
              {userTitle} có thể gõ tên thuốc hoặc bấm nút icon <Camera className="w-3.5 h-3.5 inline text-[#B85B43]" /> để chụp ảnh vỏ hộp thuốc. Trợ lý AI sẽ tự động tra cứu liều dùng & cảnh báo từ Google Search Grounding!
            </p>
          </div>
        </div>
      )}

      {/* Loading Pulse State */}
      {isSearching && (
        <div className="bg-white border border-[#F4DCD3] rounded-2xl p-6 text-center space-y-3 shadow-soft animate-pulse">
          <div className="w-12 h-12 bg-[#FBF0EC] text-[#B85B43] rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-[#B85B43]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-stone-900">Đang phân tích dữ liệu Dược học...</h3>
            <p className="text-xs text-stone-500 font-medium">
              Kết nối Google Gemini AI & Google Search Grounding để tổng hợp thông tin mới nhất...
            </p>
          </div>
        </div>
      )}

      {/* Thẻ Chi Tiết Thuốc Kết Quả Từ Gemini AI */}
      {selectedMed && !isSearching && (
        <div className="bg-white border border-stone-200/90 border-l-4 border-l-[#B85B43] rounded-2xl p-4 shadow-soft space-y-3.5 animate-in zoom-in-98 duration-200">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FBF0EC] text-[#B85B43] flex items-center justify-center shrink-0 border border-[#F4DCD3]">
                <Pill className="w-5 h-5 text-[#B85B43]" />
              </div>
              <div className="min-w-0">
                <h3 className={`${subTitleClass} text-stone-900 font-bold truncate`}>{selectedMed.name}</h3>
                <span className="text-[11px] font-semibold text-[#B85B43] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B85B43]" /> Tra cứu bởi Gemini AI
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 bg-[#FBF0EC] border border-[#F4DCD3] px-2.5 py-1 rounded-full shrink-0">
              <Check className="w-3.5 h-3.5 text-[#B85B43]" /> Kết quả chính xác
            </span>
          </div>

          {/* Mục Đơn vị / Liều dùng */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#B85B43]" /> Liều dùng & Cách dùng:
            </h4>
            {renderFormattedList(selectedMed.dosage, "bg-[#B85B43]", "text-stone-900")}
          </div>

          {/* Mục Cảnh báo ăn uống */}
          <div className="space-y-1 pt-1 border-t border-stone-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Lưu ý ăn uống & Cảnh báo:
            </h4>
            {renderFormattedList(selectedMed.foodAdvice, "bg-amber-500", "text-stone-900")}
          </div>

          {/* Nút Tạo Lịch Nhắc Nhở Google Calendar */}
          <div className="pt-2">
            <button
              onClick={() => onSetCalendarReminder(selectedMed.name, "08:00")}
              className="w-full bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Tạo lịch nhắc uống thuốc hàng ngày (Google Calendar)</span>
            </button>
          </div>
        </div>
      )}

      {/* Photo Selection Option Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-[#FBF0EC] text-[#B85B43] rounded-2xl flex items-center justify-center mx-auto border border-[#F4DCD3]">
              <Camera className="w-6 h-6 text-[#B85B43]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-stone-900">Chọn cách tải ảnh hộp thuốc</h3>
              <p className="text-xs text-stone-500 font-medium">Chụp trực tiếp bằng máy ảnh hoặc chọn từ Album</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-3 bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Chụp ảnh trực tiếp</span>
              </button>

              <button
                type="button"
                onClick={() => albumInputRef.current?.click()}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-stone-600" />
                <span>Chọn ảnh từ Album</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-full py-2 text-stone-500 font-semibold text-xs hover:text-stone-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
