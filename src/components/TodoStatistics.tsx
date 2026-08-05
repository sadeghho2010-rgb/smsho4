import React, { useMemo, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import { X, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { TodoItem, WeeklyTask } from '../types';

interface TodoStatisticsProps {
  todos: TodoItem[];
  weeklyTasks: WeeklyTask[];
  onClose: () => void;
  isLight?: boolean;
}

type Range = '7d' | '30d' | '90d';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TodoStatistics({ todos, weeklyTasks, onClose, isLight }: TodoStatisticsProps) {
  const [range, setRange] = useState<Range>('7d');

  const statsData = useMemo(() => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = getLocalDateString(date);
      
      // Calculate normal todos for this day
      const dayTodos = todos.filter(t => getLocalDateString(new Date(t.createdAt)) === dateStr);
      
      // Calculate weekly tasks for this day
      const jsDay = date.getDay(); 
      const mappedDay = (jsDay + 1) % 7;
      const dayWeekly = weeklyTasks.filter(wt => wt.day === mappedDay);

      const combined = [...dayTodos, ...dayWeekly];
      const total = combined.length;
      const completed = combined.filter(t => t.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      data.push({
        date: date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        درصد_پایبندی: percent,
        تعداد_کارها: total
      });
    }
    return data;
  }, [todos, weeklyTasks, range]);

  const averageCommitment = useMemo(() => {
    if (statsData.length === 0) return 0;
    const sum = statsData.reduce((acc, curr) => acc + curr.درصد_پایبندی, 0);
    return Math.round(sum / statsData.length);
  }, [statsData]);

  const bestDay = useMemo(() => {
    return [...statsData].sort((a, b) => b.درصد_پایبندی - a.درصد_پایبندی)[0];
  }, [statsData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border flex flex-col shadow-2xl ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black">تحلیل جامع عملکرد و پایبندی</h2>
              <p className="text-xs text-slate-500 mt-0.5">بررسی میزان تحقق اهداف در بازه‌های زمانی مختلف</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800/10 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Controls & Summary Cards */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Target className="w-4 h-4" />
                  <span className="text-[10px] font-bold">میانگین پایبندی</span>
                </div>
                <div className="text-2xl font-black text-emerald-500">{averageCommitment}%</div>
              </div>
              
              <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-bold">بهترین عملکرد</span>
                </div>
                <div className="text-2xl font-black text-indigo-500">{bestDay?.درصد_پایبندی}%</div>
                <div className="text-[9px] text-slate-500 mt-1 truncate">{bestDay?.date}</div>
              </div>

              <div className={`p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold">بازه زمانی</span>
                </div>
                <div className="flex p-0.5 bg-slate-800/20 rounded-xl">
                  {(['7d', '30d', '90d'] as Range[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${
                        range === r ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r === '7d' ? 'هفته' : r === '30d' ? 'ماه' : '۳ ماه'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className={`p-6 rounded-[2rem] border min-h-[350px] ${
            isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/30 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                نمودار روند پایبندی روزانه
              </h3>
            </div>
            
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#64748b' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`p-3 rounded-2xl border shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                            <p className="text-[10px] font-black mb-1.5 text-slate-500">{data.fullDate}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase tracking-wider">پایبندی</span>
                                <span className="text-lg font-black text-emerald-500">{data.درصد_پایبندی}%</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase tracking-wider">کل کارها</span>
                                <span className="text-lg font-black text-indigo-500">{data.تعداد_کارها}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={averageCommitment} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'right', value: 'میانگین', fill: '#64748b', fontSize: 9 }} />
                  <Area 
                    type="monotone" 
                    dataKey="درصد_پایبندی" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPercent)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-50/30 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
              <p className="text-[11px] font-bold text-emerald-500 mb-1">نکته بهبود عملکرد:</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                سعی کنید کارهای روز بعد را در انتهای شب برنامه‌ریزی کنید. آمارهای شما نشان می‌دهد روزهایی که بیش از ۵ کار دارید، پایبندی شما کاهش می‌یابد.
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-indigo-50/30 border-indigo-100' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
              <p className="text-[11px] font-bold text-indigo-500 mb-1">تداوم زنجیره:</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                در هفته گذشته توانستید ۳ روز متوالی بالای ۸۰٪ پایبندی داشته باشید. هدف بعدی: ۴ روز متوالی!
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800/10 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            فهمیدم، ادامه میدم
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
