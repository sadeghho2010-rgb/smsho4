import React from 'react';
import { Program, AppTheme } from '../types';
import { Layers, CheckCircle2, Circle, Clock, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import persianDate from 'persian-date';

const toJalali = (dateStr?: string) => {
  if (!dateStr) return '';
  return new persianDate(new Date(dateStr)).format('YYYY/MM/DD');
};

interface ProgramsOverviewProps {
  programs: Program[];
  activeTheme: AppTheme;
  onSelectProgram: (id: string) => void;
  onTabChange: (tab: any) => void;
}

export default function ProgramsOverview({ programs, activeTheme, onSelectProgram, onTabChange }: ProgramsOverviewProps) {
  const isLight = activeTheme.startsWith('light-');

  const calculateProgress = (program: Program) => {
    let totalNodes = 0;
    let completedNodes = 0;

    program.paths.forEach(path => {
      path.nodes.forEach(node => {
        totalNodes++;
        if (node.status === 'COMPLETED') completedNodes++;
      });
    });

    const percent = totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100);
    return { totalNodes, completedNodes, percent };
  };

  return (
    <div className={`p-6 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
      <div className="mb-6">
        <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>نمای کلی برنامه‌های جامع</h2>
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
          مشاهده وضعیت کلی و پیشرفت تمام برنامه‌های بلندمدت شما در یک نگاه.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program, idx) => {
          const { totalNodes, completedNodes, percent } = calculateProgress(program);
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={program.id}
              onClick={() => {
                onSelectProgram(program.id);
                onTabChange('roadmap');
              }}
              className={`p-5 rounded-xl border transition-all cursor-pointer group ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-emerald-300' 
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-emerald-700'
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors ${isLight ? 'text-slate-800' : 'text-white'}`}>
                {program.title}
              </h3>
              {program.description && (
                <p className={`text-xs mb-4 line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {program.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>پیشرفت کلی</span>
                  <span className="font-bold text-emerald-500">{percent}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`}>
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className={`flex items-center gap-4 text-xs mt-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                <div className="flex items-center gap-1.5" title="تعداد مسیرها">
                  <Layers className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{program.paths.length} مسیر</span>
                </div>
                <div className="flex items-center gap-1.5" title="گام‌های تکمیل‌شده / کل گام‌ها">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{completedNodes} / {totalNodes} گام</span>
                </div>
              </div>
              
              {program.dueDate && (
                 <div className="flex items-center gap-1.5 mt-3 text-xs bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>موعد: {toJalali(program.dueDate)}</span>
                 </div>
              )}
              {program.timingType === 'days' && program.durationDays && (
                 <div className="flex items-center gap-1.5 mt-3 text-xs bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                    <Timer className="w-4 h-4 text-indigo-500" />
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>مدت برنامه: {program.durationDays} روز</span>
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
