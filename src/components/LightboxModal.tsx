import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { useUIStore } from "../store";

export const LightboxModal: React.FC = () => {
  const image = useUIStore((state) => state.lightboxImage);
  const onClose = () => useUIStore.getState().setLightboxImage(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
        <h3 className="font-bold text-sm truncate max-w-50 sm:max-w-xs">{image.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.3, 3))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.3, 0.5))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
            title="Xoay ảnh"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <a
            href={image.url}
            download="Medical_Record.jpg"
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
            title="Tải ảnh về máy"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={() => {
              setZoomLevel(1);
              setRotation(0);
              onClose();
            }}
            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors ml-2 cursor-pointer"
            title="Đóng xem ảnh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Stage Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden my-4 relative">
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
          }}
        >
          <img
            src={image.url}
            alt={image.title}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-slate-400 text-xs font-medium py-1 bg-slate-900/80 rounded-xl border border-slate-800">
        Phóng to: {Math.round(zoomLevel * 100)}% • Góc xoay: {rotation}°
      </div>
    </div>
  );
};
