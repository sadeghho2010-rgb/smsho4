import React, { useRef, useState } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, 
  Download, 
  Upload, 
  RefreshCw, 
  ChevronDown, 
  Plus, 
  Compass, 
  LogOut,
  Palette,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Award,
  Edit3,
  Trash2,
  CheckSquare,
  LayoutGrid,
  Timer,
  Calendar as CalendarIcon,
  Menu,
  GitBranch
} from 'lucide-react';
import { Program, AppTheme, AppMode, Challenge, AppTab, TodoItem } from '../types';
import logo from '../assets/images/logo.jpg';
import { downloadBackup, parseBackupFile, DecryptedBackup } from '../utils/localStorage';

interface HeaderProps {
  programs: Program[];
  challenges: Challenge[];
  todos: TodoItem[];
  activeProgramId: string;
  username: string;
  activeTheme: AppTheme;
  activeMode: AppMode;
  activeTab: AppTab;
  onSelectProgram: (id: string) => void;
  onAddProgram: (title: string, description: string, timingData?: { timingType: 'days' | 'date', dueDate?: string, durationDays?: number }) => void;
  onUpdateProgramTitleDesc?: (id: string, title: string, description: string, timingData?: { timingType: 'days' | 'date', dueDate?: string, durationDays?: number }) => void;
  onDeleteProgram?: (id: string) => void;
  onRestoreBackup: (backup: DecryptedBackup) => void;
  onResetToDefaults: () => void;
  onThemeChange: (theme: AppTheme) => void;
  onModeChange: (mode: AppMode) => void;
  onTabChange: (tab: AppTab) => void;
  onOpenSidebar: () => void;
}

const THEME_OPTIONS: { value: AppTheme; label: string; colorClass: string }[] = [
  { value: 'cyber-gradient', label: 'سایبر گرادینت', colorClass: 'from-indigo-600 to-purple-600' },
  { value: 'forest-zen', label: 'جنگل آرامش', colorClass: 'from-emerald-600 to-teal-700' },
  { value: 'sunset-glow', label: 'غروب درخشان', colorClass: 'from-rose-600 to-amber-500' },
  { value: 'royal-classic', label: 'آبی سلطنتی', colorClass: 'from-blue-700 to-indigo-800' },
  { value: 'midnight-deep', label: 'نصف‌شب تاریک', colorClass: 'from-slate-900 to-black' },
  { value: 'light-emerald', label: 'زمرد روشن (سفید/سبز)', colorClass: 'from-emerald-400 to-emerald-600' },
  { value: 'light-royal', label: 'آبی کلاسیک روشن', colorClass: 'from-blue-400 to-indigo-600' },
  { value: 'light-warm', label: 'شکلاتی و گرم روشن', colorClass: 'from-amber-400 to-orange-500' },
];

