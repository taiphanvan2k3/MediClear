import React, { useState, useRef } from "react";
import {
  Pill,
  Search,
  Clock,
  Calendar,
  AlertTriangle,
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Sparkles,
  HeartPulse,
  Globe
} from "lucide-react";
import { useAuthStore, useUIStore } from "../store";
import { useMedicineSearch, useCalendarReminder, useAuthMutations } from "../hooks";
import { MedicineInfoResult } from "../api/scanApi";

export const MedsTab: React.FC = () => {
  const userTitle = useAuthStore((state) => state.userProfile.userTitle) || "Bác";
  const aiTitle = useAuthStore((state) => state.userProfile.aiTitle) || "Cháu";
  const isLargeText = useUIStore((state) => state.isLargeText);

  // TanStack Query Mutations
  const medicineSearchMutation = useMedicineSearch();
  const { setCalendarReminder } = useCalendarReminder();
  const { login: handleLogin } = useAuthMutations();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [medQuery, setMedQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [selectedMed, setSelectedMed] = useState<MedicineInfoResult | null>(null);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setShowPhotoModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSearchMedicine = (queryText?: string) => {
    const textToSearch = queryText !== undefined ? queryText : medQuery;
    if (!textToSearch.trim() && !imagePreview) return;

    let imageBase64Data: string | undefined = undefined;
    if (imagePreview) {
      imageBase64Data = imagePreview.includes("base64,") ? imagePreview.split("base64,")[1] : imagePreview;
    }

    medicineSearchMutation.mutate(
      {
        query: textToSearch.trim(),
        imageBase64: imageBase64Data,
        mimeType: imageMimeType
      },
      {
        onSuccess: (data) => {
          setSelectedMed(data);
        }
      }
    );
  };

  const quickMeds = ["Panadol Extra", "Amlodipine 5mg", "Glucophage 500mg", "Lipitor 10mg", "Berberin"];

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-300 max-w-md mx-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input type="file" ref={albumInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />

      <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
        <Pill className="w-6 h-6 text-[#B85B43]" />
        <h2 className={`${titleClass} text-stone-900 font-extrabold`}>Tra cứu thông tin thuốc</h2>
      </div>

      {/* Box Tìm Kiếm Đa Phương Thức */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3 shadow-soft space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Nút Chọn Ảnh */}
          <button
            type="button"
            onClick={() => setShowPhotoModal(true)}
            className="p-2.5 bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] text-[#B85B43] rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
            title="Chụp hoặc Tải ảnh hộp thuốc"
          >
            <Camera className="w-5 h-5 text-[#B85B43]" />
          </button>

          {/* Ô Nhập Văn Bản */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={medQuery}
              onChange={(e) => setMedQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchMedicine();
              }}
              placeholder={`Nhập tên thuốc (${userTitle} uống thuốc gì?)...`}
              className="w-full bg-stone-50 border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#B85B43] focus:bg-white transition-all pr-8"
            />
            {medQuery && (
              <button
                onClick={() => setMedQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Nút Tìm Kiếm AI */}
          <button
            disabled={medicineSearchMutation.isPending || (!medQuery.trim() && !imagePreview)}
            onClick={() => handleSearchMedicine()}
            className="p-2.5 bg-[#B85B43] hover:bg-[#A34E37] text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {medicineSearchMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Xem trước ảnh đính kèm */}
        {imagePreview && (
          <div className="flex items-center gap-2 p-2 bg-[#FBF0EC]/60 border border-[#F4DCD3] rounded-xl animate-in fade-in duration-200">
            <img src={imagePreview} alt="Ảnh thuốc" className="w-10 h-10 object-cover rounded-lg border border-[#F4DCD3]" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-stone-800 truncate">Ảnh hộp thuốc đã chọn</p>
              <p className="text-[10px] text-stone-500 font-medium">Sẽ được AI đọc nhận diện tự động</p>
            </div>
            <button
              onClick={() => setImagePreview(null)}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Gỡ ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Gợi Ý Thuốc Phổ Biến */}
        <div className="pt-1">
          <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1.5">
            Gợi ý tra cứu nhanh:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickMeds.map((med, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMedQuery(med);
                  handleSearchMedicine(med);
                }}
                className="text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 border border-stone-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {med}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hiển Thị Trạng Thái Đang Tra Cứu */}
      {medicineSearchMutation.isPending && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-3 shadow-soft animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-[#FBF0EC] text-[#B85B43] rounded-2xl flex items-center justify-center mx-auto border border-[#F4DCD3]">
            <Loader2 className="w-6 h-6 animate-spin text-[#B85B43]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-stone-900">{aiTitle} đang tra cứu thông tin y khoa...</h3>
            <p className="text-xs text-stone-500 font-medium">
              Đang đối chiếu dữ liệu dược thư y tế và cảnh báo an toàn cho {userTitle}
            </p>
          </div>
        </div>
      )}

      {/* Báo Lỗi Tra Cứu */}
      {medicineSearchMutation.isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            {medicineSearchMutation.error instanceof Error
              ? medicineSearchMutation.error.message
              : "Đã xảy ra lỗi khi tìm kiếm thuốc. Vui lòng thử lại!"}
          </span>
        </div>
      )}

      {/* Kết Quả Tra Cứu Thuốc */}
      {selectedMed && (
        <div className="bg-white border border-stone-200/90 border-l-4 border-l-[#B85B43] rounded-2xl p-4 shadow-soft space-y-3.5 animate-in slide-in-from-bottom-3 duration-300">
          {/* Tên Thuốc */}
          <div className="border-b border-stone-100 pb-2.5 space-y-0.5">
            <span className="text-[10px] font-extrabold text-[#B85B43] uppercase tracking-wider bg-[#FBF0EC] border border-[#F4DCD3] px-2 py-0.5 rounded-full inline-block">
              Thông tin dược học chuẩn
            </span>
            <h3 className={`${subTitleClass} text-stone-900 font-extrabold pt-1`}>{selectedMed.name}</h3>
          </div>

          {/* Công Dụng / Chỉ Định */}
          {selectedMed.purpose && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-sky-600" /> Công dụng & Chỉ định:
              </h4>
              <div className="bg-sky-50/80 p-2.5 rounded-xl border border-sky-100 text-xs font-semibold text-sky-950 leading-relaxed">
                {Array.isArray(selectedMed.purpose) ? selectedMed.purpose.join(" • ") : selectedMed.purpose}
              </div>
            </div>
          )}

          {/* Liều Dùng */}
          <div className="space-y-1 pt-1 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#B85B43]" /> Hướng dẫn liều lượng:
            </h4>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs font-semibold text-stone-900 leading-relaxed">
              {Array.isArray(selectedMed.dosage) ? selectedMed.dosage.join(" • ") : selectedMed.dosage}
            </div>
          </div>

          {/* Cảnh Báo & Lưu Ý Ăn Uống */}
          <div className="space-y-1 pt-1 border-t border-stone-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Lưu ý ăn uống & Cảnh báo an toàn:
            </h4>
            <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 text-xs font-semibold text-amber-950 leading-relaxed">
              {Array.isArray(selectedMed.foodAdvice) ? selectedMed.foodAdvice.join(" • ") : selectedMed.foodAdvice}
            </div>
          </div>

          {/* Tóm Tắt Dễ Hiểu Của AI */}
          {selectedMed.summary && (
            <div className="bg-[#FBF0EC]/60 border border-[#F4DCD3] p-3 rounded-xl text-xs text-stone-800 leading-relaxed font-medium">
              💡 <span className="font-bold text-[#B85B43]">Tóm tắt từ {aiTitle}:</span> {selectedMed.summary}
            </div>
          )}

          {/* Nguồn Tài Liệu Y Tế (Google Grounding) */}
          {selectedMed.sources && selectedMed.sources.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Nguồn tài liệu y khoa tham khảo:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedMed.sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors truncate max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Nút Tạo Lịch Nhắc Nhở Google Calendar */}
          <div className="pt-2">
            <button
              onClick={() => setCalendarReminder(selectedMed.name, "08:00", () => handleLogin())}
              className="w-full bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
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
                className="w-full py-3 bg-[#B85B43] hover:bg-[#A34E37] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Chụp ảnh trực tiếp</span>
              </button>

              <button
                type="button"
                onClick={() => albumInputRef.current?.click()}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-stone-600" />
                <span>Chọn ảnh từ Album</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-full py-2 text-stone-500 font-semibold text-xs hover:text-stone-700 transition-colors cursor-pointer"
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
