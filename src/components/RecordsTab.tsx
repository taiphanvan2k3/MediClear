import React, { useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Lightbulb, 
  Loader2, 
  Image as ImageIcon, 
  Activity, 
  Maximize2, 
  ZoomIn, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  Check, 
  RefreshCw,
  Pill,
  Clock,
  Calendar,
  Building,
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { ScanStateType, PrescriptionScanResult } from '../types';

interface RecordsTabProps {
  scanState: ScanStateType;
  setScanState: (state: ScanStateType) => void;
  selectedImages: string[];
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  onFilesSelect: (files: FileList | File[]) => void;
  onRemoveImageFromBatch: (index: number) => void;
  onSaveResult: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  onOpenLightbox: (url: string, title: string) => void;
  userTitle: string;
  aiTitle: string;
  userDisplayName: string;
  isLargeText: boolean;
  setAlertMessage: (msg: string | null) => void;
  scanResult: PrescriptionScanResult | null;
  onSetCalendarReminder: (medName: string, time: string) => void;
}

export const RecordsTab: React.FC<RecordsTabProps> = ({
  scanState,
  setScanState,
  selectedImages,
  setSelectedImages,
  activeImageIndex,
  setActiveImageIndex,
  onFilesSelect,
  onRemoveImageFromBatch,
  onSaveResult,
  isSaving,
  saveSuccess,
  onOpenLightbox,
  userTitle,
  aiTitle,
  userDisplayName,
  isLargeText,
  setAlertMessage,
  scanResult,
  onSetCalendarReminder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const addMoreFileInputRef = useRef<HTMLInputElement>(null);
  const addMoreCameraInputRef = useRef<HTMLInputElement>(null);

  const titleClass = isLargeText ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight";
  const subTitleClass = isLargeText ? "text-lg font-bold" : "text-base font-bold";
  const bodyClass = isLargeText ? "text-base leading-relaxed" : "text-sm leading-relaxed";
  const descClass = isLargeText ? "text-sm" : "text-xs";

  const handleMainFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(e.target.files);
    }
  };

  const handleAddMorePhotosInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files) as File[];
      const files = fileArray.filter(f => f && f.type && f.type.startsWith('image/'));
      const readPromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(newImages => {
        setSelectedImages(prev => [...prev, ...newImages]);
        setAlertMessage(`Đã tải thêm ${newImages.length} ảnh vào tập hồ sơ!`);
      });
    }
  };

  // 1. MÀN HÌNH CHỤP / TẢI ẢNH (IDLE)
  if (scanState === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center py-5 px-4 space-y-5 animate-in fade-in duration-300 max-w-sm mx-auto">
        {/* Hidden Camera Input */}
        <input 
          type="file" 
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleMainFileInputChange}
        />

        {/* Hidden Multiple File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleMainFileInputChange}
        />

        {/* Greeting Block */}
        <div className="w-full text-center space-y-1 py-1">
          <h2 className={`${titleClass} text-stone-900 font-extrabold`}>
            {aiTitle} chào {userTitle}{userDisplayName ? ` ${userDisplayName}` : ""}!
          </h2>
          <p className={`${bodyClass} text-stone-600 font-medium max-w-xs mx-auto`}>
            {userTitle} chụp hoặc chọn tải lên phiếu khám, đơn thuốc của {userTitle} nhé!
          </p>
        </div>

        {/* Upload Box */}
        <div className="w-full max-w-xs rounded-3xl border-2 border-dashed border-[#B85B43] bg-[#FBF0EC]/60 hover:bg-[#FBF0EC] transition-all flex flex-col items-center justify-center p-5 space-y-3.5 shadow-soft text-center group relative overflow-hidden">
          <div className="p-3.5 bg-[#F4DCD3] group-hover:bg-[#EBC7BA] rounded-full text-[#B85B43] transition-colors shadow-sm">
            <Camera className="w-10 h-10 text-[#B85B43]" />
          </div>

          <div className="space-y-1 px-2">
            <span className={`${subTitleClass} text-stone-900 font-extrabold block leading-snug`}>
              Chụp hoặc Tải ảnh lên
            </span>
            <p className="text-xs text-stone-600 font-medium">
              Chụp ảnh phiếu khám mới hoặc chọn nhiều trang đơn thuốc từ album
            </p>
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#B85B43] hover:bg-[#A34E37] active:scale-95 py-2.5 px-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white shrink-0" />
              <span>Chụp ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-800 bg-white border border-[#F4DCD3] hover:bg-[#FDF8F3] active:scale-95 py-2.5 px-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#B85B43] shrink-0" />
              <span>Album ảnh</span>
            </button>
          </div>
        </div>

        {/* Medical Tip Block */}
        <div className="w-full bg-[#FDF8F3] border-l-4 border-[#B85B43] rounded-r-2xl p-3.5 shadow-sm text-left border border-stone-200/60">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#F4DCD3] rounded-lg text-[#B85B43] shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <p className={`${descClass} text-stone-800 leading-relaxed font-medium`}>
              <strong className="font-bold text-stone-900">Lưu ý cho {userTitle}:</strong> Gemini AI sẽ đọc toàn bộ chữ viết tay và chữ in trên ảnh để bóc tách danh sách thuốc, liều dùng và tạo lịch nhắc tự động ạ!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. MÀN HÌNH ĐANG PHÂN TÍCH VỚI GEMINI VISION (ANALYZING)
  if (scanState === 'ANALYZING') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 animate-in fade-in duration-300 text-center max-w-sm mx-auto">
        <div className="relative w-full aspect-4/3 max-w-xs rounded-2xl overflow-hidden border-2 border-[#B85B43] shadow-lg bg-stone-900">
          {selectedImages.length > 0 ? (
            <img 
              src={selectedImages[0]} 
              alt="Ảnh đang phân tích" 
              className="w-full h-full object-contain opacity-90" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
          
          <div className="absolute inset-x-0 h-1 bg-[#B85B43] shadow-[0_0_15px_#B85B43] animate-pulse top-1/2 -translate-y-1/2"></div>
          <div className="absolute inset-0 bg-[#B85B43]/10 pointer-events-none"></div>

          <div className="absolute bottom-2 left-2 right-2 bg-stone-900/80 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-[11px] text-amber-200 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            Gemini Vision đang đọc {selectedImages.length} ảnh thực tế...
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className={`${titleClass} text-stone-900 font-extrabold`}>
            {userTitle} đợi {aiTitle} một chút nhé...
          </h3>
          <p className={`${bodyClass} text-stone-600`}>
            {aiTitle} đang phân tích đơn thuốc và trích xuất danh sách liều dùng từ {selectedImages.length} ảnh thực tế ạ.
          </p>
        </div>

        <div className="w-full max-w-xs h-2.5 bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#B85B43] rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  // 3. MÀN HÌNH KẾT QUẢ PHÂN TÍCH THẬT TỪ GEMINI AI (RESULT)
  const isWarning = scanResult?.badgeType === 'warning' || Boolean(scanResult?.warning);
  const badgeColor = isWarning 
    ? 'bg-amber-100 border-amber-300 text-amber-900' 
    : 'bg-emerald-100 border-emerald-300 text-emerald-900';

  return (
    <div className="space-y-5 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      {/* Hidden File Inputs to add more photos */}
      <input 
        type="file" 
        ref={addMoreCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleAddMorePhotosInputChange}
      />
      <input 
        type="file" 
        ref={addMoreFileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddMorePhotosInputChange}
      />

      {/* Header Kết Quả */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-6 h-6 text-[#B85B43] shrink-0" />
          <h2 className={`${titleClass} text-stone-900 font-extrabold truncate`}>
            {scanResult?.title || "Kết quả đọc đơn thuốc:"}
          </h2>
        </div>
        <span className={`px-3 py-1 border rounded-full font-bold text-xs shrink-0 ${badgeColor}`}>
          {scanResult?.badge || (isWarning ? "CẦN CHÚ Ý" : "ĐÃ PHÂN TÍCH")}
        </span>
      </div>

      {/* Thông Tin Cơ Sở Y Tế & Chẩn Đoán */}
      {(scanResult?.facility || scanResult?.doctor || scanResult?.diagnosis) && (
        <div className="bg-[#FDF8F3] border border-[#F4DCD3] rounded-2xl p-3.5 space-y-2 text-xs">
          {scanResult.facility && (
            <div className="flex items-center gap-2 text-stone-700 font-semibold">
              <Building className="w-4 h-4 text-[#B85B43] shrink-0" />
              <span>Cơ sở y tế: <strong className="text-stone-900">{scanResult.facility}</strong></span>
            </div>
          )}
          {scanResult.doctor && (
            <div className="flex items-center gap-2 text-stone-700 font-semibold">
              <UserCheck className="w-4 h-4 text-[#B85B43] shrink-0" />
              <span>Bác sĩ kê đơn: <strong className="text-stone-900">{scanResult.doctor}</strong></span>
            </div>
          )}
          {scanResult.diagnosis && (
            <div className="flex items-center gap-2 text-stone-700 font-semibold">
              <Sparkles className="w-4 h-4 text-[#B85B43] shrink-0" />
              <span>Chẩn đoán: <strong className="text-[#B85B43]">{scanResult.diagnosis}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Images Gallery */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#B85B43]" />
            Ảnh thực tế đã tải lên ({selectedImages.length} ảnh):
          </span>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => addMoreCameraInputRef.current?.click()}
              className="text-xs font-bold text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="Chụp thêm ảnh"
            >
              <Camera className="w-3.5 h-3.5 text-[#B85B43]" /> Chụp
            </button>
            <button 
              onClick={() => addMoreFileInputRef.current?.click()}
              className="text-xs font-bold text-[#B85B43] bg-[#FBF0EC] hover:bg-[#F4DCD3] border border-[#F4DCD3] px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="Chọn thêm từ Album"
            >
              <Upload className="w-3.5 h-3.5 text-[#B85B43]" /> Album
            </button>
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <div 
              onClick={() => onOpenLightbox(selectedImages[activeImageIndex], `Ảnh thứ ${activeImageIndex + 1}`)}
              className="relative rounded-xl overflow-hidden border border-stone-300 h-44 bg-stone-900 cursor-pointer group shadow-sm flex items-center justify-center"
            >
              <img 
                src={selectedImages[activeImageIndex]} 
                alt={`Ảnh ${activeImageIndex + 1}`} 
                className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/10 transition-colors flex items-center justify-center">
                <div className="p-2 bg-white/25 backdrop-blur-md rounded-full text-white">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5" /> Phóng to
              </div>

              <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                Trang {activeImageIndex + 1} / {selectedImages.length}
              </div>
            </div>

            {selectedImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {selectedImages.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-[#B85B43] scale-105 shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImageFromBatch(idx);
                      }}
                      className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl-md hover:bg-rose-700"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DANH SÁCH THUỐC TRÍCH XUẤT TỪ ĐƠN (MEDICATIONS) */}
      {scanResult?.medications && scanResult.medications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Pill className="w-4 h-4 text-[#B85B43]" />
            Danh sách thuốc được kê ({scanResult.medications.length} loại):
          </h3>

          <div className="space-y-3">
            {scanResult.medications.map((med, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-stone-200/90 border-l-4 border-l-[#B85B43] rounded-2xl p-4 shadow-soft space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FBF0EC] text-[#B85B43] flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <h4 className={`${subTitleClass} text-stone-900 font-extrabold`}>{med.name}</h4>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-stone-700 pl-1">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B85B43] shrink-0 mt-0.5" />
                    <span><strong className="text-stone-900">Liều dùng:</strong> {med.dosage}</span>
                  </div>
                  {med.purpose && (
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span><strong className="text-stone-900">Mục đích:</strong> {med.purpose}</span>
                    </div>
                  )}
                  {med.foodAdvice && (
                    <div className="flex items-start gap-1.5 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong className="text-amber-950">Lưu ý:</strong> {med.foodAdvice}</span>
                    </div>
                  )}
                </div>

                {/* Nút Tạo Lịch Nhắc Thuốc Từng Thuốc */}
                <button
                  type="button"
                  onClick={() => onSetCalendarReminder(med.name, med.reminderTime || "08:00")}
                  className="w-full mt-2 bg-[#FBF0EC] hover:bg-[#F4DCD3] text-[#B85B43] border border-[#F4DCD3] font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#B85B43]" />
                  <span>Tạo lịch nhắc uống "{med.name}" (Google Calendar)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KẾT QUẢ XÉT NGHIỆM (LAB RESULTS) NẾU CÓ */}
      {scanResult?.labResults && scanResult.labResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Activity className="w-4 h-4 text-[#B85B43]" />
            Chỉ số xét nghiệm trích xuất:
          </h3>

          <div className="space-y-2.5">
            {scanResult.labResults.map((lab, idx) => {
              const isHigh = lab.status === 'high' || lab.status === 'warning';
              return (
                <div 
                  key={idx}
                  className={`rounded-2xl p-3.5 border shadow-2xs space-y-1 ${
                    isHigh 
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950' 
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm flex items-center gap-1.5">
                      {isHigh ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {lab.label}
                    </span>
                    <span className="font-bold text-sm">{lab.value}</span>
                  </div>
                  {lab.advice && (
                    <p className="text-xs text-stone-700 pl-5.5 leading-relaxed font-medium">
                      {lab.advice}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LỜI KHUYÊN DỊU DÀNG CỦA AI */}
      {scanResult?.advice && (
        <div className="bg-[#FDF8F3] border-l-4 border-[#B85B43] rounded-r-2xl p-4 shadow-sm space-y-1 border border-stone-200/70">
          <h4 className="text-xs font-extrabold text-[#B85B43] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#B85B43]" /> Lời khuyên ân cần của {aiTitle}:
          </h4>
          <p className={`${bodyClass} text-stone-800 leading-relaxed font-medium`}>
            {scanResult.advice}
          </p>
        </div>
      )}

      {/* CẢNH BÁO QUAN TRỌNG */}
      {scanResult?.warning && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1 text-rose-900 shadow-sm">
          <h4 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Cảnh báo quan trọng:
          </h4>
          <p className={`${bodyClass} leading-relaxed font-medium`}>
            {scanResult.warning}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <button 
          onClick={onSaveResult}
          disabled={isSaving || saveSuccess}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl p-4 text-base font-bold transition-all shadow-sm active:scale-98 cursor-pointer ${
            saveSuccess 
              ? 'bg-stone-800 text-white' 
              : 'bg-[#B85B43] hover:bg-[#A34E37] text-white'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-6 h-6" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          {saveSuccess ? 'Đã lưu toàn bộ ảnh & kết quả vào Lịch sử!' : `Lưu kết quả & ${selectedImages.length} ảnh vào Lịch sử`}
        </button>

        <button 
          onClick={() => {
            setSelectedImages([]);
            setActiveImageIndex(0);
            setScanState('IDLE');
          }}
          className="w-full flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-2xl p-3.5 text-base font-bold active:scale-98 transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-5 h-5 text-stone-500" />
          Chụp hoặc Tải bộ ảnh khác
        </button>
      </div>
    </div>
  );
};
