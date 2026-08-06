import React from 'react';
import { 
  Home, 
  Calendar, 
  Trophy, 
  GitBranch, 
  Share2,
  ChevronLeft,
  X,
  LayoutGrid,
  Settings,
  Target,
  Bell,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab, AppTheme } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  theme: AppTheme;
}

const MENU_ITEMS = [
  { id: 'daily-todos', label: 'کارهای روزانه', icon: Home },
  { id: 'weekly-planner', label: 'برنامه هفتگی', icon: Calendar },
  { id: 'challenges', label: 'چالش ها', icon: Trophy },
  { id: 'programs', label: 'سیرها و برنامه ها', icon: GitBranch },
  { id: 'events', label: 'مناسبت‌ها', icon: Bell },
  { id: 'ai-consultant', label: 'مشاور هوشمند', icon: MessageSquare },
  { id: 'strategic-mind-map', label: 'بارش فکری', icon: Target },
];

export default function Sidebar({ isOpen, onClose, activeTab, onSelectTab, theme }: SidebarProps) {
  const isLight = theme.startsWith('light-');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 h-full w-72 z-50 flex flex-col border-l shadow-2xl ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-dashed border-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-lg font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>منوی اصلی</h2>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-all ${
                  isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id as AppTab);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : isLight 
                          ? 'text-slate-600 hover:bg-slate-50' 
                          : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-indigo-600 -z-10"
                      />
                    )}
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                    <span className="flex-1 text-right">{item.label}</span>
                    {isActive && <ChevronLeft className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
              <div className="flex items-center gap-3 opacity-60">
                <Settings className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">تنظیمات سیستم</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
