import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Flame, 
  CheckCircle, 
  Award, 
  Calendar, 
  TrendingUp, 
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Archive,
  History,
  X
} from 'lucide-react';
import { Challenge } from '../types';

interface ChallengesTrackerProps {
  challenges: Challenge[];
  onUpdateChallenges: (updated: Challenge[]) => void;
  isLight?: boolean;
}

export default function ChallengesTracker({ challenges, onUpdateChallenges, isLight = false }: ChallengesTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(30);
  const [isCompact, setIsCompact] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [deletingChallengeId, setDeletingChallengeId] = useState<string | null>(null);

  const handleToggleArchive = (id: string) => {
    const updated = challenges.map(c => 
      c.id === id ? { ...c, isArchived: !c.isArchived } : c
    );
    onUpdateChallenges(updated);
  };

  const handleAddChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newChallenge: Challenge = {
      id: `chal-${Date.now()}`,
      title: newTitle.trim(),
      durationDays: Number(newDuration) || 30,
      completedDays: [],
      createdAt: new Date().toISOString()
    };

    onUpdateChallenges([...challenges, newChallenge]);
    setNewTitle('');
    setNewDuration(30);
    setShowAddForm(false);
  };

  const handleOpenEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setEditTitle(challenge.title);
    setEditDuration(challenge.durationDays);
  };

  const handleUpdateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge || !editTitle.trim()) return;

    const updated = challenges.map(c => 
      c.id === editingChallenge.id 
        ? { ...c, title: editTitle.trim(), durationDays: Number(editDuration) } 
        : c
    );
    onUpdateChallenges(updated);
    setEditingChallenge(null);
  };

  const handleDeleteChallenge = (id: string) => {
    onUpdateChallenges(challenges.filter(c => c.id !== id));
    setDeletingChallengeId(null);
  };

  const handleToggleDay = (challengeId: string, day: number) => {
    const updated = challenges.map(c => {
      if (c.id === challengeId) {
        const isCompleted = c.completedDays.includes(day);
        const newCompletedDays = isCompleted
          ? c.completedDays.filter(d => d !== day)
          : [...c.completedDays, day].sort((a, b) => a - b);
        
        return {
          ...c,
          completedDays: newCompletedDays
        };
      }
      return c;
    });
    onUpdateChallenges(updated);
  };

  // Quick action: mark next uncompleted day as completed
  const handleQuickCheckIn = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Find first day from 1 to durationDays that is not in completedDays
    let nextDay = -1;
    for (let d = 1; d <= challenge.durationDays; d++) {
      if (!challenge.completedDays.includes(d)) {
        nextDay = d;
        break;
      }
    }

    if (nextDay !== -1) {
      handleToggleDay(challengeId, nextDay);
    } else {
      alert('تمامی روزهای این چالش با موفقیت تکمیل شده‌اند! 🎉');
    }
  };

  // Calculate stats
  const activeChallenges = challenges.filter(c => !c.isArchived);
  const archivedChallenges = challenges.filter(c => c.isArchived);

  const totalDaysPotential = activeChallenges.reduce((acc, curr) => acc + curr.durationDays, 0);
  const totalDaysCompleted = activeChallenges.reduce((acc, curr) => acc + curr.completedDays.length, 0);
  const globalPercentage = totalDaysPotential > 0 
    ? Math.round((totalDaysCompleted / totalDaysPotential) * 100) 
    : 0;

  return (
    <div id="challenges-section" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Stats Dashboard Banner */}
      <div className={`border p-6 rounded-3xl shadow-md transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-850'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30'
            }`}>
              سیستم نوین عادتی (استمرار ۱۵ تا ۱۰۰ روزه)
            </span>
            <h2 className={`text-xl font-bold mt-2 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Flame className="w-5 h-5 text-amber-500 animate-pulse animate-duration-1000" />
              چالش‌ها و ردیاب عادت‌های من
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ساخت، زمان‌بندی و پایش میزان پایبندی به روتین‌های روزانه در قالب تقویم‌های تعاملی و نمای جمع‌وجور نقطه‌ای.
            </p>
          </div>

          {/* Stats display */}
          <div className="flex flex-wrap items-center gap-4">
            <div className={`p-3.5 rounded-2xl border flex items-center gap-4 ${
              isLight ? 'bg-slate-50/50 border-slate-200/80 text-slate-850' : 'bg-slate-950/40 border-slate-850 text-white'
            }`}>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">میزان پایبندی کل</p>
                <p className={`text-sm font-black mt-0.5 ${isLight ? 'text-emerald-600' : 'text-white'}`}>{globalPercentage}% پیشرفت عمومی</p>
                <p className="text-[9px] text-emerald-600/80 mt-0.5">{totalDaysCompleted} روز موفق از کل {totalDaysPotential} روز</p>
              </div>
              
              <div className={`relative w-10 h-10 flex items-center justify-center rounded-full border shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-[11px] font-black font-mono ${isLight ? 'text-emerald-600' : 'text-indigo-400'}`}>{globalPercentage}%</span>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border ${
              isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/30 border-slate-850'
            }`}>
              {/* Compact / Full View Switcher button */}
              <button
                onClick={() => setShowArchive(!showArchive)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  showArchive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : isLight 
                      ? 'text-slate-600 hover:bg-white hover:shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title="مشاهده تاریخچه چالش‌های آرشیو شده"
              >
                <History className={`w-3.5 h-3.5 ${showArchive ? 'text-white' : 'text-indigo-400'}`} />
                <span>آرشیو</span>
                {archivedChallenges.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                    showArchive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                  }`}>
                    {archivedChallenges.length}
                  </span>
                )}
              </button>

              <div className={`w-px h-4 mx-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

              <button
                onClick={() => setIsCompact(!isCompact)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  isLight 
                    ? 'text-slate-600 hover:bg-white hover:shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={isCompact ? "تغییر به نمای تقویم بزرگ" : "تغییر به نمای جمع‌وجور عادتی"}
              >
                {isCompact ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>نمای کامل</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>نمای فشرده</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                className="mr-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                جدید
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Grid of existing challenges */}
      <div className={isCompact ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
        {activeChallenges.length === 0 ? (
          <div className={`col-span-full text-center py-12 border border-dashed rounded-3xl space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/20 border-slate-800'
          }`}>
            <Calendar className="w-10 h-10 text-slate-550 mx-auto" />
            <p className="text-xs text-slate-500">هنوز هیچ چالش یا عادتی نساخته‌اید.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow"
            >
              ساخت اولین چالش عادتی
            </button>
          </div>
        ) : (
          activeChallenges.map((c) => {
            const percentage = c.durationDays > 0 
              ? Math.round((c.completedDays.length / c.durationDays) * 100) 
              : 0;

            const isCompletedAll = percentage >= 100;

            return (
              <div 
                key={c.id} 
                onClick={() => handleOpenEdit(c)}
                className={`border rounded-2xl flex flex-col justify-between hover:scale-[1.005] hover:shadow-md transition-all duration-350 relative p-4.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-850' 
                    : 'bg-slate-900/50 border-slate-850 text-slate-100'
                } ${isCompact ? 'space-y-3 p-3.5' : 'space-y-4'}`}
              >
                
                {/* Header info */}
                <div className={`flex items-start justify-between border-b pb-2.5 gap-3 ${
                  isLight ? 'border-slate-100' : 'border-slate-800/60'
                }`}>
                  <div>
                    <h3 className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      {c.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      دوره چالش: {c.durationDays} روزه
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/40 border-slate-800'
                    }`}>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg border shadow-sm ${
                        isLight 
                          ? 'text-emerald-700 bg-white border-emerald-100' 
                          : 'text-emerald-400 bg-slate-900 border-emerald-900/30'
                      }`}>
                        {percentage}%
                      </span>

                      <div className={`w-px h-3 mx-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleArchive(c.id); }}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                          isLight ? 'text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm' : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800'
                        }`}
                        title={c.isArchived ? "بازگردانی از آرشیو" : "آرشیو کردن چالش"}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {deletingChallengeId === c.id ? (
                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-1 py-0.5 rounded-lg animate-in slide-in-from-left-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteChallenge(c.id)}
                            className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black hover:bg-rose-500 cursor-pointer"
                          >
                            حذف
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingChallengeId(null)}
                            className={`p-0.5 rounded cursor-pointer ${
                              isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingChallengeId(c.id)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                            isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                          }`}
                          title="حذف چالش"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Mini Line */}
                <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between text-[9px] text-slate-405">
                    <span>{c.completedDays.length} روز انجام شده</span>
                    <span>{c.durationDays - c.completedDays.length} روز باقیمانده</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-350 ${
                        isLight ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Grid layout for days (RTL) */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  {isCompact ? (
                    /* ================= COMPACT VIEW (GitHub Contribution style dots & Quick Log) ================= */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[9.5px]">
                        <span className="text-slate-550 font-bold">نمای وضعیت نقطه‌ای چالش:</span>
                        <button
                          onClick={() => handleQuickCheckIn(c.id)}
                          disabled={isCompletedAll}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition-colors ${
                            isCompletedAll
                              ? 'bg-slate-100 text-slate-400 border border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          +۱ ثبت روز جدید
                        </button>
                      </div>

                      {/* GitHub style tiny grid of boxes */}
                      <div className={`p-2 rounded-xl flex flex-wrap gap-1 items-center justify-center ${
                        isLight ? 'bg-slate-50/70 border border-slate-150' : 'bg-slate-950/60'
                      }`}>
                        {Array.from({ length: c.durationDays }, (_, i) => i + 1).map((day) => {
                          const isDone = c.completedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleToggleDay(c.id, day)}
                              className={`w-3.5 h-3.5 rounded-[3px] border transition-all cursor-pointer ${
                                isDone
                                  ? isLight
                                    ? 'bg-emerald-600 border-emerald-500 shadow-sm'
                                    : 'bg-emerald-600 border-emerald-500 shadow-sm'
                                  : isLight
                                    ? 'bg-slate-200 border-slate-250 hover:bg-slate-300'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                              title={`روز ${day}: ${isDone ? 'موفق' : 'ثبت نشده'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* ================= FULL VIEW (Full Calendar Interactive Grid) ================= */
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 font-bold">تقویم روزها (برای تیک زدن کلیک کنید):</p>
                      
                      <div className={`grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-3 rounded-xl max-h-52 overflow-y-auto ${
                        isLight ? 'bg-slate-50 border border-slate-150' : 'bg-slate-950/60'
                      }`}>
                        {Array.from({ length: c.durationDays }, (_, i) => i + 1).map((day) => {
                          const isDone = c.completedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleToggleDay(c.id, day)}
                              className={`aspect-square text-[10px] font-mono font-bold flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                                isDone
                                  ? isLight
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm font-extrabold scale-102'
                                    : 'bg-emerald-600/25 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/30 font-extrabold scale-102'
                                  : isLight
                                    ? 'bg-white border-slate-200 text-slate-550 hover:border-slate-300 hover:text-slate-700'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-305'
                              }`}
                            >
                              <span>{day}</span>
                              {isDone && <CheckCircle className={`w-2.5 h-2.5 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`text-[10px] pt-1 text-center py-1.5 rounded-lg border ${
                  isLight 
                    ? 'bg-slate-50/50 border-slate-100 text-slate-600' 
                    : 'bg-slate-950/20 border-slate-800/30 text-slate-500'
                }`}>
                  {percentage >= 100 
                    ? '🎉 تبریک فراوان! شما این چالش عادتی را با موفقیت کامل به پایان رساندید!'
                    : `استمرار داشته باشید، فقط با تیک زدن ${c.durationDays - c.completedDays.length} روز دیگر به خط پایان می‌رسید.`}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Archived Challenges Section */}
      {showArchive && archivedChallenges.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-dashed border-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Archive className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className={`text-sm font-black ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>چالش‌های آرشیو شده (تاریخچه)</h3>
          </div>

          <div className={isCompact ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
            {archivedChallenges.map((c) => {
              const percentage = c.durationDays > 0 
                ? Math.round((c.completedDays.length / c.durationDays) * 100) 
                : 0;

              return (
                <div 
                  key={c.id} 
                  className={`border rounded-2xl flex flex-col justify-between opacity-60 hover:opacity-100 transition-all duration-350 relative p-4.5 ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-850' 
                      : 'bg-slate-950 border-slate-850 text-slate-100'
                  } ${isCompact ? 'space-y-3 p-3.5' : 'space-y-4'}`}
                >
                  <div className={`flex items-start justify-between border-b pb-2.5 gap-3 ${
                    isLight ? 'border-slate-100' : 'border-slate-800/60'
                  }`}>
                    <div>
                      <h3 className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {c.title}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-500">آرشیو</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleArchive(c.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-emerald-600 hover:bg-slate-50' : 'text-slate-550 hover:text-emerald-400 hover:bg-slate-800'
                        }`}
                        title="بازگردانی از آرشیو"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(c.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-50' : 'text-slate-550 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title="حذف دائمی"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    این چالش آرشیو شده است. می‌توانید آن را بازگردانی یا حذف کنید.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Challenge Dialog Popover */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-100'
          }`} dir="rtl">
            <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Plus className="w-5 h-5 text-emerald-500" />
              ایجاد چالش عادتی جدید
            </h3>
            <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              یک روتین یا عادت جدید بسازید و با تعیین مدت زمان، روزهای خود را برای ایجاد پایبندی ردیابی کنید.
            </p>

            <form onSubmit={handleAddChallenge} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-655' : 'text-slate-300'}`}>عنوان عادت یا چالش *</label>
                <input
                  type="text"
                  placeholder="مثال: ۳۰ دقیقه ورزش، عدم استفاده از گوشی بعد از ۲۲:۰۰"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-655' : 'text-slate-300'}`}>مدت دوره چالش (روز) *</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors cursor-pointer focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value={7}>۷ روزه (چالش یک‌هفته‌ای)</option>
                  <option value={15}>۱۵ روزه (چالش دوهفته‌ای)</option>
                  <option value={30}>۳۰ روزه (چالش یک‌ماهه)</option>
                  <option value={60}>۶۰ روزه (چالش دوماهه)</option>
                  <option value={90}>۹۰ روزه (چالش سه‌ماهه پاییز/بهار)</option>
                  <option value={100}>۱۰۰ روزه (چالش صد روزه تا هدف)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-700 hover:bg-slate-650 text-slate-200'
                  }`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  ایجاد چالش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Challenge Dialog Popover */}
      {editingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingChallenge(null)} />
          
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-100'
          }`} dir="rtl">
            <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Sparkles className="w-5 h-5 text-indigo-500" />
              ویرایش چالش عادتی
            </h3>
            <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              عنوان یا مدت زمان چالش خود را در اینجا ویرایش کنید.
            </p>

            <form onSubmit={handleUpdateChallenge} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-655' : 'text-slate-300'}`}>عنوان عادت یا چالش *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-655' : 'text-slate-300'}`}>مدت دوره چالش (روز) *</label>
                <select
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors cursor-pointer focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value={7}>۷ روزه (چالش یک‌هفته‌ای)</option>
                  <option value={15}>۱۵ روزه (چالش دوهفته‌ای)</option>
                  <option value={30}>۳۰ روزه (چالش یک‌ماهه)</option>
                  <option value={60}>۶۰ روزه (چالش دوماهه)</option>
                  <option value={90}>۹۰ روزه (چالش سه‌ماهه پاییز/بهار)</option>
                  <option value={100}>۱۰۰ روزه (چالش صد روزه تا هدف)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChallenge(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-700 hover:bg-slate-650 text-slate-200'
                  }`}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
