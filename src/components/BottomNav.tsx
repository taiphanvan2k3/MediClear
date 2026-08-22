import React from 'react';
import { FileText, Pill, Clock, User as UserIcon } from 'lucide-react';
import { useUIStore } from '../store';

export const BottomNav: React.FC = () => {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const isLargeText = useUIStore((state) => state.isLargeText);

  const labelClass = isLargeText ? "text-xs font-bold" : "text-[11px] font-semibold";

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-30 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {/* Tab 1: Sổ khám */}
        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
            activeTab === 'RECORDS' ? 'text-[#B85B43]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {activeTab === 'RECORDS' && (
            <span className="absolute top-0 w-8 h-1 bg-[#B85B43] rounded-b-full" />
          )}
          <FileText className={`w-5 h-5 ${activeTab === 'RECORDS' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Sổ khám</span>
        </button>

        {/* Tab 2: Tra thuốc */}
        <button
          onClick={() => setActiveTab('MEDS')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
            activeTab === 'MEDS' ? 'text-[#B85B43]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {activeTab === 'MEDS' && (
            <span className="absolute top-0 w-8 h-1 bg-[#B85B43] rounded-b-full" />
          )}
          <Pill className={`w-5 h-5 ${activeTab === 'MEDS' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Tra thuốc</span>
        </button>

        {/* Tab 3: Lịch sử */}
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
            activeTab === 'HISTORY' ? 'text-[#B85B43]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {activeTab === 'HISTORY' && (
            <span className="absolute top-0 w-8 h-1 bg-[#B85B43] rounded-b-full" />
          )}
          <Clock className={`w-5 h-5 ${activeTab === 'HISTORY' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Lịch sử</span>
        </button>

        {/* Tab 4: Hồ sơ */}
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative cursor-pointer ${
            activeTab === 'PROFILE' ? 'text-[#B85B43]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {activeTab === 'PROFILE' && (
            <span className="absolute top-0 w-8 h-1 bg-[#B85B43] rounded-b-full" />
          )}
          <UserIcon className={`w-5 h-5 ${activeTab === 'PROFILE' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Hồ sơ</span>
        </button>
      </div>
    </nav>
  );
};
