import React from 'react';
import { FileText, Pill, Clock, User as UserIcon } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isLargeText: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isLargeText
}) => {
  const labelClass = isLargeText ? "text-xs font-bold" : "text-[11px] font-semibold";

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {/* Tab 1: Sổ khám */}
        <button
          onClick={() => setActiveTab('RECORDS')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'RECORDS' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {activeTab === 'RECORDS' && (
            <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full" />
          )}
          <FileText className={`w-5 h-5 ${activeTab === 'RECORDS' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Sổ khám</span>
        </button>

        {/* Tab 2: Tra thuốc */}
        <button
          onClick={() => setActiveTab('MEDS')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'MEDS' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {activeTab === 'MEDS' && (
            <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full" />
          )}
          <Pill className={`w-5 h-5 ${activeTab === 'MEDS' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Tra thuốc</span>
        </button>

        {/* Tab 3: Lịch sử */}
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'HISTORY' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {activeTab === 'HISTORY' && (
            <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full" />
          )}
          <Clock className={`w-5 h-5 ${activeTab === 'HISTORY' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Lịch sử</span>
        </button>

        {/* Tab 4: Hồ sơ */}
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'PROFILE' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {activeTab === 'PROFILE' && (
            <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full" />
          )}
          <UserIcon className={`w-5 h-5 ${activeTab === 'PROFILE' ? 'stroke-[2.5]' : ''}`} />
          <span className={labelClass}>Hồ sơ</span>
        </button>
      </div>
    </nav>
  );
};