export default function Header({
  programs,
  challenges,
  todos,
  activeProgramId,
  username,
  activeTheme,
  activeMode,
  activeTab,
  onSelectProgram,
  onAddProgram,
  onUpdateProgramTitleDesc,
  onDeleteProgram,
  onRestoreBackup,
  onResetToDefaults,
  onThemeChange,
  onModeChange,
  onTabChange,
  onOpenSidebar
}: HeaderProps) {
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');
  const [newTimingType, setNewTimingType] = useState<'days' | 'date'>('date');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDurationDays, setNewDurationDays] = useState<string | number>('');

  const [errorMsg, setErrorMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProgramsTab = activeTab === 'programs';

  // Program Editing States
  const [showEditProgramModal, setShowEditProgramModal] = useState(false);
  const [editProgramTitle, setEditProgramTitle] = useState('');
  const [editProgramDesc, setEditProgramDesc] = useState('');
  const [editTimingType, setEditTimingType] = useState<'days' | 'date'>('date');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDurationDays, setEditDurationDays] = useState<string | number>('');
  const [showDeleteProgramConfirm, setShowDeleteProgramConfirm] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programToDeleteId, setProgramToDeleteId] = useState<string | null>(null);

  const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0];

  const handleOpenEditProgram = (progId?: string) => {
    const targetProg = progId ? (programs.find(p => p.id === progId) || activeProgram) : activeProgram;
    if (targetProg) {
      setEditingProgramId(targetProg.id);
      setEditProgramTitle(targetProg.title);
      setEditProgramDesc(targetProg.description || '');
      setEditTimingType(targetProg.timingType || 'date');
      setEditDueDate(targetProg.dueDate || '');
      setEditDurationDays(targetProg.durationDays || '');
      setShowEditProgramModal(true);
    }
  };

  const handleEditProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProgramTitle.trim()) return;
    const targetId = editingProgramId || activeProgram?.id;
    if (onUpdateProgramTitleDesc && targetId) {
      onUpdateProgramTitleDesc(targetId, editProgramTitle.trim(), editProgramDesc.trim(), {
        timingType: editTimingType,
        dueDate: editTimingType === 'date' ? (editDueDate || undefined) : undefined,
        durationDays: editTimingType === 'days' ? (Number(editDurationDays) || undefined) : undefined
      });
    }
    setShowEditProgramModal(false);
  };

  const handleDeleteActiveProgram = (progId?: string) => {
    const targetProg = progId ? (programs.find(p => p.id === progId) || activeProgram) : activeProgram;
    if (!targetProg) return;
    setProgramToDeleteId(targetProg.id);
    setShowDeleteProgramConfirm(true);
  };

  const isLight = activeTheme.startsWith('light-');

  const handleAddProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramTitle.trim()) {
      setErrorMsg('لطفا عنوان برنامه جامع را وارد کنید.');
      return;
    }
    onAddProgram(newProgramTitle, newProgramDesc, {
      timingType: newTimingType,
      dueDate: newTimingType === 'date' ? (newDueDate || undefined) : undefined,
      durationDays: newTimingType === 'days' ? (Number(newDurationDays) || undefined) : undefined
    });
    setNewProgramTitle('');
    setNewProgramDesc('');
    setNewDueDate('');
    setNewDurationDays('');
    setErrorMsg('');
    setShowAddProgramModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseBackupFile(file);
      onRestoreBackup(parsed);
      alert('داده‌ها (برنامه‌ها و چالش‌ها) با موفقیت از فایل پشتیبان بارگذاری شدند.');
    } catch (err: any) {
      alert(err.message || 'خطا در بارگذاری فایل پشتیبان.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-700 ${
        isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/20' : 'bg-slate-900/90 border-slate-800 shadow-black/20'
      } border-b backdrop-blur-md px-4 md:px-6 py-3 shadow-xl`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Right Side: Menu Toggle and Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSidebar}
            className={`p-2.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center border ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="نقشه راه" 
              className="w-10 h-10 rounded-2xl shadow-lg shadow-indigo-600/20 object-cover border border-slate-800/10" 
            />
            <div className="hidden sm:flex flex-col">
              <h1 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>نقشه راه</h1>
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Strategic Planner</p>
            </div>
          </div>
        </div>
        {/* Middle: Conditional Mode Switcher (only for Programs tab) */}
        {isProgramsTab && (
          <div className={`hidden md:flex items-center gap-1 p-1 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'} border rounded-xl text-[10px] font-bold`}>
            <button
              type="button"
              onClick={() => onModeChange('simple')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === 'simple' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              حالت ساده
            </button>
            <button
              type="button"
              onClick={() => onModeChange('advanced')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === 'advanced' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              حالت پیشرفته
            </button>
            <button
              type="button"
              onClick={() => onModeChange('diagram')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMode === 'diagram' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              نمودار ذهنی
            </button>
          </div>
        )}

        {/* Left Side: Program Switcher & Actions */}
        <div className="flex items-center gap-3">
          
          {isProgramsTab && programs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProgramDropdown(!showProgramDropdown);
                  setShowThemeDropdown(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50' : 'bg-slate-950 border-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <span className="max-w-[120px] truncate">{activeProgram?.title || 'برنامه‌ها'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProgramDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProgramDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProgramDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute top-full right-0 mt-2 w-72 rounded-2xl border shadow-2xl z-50 p-2 overflow-hidden ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="max-h-80 overflow-y-auto p-1 space-y-1">
                        {programs.map((p) => (
                          <div key={p.id} className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onSelectProgram(p.id);
                                setShowProgramDropdown(false);
                              }}
                              className={`flex-1 flex flex-col items-start px-4 py-3 rounded-xl text-xs transition-all ${
                                activeProgramId === p.id
                                  ? 'bg-indigo-600 text-white shadow-lg'
                                  : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="font-bold">{p.title}</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Program Button at the bottom of the list */}
                      <div className={`mt-1 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                        <button
                          onClick={() => {
                            setShowAddProgramModal(true);
                            setShowProgramDropdown(false);
                          }}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                            isLight 
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                              : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40'
                          } cursor-pointer`}
                        >
                          <Plus className="w-4 h-4" />
                          ایجاد برنامه جامع جدید
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="w-px h-6 bg-slate-800/20 hidden sm:block" />

          {/* User & Theme Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className={`p-2.5 rounded-xl transition-all border ${
                isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {showThemeDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowThemeDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full left-4 md:left-6 mt-2 w-64 rounded-2xl border shadow-2xl z-50 p-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="grid grid-cols-1 gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onThemeChange(opt.value);
                      setShowThemeDropdown(false);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-xl text-[10px] font-bold transition-all ${
                      activeTheme === opt.value
                        ? 'bg-indigo-600 text-white'
                        : isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${opt.colorClass}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Backup hidden input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />
    </header>

      {/* Add Program Modal */}
      {showAddProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddProgramModal(false)} />
          
          <div className={`relative ${isLight ? 'bg-white text-slate-800 border-slate-200 shadow-2xl' : 'bg-slate-800 text-slate-100 border-slate-700 shadow-2xl'} rounded-2xl w-full max-w-md p-6 border z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right`} dir="rtl">
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'} mb-1.5 flex items-center gap-2`}>
              <FolderPlus className="w-5 h-5 text-emerald-500" />
              ایجاد برنامه جامع جدید
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-4`}>
              برنامه‌ای بزرگ و طولانی‌مدت (مثل "توسعه فردی ۱۴۰۵") ایجاد کنید که بتوانید شاخه‌ها و مراحل را به آن اضافه کنید.
            </p>

            <form onSubmit={handleAddProgramSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>عنوان برنامه *</label>
                <input
                  type="text"
                  placeholder="مثال: یادگیری زبان آلمانی، راه‌اندازی شرکت"
                  value={newProgramTitle}
                  onChange={(e) => setNewProgramTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>توضیحات کوتاه (اختیاری)</label>
                <textarea
                  placeholder="توضیح دهید این برنامه بزرگ قرار است چه حوزه‌ای از زندگی یا کار شما را توسعه دهد..."
                  value={newProgramDesc}
                  onChange={(e) => setNewProgramDesc(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors resize-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-655' : 'text-slate-400'}`}>زمان‌بندی برنامه</label>
                
                <div className={`flex items-center gap-2 mb-3 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'} w-fit`}>
                  <button
                    type="button"
                    onClick={() => setNewTimingType('date')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      newTimingType === 'date' 
                        ? 'bg-emerald-600 text-white shadow' 
                        : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    تاریخ دقیق (شمسی)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTimingType('days')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      newTimingType === 'days' 
                        ? 'bg-emerald-600 text-white shadow' 
                        : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    تعداد روز
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {newTimingType === 'date' ? (
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={newDueDate}
                      onChange={(date: any) => setNewDueDate(date?.format?.("YYYY-MM-DD") || "")}
                      calendarPosition="bottom-right"
                      inputClass={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors text-center ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-750 text-white'
                      }`}
                      placeholder="انتخاب تاریخ سررسید..."
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={newDurationDays}
                        onChange={(e) => setNewDurationDays(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-750 text-white'
                        }`}
                        placeholder="مدت کل برنامه به روز..."
                      />
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>روز</span>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs py-1 px-2 bg-red-950/20 rounded border border-red-900/30">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProgramModal(false)}
                  className={`px-4 py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-700 hover:bg-slate-650 text-slate-200'} rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  ایجاد برنامه جامع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditProgramModal(false)} />
          
          <div className={`relative ${isLight ? 'bg-white text-slate-800 border-slate-200 shadow-2xl' : 'bg-slate-800 text-slate-100 border-slate-700 shadow-2xl'} rounded-2xl w-full max-w-md p-6 border z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right`} dir="rtl">
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'} mb-1.5 flex items-center gap-2`}>
              <Edit3 className="w-5 h-5 text-emerald-500" />
              ویرایش جزئیات برنامه جامع
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-4`}>
              تغییر عنوان یا توضیحات مربوط به برنامه جامع انتخابی.
            </p>

            <form onSubmit={handleEditProgramSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>عنوان جدید برنامه *</label>
                <input
                  type="text"
                  value={editProgramTitle}
                  onChange={(e) => setEditProgramTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>توضیحات جدید</label>
                <textarea
                  value={editProgramDesc}
                  onChange={(e) => setEditProgramDesc(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors resize-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-655' : 'text-slate-400'}`}>ویرایش زمان‌بندی</label>
                
                <div className={`flex items-center gap-2 mb-3 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'} w-fit`}>
                  <button
                    type="button"
                    onClick={() => setEditTimingType('date')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      editTimingType === 'date' 
                        ? 'bg-emerald-600 text-white shadow' 
                        : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    تاریخ دقیق (شمسی)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTimingType('days')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      editTimingType === 'days' 
                        ? 'bg-emerald-600 text-white shadow' 
                        : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    تعداد روز
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {editTimingType === 'date' ? (
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={editDueDate}
                      onChange={(date: any) => setEditDueDate(date?.format?.("YYYY-MM-DD") || "")}
                      calendarPosition="bottom-right"
                      inputClass={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors text-center ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-750 text-white'
                      }`}
                      placeholder="انتخاب تاریخ سررسید..."
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={editDurationDays}
                        onChange={(e) => setEditDurationDays(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-750 text-white'
                        }`}
                        placeholder="مدت کل برنامه به روز..."
                      />
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>روز</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProgramModal(false)}
                  className={`px-4 py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-700 hover:bg-slate-650 text-slate-200'} rounded-lg text-xs font-semibold transition-colors cursor-pointer`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Program Confirmation Modal */}
      {showDeleteProgramConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowDeleteProgramConfirm(false)} />
          
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl z-50 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`} dir="rtl">
            <h3 className="text-sm font-black text-rose-500 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>تایید حذف برنامه جامع</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              آیا مطمئن هستید که می‌خواهید برنامه جامع <strong className="text-emerald-550 dark:text-emerald-400">«{programs.find(p => p.id === programToDeleteId)?.title || activeProgram?.title}»</strong> را همراه با تمام سیرها، گام‌ها و زیرمجموعه‌های داخل آن برای همیشه حذف کنید؟ این اقدام غیرقابل بازگشت است.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const targetDeleteId = programToDeleteId || activeProgram?.id;
                  if (onDeleteProgram && targetDeleteId) {
                    onDeleteProgram(targetDeleteId);
                  }
                  setShowDeleteProgramConfirm(false);
                  setProgramToDeleteId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                بله، برای همیشه حذف شود
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteProgramConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 border' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                لغو / انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowResetConfirm(false)} />
          
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl z-50 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`} dir="rtl">
            <h3 className="text-sm font-black text-rose-500 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>بازنشانی کل داده‌ها به پیش‌فرض</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              آیا مطمئن هستید که می‌خواهید تمام برنامه‌ها، سیرها، گام‌ها، عادت‌ها و کارهای روزانه این حساب کاربری را حذف کرده و به داده‌های اولیه نمونه برگردانید؟ این اقدام کلیه تلاش‌های شما را پاک خواهد کرد و غیرقابل بازگشت است.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                بله، بازنشانی شود
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 border' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
