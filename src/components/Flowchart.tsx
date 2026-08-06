import React, { useState } from 'react';
import { 
  GitCommit, 
  GitMerge, 
  GitBranch, 
  Plus, 
  Trash2, 
  PlusCircle, 
  CheckSquare, 
  Edit3, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Circle,
  HelpCircle,
  Compass,
  ListTodo,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare2,
  FolderPlus,
  SlidersHorizontal,
  Layers,
  Clock,
  Sparkles,
  Timer
} from 'lucide-react';
import { RoadmapPath, RoadmapNode, NodeStatus, Program, AppMode } from '../types';
import NodeEditorModal from './NodeEditorModal';
import GeminiConsultationModal from './GeminiConsultationModal';
import persianDate from 'persian-date';

const toJalali = (dateStr?: string) => {
  if (!dateStr) return '';
  return new persianDate(new Date(dateStr)).format('YYYY/MM/DD');
};

interface FlowchartProps {
  program: Program;
  mode: AppMode;
  onUpdateProgram: (updatedProgram: Program) => void;
  isLight?: boolean;
}

const COLOR_MAP: Record<string, { primary: string; hover: string; border: string; bg: string; text: string; accent: string }> = {
  indigo: { primary: 'bg-indigo-600', hover: 'hover:bg-indigo-500', border: 'border-indigo-700/50', bg: 'bg-indigo-950/10', text: 'text-indigo-400', accent: 'indigo' },
  emerald: { primary: 'bg-emerald-600', hover: 'hover:bg-emerald-500', border: 'border-emerald-700/50', bg: 'bg-emerald-950/10', text: 'text-emerald-400', accent: 'emerald' },
  amber: { primary: 'bg-amber-600', hover: 'hover:bg-amber-500', border: 'border-amber-700/50', bg: 'bg-amber-950/10', text: 'text-amber-400', accent: 'amber' },
  rose: { primary: 'bg-rose-600', hover: 'hover:bg-rose-500', border: 'border-rose-700/50', bg: 'bg-rose-950/10', text: 'text-rose-400', accent: 'rose' },
  sky: { primary: 'bg-sky-600', hover: 'hover:bg-sky-500', border: 'border-sky-700/50', bg: 'bg-sky-950/10', text: 'text-sky-400', accent: 'sky' },
};

const getColorScheme = (color: string, isLight: boolean) => {
  const map: Record<string, { primary: string; hover: string; border: string; bg: string; text: string; badge: string }> = {
    indigo: { 
      primary: 'bg-indigo-600', 
      hover: 'hover:bg-indigo-500', 
      border: isLight ? 'border-indigo-200' : 'border-indigo-700/50', 
      bg: isLight ? 'bg-indigo-50/70 text-indigo-700' : 'bg-indigo-950/10 text-indigo-400', 
      text: isLight ? 'text-indigo-600' : 'text-indigo-400',
      badge: isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
    },
    emerald: { 
      primary: 'bg-emerald-600', 
      hover: 'hover:bg-emerald-500', 
      border: isLight ? 'border-emerald-200' : 'border-emerald-700/50', 
      bg: isLight ? 'bg-emerald-50/70 text-emerald-700' : 'bg-emerald-950/10 text-emerald-400', 
      text: isLight ? 'text-emerald-600' : 'text-emerald-400',
      badge: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
    },
    amber: { 
      primary: 'bg-amber-600', 
      hover: 'hover:bg-amber-500', 
      border: isLight ? 'border-amber-200' : 'border-amber-700/50', 
      bg: isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-950/10 text-amber-400', 
      text: isLight ? 'text-amber-700' : 'text-amber-400',
      badge: isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-950/40 text-amber-400 border-amber-900/30'
    },
    rose: { 
      primary: 'bg-rose-600', 
      hover: 'hover:bg-rose-500', 
      border: isLight ? 'border-rose-200' : 'border-rose-700/50', 
      bg: isLight ? 'bg-rose-50 text-rose-800' : 'bg-rose-950/10 text-rose-400', 
      text: isLight ? 'text-rose-700' : 'text-rose-400',
      badge: isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
    },
    sky: { 
      primary: 'bg-sky-600', 
      hover: 'hover:bg-sky-500', 
      border: isLight ? 'border-sky-200' : 'border-sky-700/50', 
      bg: isLight ? 'bg-sky-50/70 text-sky-700' : 'bg-sky-950/10 text-sky-400', 
      text: isLight ? 'text-sky-650' : 'text-sky-400',
      badge: isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950/40 text-sky-400 border-sky-900/30'
    },
  };
  return map[color] || map.indigo;
};

