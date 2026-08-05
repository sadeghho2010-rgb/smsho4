import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Cake, 
  Heart, 
  Presentation, 
  Info,
  Clock,
  ArrowLeft,
  Edit2,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarEvent, AppTheme } from '../types';
import * as jalaali from 'jalaali-js';

interface EventsProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  theme: AppTheme;
}

const EVENT_TYPES = [
  { id: 'birthday', label: 'تولد', icon: Cake, color: 'text-rose-500 bg-rose-500/10' },
  { id: 'anniversary', label: 'سالگرد', icon: Heart, color: 'text-pink-500 bg-pink-500/10' },
  { id: 'conference', label: 'همایش/جلسه', icon: Presentation, color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'other', label: 'سایر مناسبت‌ها', icon: Info, color: 'text-slate-500 bg-slate-500/10' },
];

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export default function Events({ events, onAddEvent, onUpdateEvent, onDeleteEvent, theme }: EventsProps) {
  const isLight = theme.startsWith('light-');
  
  // Current view state
  const now = new Date();
  const currentJDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  const [viewYear, setViewYear] = useState(currentJDate.jy);
  const [viewMonth, setViewMonth] = useState(currentJDate.jm);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  // New/Edit event form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEvent['type']>('birthday');
  const [newDay, setNewDay] = useState(currentJDate.jd);
  const [newDescription, setNewDescription] = useState('');
  const [newIsYearly, setNewIsYearly] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setNewTitle(editingEvent.title);
      setNewType(editingEvent.type);
      setNewDescription(editingEvent.description || '');
      setNewIsYearly(editingEvent.isYearly || false);
      const [y, m, d] = editingEvent.date.split('/').map(Number);
      setNewDay(d);
    }
  }, [editingEvent]);

  // Calendar calculations
  const daysInMonth = jalaali.jalaaliMonthLength(viewYear, viewMonth);
  const firstDayOfMonth = jalaali.toGregorian(viewYear, viewMonth, 1);
  const firstDayDate = new Date(firstDayOfMonth.gy, firstDayOfMonth.gm - 1, firstDayOfMonth.gd);
  const firstDayOfWeek = (firstDayDate.getDay() + 1) % 7; 

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSaveEvent = () => {
    if (!newTitle.trim()) return;
    
    const event: CalendarEvent = {
      id: editingEvent ? editingEvent.id : Math.random().toString(36).substr(2, 9),
      title: newTitle,
      type: newType,
      date: `${viewYear}/${String(viewMonth).padStart(2, '0')}/${String(newDay).padStart(2, '0')}`,
      description: newDescription,
      isYearly: newIsYearly,
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
    };
    
    if (editingEvent) {
      onUpdateEvent(event);
    } else {
      onAddEvent(event);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewIsYearly(false);
    setEditingEvent(null);
    setIsAddModalOpen(false);
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const [y, m, d] = e.date.split('/').map(Number);
      return (e.isYearly && m === viewMonth && d === day) || (!e.isYearly && y === viewYear && m === viewMonth && d === day);
    });
  };

  const monthEvents = events.filter(e => {
    const [y, m] = e.date.split('/').map(Number);
    return (e.isYearly && m === viewMonth) || (!e.isYearly && y === viewYear && m === viewMonth);
  }).sort((a, b) => {
    const d1 = Number(a.date.split('/')[2]);
    const d2 = Number(b.date.split('/')[2]);
    return d1 - d2;
  });

  const upcomingEvents = events.filter(e => {
    const [y, m, d] = e.date.split('/').map(Number);
    if (e.isYearly) {
      if (m > currentJDate.jm) return true;
      if (m === currentJDate.jm && d >= currentJDate.jd) return true;
      return false; 
    }
    if (y > currentJDate.jy) return true;
    if (y === currentJDate.jy && m > currentJDate.jm) return true;
    if (y === currentJDate.jy && m === currentJDate.jm && d >= currentJDate.jd) return true;
    return false;
  }).sort((a, b) => {
    const [, m1, d1] = a.date.split('/').map(Number);
    const [, m2, d2] = b.date.split('/').map(Number);
    return (m1 * 100 + d1) - (m2 * 100 + d2);
  });

  const handleMouseEnter = (day: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoveredDay(day);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredDay(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 md:order-last"
        >
          <Plus className="w-5 h-5" />
          ثبت مناسبت جدید
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>مدیریت مناسبت‌ها</h1>
            <p className="text-sm font-medium text-slate-500">تقویم شخصی و ثبت رویدادهای مهم</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Calendar Section */}
        <div className={`rounded-3xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Calendar Header */}
          <div className={`p-6 border-b flex flex-wrap items-center justify-between gap-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center gap-4">
              <select 
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className={`bg-transparent text-lg font-black focus:outline-none cursor-pointer ${isLight ? 'text-slate-800' : 'text-white'}`}
              >
                {JALALI_MONTHS.map((m, i) => (
                  <option key={m} value={i + 1} className="dark:bg-slate-900">{m}</option>
                ))}
              </select>
              <select 
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className={`bg-transparent text-lg font-black focus:outline-none cursor-pointer ${isLight ? 'text-slate-800' : 'text-white'}`}
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <option key={i} value={currentJDate.jy - 5 + i} className="dark:bg-slate-900">{currentJDate.jy - 5 + i}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleNextMonth}
                className={`p-2 rounded-xl border transition-all ${
                  isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setViewYear(currentJDate.jy); setViewMonth(currentJDate.jm); }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                بازگشت به امروز
              </button>
              <button 
                onClick={handlePrevMonth}
                className={`p-2 rounded-xl border transition-all ${
                  isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`offset-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const hasEvent = dayEvents.length > 0;
                const isToday = currentJDate.jy === viewYear && currentJDate.jm === viewMonth && currentJDate.jd === day;
                
                return (
                  <div key={day} className="relative group">
                    <button
                      onMouseEnter={() => handleMouseEnter(day)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => { 
                        setNewDay(day); 
                        setEditingEvent(null);
                        setIsAddModalOpen(true); 
                      }}
                      className={`w-full aspect-square relative flex items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                        isToday 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/10' 
                          : hasEvent
                            ? isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : isLight ? 'hover:bg-slate-100 text-slate-600 border border-slate-100' : 'hover:bg-slate-800/50 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {day}
                      {hasEvent && (
                        <div className="absolute bottom-2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map(e => (
                            <div key={e.id} className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500'}`} />
                          ))}
                        </div>
                      )}
                    </button>

                    <AnimatePresence>
                      {hoveredDay === day && hasEvent && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 rounded-xl shadow-xl z-50 pointer-events-none ${
                            isLight ? 'bg-white border border-slate-100 text-slate-800' : 'bg-slate-800 border border-slate-700 text-white'
                          }`}
                        >
                          <div className="space-y-1">
                            {dayEvents.map(e => (
                              <div key={e.id} className="text-[9px] font-black flex items-center gap-1.5 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                {e.title}
                              </div>
                            ))}
                          </div>
                          <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${
                            isLight ? 'border-t-white' : 'border-t-slate-800'
                          }`} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>
              مناسبت‌های {JALALI_MONTHS[viewMonth - 1]}
            </h3>
            <span className="text-xs font-black bg-indigo-500/10 text-indigo-500 px-3 py-1.5 rounded-xl">
              {monthEvents.length} مورد ثبت شده
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthEvents.length > 0 ? monthEvents.map(event => {
              const typeInfo = EVENT_TYPES.find(t => t.id === event.type) || EVENT_TYPES[3];
              const Icon = typeInfo.icon;
              return (
                <div 
                  key={event.id}
                  className={`flex items-center gap-4 p-5 rounded-3xl border transition-all hover:scale-[1.02] hover:shadow-lg ${
                    isLight ? 'bg-slate-50 border-slate-100 hover:bg-white' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${typeInfo.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-black truncate mb-0.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>{event.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      {event.date.split('/')[2]} {JALALI_MONTHS[viewMonth - 1]}
                      {event.isYearly && <RefreshCw className="w-2.5 h-2.5 opacity-60" />}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingEvent(event);
                        setIsAddModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-16 opacity-40">
                <Clock className="w-10 h-10 mx-auto mb-4 text-slate-400" />
                <p className="text-xs font-black">هیچ مناسبتی برای این ماه ثبت نشده است</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <button 
            onClick={() => setShowUpcoming(!showUpcoming)}
            className={`w-full p-6 rounded-3xl border border-dashed text-sm font-black transition-all flex items-center justify-center gap-3 ${
              showUpcoming 
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : isLight ? 'border-slate-300 text-slate-500 hover:bg-slate-50' : 'border-slate-700 text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            {showUpcoming ? <ArrowLeft className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            {showUpcoming ? 'بازگشت به تقویم اصلی' : 'مشاهده تمام مناسبت‌های پیش رو در ماه‌های بعد'}
          </button>

          <AnimatePresence>
            {showUpcoming && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                  {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
                    const typeInfo = EVENT_TYPES.find(t => t.id === event.type) || EVENT_TYPES[3];
                    const Icon = typeInfo.icon;
                    const [, m, d] = event.date.split('/').map(Number);
                    return (
                      <div 
                        key={event.id}
                        className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                          isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-2xl ${typeInfo.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isLight ? 'bg-slate-50 text-slate-500' : 'bg-slate-950 text-slate-400'}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div>
                          <h4 className={`text-sm font-black mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{event.title}</h4>
                          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                            {d} {JALALI_MONTHS[m - 1]}
                            {event.isYearly && <RefreshCw className="w-2.5 h-2.5 opacity-60" />}
                          </p>
                          {event.description && (
                            <p className={`mt-3 text-[10px] leading-relaxed opacity-60 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2 border-t pt-4 border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={() => {
                              setEditingEvent(event);
                              setIsAddModalOpen(true);
                            }}
                            className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            ویرایش
                          </button>
                          <button 
                            onClick={() => onDeleteEvent(event.id)}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors mr-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full py-20 text-center opacity-40">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-sm font-bold">هیچ مناسبتی برای آینده ثبت نشده است</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg z-[101] rounded-3xl border shadow-2xl overflow-hidden ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {editingEvent ? 'ویرایش مناسبت' : 'ثبت مناسبت جدید'}
                  </h3>
                  <div className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                    {newDay} {JALALI_MONTHS[viewMonth - 1]} {viewYear}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">عنوان مناسبت</label>
                    <input 
                      autoFocus
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="مثلاً: تولد مریم"
                      className={`w-full px-5 py-4 rounded-2xl text-sm font-bold focus:outline-none border transition-all ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' 
                          : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">نوع مناسبت</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EVENT_TYPES.map(type => {
                        const Icon = type.icon;
                        const isActive = newType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setNewType(type.id as CalendarEvent['type'])}
                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-right ${
                              isActive 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                : isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-400'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                            <span className="text-[11px] font-black">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => setNewIsYearly(!newIsYearly)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        newIsYearly ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {newIsYearly ? <Check className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    </button>
                    <div>
                      <h4 className={`text-xs font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>مناسبت سالانه</h4>
                      <p className="text-[10px] font-medium text-slate-500">این مناسبت هر سال تکرار شود</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">توضیحات (اختیاری)</label>
                    <textarea 
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="جزئیات بیشتر..."
                      className={`w-full px-5 py-4 rounded-2xl text-sm font-bold focus:outline-none border transition-all h-24 resize-none leading-relaxed ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' 
                          : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleSaveEvent}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {editingEvent ? 'ذخیره تغییرات' : 'تایید و ثبت'}
                  </button>
                  <button 
                    onClick={resetForm}
                    className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
