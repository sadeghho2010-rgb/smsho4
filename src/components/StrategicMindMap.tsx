import React from 'react';
import { GitBranch, Construction } from 'lucide-react';
import { AppTheme } from '../types';

interface StrategicMindMapProps {
  theme: AppTheme;
}

export default function StrategicMindMap({ theme }: StrategicMindMapProps) {
  const isLight = theme.startsWith('light-');

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-[#fcfcfc] dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative" dir="rtl">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 rounded-[40px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/10">
          <GitBranch className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">بخش بارش فکری</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2">
            <Construction className="w-4 h-4" />
            این بخش در حال بازسازی است
          </p>
        </div>
      </div>
    </div>
  );
}
