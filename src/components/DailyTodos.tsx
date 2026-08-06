import React, { useState, useEffect } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  Flame,
  GitCommit,
  CheckSquare,
  Square,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Save,
  X,
  GripVertical,
  TrendingUp,
  Download,
  Upload,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TodoItem, TodoSubTask, WeeklyTask } from '../types';
import TodoStatistics from './TodoStatistics';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DAYS_OF_WEEK = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

interface SortableTodoItemProps {
  todo: TodoItem & { isWeekly?: boolean; weeklyDayName?: string };
  index: number;
  isLight: boolean;
  todoViewMode: string;
  isExpanded: boolean;
  isActive: boolean;
  onActivate: (id: string | null) => void;
  onExpand: (id: string | null) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSub: (todoId: string, subId: string) => void;
  onAddSub: (todoId: string, e: React.FormEvent) => void;
  onDeleteSub: (todoId: string, subId: string) => void;
  onPin: (id: string) => void;
  onCopyToNextDay: (todo: TodoItem) => void;
  onStartEdit: (todo: TodoItem) => void;
  subTaskInput: Record<string, string>;
  setSubTaskInput: (val: Record<string, string>) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
}

function SortableTodoItem({
  todo,
  index,
  isLight,
  todoViewMode,
  isExpanded,
  isActive,
  onActivate,
  onExpand,
  onToggle,
  onDelete,
  onToggleSub,
  onAddSub,
  onDeleteSub,
  onPin,
  onCopyToNextDay,
  onStartEdit,
  subTaskInput,
  setSubTaskInput,
  confirmDeleteId,
  setConfirmDeleteId
}: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined
  };

  const totalSub = todo.subTasks.length;
  const doneSub = todo.subTasks.filter(s => s.completed).length;
  const pct = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onActivate(isActive ? null : todo.id)}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 relative cursor-pointer ${
        todo.completed 
          ? (isLight ? 'bg-emerald-50/20 border-emerald-200' : 'bg-emerald-950/5 border-emerald-900/30 opacity-75') 
          : todo.isWeekly 
            ? (isLight ? 'bg-indigo-50/70 border-indigo-300 border-dashed shadow-[0_8px_20px_-6px_rgba(79,70,229,0.15)]' : 'bg-indigo-900/30 border-indigo-500/50 border-dashed shadow-[0_0_25px_-5px_rgba(79,70,229,0.4)]')
            : (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-850')
      } ${isDragging ? 'shadow-2xl scale-[1.02]' : ''} ${isActive ? 'ring-2 ring-emerald-500/50' : ''}`}
    >
      {/* Weekly task background pattern */}
      {todo.isWeekly && !todo.completed && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 0)', backgroundSize: '12px 12px' }} />
      )}
      <div>
        {/* Top border decor for advanced mode */}
        {todoViewMode === 'advanced' && (
          <div className={`h-1.5 w-full bg-gradient-to-r ${
            todo.completed 
              ? 'from-emerald-500 to-emerald-600' 
              : todo.isWeekly 
                ? 'from-indigo-400 via-violet-500 to-indigo-600'
                : 'from-indigo-500 to-teal-500'
          }`} />
        )}

        {/* Main Card Header bar */}
        <div className="p-4 flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-2.5">
            {/* Weekly task left accent */}
            {todo.isWeekly && !todo.completed && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500" />
            )}
            {/* Drag Handle */}
            <div 
              {...attributes} 
              {...listeners} 
              className="mt-0.5 cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-800/10 transition-colors shrink-0"
              title="جابه‌جایی (درگ و دراپ)"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Check Button + Number Badge right next to it */}
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <button
                type="button"
                onClick={() => onToggle(todo.id)}
                className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                title={todo.completed ? "علامت‌گذاری به عنوان انجام نشده" : "علامت‌گذاری به عنوان انجام شده"}
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:scale-110 transition-transform" />
                )}
              </button>

              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}>
                #{index + 1}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h4 className={`text-xs font-bold transition-all ${
                todo.completed 
                  ? 'line-through text-slate-500' 
                  : (isLight ? 'text-slate-900' : 'text-white')
              }`}>
                {todo.title}
                {todo.isPinned && (
                  <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                    <Square className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>برنامه ثابت</span>
                  </span>
                )}
                {todo.isWeekly && (
                  <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
                    <Calendar className="w-2.5 h-2.5 text-indigo-500" />
                    <span>برنامه هفتگی {todo.weeklyDayName}</span>
                  </span>
                )}
                {todo.isAutoGenerated && (
                  <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                    <Bell className="w-2.5 h-2.5 text-rose-500" />
                    <span>مناسبت</span>
                  </span>
                )}
              </h4>
              
              {todo.description && todoViewMode !== 'compact' && (
                <p className={`text-[10px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {todo.description}
                </p>
              )}

              {/* Completion details badge */}
              {totalSub > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-20 h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-emerald-500">{doneSub}/{totalSub} زیرمجموعه ({pct}%)</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking buttons
                >
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => onStartEdit(todo)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                    title="ویرایش برنامه"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete actions */}
                  {confirmDeleteId === todo.id ? (
                    <div className="flex items-center gap-1 bg-red-950/20 border border-red-900/30 p-1 rounded-lg">
                      <span className="text-[8px] font-bold text-rose-400 px-1">حذف؟</span>
                      <button
                        type="button"
                        onClick={() => onDelete(todo.id)}
                        className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold hover:bg-rose-500 cursor-pointer"
                      >
                        بله
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        خیر
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(todo.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-850'
                      }`}
                      title="حذف برنامه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Copy to Next Day */}
            {!todo.isWeekly && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onCopyToNextDay(todo); }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                  title="انتقال به روز بعد"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Square Pin Toggle */}
            {!todo.isWeekly && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPin(todo.id); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  todo.isPinned 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                    : isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
                title={todo.isPinned ? "لغو برنامه ثابت" : "مربع سنجاق: برنامه ثابت شود (تکرار روزانه)"}
              >
                <Square className={`w-3.5 h-3.5 ${todo.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            )}

            {/* Subtask Toggle Expand button */}
            {!todo.isWeekly && todoViewMode !== 'compact' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onExpand(isExpanded ? null : todo.id); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
                title="مدیریت زیرمجموعه‌ها"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Sub-Tasks Section */}
        {isExpanded && todoViewMode !== 'compact' && (
          <div className={`px-4 pb-4 pt-2 border-t text-xs ${
            isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-950/20 border-slate-800/50'
          }`}>
            <p className={`text-[10px] font-black mb-2 flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <GitCommit className="w-3 h-3 text-emerald-500" />
              <span>مراحل جزئی کار (زیرمجموعه‌ها):</span>
            </p>

            {/* Sub tasks list */}
            {todo.subTasks.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {todo.subTasks.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="flex items-center justify-between gap-4 p-2 bg-slate-950/40 rounded-xl border border-slate-850/50"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleSub(todo.id, sub.id)}
                        className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                      >
                        {sub.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <span className={`text-[11px] font-medium ${sub.completed ? 'line-through text-slate-500' : (isLight ? 'text-slate-800' : 'text-slate-200')}`}>
                        {sub.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteSub(todo.id, sub.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick sub-task form */}
            <form 
              onSubmit={(e) => onAddSub(todo.id, e)} 
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="عنوان گام جزئی جدید..."
                value={subTaskInput[todo.id] || ''}
                onChange={(e) => setSubTaskInput({ ...subTaskInput, [todo.id]: e.target.value })}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-[10px] focus:outline-none focus:border-emerald-500 transition-colors ${
                  isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-750 text-white'
                }`}
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>ثبت</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

interface DailyTodosProps {
  todos: TodoItem[];
  onUpdateTodos: (updatedList: TodoItem[]) => void;
  weeklyTasks: WeeklyTask[];
  onUpdateWeeklyTasks: (updatedList: WeeklyTask[]) => void;
  isLight?: boolean;
}

export default function DailyTodos({
  todos,
  onUpdateTodos,
  weeklyTasks,
  onUpdateWeeklyTasks,
  isLight = false
}: DailyTodosProps) {
  // View mode states: 'compact' | 'simple' | 'advanced'
  const [todoViewMode, setTodoViewMode] = useState<'compact' | 'simple' | 'advanced'>('simple');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  // Date selection state for viewing history
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Create state
  const [quickEntryTitle, setQuickEntryTitle] = useState('');
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Download all todos and weekly tasks as JSON
  const handleDownloadData = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      todos,
      weeklyTasks
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("download", `daily_tasks_backup_${date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload JSON data
  const handleUploadData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed && Array.isArray(parsed.todos)) {
          onUpdateTodos(parsed.todos);
          if (Array.isArray(parsed.weeklyTasks)) {
            onUpdateWeeklyTasks(parsed.weeklyTasks);
          }
          alert('اطلاعات با موفقیت بازگردانی شد.');
        } else {
          alert('فرمت فایل نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Edit state
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Subtask quick creation states
  const [subTaskInput, setSubTaskInput] = useState<Record<string, string>>({});

  // Custom inline delete confirmation state to bypass blocked native confirms in iframe
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Recurring (Pinned) Tasks Logic
  useEffect(() => {
    const selectedDateStr = getLocalDateString(selectedDate);
    
    // Find pinned tasks that are NOT present in the current day
    const pinnedTasks = todos.filter(t => t.isPinned);
    const currentDayTaskTitles = todos
      .filter(t => getLocalDateString(new Date(t.createdAt)) === selectedDateStr)
      .map(t => t.title);
    
    const tasksToAutoCopy = pinnedTasks.filter(p => {
      const pDateStr = getLocalDateString(new Date(p.createdAt));
      return pDateStr < selectedDateStr && !currentDayTaskTitles.includes(p.title);
    });

    if (tasksToAutoCopy.length > 0) {
      const newTasks = tasksToAutoCopy.map(p => ({
        ...p,
        id: `todo-${Date.now()}-${Math.random()}`,
        createdAt: selectedDate.toISOString(),
        completed: false,
        subTasks: p.subTasks.map(s => ({ ...s, id: `sub-${Date.now()}-${Math.random()}`, completed: false }))
      }));
      onUpdateTodos([...newTasks, ...todos]);
    }
  }, [selectedDate, todos.length]); // Added todos.length to trigger when list changes

  // Day navigation handlers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleJumpToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };

  const handleQuickAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEntryTitle.trim()) return;

    const now = new Date();
    const targetDate = new Date(selectedDate);
    targetDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: quickEntryTitle.trim(),
      completed: false,
      subTasks: [],
      createdAt: targetDate.toISOString()
    };

    onUpdateTodos([newTodo, ...todos]);
    setQuickEntryTitle('');
  };

  // Handle Edit
  const handleStartEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !editTitle.trim()) return;

    const updated = todos.map(t => 
      t.id === editingTodo.id 
        ? { ...t, title: editTitle.trim(), description: editDesc.trim() || undefined } 
        : t
    );
    onUpdateTodos(updated);
    setEditingTodo(null);
  };

  // Toggle main To-Do completion
  const handleToggleTodo = (id: string) => {
    // Check if it's a weekly task
    if (id.startsWith('weekly-')) {
      const updatedWeekly = weeklyTasks.map(wt => 
        wt.id === id ? { ...wt, completed: !wt.completed } : wt
      );
      onUpdateWeeklyTasks(updatedWeekly);
      return;
    }

    const updated = todos.map(todo => {
      if (todo.id === id) {
        const nextCompleted = !todo.completed;
        const updatedSubTasks = todo.subTasks.map(sub => ({
          ...sub,
          completed: nextCompleted
        }));
        return {
          ...todo,
          completed: nextCompleted,
          subTasks: updatedSubTasks
        };
      }
      return todo;
    });
    onUpdateTodos(updated);
  };

  // Delete main To-Do
  const handleDeleteTodo = (id: string) => {
    if (id.startsWith('weekly-')) {
      const updatedWeekly = weeklyTasks.filter(wt => wt.id !== id);
      onUpdateWeeklyTasks(updatedWeekly);
      setConfirmDeleteId(null);
      return;
    }
    onUpdateTodos(todos.filter(todo => todo.id !== id));
    setConfirmDeleteId(null);
  };

  // Pin Toggle
  const handleTogglePin = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
    onUpdateTodos(updated);
  };

  // Copy to Next Day
  const handleCopyToNextDay = (todo: TodoItem) => {
    const nextDay = new Date(todo.createdAt);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const copy: TodoItem = {
      ...todo,
      id: `todo-${Date.now()}-${Math.random()}`,
      createdAt: nextDay.toISOString(),
      completed: false,
      subTasks: todo.subTasks.map(s => ({ ...s, id: `sub-${Date.now()}-${Math.random()}`, completed: false }))
    };
    
    onUpdateTodos([copy, ...todos]);
  };

  // Add a sub-task
  const handleAddSubTask = (todoId: string, e: React.FormEvent) => {
    e.preventDefault();
    const subTitle = subTaskInput[todoId]?.trim();
    if (!subTitle) return;

    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        const newSub: TodoSubTask = {
          id: `sub-${Date.now()}-${Math.random()}`,
          title: subTitle,
          completed: false
        };
        return {
          ...todo,
          subTasks: [...todo.subTasks, newSub]
        };
      }
      return todo;
    });

    onUpdateTodos(updated);
    setSubTaskInput({ ...subTaskInput, [todoId]: '' });
  };

  // Toggle sub-task
  const handleToggleSubTask = (todoId: string, subId: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        const updatedSubs = todo.subTasks.map(sub => 
          sub.id === subId ? { ...sub, completed: !sub.completed } : sub
        );
        const allCompleted = updatedSubs.length > 0 && updatedSubs.every(s => s.completed);
        return {
          ...todo,
          subTasks: updatedSubs,
          completed: allCompleted ? true : todo.completed
        };
      }
      return todo;
    });
    onUpdateTodos(updated);
  };

  // Delete sub-task
  const handleDeleteSubTask = (todoId: string, subId: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          subTasks: todo.subTasks.filter(s => s.id !== subId)
        };
      }
      return todo;
    });
    onUpdateTodos(updated);
  };

  // DnD Reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeId = active.id.toString();
      const overId = over.id.toString();

      const oldIndex = filteredTodos.findIndex(t => t.id === activeId);
      const newIndex = filteredTodos.findIndex(t => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFiltered = arrayMove(filteredTodos, oldIndex, newIndex);
        
        // Preserve items that are not in the current filtered list
        const filteredIds = new Set(filteredTodos.map(t => t.id));
        const nonFilteredTodos = todos.filter(t => !filteredIds.has(t.id));

        onUpdateTodos([...reorderedFiltered, ...nonFilteredTodos]);
      }
    }
  };

  const selectedDateStr = getLocalDateString(selectedDate);

  // Weekly tasks logic: map weekly tasks to current day
  const jsDay = selectedDate.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
  // Map JS Day to our DAYS_OF_WEEK (0: Sat, 1: Sun, 2: Mon, 3: Tue, 4: Wed, 5: Thu, 6: Fri)
  const mappedDay = (jsDay + 1) % 7;
  const currentDayWeeklyTasks = weeklyTasks.filter(wt => wt.day === mappedDay);
  
  const weeklyAsTodos: (TodoItem & { isWeekly: boolean; weeklyDayName: string })[] = currentDayWeeklyTasks.map(wt => ({
    id: wt.id,
    title: wt.text,
    completed: wt.completed,
    isWeekly: true,
    weeklyDayName: DAYS_OF_WEEK[wt.day],
    subTasks: [],
    createdAt: selectedDate.toISOString()
  }));

  const filteredTodosByDate = todos.filter(todo => {
    try {
      const todoDate = new Date(todo.createdAt);
      return getLocalDateString(todoDate) === selectedDateStr;
    } catch (err) {
      return false;
    }
  });

  // Combine normal and weekly tasks
  // Logic: Non-completed normal tasks first, then non-completed weekly tasks, then completed ones
  const combinedTodos = [...filteredTodosByDate, ...weeklyAsTodos];

  const totalCount = combinedTodos.length;
  const completedCount = combinedTodos.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTodos = combinedTodos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  // Re-sorting to put weekly tasks at the bottom but above completed ones
  const sortedTodos = [...filteredTodos].sort((a: any, b: any) => {
    // Completed tasks last
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Within the same completion status, weekly tasks last
    if (a.isWeekly && !b.isWeekly) return 1;
    if (!a.isWeekly && b.isWeekly) return -1;
    
    return 0;
  });

  return (
    <div id="daily-todos-section" className="space-y-6 text-right" dir="rtl">
      
      <div className={`p-4 border rounded-3xl transition-all duration-300 shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-850 text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isLight ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-800'
              }`}>
                امروز: {new Date().toLocaleDateString('fa-IR', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>لیست کارهای روزانه و تاریخچه</h2>
          </div>

          <div className="flex gap-2.5 shrink-0">
            {/* Hidden File Input for Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadData}
              className="hidden"
              accept=".json"
            />
            
            <button
              onClick={() => setIsStatsOpen(true)}
              className={`p-3 rounded-2xl border text-center min-w-[90px] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group ${
                isLight ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
              title="مشاهده آمار عملکرد"
            >
              <p className={`text-[9px] font-black flex items-center justify-center gap-1 mb-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                <TrendingUp className="w-3 h-3 group-hover:animate-bounce" />
                آمار کلی
              </p>
              <p className={`text-sm font-black ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>تحلیل</p>
            </button>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleDownloadData}
                className={`flex-1 px-3 rounded-xl border flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
                title="دانلود نسخه پشتیبان برنامه‌ها"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">دانلود</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 px-3 rounded-xl border flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
                title="بارگذاری فایل پشتیبان"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">آپلود</span>
              </button>
            </div>

            <div className={`p-3 rounded-2xl border text-center min-w-[80px] ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <p className={`text-[9px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>پایبندی روز</p>
              <p className="text-lg font-black text-emerald-500 mt-0.5">{completionPercentage}%</p>
            </div>
            <div className={`p-3 rounded-2xl border text-center min-w-[90px] ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <p className={`text-[9px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>کارها</p>
              <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-0.5`}>{completedCount}/{totalCount}</p>
            </div>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/10">
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                <span>میزان پیشروی کارهای روز انتخابی</span>
              </span>
              <span className="text-emerald-500 font-black">{completionPercentage}%</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
              <motion.div 
                className="h-full bg-gradient-to-l from-emerald-500 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-800/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </span>
            <div>
              <p className={`text-[9px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>لیست کارهای روز:</p>
              <p className={`text-xs font-black ${isLight ? 'text-slate-850' : 'text-emerald-400'} mt-0.5`}>
                {selectedDate.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {getLocalDateString(selectedDate) === getLocalDateString(new Date()) && " (امروز)"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="روز قبل"
            >
              <span>روز قبل</span>
              <span className="font-mono text-emerald-500">→</span>
            </button>

            {getLocalDateString(selectedDate) !== getLocalDateString(new Date()) && (
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-xl transition-all shadow-md cursor-pointer"
              >
                امروز
              </button>
            )}

            <button
              type="button"
              onClick={handleNextDay}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="روز بعد"
            >
              <span className="font-mono text-emerald-500">←</span>
              <span>روز بعد</span>
            </button>

            <div className="relative">
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={selectedDate}
                onChange={(date: any) => {
                  if (date) setSelectedDate(date.toDate());
                }}
                inputClass={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border focus:outline-none focus:border-emerald-500 w-32 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-850 border-slate-800 text-slate-300'
                }`}
                containerStyle={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-850'
      }`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-emerald-600 text-white shadow' : `${isLight ? 'text-slate-650 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            همه کارها ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-emerald-600/20 text-emerald-500 font-black border border-emerald-500/20 shadow' : `${isLight ? 'text-slate-650 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            در حال اقدام ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed' ? 'bg-emerald-600 text-white shadow' : `${isLight ? 'text-slate-650 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`
            }`}
          >
            کامل شده ({completedCount})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-450'}`}>طراحی نما:</span>
            <div className={`flex items-center p-0.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl`}>
              <button
                onClick={() => setTodoViewMode('compact')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${todoViewMode === 'compact' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="نمای جمع و جور"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTodoViewMode('simple')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${todoViewMode === 'simple' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="نمای ساده کلاسیک"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTodoViewMode('advanced')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${todoViewMode === 'advanced' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="نمای پیشرفته و متراکم"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-4 space-y-4">
          <AnimatePresence>
            {editingTodo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`border p-5 rounded-3xl space-y-4 shadow-xl fixed lg:static bottom-4 left-4 right-4 z-50 lg:z-auto ${isLight ? 'bg-white border-emerald-200 text-slate-805 shadow-emerald-500/10' : 'bg-slate-900 border-emerald-900/30'}`}
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-500" />
                    <h3 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>ویرایش کار</h3>
                  </div>
                  <button onClick={() => setEditingTodo(null)} className="text-slate-500 hover:text-rose-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>عنوان جدید</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-950 border-slate-750 text-white'}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>توضیحات جدید</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors resize-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-950 border-slate-750 text-white'}`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </button>
                  <button
                    onClick={() => setEditingTodo(null)}
                    className={`flex-1 py-2 ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'} text-[11px] font-black rounded-xl transition-all cursor-pointer`}
                  >
                    انصراف
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {/* Quick Entry Box */}
          <div className={`p-4 rounded-3xl border transition-all duration-300 shadow-sm group ${
            isLight ? 'bg-white border-slate-200 focus-within:border-emerald-500/50' : 'bg-slate-900 border-slate-850 focus-within:border-emerald-500/50'
          }`}>
            <form onSubmit={handleQuickAddTodo} className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 transition-transform group-focus-within:scale-110 ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Plus className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="ثبت کار جدید..."
                value={quickEntryTitle}
                onChange={(e) => setQuickEntryTitle(e.target.value)}
                className={`flex-1 bg-transparent border-none focus:outline-none text-sm font-bold ${
                  isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-slate-100 placeholder:text-slate-500'
                }`}
              />
              <AnimatePresence>
                {quickEntryTitle.trim() && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    type="submit"
                    className="text-emerald-500 hover:text-emerald-400 font-black text-xs px-4 py-2 rounded-xl bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    ثبت (Enter)
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          </div>

          {filteredTodos.length === 0 ? (
            <div className={`text-center py-24 border border-dashed rounded-3xl space-y-4 ${isLight ? 'bg-slate-50/50 border-slate-200/80' : 'bg-slate-900/10 border-slate-850'}`}>
              <CheckSquare className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-350'}`}>هیچ کار فعالی در این بخش نیست</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">می‌توانید کارهای شخصی روزانه که مربوط به اهداف بزرگ نیستند را اینجا ذخیره کنید.</p>
              </div>
            </div>
          ) : (
            <div className={todoViewMode === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence mode="popLayout">
                    {sortedTodos.map((todo, idx) => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        index={idx}
                        isLight={isLight}
                        todoViewMode={todoViewMode}
                        isExpanded={expandedTodoId === todo.id}
                        isActive={activeTodoId === todo.id}
                        onActivate={setActiveTodoId}
                        onExpand={setExpandedTodoId}
                        onToggle={handleToggleTodo}
                        onDelete={handleDeleteTodo}
                        onToggleSub={handleToggleSubTask}
                        onAddSub={handleAddSubTask}
                        onDeleteSub={handleDeleteSubTask}
                        onPin={handleTogglePin}
                        onCopyToNextDay={handleCopyToNextDay}
                        onStartEdit={handleStartEdit}
                        subTaskInput={subTaskInput}
                        setSubTaskInput={setSubTaskInput}
                        confirmDeleteId={confirmDeleteId}
                        setConfirmDeleteId={setConfirmDeleteId}
                      />
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isStatsOpen && (
          <TodoStatistics 
            todos={todos} 
            weeklyTasks={weeklyTasks} 
            onClose={() => setIsStatsOpen(false)} 
            isLight={isLight} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
