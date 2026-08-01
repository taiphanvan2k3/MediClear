import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface LightboxModalProps {
  image: { url: string; title: string } | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ image, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
        <h3 className="font-bold text-sm truncate max-w-[200px] sm:max-w-xs">{image.title}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 3))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.5))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            title="Xoay ảnh"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <a 
            href={image.url}
            download="Medical_Record.jpg"
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
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
            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors ml-2"
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
