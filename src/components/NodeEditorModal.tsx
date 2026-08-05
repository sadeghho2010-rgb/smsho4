import React, { useState } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { 
  X, 
  Trash2, 
  Plus, 
  CheckSquare, 
  Square, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Circle,
  FolderOpen,
  PlusCircle,
  HelpCircle,
  Calendar as CalendarIcon,
  Timer
} from 'lucide-react';
import { RoadmapNode, NodeStatus, ChecklistItem } from '../types';

interface NodeEditorModalProps {
  node: RoadmapNode;
  parentTitle?: string;
  onClose: () => void;
  onUpdate: (updatedNode: RoadmapNode) => void;
  onDelete: (nodeId: string) => void;
  onAddSubnode: (parentId: string, title: string, description: string) => void;
  isLight?: boolean;
}

const getStatusOptions = (lightMode: boolean) => [
  { value: 'NOT_STARTED' as NodeStatus, label: 'شروع نشده', color: lightMode ? 'text-slate-550' : 'text-slate-400', bg: lightMode ? 'bg-slate-100' : 'bg-slate-900/40', border: lightMode ? 'border-slate-200' : 'border-slate-700', icon: Circle },
  { value: 'IN_PROGRESS' as NodeStatus, label: 'در حال اقدام', color: lightMode ? 'text-indigo-650' : 'text-indigo-400', bg: lightMode ? 'bg-indigo-50/70' : 'bg-indigo-950/20', border: lightMode ? 'border-indigo-200' : 'border-indigo-800/60', icon: Play },
  { value: 'COMPLETED' as NodeStatus, label: 'انجام شده', color: lightMode ? 'text-emerald-650' : 'text-emerald-400', bg: lightMode ? 'bg-emerald-50/70' : 'bg-emerald-950/20', border: lightMode ? 'border-emerald-200' : 'border-emerald-800/60', icon: CheckCircle2 },
  { value: 'BLOCKED' as NodeStatus, label: 'دارای مانع / متوقف', color: lightMode ? 'text-rose-650' : 'text-rose-400', bg: lightMode ? 'bg-rose-50/70' : 'bg-rose-950/20', border: lightMode ? 'border-rose-200' : 'border-rose-800/60', icon: AlertCircle },
];

