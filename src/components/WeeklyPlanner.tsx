import React, { useState } from 'react';
import { 
  Plus, 
  Trash2,
  Clock,
  GripVertical,
  CheckCircle2,
  Circle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeeklyTask, AppTheme } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DAYS_OF_WEEK = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

interface SortableTaskItemProps {
  task: WeeklyTask;
  isLight: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: WeeklyTask) => void;
}

function SortableTaskItem({ task, isLight, onToggle, onDelete, onEdit }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col gap-1 p-3 rounded-xl border transition-all cursor-pointer ${
        isDragging ? 'shadow-xl scale-[1.02] z-50 ring-2 ring-indigo-500/50' : ''
      } ${
        task.completed
          ? isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-900'
          : isLight ? 'bg-white border-slate-200 hover:border-indigo-200' : 'bg-slate-900 border-slate-800 hover:border-indigo-900/50'
      }`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={`shrink-0 transition-colors mt-0.5 ${
            task.completed ? 'text-emerald-500' : isLight ? 'text-slate-300' : 'text-slate-700 hover:text-indigo-500'
          }`}
        >
          {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold leading-tight transition-all truncate ${
            task.completed 
              ? isLight ? 'text-slate-400 line-through' : 'text-slate-600 line-through'
              : isLight ? 'text-slate-700' : 'text-slate-200'
          }`}>
            {task.text}
          </p>
          {task.time && (
            <div className="flex items-center gap-1 mt-1 opacity-60">
              <Clock className="w-2.5 h-2.5" />
              <span className="text-[9px] font-medium">{task.time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div {...attributes} {...listeners} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-grab active:cursor-grabbing">
            <GripVertical className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface WeeklyPlannerProps {
  theme: AppTheme;
  tasks: WeeklyTask[];
  onUpdateTasks: (tasks: WeeklyTask[]) => void;
}

export default function WeeklyPlanner({ theme, tasks, onUpdateTasks }: WeeklyPlannerProps) {
  const isLight = theme.startsWith('light-');
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [tempTitle, setTempTitle] = useState('');
  const [tempTime, setTempTime] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent, dayIndex: number) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const dayTasks = tasks.filter(t => t.day === dayIndex).sort((a, b) => (a.order || 0) - (b.order || 0));
      const oldIndex = dayTasks.findIndex(t => t.id === active.id);
      const newIndex = dayTasks.findIndex(t => t.id === over.id);
      
      const rearrangedDayTasks = arrayMove(dayTasks, oldIndex, newIndex);
      
      // Update orders
      const updatedDayTasks = rearrangedDayTasks.map((t, idx) => ({ ...t, order: idx }));
      
      // Merge back with other days
      const otherDayTasks = tasks.filter(t => t.day !== dayIndex);
      onUpdateTasks([...otherDayTasks, ...updatedDayTasks]);
    }
  };

  const openAddModal = (dayIndex: number) => {
    setActiveDayIndex(dayIndex);
    setTempTitle('');
    setTempTime('');
    setModalMode('add');
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: WeeklyTask) => {
    setEditingTask(task);
    setTempTitle(task.text);
    setTempTime(task.time || '');
    setModalMode('edit');
    setActiveDayIndex(task.day);
    setIsModalOpen(true);
  };

  const saveTask = () => {
    if (!tempTitle.trim()) return;

    if (modalMode === 'add') {
      const dayTasks = tasks.filter(t => t.day === activeDayIndex);
      const newTask: WeeklyTask = {
        id: `weekly-${Date.now()}`,
        text: tempTitle.trim(),
        time: tempTime.trim() || undefined,
        day: activeDayIndex,
        completed: false,
        order: dayTasks.length
      };
      onUpdateTasks([...tasks, newTask]);
    } else if (editingTask) {
      onUpdateTasks(tasks.map(t => t.id === editingTask.id ? { ...t, text: tempTitle.trim(), time: tempTime.trim() || undefined } : t));
    }
    
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const toggleTask = (id: string) => {
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 pb-24" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => {
          const dayTasks = tasks
            .filter(t => t.day === dayIndex)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          const isWeekend = dayIndex === 6 || dayIndex === 5; // Friday, Thursday

          return (
            <div 
              key={dayIndex} 
              className={`flex flex-col min-h-[400px] rounded-3xl border overflow-hidden shadow-sm transition-all ${
                isLight ? 'bg-white border-slate-100 shadow-slate-200/40' : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Day Header */}
              <div className={`p-4 text-center border-b ${
                isWeekend 
                  ? isLight ? 'bg-rose-50/50 border-rose-100' : 'bg-rose-950/20 border-rose-900/30'
                  : isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-850'
              }`}>
                <p className="text-[9px] font-bold text-slate-500 mb-0.5">روز هفته</p>
                <h3 className={`text-sm font-black ${
                  isWeekend ? 'text-rose-500' : isLight ? 'text-slate-800' : 'text-white'
                }`}>
                  {dayName}
                </h3>
              </div>

              {/* Tasks List */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[60vh] scrollbar-hide">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, dayIndex)}
                >
                  <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence mode="popLayout">
                      {dayTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <SortableTaskItem 
                            task={task} 
                            isLight={isLight} 
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onEdit={openEditModal}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>

                {dayTasks.length === 0 && (
                  <div className="py-8 flex flex-col items-center justify-center text-center opacity-20">
                    <p className="text-[10px] font-bold">خالی</p>
                  </div>
                )}
              </div>

              {/* Add Button */}
              <div className="p-3 pt-0">
                <button
                  onClick={() => openAddModal(dayIndex)}
                  className={`w-full py-2.5 rounded-xl border border-dashed flex items-center justify-center gap-2 text-[10px] font-bold transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 hover:border-indigo-200' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن برنامه</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dialog */}
      <AnimatePresence>
        {isModalOpen && activeDayIndex !== -1 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-[2rem] border overflow-hidden shadow-2xl ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-6 border-b border-slate-800/10 flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  {modalMode === 'add' ? 'افزودن برنامه جدید' : 'ویرایش برنامه'}
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px]">
                    {DAYS_OF_WEEK[activeDayIndex]}
                  </span>
                </h3>
                <button onClick={() => { setIsModalOpen(false); setEditingTask(null); }} className="text-slate-500 hover:text-rose-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 mr-2">عنوان فعالیت *</label>
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    placeholder="مثلاً: مطالعه کتاب، ورزش..."
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border focus:outline-none transition-all ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-indigo-400' : 'bg-slate-950 border-slate-800 focus:border-indigo-500'
                    }`}
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && saveTask()}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 mr-2">ساعت یا زمان (اختیاری)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tempTime}
                      onChange={(e) => setTempTime(e.target.value)}
                      placeholder="مثلاً: ۱۸:۰۰ الی ۱۹:۳۰"
                      className={`w-full px-4 py-3 pr-10 rounded-2xl text-xs font-bold border focus:outline-none transition-all ${
                        isLight ? 'bg-slate-50 border-slate-200 focus:border-indigo-400' : 'bg-slate-950 border-slate-800 focus:border-indigo-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && saveTask()}
                    />
                    <Clock className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={saveTask}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  ذخیره تغییرات
                </button>
                {modalMode === 'edit' && editingTask && (
                  <button
                    onClick={() => deleteTask(editingTask.id)}
                    className="p-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