export default function Flowchart({ program, mode, onUpdateProgram, isLight = false }: FlowchartProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [deletingPathId, setDeletingPathId] = useState<string | null>(null);
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editPathTitle, setEditPathTitle] = useState('');
  const [editPathDesc, setEditPathDesc] = useState('');
  const [editPathColor, setEditPathColor] = useState('indigo');
  
  // Toggles to show checklists on board (For advanced mode)
  const [showChecklistsDirectly, setShowChecklistsDirectly] = useState(false);
  const [isCompact, setIsCompact] = useState(true);

  // Creation States
  const [showAddPath, setShowAddPath] = useState(false);
  const [newPathTitle, setNewPathTitle] = useState('');
  const [newPathDesc, setNewPathDesc] = useState('');
  const [newPathColor, setNewPathColor] = useState('indigo');

  const [activePathIdForAddingNode, setActivePathIdForAddingNode] = useState<string | null>(null);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeDesc, setNodeDesc] = useState('');

  const [activeGeminiPath, setActiveGeminiPath] = useState<RoadmapPath | null>(null);

  const getRemainingDaysText = (node: RoadmapNode) => {
    if (node.timingType === 'days' && node.durationDays) {
      if (node.status === 'COMPLETED') return null;
      return { text: `${node.durationDays} روز مهلت`, color: 'text-amber-500' };
    }
    
    if (!node.dueDate) return null;
    const target = new Date(node.dueDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} روز گذشته`, color: 'text-rose-500' };
    if (diffDays === 0) return { text: 'امروز نهایی', color: 'text-amber-500' };
    return { text: `${diffDays} روز مانده`, color: 'text-emerald-500' };
  };

  // 1. Path Management
  const handleAddPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPathTitle.trim()) return;

    const newPath: RoadmapPath = {
      id: `path-${Date.now()}`,
      title: newPathTitle.trim(),
      description: newPathDesc.trim(),
      color: newPathColor,
      nodes: []
    };

    onUpdateProgram({
      ...program,
      paths: [...program.paths, newPath]
    });

    setNewPathTitle('');
    setNewPathDesc('');
    setNewPathColor('indigo');
    setShowAddPath(false);
  };

  const handleDeletePath = (pathId: string) => {
    onUpdateProgram({
      ...program,
      paths: program.paths.filter(p => p.id !== pathId)
    });
    setDeletingPathId(null);
  };

  // 2. Node Management
  const handleAddMainNode = (pathId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeTitle.trim()) return;

    const newNode: RoadmapNode = {
      id: `node-${Date.now()}`,
      title: nodeTitle.trim(),
      description: nodeDesc.trim(),
      status: 'NOT_STARTED',
      parentId: null,
      checklist: [],
      createdAt: new Date().toISOString()
    };

    const updatedPaths = program.paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          nodes: [...p.nodes, newNode]
        };
      }
      return p;
    });

    onUpdateProgram({
      ...program,
      paths: updatedPaths
    });

    setNodeTitle('');
    setNodeDesc('');
    setActivePathIdForAddingNode(null);
  };

  const handleUpdateNode = (pathId: string, updatedNode: RoadmapNode) => {
    const updatedPaths = program.paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          nodes: p.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
        };
      }
      return p;
    });

    onUpdateProgram({
      ...program,
      paths: updatedPaths
    });
  };

  const handleDeleteNode = (pathId: string, nodeId: string) => {
    const updatedPaths = program.paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          nodes: p.nodes.filter(n => n.id !== nodeId && n.parentId !== nodeId)
        };
      }
      return p;
    });

    onUpdateProgram({
      ...program,
      paths: updatedPaths
    });
    setSelectedNode(null);
  };

  const handleAddSubnodeToParent = (pathId: string, parentId: string, title: string, description: string) => {
    const newSub: RoadmapNode = {
      id: `node-${Date.now()}`,
      title,
      description,
      status: 'NOT_STARTED',
      parentId,
      checklist: [],
      createdAt: new Date().toISOString()
    };

    const updatedPaths = program.paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          nodes: [...p.nodes, newSub]
        };
      }
      return p;
    });

    onUpdateProgram({
      ...program,
      paths: updatedPaths
    });
  };

  const handleToggleChecklistItem = (pathId: string, nodeId: string, itemId: string) => {
    const updatedPaths = program.paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          nodes: p.nodes.map(n => {
            if (n.id === nodeId) {
              const updatedChecklist = n.checklist.map(item => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
              );
              
              // Automatically mark as complete if all checklist items are completed (optional, keeping manual override)
              let currentStatus = n.status;
              const total = updatedChecklist.length;
              const done = updatedChecklist.filter(x => x.completed).length;
              if (total > 0 && done === total && currentStatus !== 'COMPLETED') {
                currentStatus = 'COMPLETED';
              } else if (total > 0 && done > 0 && done < total && currentStatus === 'NOT_STARTED') {
                currentStatus = 'IN_PROGRESS';
              }

              return {
                ...n,
                status: currentStatus,
                checklist: updatedChecklist
              };
            }
            return n;
          })
        };
      }
      return p;
    });

    onUpdateProgram({
      ...program,
      paths: updatedPaths
    });
  };

  // Status Helpers
  const getStatusBadge = (status: NodeStatus, lightMode: boolean) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'انجام شده',
          color: lightMode 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
          icon: CheckCircle2,
          class: lightMode ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-600/30 bg-emerald-950/5'
        };
      case 'IN_PROGRESS':
        return {
          label: 'در حال اقدام',
          color: lightMode 
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
            : 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40 pulse-indigo',
          icon: Play,
          class: lightMode ? 'border-indigo-200 bg-indigo-50' : 'border-indigo-600/50 bg-indigo-950/5'
        };
      case 'BLOCKED':
        return {
          label: 'دارای مانع',
          color: lightMode 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : 'bg-rose-950/60 text-rose-400 border-rose-800/40',
          icon: AlertCircle,
          class: lightMode ? 'border-rose-200 bg-rose-50' : 'border-rose-600/30 bg-rose-950/5'
        };
      default:
        return {
          label: 'شروع نشده',
          color: lightMode 
            ? 'bg-slate-100 text-slate-650 border-slate-200' 
            : 'bg-slate-900/60 text-slate-400 border-slate-800',
          icon: Circle,
          class: lightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-transparent'
        };
    }
  };

  return (
    <div id="flowchart-section" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Active Program General Info Card */}
      <div className={`border p-5 rounded-3xl shadow-md space-y-4 transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-850'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                isLight ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30'
              }`}>
                برنامه جامع فعال
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                isLight ? 'text-slate-650 bg-slate-100 border-slate-200 border' : 'text-slate-400 bg-slate-800'
              }`}>
                {mode === 'simple' ? 'حالت نمایش ساده' : 'حالت نمایش پیشرفته (فلوچارت تعاملی)'}
              </span>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold mt-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{program.title}</h2>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {program.description || 'توضیحاتی برای این برنامه نوشته نشده است.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {mode === 'advanced' && (
              <button
                type="button"
                onClick={() => setShowChecklistsDirectly(!showChecklistsDirectly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                }`}
              >
                {showChecklistsDirectly ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{showChecklistsDirectly ? 'پنهان‌کردن چک‌لیست‌ها روی بورد' : 'نمایش چک‌لیست‌ها روی بورد'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCompact(!isCompact)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                isCompact 
                  ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/30 font-bold' 
                  : (isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300')
              }`}
              title={isCompact ? "تغییر به نمای کامل" : "تغییر به نمای فشرده و جمع‌وجور"}
            >
              {isCompact ? <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> : <Layers className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{isCompact ? 'نمای عادی' : 'مشاهده جمع‌وجور'}</span>
            </button>

            <button
              onClick={() => setShowAddPath(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-750 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              افزودن سیر (شاخه جدید)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of paths / roadmaps */}
      {/* For Simple Mode we make a highly structured multi-column layout for cohesive comparison! */}
      <div className={mode === 'simple' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
        {program.paths.length === 0 ? (
          <div className={`col-span-full text-center py-16 rounded-3xl space-y-4 border ${
            isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/40 border-slate-850'
          }`}>
            <Compass className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>هنوز هیچ سیر یا شاخه‌ای تعریف نکرده‌اید</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">برای سازمان‌دهی برنامه‌های طولانی‌مدت خود، ابتدا یک سیر (مثل مسیر ورزشی، آموزشی یا مالی) اضافه کنید.</p>
            </div>
            <button
              onClick={() => setShowAddPath(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              ساخت اولین سیر برنامه
            </button>
          </div>
        ) : (
          program.paths.map((path) => {
            const colorScheme = getColorScheme(path.color, !!isLight);
            
            // In both modes, we sort and structure nodes.
            // Main nodes are those where parentId is null
            const mainNodes = path.nodes.filter(n => n.parentId === null).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            return (
              <div 
                key={path.id} 
                className={`border rounded-3xl p-5 sm:p-6 space-y-5 relative overflow-hidden transition-all duration-300 ${
                  isLight 
                    ? 'bg-white border-slate-200/80 shadow-sm text-slate-800' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-100'
                }`}
              >
                {/* Decorative glow background */}
                <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-[0.06] ${colorScheme.primary}`} />

                {/* Path Header */}
                <div className={`flex items-start justify-between border-b pb-3 gap-4 relative z-10 ${
                  isLight ? 'border-slate-100' : 'border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorScheme.primary} animate-pulse`} />
                      <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-850' : 'text-white'}`}>{path.title}</h3>
                    </div>
                    {path.description && (
                      <p className={`text-[10px] sm:text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{path.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveGeminiPath(path)}
                      className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 text-[10px] font-bold cursor-pointer border ${
                        isLight 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 shadow-sm'
                          : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/50 hover:text-indigo-300 hover:border-indigo-400'
                      }`}
                      title="مشورت با هوش مصنوعی برای این سیر"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">مشورت هوشمند</span>
                    </button>
                    {deletingPathId === path.id ? (
                    <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-900/30 p-1 rounded-xl shrink-0">
                      <span className="text-[10px] font-bold text-rose-400">حذف؟</span>
                      <button
                        type="button"
                        onClick={() => handleDeletePath(path.id)}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] rounded font-bold cursor-pointer animate-pulse"
                      >
                        بله
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPathId(null)}
                        className={`px-2 py-0.5 text-[10px] rounded font-bold cursor-pointer ${
                          isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        خیر
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPathId(path.id);
                          setEditPathTitle(path.title);
                          setEditPathDesc(path.description || '');
                          setEditPathColor(path.color || 'indigo');
                        }}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-850'
                        }`}
                        title="ویرایش عنوان و توضیحات این سیر"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPathId(path.id)}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-rose-650 hover:bg-slate-100' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-850'
                        }`}
                        title="حذف کامل این سیر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  </div>
                </div>

                {/* VISUAL LAYOUT BASED ON MODE (SIMPLE vs ADVANCED) */}
                {mode === 'simple' ? (
                  
                  /* ======================= SIMPLE VIEW ======================= */
                  <div className="space-y-4 relative z-10">
                    <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>گام‌ها و چک‌لیست کارهای زیرمجموعه:</p>
                    
                    {mainNodes.length === 0 ? (
                      <div className={`text-center py-8 border border-dashed rounded-2xl max-w-md mx-auto ${
                        isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/20 border-slate-800'
                      }`}>
                        {activePathIdForAddingNode === path.id ? (
                          <form onSubmit={(e) => handleAddMainNode(path.id, e)} className="w-full space-y-3 text-right p-4">
                            <h4 className={`text-xs font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>افزودن اولین گام</h4>
                            <input
                              type="text"
                              placeholder="عنوان گام جدید..."
                              value={nodeTitle}
                              onChange={(e) => setNodeTitle(e.target.value)}
                              className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500 border ${
                                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                              }`}
                              required
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button type="submit" className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold cursor-pointer">ثبت</button>
                              <button type="button" onClick={() => setActivePathIdForAddingNode(null)} className={`px-3 py-1 rounded text-xs cursor-pointer ${
                                isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}>لغو</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p className="text-xs text-slate-500">هنوز گامی اضافه نشده است.</p>
                            <button
                              onClick={() => {
                                setNodeTitle('');
                                setNodeDesc('');
                                setActivePathIdForAddingNode(path.id);
                              }}
                              className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer"
                            >
                              افزودن اولین گام +
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {isCompact ? (
                          /* COMPACT STEP LIST - Super dense and neat */
                          <div className="space-y-1.5">
                            {mainNodes.map((mainNode, nodeIdx) => {
                              const isCompleted = mainNode.status === 'COMPLETED';
                              
                              const handleToggleNodeStatusSimple = () => {
                                const nextStatus: NodeStatus = isCompleted ? 'NOT_STARTED' : 'COMPLETED';
                                handleUpdateNode(path.id, {
                                  ...mainNode,
                                  status: nextStatus,
                                  checklist: mainNode.checklist.map(item => ({ ...item, completed: nextStatus === 'COMPLETED' }))
                                });
                              };

                              return (
                                <div 
                                  key={mainNode.id}
                                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all duration-200 ${
                                    isCompleted 
                                      ? isLight ? 'bg-emerald-50/20 border-emerald-100/50 text-slate-400 opacity-70' : 'bg-emerald-950/5 border-emerald-950/20 text-slate-500 opacity-60'
                                      : isLight ? 'bg-white border-slate-150 hover:border-slate-250 shadow-xs' : 'bg-slate-905 border-slate-850/80 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={handleToggleNodeStatusSimple}
                                      className="p-0.5 rounded cursor-pointer shrink-0 transition-transform active:scale-90"
                                    >
                                      {isCompleted ? (
                                        <CheckSquare2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Square className={`w-3.5 h-3.5 ${isLight ? 'text-slate-350' : 'text-slate-600'}`} />
                                      )}
                                    </button>
                                    <span 
                                      onClick={() => setSelectedNode(mainNode)}
                                      className={`font-semibold cursor-pointer hover:text-indigo-500 truncate ${isCompleted ? 'line-through text-slate-400' : isLight ? 'text-slate-750' : 'text-slate-200'}`}
                                      title="مشاهده جزئیات"
                                    >
                                      {nodeIdx + 1}. {mainNode.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {mainNode.dueDate && !isCompleted && (
                                      <div className={`flex items-center gap-0.5 text-[9px] font-bold ${getRemainingDaysText(mainNode)?.color}`} title={`موعد: ${toJalali(mainNode.dueDate)}`}>
                                        <Clock className="w-3 h-3" />
                                      </div>
                                    )}
                                    {mainNode.timingType === 'days' && mainNode.durationDays && !isCompleted && (
                                      <div className={`flex items-center gap-0.5 text-[9px] font-bold text-amber-500`} title={`مهلت: ${mainNode.durationDays} روز`}>
                                        <Timer className="w-3 h-3" />
                                      </div>
                                    )}
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                      isCompleted 
                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                        : isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-850 text-slate-400'
                                    }`}>
                                      {isCompleted ? 'تکمیل' : 'در انتظار'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteNode(path.id, mainNode.id)}
                                      className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                      title="حذف"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-3">
                        {mainNodes.map((mainNode, nodeIdx) => {
                          const isCompleted = mainNode.status === 'COMPLETED';
                          
                          // Toggle entire node status simply between Completed / Not Started
                          const handleToggleNodeStatusSimple = () => {
                            const nextStatus: NodeStatus = isCompleted ? 'NOT_STARTED' : 'COMPLETED';
                            
                            // Also optionally toggle all checklist items to complete if node is completed
                            const updatedChecklist = mainNode.checklist.map(item => ({
                              ...item,
                              completed: nextStatus === 'COMPLETED'
                            }));

                            handleUpdateNode(path.id, {
                              ...mainNode,
                              status: nextStatus,
                              checklist: updatedChecklist
                            });
                          };

                          return (
                            <div 
                              key={mainNode.id} 
                              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                                isCompleted 
                                  ? isLight
                                    ? 'bg-emerald-50/40 border-emerald-100/60 text-slate-400 opacity-70'
                                    : 'bg-emerald-950/5 border-emerald-950/40 text-slate-500 opacity-60' 
                                  : isLight
                                    ? 'bg-slate-50/50 border-slate-150 hover:border-slate-300'
                                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              
                              {/* Title line */}
                              <div className={`flex items-start justify-between gap-3 border-b pb-2 mb-2.5 ${
                                isLight ? 'border-slate-100' : 'border-slate-850'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleToggleNodeStatusSimple}
                                    className={`p-1 rounded border transition-all cursor-pointer ${
                                      isLight ? 'bg-white border-slate-200 hover:border-indigo-400 text-indigo-600' : 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-indigo-400'
                                    }`}
                                    title="تغییر وضعیت انجام گام"
                                  >
                                    {isCompleted ? (
                                      <CheckSquare2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Square className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                                    )}
                                  </button>
                                    <div className="flex items-center gap-2">
                                      <h4 className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-450' : isLight ? 'text-slate-800' : 'text-white'}`}>
                                        {nodeIdx + 1}. {mainNode.title}
                                      </h4>
                                      {mainNode.description && (
                                        <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{mainNode.description}</p>
                                      )}
                                      {mainNode.dueDate && (
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${getRemainingDaysText(mainNode)?.color}`}>
                                          <Clock className="w-3 h-3" />
                                          <span>{getRemainingDaysText(mainNode)?.text}</span>
                                          <span className="opacity-60 font-normal mr-1">({toJalali(mainNode.dueDate)})</span>
                                        </div>
                                      )}
                                      {mainNode.timingType === 'days' && mainNode.durationDays && !isCompleted && (
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-500`}>
                                          <Timer className="w-3 h-3" />
                                          <span>{mainNode.durationDays} روز مهلت</span>
                                        </div>
                                      )}
                                    </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteNode(path.id, mainNode.id)}
                                  className={`p-1 rounded transition-colors cursor-pointer ${
                                    isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100' : 'text-slate-600 hover:text-rose-400 hover:bg-slate-900'
                                  }`}
                                  title="حذف گام"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Checklist rendered directly on the board */}
                              <div className="space-y-1.5">
                                {mainNode.checklist.length === 0 ? (
                                  <p className="text-[10px] text-slate-400 italic">چک‌لیستی برای این گام نوشته نشده است.</p>
                                ) : (
                                  <div className="space-y-1">
                                    {mainNode.checklist.map((item) => (
                                      <div 
                                        key={item.id} 
                                        className={`flex items-center justify-between gap-2 p-1.5 rounded transition-all text-[11px] group/item ${
                                          item.completed 
                                            ? 'opacity-50 line-through text-slate-400 bg-transparent' 
                                            : isLight
                                              ? 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-750 shadow-sm'
                                              : 'bg-slate-900/30 border border-slate-900 hover:bg-slate-900 text-slate-300'
                                        }`}
                                      >
                                        <label className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden">
                                          <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => handleToggleChecklistItem(path.id, mainNode.id, item.id)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer shrink-0"
                                          />
                                          <span className="truncate">{item.text}</span>
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateNode(path.id, {
                                              ...mainNode,
                                              checklist: mainNode.checklist.filter(x => x.id !== item.id)
                                            });
                                          }}
                                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer opacity-0 group-hover/item:opacity-100 transition-all shrink-0"
                                          title="حذف کار از چک‌لیست"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Quick add checklist item */}
                              <div className={`mt-3 pt-2 border-t flex gap-1.5 ${isLight ? 'border-slate-100' : 'border-slate-850'}`}>
                                <input
                                  type="text"
                                  placeholder="افزودن کار جدید به چک‌لیست..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.currentTarget;
                                      const val = input.value.trim();
                                      if (val) {
                                        const newItem = {
                                          id: `item-${Date.now()}`,
                                          text: val,
                                          completed: false
                                        };
                                        handleUpdateNode(path.id, {
                                          ...mainNode,
                                          checklist: [...mainNode.checklist, newItem]
                                        });
                                        input.value = '';
                                      }
                                    }
                                  }}
                                  className={`flex-1 px-2.5 py-1 rounded-lg text-[10px] focus:outline-none focus:border-indigo-500 border ${
                                    isLight ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                                  }`}
                                />
                                <button
                                  onClick={() => setSelectedNode(mainNode)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                                  }`}
                                  title="ویرایش کامل"
                                >
                                  جزئیات
                                </button>
                              </div>

                            </div>
                          );
                        })}
                          </div>
                        )}

                        {/* Add main node placeholder in Simple mode */}
                        <div className={`border border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center ${
                          isLight ? 'border-slate-200/80 bg-slate-50/40' : 'border-slate-800 bg-slate-950/20'
                        }`}>
                          {activePathIdForAddingNode === path.id ? (
                            <form onSubmit={(e) => handleAddMainNode(path.id, e)} className="w-full space-y-3 text-right">
                              <input
                                type="text"
                                placeholder="عنوان گام جدید..."
                                value={nodeTitle}
                                onChange={(e) => setNodeTitle(e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500 border ${
                                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                                }`}
                                required
                              />
                              <div className="flex gap-2">
                                <button type="submit" className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold cursor-pointer">ثبت</button>
                                <button type="button" onClick={() => setActivePathIdForAddingNode(null)} className={`px-3 py-1 rounded text-xs cursor-pointer ${
                                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                                }`}>لغو</button>
                              </div>
                            </form>
                          ) : (
                            <button
                              onClick={() => setActivePathIdForAddingNode(path.id)}
                              className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                isLight ? 'text-slate-600 hover:text-indigo-650' : 'text-slate-500 hover:text-indigo-400'
                              }`}
                            >
                              <PlusCircle className="w-4 h-4 text-indigo-500" />
                              افزودن گام جدید به این سیر
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                ) : (
                  
                  /* ======================= ADVANCED VIEW (FLOWCHART & BRANCHING) ======================= */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                    
                    {/* Flowchart Tree Column (Take 8 cols in desktop) */}
                    <div className="lg:col-span-8 space-y-5">
                      {mainNodes.length === 0 ? (
                        <div className={`text-center py-10 border border-dashed rounded-2xl max-w-md mx-auto ${
                          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/20 border-slate-800'
                        }`}>
                          {activePathIdForAddingNode === path.id ? (
                            <form onSubmit={(e) => handleAddMainNode(path.id, e)} className="w-full space-y-3 text-right p-4">
                              <h4 className={`text-xs font-bold mb-1 ${isLight ? 'text-slate-850' : 'text-white'}`}>افزودن اولین گام اصلی</h4>
                              <input
                                type="text"
                                placeholder="عنوان گام جدید..."
                                value={nodeTitle}
                                onChange={(e) => setNodeTitle(e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500 border ${
                                  isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-950 border-slate-800 text-white'
                                }`}
                                required
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button type="submit" className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold cursor-pointer">ثبت</button>
                                <button type="button" onClick={() => setActivePathIdForAddingNode(null)} className={`px-3 py-1.5 rounded text-xs cursor-pointer ${
                                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                                }`}>لغو</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p className="text-xs text-slate-500">هنوز هیچ مرحله‌ای در این سیر اضافه نشده است.</p>
                              <button
                                onClick={() => {
                                  setNodeTitle('');
                                  setNodeDesc('');
                                  setActivePathIdForAddingNode(path.id);
                                }}
                                className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer"
                              >
                                افزودن اولین گام اصلی +
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          {isCompact ? (
                            /* COMPACT ADVANCED VIEW - Tightly packed list layout */
                            <div className="space-y-2 relative z-10 mr-4 border-r-2 border-indigo-500/15 pr-3">
                              {mainNodes.map((mainNode, nodeIdx) => {
                                const isCompleted = mainNode.status === 'COMPLETED';
                                const subNodesCount = path.nodes.filter(n => n.parentId === mainNode.id).length;
                                const statusB = getStatusBadge(mainNode.status, !!isLight);
                                const StatusIcon = statusB.icon;

                                return (
                                  <div 
                                    key={mainNode.id} 
                                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all duration-200 hover:scale-[1.005] group ${
                                      isLight ? 'bg-white/80 border-slate-100 hover:border-slate-205 shadow-xs' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
                                      <span 
                                        onClick={() => setSelectedNode(mainNode)}
                                        className={`font-semibold cursor-pointer hover:text-indigo-500 truncate ${isCompleted ? 'line-through text-slate-400' : isLight ? 'text-slate-800' : 'text-slate-105'}`}
                                        title="مشاهده و ویرایش جزئیات گام"
                                      >
                                        {nodeIdx + 1}. {mainNode.title}
                                      </span>
                                      {subNodesCount > 0 && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${isLight ? 'bg-slate-100 text-slate-550' : 'bg-slate-800 text-slate-400'}`}>
                                          {subNodesCount} زیرشاخه
                                        </span>
                                      )}
                                      {mainNode.dueDate && !isCompleted && (
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold ${getRemainingDaysText(mainNode)?.color}`} title={`موعد: ${toJalali(mainNode.dueDate)}`}>
                                          <Clock className="w-3.5 h-3.5" />
                                          <span className="text-[9px]">{getRemainingDaysText(mainNode)?.text}</span>
                                        </div>
                                      )}
                                      {mainNode.timingType === 'days' && mainNode.durationDays && !isCompleted && (
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20`} title={`مهلت: ${mainNode.durationDays} روز`}>
                                          <Timer className="w-3.5 h-3.5" />
                                          <span className="text-[9px]">{mainNode.durationDays} روز مهلت</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`text-[10px] flex items-center gap-1 ${statusB.color} px-2 py-0.5 rounded-full border`}>
                                        <StatusIcon className="w-3 h-3" />
                                        <span>{statusB.label}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteNode(path.id, mainNode.id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all"
                                        title="حذف گام"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <>
                              {/* Timeline vertical connector line */}
                              <div className={`absolute top-4 bottom-4 right-6 w-0.5 z-0 ${
                                isLight ? 'bg-slate-200' : 'bg-slate-850'
                              }`} />

                              <div className="space-y-6 relative z-10">
                                {mainNodes.map((mainNode, index) => {
                              const nodeStatus = getStatusBadge(mainNode.status, !!isLight);
                              const StatusIcon = nodeStatus.icon;
                              const isMainCompleted = mainNode.status === 'COMPLETED';

                              // Get all child nodes/subnodes belonging to this main node
                              const subNodes = path.nodes.filter(n => n.parentId === mainNode.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                              // Checklist calculations
                              const totalChecklist = mainNode.checklist.length;
                              const completedChecklist = mainNode.checklist.filter(c => c.completed).length;
                              const hasChecklist = totalChecklist > 0;
                              const percent = hasChecklist ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

                              return (
                                <div key={mainNode.id} className="space-y-3">
                                  
                                  {/* Main Node Card (With outer timeline connection) */}
                                  <div className="flex items-start gap-4 mr-1">
                                    {/* Timeline circle anchor on the line */}
                                    <div className="mt-4 mr-1.5 flex-shrink-0 z-10">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isLight ? 'bg-white' : 'bg-slate-900'
                                      } ${
                                        mainNode.status === 'COMPLETED' 
                                          ? 'border-emerald-500 text-emerald-500' 
                                          : mainNode.status === 'IN_PROGRESS'
                                            ? 'border-indigo-500 text-indigo-550 pulse-indigo'
                                            : mainNode.status === 'BLOCKED'
                                              ? 'border-rose-500 text-rose-500'
                                              : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                                      }`}>
                                        <StatusIcon className="w-4 h-4" />
                                      </div>
                                    </div>

                                    {/* Card content */}
                                    <div 
                                      className={`flex-1 p-4.5 rounded-2xl border transition-all duration-300 hover:scale-[1.005] hover:shadow-md text-right group ${
                                        isMainCompleted 
                                          ? isLight 
                                            ? 'bg-emerald-50/20 border-emerald-100/60 text-slate-550 hover:border-emerald-200'
                                            : 'bg-slate-950/20 border-emerald-950/40 text-slate-400 hover:border-emerald-900/60' 
                                          : mainNode.status === 'IN_PROGRESS'
                                            ? isLight
                                              ? 'bg-indigo-50/15 border-indigo-200 hover:border-indigo-300'
                                              : 'bg-indigo-950/5 border-indigo-900/50 hover:border-indigo-800'
                                            : mainNode.status === 'BLOCKED'
                                              ? isLight
                                                ? 'bg-rose-50/15 border-rose-200 hover:border-rose-300'
                                                : 'bg-rose-950/5 border-rose-900/50 hover:border-rose-800'
                                              : isLight
                                                ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-800'
                                                : 'bg-slate-900/50 border-slate-850 hover:border-slate-750 text-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div onClick={() => setSelectedNode(mainNode)} className="flex-1 cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                              isLight ? 'bg-slate-150 text-slate-600' : 'bg-slate-800 text-slate-400'
                                            }`}>گام {index + 1}</span>
                                            <h4 className={`text-sm font-bold transition-all group-hover:text-indigo-600 ${
                                              isLight ? 'text-slate-850' : 'text-white'
                                            } ${isMainCompleted ? 'opacity-70 line-through text-slate-450' : ''}`}>
                                              {mainNode.title}
                                            </h4>
                                          </div>
                                          <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                                            isLight ? 'text-slate-500' : 'text-slate-400'
                                          }`}>{mainNode.description || 'بدون توضیحات اضافی.'}</p>
                                          {mainNode.dueDate && (
                                            <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${getRemainingDaysText(mainNode)?.color}`}>
                                              <Clock className="w-3.5 h-3.5" />
                                              <span>{getRemainingDaysText(mainNode)?.text}</span>
                                              <span className="opacity-60 font-normal text-[9px] mr-1">({toJalali(mainNode.dueDate)})</span>
                                            </div>
                                          )}
                                          {mainNode.timingType === 'days' && mainNode.durationDays && !isMainCompleted && (
                                            <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-500`}>
                                              <Timer className="w-3.5 h-3.5" />
                                              <span>{mainNode.durationDays} روز مهلت</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nodeStatus.color}`}>
                                            {nodeStatus.label}
                                          </span>
                                        </div>
                                      </div>

                                      {/* ADVANCED: Render Checklist items directly if toggle is true */}
                                      {hasChecklist && showChecklistsDirectly && (
                                        <div className={`mt-4 pt-3 border-t space-y-2 ${
                                          isLight ? 'border-slate-100' : 'border-slate-800/40'
                                        }`}>
                                          <p className={`text-[10px] font-bold flex items-center gap-1 mb-1 ${
                                            isLight ? 'text-slate-500' : 'text-slate-400'
                                          }`}>
                                            <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                                            چک‌لیست کارها (برای انجام کلیک کنید):
                                          </p>
                                          
                                          <div className="space-y-1.5 max-w-lg">
                                            {mainNode.checklist.map((item) => (
                                              <label 
                                                key={item.id} 
                                                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                                                  item.completed 
                                                    ? 'opacity-40 line-through text-slate-500 border-transparent bg-transparent' 
                                                    : isLight
                                                      ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                                                      : 'bg-slate-950/50 border-slate-850 hover:bg-slate-900 text-slate-300'
                                                }`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={item.completed}
                                                  onChange={() => handleToggleChecklistItem(path.id, mainNode.id, item.id)}
                                                  className="w-4 h-4 rounded border-slate-350 text-indigo-500 focus:ring-0 cursor-pointer"
                                                />
                                                <span>{item.text}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Backup progress bar if checklists are hidden */}
                                      {hasChecklist && !showChecklistsDirectly && (
                                        <div className={`mt-4 pt-3 border-t space-y-1 ${
                                          isLight ? 'border-slate-100' : 'border-slate-800/40'
                                        }`}>
                                          <div className={`flex items-center justify-between text-[10px] ${
                                            isLight ? 'text-slate-500' : 'text-slate-400'
                                          }`}>
                                            <span className="flex items-center gap-1">
                                              <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                                              پیشرفت چک‌لیست: {completedChecklist} از {totalChecklist} کار
                                            </span>
                                            <span className="font-mono font-bold text-slate-550">{percent}%</span>
                                          </div>
                                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                                            isLight ? 'bg-slate-150' : 'bg-slate-950'
                                          }`}>
                                            <div 
                                              className="bg-indigo-550 h-full rounded-full transition-all duration-350"
                                              style={{ width: `${percent}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Edit trigger indicator on hover */}
                                      <div onClick={() => setSelectedNode(mainNode)} className={`flex items-center justify-end gap-1.5 text-[10px] mt-3 cursor-pointer ${
                                        isLight ? 'text-slate-400 hover:text-indigo-650' : 'text-slate-500 hover:text-indigo-400'
                                      }`}>
                                        <Edit3 className="w-3 h-3" />
                                        <span>مشاهده جزئیات، مدیریت چک‌لیست‌ها و افزودن زیرمجموعه</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Branching Subnodes (زیر مجموعه‌ها) */}
                                  {subNodes.length > 0 && (
                                    <div className="mr-14 pr-4 space-y-2.5 relative">
                                      {/* Subnodes connector L-shape line */}
                                      <div className={`absolute top-0 bottom-6 right-0 w-0.5 border-r border-dashed ${
                                        isLight ? 'border-slate-200' : 'border-slate-800'
                                      }`} />

                                      {subNodes.map((subNode) => {
                                        const subStatus = getStatusBadge(subNode.status, !!isLight);
                                        const SubIcon = subStatus.icon;
                                        const isSubCompleted = subNode.status === 'COMPLETED';

                                        const totalSubCheck = subNode.checklist.length;
                                        const completedSubCheck = subNode.checklist.filter(c => c.completed).length;

                                        return (
                                          <div 
                                            key={subNode.id}
                                            className="relative flex flex-col mr-2"
                                          >
                                            {/* Horizontal connection line to sub-card */}
                                            <div className={`absolute -right-[24px] top-6 w-4 border-b border-dashed ${
                                              isLight ? 'border-slate-200' : 'border-slate-800'
                                            }`} />

                                            <div
                                              className={`flex-1 p-3.5 rounded-xl border transition-all hover:scale-[1.005] hover:shadow-md cursor-pointer text-right flex flex-col gap-2 group/sub ${
                                                isSubCompleted 
                                                  ? isLight
                                                    ? 'bg-emerald-50/20 border-emerald-100 text-slate-500 hover:border-emerald-200'
                                                    : 'bg-slate-950/10 border-emerald-950/30 text-slate-500 hover:border-emerald-900/40' 
                                                  : subNode.status === 'IN_PROGRESS'
                                                    ? isLight
                                                      ? 'bg-indigo-50/15 border-indigo-250 hover:border-indigo-350 text-slate-800'
                                                      : 'bg-indigo-950/5 border-indigo-950/60 hover:border-indigo-900'
                                                    : subNode.status === 'BLOCKED'
                                                      ? isLight
                                                        ? 'bg-rose-50/15 border-rose-250 hover:border-rose-350 text-slate-800'
                                                        : 'bg-rose-950/5 border-rose-950/60 hover:border-rose-900'
                                                      : isLight
                                                        ? 'bg-white border-slate-200 hover:border-slate-350 text-slate-805 shadow-sm'
                                                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
                                              }`}
                                            >
                                              <div onClick={() => setSelectedNode(subNode)} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                  <div className={`p-1.5 rounded-full border ${
                                                    subNode.status === 'COMPLETED' 
                                                      ? 'border-emerald-600/40 text-emerald-500 bg-emerald-950/10' 
                                                      : subNode.status === 'IN_PROGRESS'
                                                        ? 'border-indigo-600/40 text-indigo-400 bg-indigo-950/10'
                                                        : isLight
                                                          ? 'border-slate-250 bg-slate-100 text-slate-500'
                                                          : 'border-slate-800 text-slate-500'
                                                  }`}>
                                                    <SubIcon className="w-3.5 h-3.5" />
                                                  </div>
                                                  <div>
                                                    <h5 className={`text-xs font-bold transition-all group-hover/sub:text-indigo-600 ${
                                                      isLight ? 'text-slate-800' : 'text-white'
                                                    } ${isSubCompleted ? 'opacity-65 line-through text-slate-500' : ''}`}>
                                                      {subNode.title}
                                                    </h5>
                                                    {subNode.description && (
                                                      <p className={`text-[10px] mt-0.5 line-clamp-1 max-w-sm ${
                                                        isLight ? 'text-slate-500' : 'text-slate-400'
                                                      }`}>{subNode.description}</p>
                                                    )}
                                                    {subNode.dueDate && (
                                                      <div className={`flex items-center gap-1 mt-1 text-[9px] font-bold ${getRemainingDaysText(subNode)?.color}`}>
                                                        <Clock className="w-3 h-3" />
                                                        <span>{getRemainingDaysText(subNode)?.text}</span>
                                                        <span className="opacity-60 font-normal text-[8px] mr-1">({toJalali(subNode.dueDate)})</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                  {totalSubCheck > 0 && (
                                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                                      isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                                                    }`}>
                                                      {completedSubCheck}/{totalSubCheck} کار
                                                    </span>
                                                  )}
                                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${subStatus.color}`}>
                                                    {subStatus.label}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* ADVANCED subnode todo items rendered if toggle is active */}
                                              {totalSubCheck > 0 && showChecklistsDirectly && (
                                                <div className={`mt-1 pt-2 border-t space-y-1 ${
                                                  isLight ? 'border-slate-100' : 'border-slate-800/40'
                                                }`}>
                                                  {subNode.checklist.map((item) => (
                                                    <label 
                                                      key={item.id} 
                                                      className={`flex items-center gap-2 p-1 rounded hover:bg-slate-100 transition-all cursor-pointer text-[10px] ${
                                                        item.completed 
                                                          ? 'opacity-40 line-through text-slate-500' 
                                                          : 'text-slate-700 dark:text-slate-305'
                                                      }`}
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={item.completed}
                                                        onChange={() => handleToggleChecklistItem(path.id, subNode.id, item.id)}
                                                        className="w-3 h-3 rounded border-slate-350 text-indigo-500 focus:ring-0 cursor-pointer"
                                                      />
                                                      <span>{item.text}</span>
                                                    </label>
                                                  ))}
                                                </div>
                                              )}

                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Add Node Side Panel (Takes 4 cols in desktop) */}
                    <div className={`lg:col-span-4 border p-5 rounded-2xl h-fit space-y-4 transition-all duration-300 ${
                      isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/40 border-slate-850'
                    }`}>
                      <h4 className={`text-xs font-bold flex items-center gap-1 ${
                        isLight ? 'text-indigo-600' : 'text-indigo-400'
                      }`}>
                        <PlusCircle className="w-4 h-4 animate-pulse" />
                        افزودن مرحله یا سیر جدید
                      </h4>
                      
                      {activePathIdForAddingNode === path.id ? (
                        <form onSubmit={(e) => handleAddMainNode(path.id, e)} className="space-y-3">
                          <div className="space-y-1">
                            <label className={`text-[10px] font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>عنوان مرحله اصلی جدید</label>
                            <input
                              type="text"
                              placeholder="مثال: تسلط بر CSS Grid..."
                              value={nodeTitle}
                              onChange={(e) => setNodeTitle(e.target.value)}
                              className={`w-full px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 ${
                                isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-750 text-white'
                              }`}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`text-[10px] font-semibold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>توضیح کوتاه</label>
                            <textarea
                              placeholder="توضیح دهید در این گام قرار است چه کاری انجام شود..."
                              value={nodeDesc}
                              onChange={(e) => setNodeDesc(e.target.value)}
                              rows={3}
                              className={`w-full px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 resize-none ${
                                isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-750 text-white'
                              }`}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="submit"
                              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              تایید و ثبت
                            </button>
                            <button
                              type="button"
                              onClick={() => setActivePathIdForAddingNode(null)}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              لغو
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => setActivePathIdForAddingNode(path.id)}
                            className={`w-full py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white' : 'bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border-indigo-900/30'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            افزودن مرحله اصلی جدید (گام جدید)
                          </button>
                          <p className={`text-[10px] text-center leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                            با کلیک بر روی هر گام اصلی می‌توانید چک‌لیست آن را مدیریت کرده یا به آن زیرمجموعه متصل کنید.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Selected Node Details Modal Popup */}
                {selectedNode && path.nodes.some(n => n.id === selectedNode.id) && (
                  <NodeEditorModal
                    node={selectedNode}
                    parentTitle={
                      selectedNode.parentId 
                        ? path.nodes.find(n => n.id === selectedNode.parentId)?.title 
                        : undefined
                    }
                    onClose={() => setSelectedNode(null)}
                    onUpdate={(updated) => handleUpdateNode(path.id, updated)}
                    onDelete={(nodeId) => handleDeleteNode(path.id, nodeId)}
                    onAddSubnode={(parentId, title, desc) => handleAddSubnodeToParent(path.id, parentId, title, desc)}
                    isLight={isLight}
                  />
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Add Path/Roadmap Modal Dialog */}
      {showAddPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPath(false)} />
          
          <div className={`relative rounded-2xl w-full max-w-md p-6 border shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right ${
            isLight ? 'bg-white border-slate-200 text-slate-800 shadow-xl' : 'bg-slate-800 text-slate-100 border-slate-750'
          }`} dir="rtl">
            <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Compass className="w-5 h-5 text-indigo-500 animate-pulse" />
              افزودن سیر (شاخه جدید)
            </h3>
            <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              یک شاخه مجزا در برنامه جامع فعال خود ایجاد کنید. مثل "سیر یادگیری زبان"، "روتین سلامتی"، "سیر کاری".
            </p>

            <form onSubmit={handleAddPath} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>عنوان سیر *</label>
                <input
                  type="text"
                  placeholder="مثال: یادگیری پایتون، روتین خواب"
                  value={newPathTitle}
                  onChange={(e) => setNewPathTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-650' : 'text-slate-300'}`}>توضیحات کوتاه (اختیاری)</label>
                <textarea
                  placeholder="این شاخه قرار است چه مسیری را دنبال کند..."
                  value={newPathDesc}
                  onChange={(e) => setNewPathDesc(e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors resize-none focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${isLight ? 'text-slate-650' : 'text-slate-300'}`}>رنگ شاخه (تم گرافیکی)</label>
                <div className="flex gap-3">
                  {Object.keys(COLOR_MAP).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewPathColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        COLOR_MAP[color].primary
                      } ${newPathColor === color ? (isLight ? 'border-slate-800 scale-110 shadow-md' : 'border-white scale-110 shadow-lg') : 'border-transparent hover:scale-105'}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPath(false)}
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
                  ایجاد سیر جدید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Path Modal */}
      {editingPathId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingPathId(null)} />
          
          <div className={`relative ${isLight ? 'bg-white text-slate-800 border-slate-200 shadow-2xl' : 'bg-slate-900 text-slate-100 border-slate-800 shadow-2xl'} rounded-2xl w-full max-w-md p-6 border z-50 overflow-hidden animate-in zoom-in-95 duration-200 text-right`} dir="rtl">
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'} mb-1.5 flex items-center gap-2`}>
              <Edit3 className="w-5 h-5 text-emerald-500" />
              ویرایش جزئیات سیر (شاخه‌ی برنامه)
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mb-4`}>
              ویرایش نام، توضیحات یا رنگ نماد مربوط به سیر انتخابی.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editPathTitle.trim()) return;
              onUpdateProgram({
                ...program,
                paths: program.paths.map(p => p.id === editingPathId ? { ...p, title: editPathTitle.trim(), description: editPathDesc.trim(), color: editPathColor } : p)
              });
              setEditingPathId(null);
            }} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>عنوان سیر *</label>
                <input
                  type="text"
                  value={editPathTitle}
                  onChange={(e) => setEditPathTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-950 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>توضیحات</label>
                <textarea
                  value={editPathDesc}
                  onChange={(e) => setEditPathDesc(e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-950 border-slate-750 text-white focus:border-indigo-500'} rounded-lg text-sm focus:outline-none transition-colors resize-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'} mb-1`}>رنگ نماد این سیر</label>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {['indigo', 'emerald', 'amber', 'rose', 'sky'].map((c) => {
                    const colorLabel: Record<string, string> = {
                      indigo: 'بنفش',
                      emerald: 'سبز',
                      amber: 'زرد/نارنجی',
                      rose: 'قرمز',
                      sky: 'آبی'
                    };
                    const colorCircle: Record<string, string> = {
                      indigo: 'bg-indigo-600',
                      emerald: 'bg-emerald-600',
                      amber: 'bg-amber-500',
                      rose: 'bg-rose-600',
                      sky: 'bg-sky-500'
                    };
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditPathColor(c)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          editPathColor === c 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20' 
                            : `${isLight ? 'border-slate-200 hover:bg-slate-50 text-slate-600' : 'border-slate-800 hover:bg-slate-850 text-slate-400'}`
                        }`}
                        title={colorLabel[c]}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${colorCircle[c]}`} />
                        <span>{colorLabel[c]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPathId(null)}
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

      {/* Gemini Consultation Modal */}
      {activeGeminiPath && (
        <GeminiConsultationModal
          isOpen={true}
          onClose={() => setActiveGeminiPath(null)}
          contextType="path"
          contextData={{
            programTitle: program.title,
            pathTitle: activeGeminiPath.title,
            pathDescription: activeGeminiPath.description,
            nodes: activeGeminiPath.nodes.map(n => ({ title: n.title, status: n.status, checklist: n.checklist }))
          }}
          isLight={isLight}
        />
      )}
    </div>
  );
}