export default function NodeEditorModal({
  node,
  parentTitle,
  onClose,
  onUpdate,
  onDelete,
  onAddSubnode,
  isLight = false,
}: NodeEditorModalProps) {
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description);
  const [status, setStatus] = useState<NodeStatus>(node.status);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(node.checklist);
  const [newTodoText, setNewTodoText] = useState('');
  const [dueDate, setDueDate] = useState<string>(node.dueDate || '');
  const [durationDays, setDurationDays] = useState<number | string>(node.durationDays || '');
  const [timingType, setTimingType] = useState<'days' | 'date'>(node.timingType || 'date');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Subnode creation state
  const [showAddSubnode, setShowAddSubnode] = useState(false);
  const [subnodeTitle, setSubnodeTitle] = useState('');
  const [subnodeDesc, setSubnodeDesc] = useState('');

  const statusOptions = getStatusOptions(isLight);

  const handleSave = () => {
    if (!title.trim()) {
      alert('لطفا عنوان را وارد کنید.');
      return;
    }
    onUpdate({
      ...node,
      title,
      description,
      status,
      checklist,
      dueDate: timingType === 'date' ? (dueDate || undefined) : undefined,
      durationDays: timingType === 'days' ? (Number(durationDays) || undefined) : undefined,
      timingType,
    });
    onClose();
  };

  // Checklist utilities
  const handleToggleTodo = (id: string) => {
    const updated = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    // Auto save to local state for instant responsiveness
    onUpdate({
      ...node,
      title,
      description,
      status,
      checklist: updated,
    });
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newTodoText.trim(),
      completed: false
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewTodoText('');
    
    onUpdate({
      ...node,
      title,
      description,
      status,
      checklist: updated,
    });
  };

  const handleDeleteTodo = (id: string) => {
    const updated = checklist.filter(item => item.id !== id);
    setChecklist(updated);
    
    onUpdate({
      ...node,
      title,
      description,
      status,
      checklist: updated,
    });
  };

  const handleCreateSubnode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subnodeTitle.trim()) {
      alert('لطفا عنوان زیرمجموعه را وارد کنید.');
      return;
    }
    onAddSubnode(node.id, subnodeTitle.trim(), subnodeDesc.trim());
    setSubnodeTitle('');
    setSubnodeDesc('');
    setShowAddSubnode(false);
  };

  return (
    <div id="node-editor-modal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={handleSave} />

      {/* Modal Dialog (RTL) */}
      <div className={`relative border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl z-[10000] overflow-hidden animate-in zoom-in-95 duration-200 text-right ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`} dir="rtl">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'border-slate-150 bg-slate-50' : 'border-slate-800 bg-slate-950/40'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              node.parentId 
                ? 'bg-indigo-600/20 text-indigo-500' 
                : 'bg-emerald-600/20 text-emerald-500 font-bold'
            }`}>
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {node.parentId ? 'ویرایش زیرمجموعه' : 'ویرایش مرحله اصلی'}
              </h3>
              {parentTitle && (
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  متصل به مرحله: <span className="text-indigo-600 font-medium">{parentTitle}</span>
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={handleSave}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-155' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Main Info Fields */}
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-655' : 'text-slate-400'}`}>عنوان بخش</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="عنوان این مرحله یا زیرمجموعه را بنویسید..."
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-655' : 'text-slate-400'}`}>توضیحات و اهداف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none ${
                  isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-950 border-slate-800 text-white'
                }`}
                placeholder="توضیحاتی برای شفاف‌سازی مسیر، اهداف کلیدی و استراتژی انجام این بخش بنویسید..."
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-655' : 'text-slate-400'}`}>زمان‌بندی و ددلاین این بخش</label>
              
              <div className={`flex items-center gap-2 mb-3 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'} w-fit`}>
                <button
                  type="button"
                  onClick={() => setTimingType('date')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    timingType === 'date' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  تاریخ دقیق (شمسی)
                </button>
                <button
                  type="button"
                  onClick={() => setTimingType('days')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    timingType === 'days' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  تعداد روز
                </button>
              </div>

              <div className="flex items-center gap-3">
                {timingType === 'date' ? (
                  <div className="flex items-center gap-2">
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={dueDate}
                      onChange={(date: any) => setDueDate(date?.format?.("YYYY-MM-DD") || "")}
                      calendarPosition="bottom-right"
                      inputClass={`px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-indigo-505 transition-colors text-center ${
                        isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                      placeholder="انتخاب تاریخ از تقویم..."
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200' : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-750'
                        }`}
                      >
                        پاک کردن
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className={`w-32 px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-indigo-505 transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-205 text-slate-850' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                        placeholder="تعداد روز..."
                      />
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>روز</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Selection Row */}
          <div>
            <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-655' : 'text-slate-400'}`}>وضعیت پیشرفت</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-right transition-all cursor-pointer ${
                      isSelected 
                        ? isLight
                          ? `${opt.bg} ${opt.border} ${opt.color} shadow ring-1 ring-indigo-500/30 font-bold`
                          : `${opt.bg} ${opt.border} ${opt.color} shadow-lg ring-1 ring-indigo-500/50` 
                        : isLight
                          ? 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-950/80 hover:text-slate-300'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* To-Do Checklist Section */}
          <div className={`p-4 border rounded-2xl space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-850' : 'text-white'}`}>چک‌لیست کارها (To-Do)</h4>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>کارهای کوچک مربوط به این گام را مشخص کنید و پس از انجام خط بزنید.</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isLight ? 'bg-white border-slate-200 border text-slate-700 shadow-sm' : 'bg-slate-800 text-slate-300'
              }`}>
                {checklist.filter(c => c.completed).length} از {checklist.length} انجام شده
              </span>
            </div>

            {/* Checklist items list */}
            <div className="space-y-2">
              {checklist.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">هنوز هیچ کاری اضافه نشده است.</p>
              ) : (
                checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-250 ${
                      item.completed 
                        ? isLight
                          ? 'border-slate-150 bg-slate-100/40 opacity-60 text-slate-450'
                          : 'border-emerald-900/30 opacity-55 text-slate-550 bg-slate-950/10' 
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-750 shadow-sm'
                          : 'border-slate-800 text-slate-200 bg-slate-900'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTodo(item.id)}
                      className="flex items-center gap-2.5 flex-1 text-right cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className={`w-4 h-4 hover:text-indigo-500 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      )}
                      <span className={`text-xs ${item.completed ? 'line-through' : ''}`}>
                        {item.text}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(item.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-50' : 'text-slate-500 hover:text-red-400 hover:bg-slate-805'
                      }`}
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick add checklist item */}
            <form onSubmit={handleAddTodo} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="افزودن کار جدید..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className={`flex-1 px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-slate-205 text-slate-850' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </form>
          </div>

          {/* Subnode creation under MAIN node */}
          {!node.parentId && (
            <div className={`pt-5 border-t ${isLight ? 'border-slate-150' : 'border-slate-800'} space-y-4`}>
              {!showAddSubnode ? (
                <button
                  type="button"
                  onClick={() => setShowAddSubnode(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all w-full justify-center cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-indigo-50/50 border-slate-200 text-indigo-600 hover:border-indigo-300' 
                      : 'bg-slate-950 hover:bg-indigo-950/20 hover:text-indigo-400 border border-slate-800 hover:border-indigo-900/50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-indigo-505" />
                  ساخت و افزودن زیرمجموعه (Sub-node) جدید به این گام
                </button>
              ) : (
                <form onSubmit={handleCreateSubnode} className={`p-4 border rounded-2xl space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-800/80'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-bold text-indigo-600">افزودن زیرمجموعه به عنوان مرحله فرعی</h5>
                    <button
                      type="button"
                      onClick={() => setShowAddSubnode(false)}
                      className={`text-xs cursor-pointer ${isLight ? 'text-slate-450 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
                    >
                      انصراف
                    </button>
                  </div>

                  <div className="grid gap-2">
                    <input
                      type="text"
                      placeholder="عنوان زیرمجموعه (مثلا: پیاده‌سازی نمونه‌های اولیه...)"
                      value={subnodeTitle}
                      onChange={(e) => setSubnodeTitle(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 ${
                        isLight ? 'bg-white border-slate-200 text-slate-850' : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                      required
                    />
                    <textarea
                      placeholder="توضیحات فرعی برای این زیرمجموعه..."
                      value={subnodeDesc}
                      onChange={(e) => setSubnodeDesc(e.target.value)}
                      rows={2}
                      className={`w-full px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 resize-none ${
                        isLight ? 'bg-white border-slate-200 text-slate-850' : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 w-full cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تایید و ساخت زیرمجموعه جدید</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isLight ? 'border-slate-150 bg-slate-50' : 'border-slate-800 bg-slate-950/40'
        }`}>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-rose-950/20 border border-rose-900/30 p-2 rounded-xl">
              <span className="text-xs font-bold text-rose-400">آیا از حذف مطمئن هستید؟</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(node.id);
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                بله، حذف شود
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}
              >
                خیر
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLight 
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700' 
                  : 'bg-red-950/20 hover:bg-red-900/40 border border-red-950/50 hover:border-red-900/80 text-red-400'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              حذف کل این بخش
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg cursor-pointer"
            >
              ذخیره و بستن
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
