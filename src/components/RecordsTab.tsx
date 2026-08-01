import React, { useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Lightbulb, 
  Loader2, 
  Image as ImageIcon, 
  Activity, 
  Plus, 
  Maximize2, 
  ZoomIn, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { ScanStateType } from '../types';

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
  setAlertMessage
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

  if (scanState === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center py-5 px-4 space-y-5 animate-in fade-in duration-300 max-w-sm mx-auto">
        {/* Hidden Camera Input (Trực tiếp mở Máy ảnh) */}
        <input 
          type="file" 
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleMainFileInputChange}
        />

        {/* Hidden Multiple File Input (Mở Album / Thư viện ảnh) */}
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
          <h2 className={`${titleClass} text-slate-800 font-bold`}>
            {aiTitle} chào {userTitle}{userDisplayName ? ` ${userDisplayName}` : ""}!
          </h2>
          <p className={`${bodyClass} text-slate-600 font-medium max-w-xs mx-auto`}>
            {userTitle} chụp hoặc chọn tải lên phiếu khám, đơn thuốc của {userTitle} nhé!
          </p>
        </div>

        {/* Clean Upload Box với 2 tùy chọn rõ ràng: Chụp ảnh trực tiếp OR Chọn Album */}
        <div className="w-full max-w-xs rounded-3xl border-2 border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center p-5 space-y-3.5 shadow-soft text-center group relative overflow-hidden">
          {/* Camera Circle */}
          <div className="p-3.5 bg-emerald-100 group-hover:bg-emerald-200 rounded-full text-emerald-700 transition-colors shadow-sm">
            <Camera className="w-10 h-10 text-emerald-700" />
          </div>

          <div className="space-y-1 px-2">
            <span className={`${subTitleClass} text-emerald-950 font-bold block leading-snug`}>
              Chụp hoặc Tải ảnh lên
            </span>
            <p className="text-xs text-emerald-800/90 font-medium">
              Chụp ảnh phiếu khám mới hoặc chọn nhiều trang đơn thuốc từ album
            </p>
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 py-2.5 px-2.5 rounded-xl shadow-xs transition-all"
            >
              <Camera className="w-4 h-4 text-white shrink-0" />
              <span>Chụp ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 active:scale-95 py-2.5 px-2.5 rounded-xl shadow-xs transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Album ảnh</span>
            </button>
          </div>
        </div>

        {/* Medical Tip Block */}
        <div className="w-full bg-sky-50/80 border-l-4 border-sky-500 rounded-r-2xl p-3.5 shadow-sm text-left">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-sky-100 rounded-lg text-sky-600 shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <p className={`${descClass} text-sky-900 leading-relaxed font-medium`}>
              <strong className="font-bold text-sky-950">Lưu ý cho {userTitle}:</strong> Mọi hình ảnh {userTitle} thực tế chụp tải lên đều sẽ được bảo mật và lưu giữ trong mục <span className="font-bold text-emerald-700">Lịch Sử</span> để {userTitle} mở xem lại bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (scanState === 'ANALYZING') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 animate-in fade-in duration-300 text-center max-w-sm mx-auto">
        {/* Animated Scanner Box showing uploaded image */}
        <div className="relative w-full aspect-4/3 max-w-xs rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg bg-slate-900">
          {selectedImages.length > 0 ? (
            <img 
              src={selectedImages[0]} 
              alt="Ảnh đang phân tích" 
              className="w-full h-full object-contain opacity-90" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
          
          {/* Green Scan Overlay */}
          <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse top-1/2 -translate-y-1/2"></div>
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>

          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md rounded-lg py-1.5 px-2.5 text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            Đang phân tích {selectedImages.length} ảnh {userTitle} vừa tải...
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className={`${titleClass} text-slate-800 font-bold`}>
            {userTitle} đợi {aiTitle} một chút nhé...
          </h3>
          <p className={`${bodyClass} text-slate-600`}>
            {aiTitle} đang quét chữ và trích xuất chỉ số từ {selectedImages.length} ảnh {userTitle} vừa tải lên ạ.
          </p>
        </div>

        <div className="w-full max-w-xs h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  // RESULTS Screen
  return (
    <div className="space-y-5 px-4 py-4 animate-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      {/* Hidden File Inputs to add more photos to current batch */}
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

      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-600" />
          <h2 className={`${titleClass} text-slate-800`}>Kết quả phân tích:</h2>
        </div>
        <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-full font-bold text-xs">
          CẦN CHÚ Ý
        </span>
      </div>

      {/* Uploaded Images Gallery Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-600" />
            Ảnh thực tế đã tải lên ({selectedImages.length} ảnh):
          </span>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => addMoreCameraInputRef.current?.click()}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
              title="Chụp ảnh mới"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" /> Chụp
            </button>
            <button 
              onClick={() => addMoreFileInputRef.current?.click()}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
              title="Chọn từ Album"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" /> Album
            </button>
          </div>
        </div>

        {/* Main Active Image View */}
        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <div 
              onClick={() => onOpenLightbox(selectedImages[activeImageIndex], `Ảnh thứ ${activeImageIndex + 1}`)}
              className="relative rounded-xl overflow-hidden border border-slate-300 h-44 bg-slate-900 cursor-pointer group shadow-sm flex items-center justify-center"
            >
              <img 
                src={selectedImages[activeImageIndex]} 
                alt={`Ảnh ${activeImageIndex + 1}`} 
                className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                <div className="p-2 bg-white/25 backdrop-blur-md rounded-full text-white">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5" /> Phóng to
              </div>

              <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                Trang {activeImageIndex + 1} / {selectedImages.length}
              </div>
            </div>

            {/* Thumbnails list if multiple */}
            {selectedImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {selectedImages.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-emerald-600 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
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
      
      <div className="space-y-4">
        {/* Card 1: High Glucose */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`${subTitleClass} text-amber-950 font-bold`}>
                Đường huyết - 8.5 mmol/L (CAO)
              </h3>
              <p className={`${bodyClass} text-amber-900 leading-relaxed`}>
                <strong className="text-amber-950">Lời khuyên của {aiTitle}:</strong> {userTitle} nhớ hạn chế ăn đồ ngọt, bánh kẹo và bớt cơm trắng nha!
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Liver Function Normal */}
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`${subTitleClass} text-emerald-950 font-bold`}>
                Men gan - Bình thường
              </h3>
              <p className={`${bodyClass} text-emerald-900 leading-relaxed`}>
                <strong className="text-emerald-950">Chỉ số tốt:</strong> Gan của {userTitle.toLowerCase()} rất khỏe mạnh, hoạt động cực kỳ tốt ạ!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <button 
          onClick={onSaveResult}
          disabled={isSaving || saveSuccess}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl p-4 text-base font-bold transition-all shadow-sm active:scale-98 ${
            saveSuccess 
              ? 'bg-emerald-700 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-6 h-6" />
          ) : (
            <Save className="w-6 h-6" />
          )}
          {saveSuccess ? 'Đã lưu toàn bộ ảnh vào Lịch sử!' : `Lưu kết quả & ${selectedImages.length} ảnh vào Lịch sử`}
        </button>

        <button 
          onClick={() => {
            setSelectedImages([]);
            setActiveImageIndex(0);
            setScanState('IDLE');
          }}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl p-3.5 text-base font-bold active:scale-98 transition-all shadow-xs"
        >
          <RefreshCw className="w-5 h-5 text-slate-500" />
          Chụp hoặc Tải bộ ảnh khác
        </button>
      </div>
    </div>
  );
};
