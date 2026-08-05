import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Compass, 
  GitBranch, 
  GitCommit, 
  CheckCircle2, 
  Play, 
  AlertCircle, 
  Circle, 
  ArrowDown, 
  ArrowLeft,
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronLeft, 
  ChevronDown,
  Eye,
  PlusCircle,
  HelpCircle,
  Folder,
  Layers,
  Settings,
  FolderPlus,
  Minimize2,
  Download,
  Upload
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Program, RoadmapPath, RoadmapNode, NodeStatus, AppTheme } from '../types';
import NodeEditorModal from './NodeEditorModal';

interface MindMapProps {
  programs: Program[];
  activeProgramId: string;
  onUpdateProgram: (updatedProgram: Program) => void;
  onUpdateAllPrograms: (programs: Program[]) => void;
  onAddProgram: (title: string, description: string) => void;
  isLight?: boolean;
}

const STATUS_ICONS: Record<NodeStatus, any> = {
  'COMPLETED': CheckCircle2,
  'IN_PROGRESS': Play,
  'BLOCKED': AlertCircle,
  'NOT_STARTED': Circle,
};

export default function MindMap({ 
  programs, 
  activeProgramId, 
  onUpdateProgram, 
  onUpdateAllPrograms,
  onAddProgram,
  isLight = false
}: MindMapProps) {
  
  // Navigation & Interactive States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Collapse States (stores collapsed node/path/program IDs)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Layout & View Mode States
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');

  // Edit Modal States
  const [selectedNode, setSelectedNode] = useState<{ node: RoadmapNode; pathId: string; programId: string } | null>(null);

  // Program creation state
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Export/Import Logic
  const handleDownloadPrograms = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      programs
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("download", `roadmap_programs_backup_${date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleUploadPrograms = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed && Array.isArray(parsed.programs)) {
          onUpdateAllPrograms(parsed.programs);
          alert('برنامه‌ها با موفقیت بازگردانی شدند.');
        } else {
          alert('فرمت فایل نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Status colors mapped based on light vs dark theme
  const STATUS_COLORS: Record<NodeStatus, string> = {
    'COMPLETED': isLight 
      ? 'text-emerald-600 border-emerald-300 bg-emerald-50' 
      : 'text-emerald-400 border-emerald-500 bg-emerald-950/20',
    'IN_PROGRESS': isLight 
      ? 'text-emerald-700 border-emerald-300 bg-emerald-50/50' 
      : 'text-indigo-400 border-indigo-500 bg-indigo-950/20 pulse-indigo',
    'BLOCKED': isLight 
      ? 'text-rose-600 border-rose-200 bg-rose-50' 
      : 'text-rose-400 border-rose-500 bg-rose-950/20',
    'NOT_STARTED': isLight 
      ? 'text-slate-500 border-slate-200 bg-slate-50' 
      : 'text-slate-400 border-slate-700 bg-slate-900/40',
  };

  // Toggle Collapse
  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(collapsedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCollapsedIds(next);
  };

  // Dragging / Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('form') || target.closest('a') || target.closest('.node-card')) {
      return; // Do not drag when interacting with elements
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleExportMap = async () => {
    if (!mapRef.current) return;
    try {
      const dataUrl = await toPng(mapRef.current, {
        quality: 0.95,
        backgroundColor: isLight ? '#f7faf8' : '#020617',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `mindmap-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export mind map', err);
      alert('خطا در خروجی گرفتن از نمودار ذهنی.');
    }
  };

  // Update a step inside a specific program and path
  const handleUpdateNode = (programId: string, pathId: string, updatedNode: RoadmapNode) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

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

  // Delete a step
  const handleDeleteNode = (programId: string, pathId: string, nodeId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

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

  // Add a subnode
  const handleAddSubnodeToParent = (programId: string, pathId: string, parentId: string, title: string, description: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

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

  const handleAddProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddProgram(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setShowAddProgram(false);
  };

  const isVertical = orientation === 'vertical';

  const displayedPrograms = viewMode === 'all' 
    ? programs 
    : (programs.filter(p => p.id === activeProgramId).length > 0 
        ? programs.filter(p => p.id === activeProgramId) 
        : programs.slice(0, 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toolbar Header */}
      <div className={`${isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900 border-slate-850 text-slate-100'} border p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300`}>
        <div>
          <h2 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'} flex items-center gap-2`}>
            <Layers className="w-5 h-5 text-emerald-500" />
            نمودار ذهنی جامع (XMind Map)
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
            نمای درختی یکپارچه از تمامی برنامه‌ها و گام‌های شما. با دوبار کلیک بر فضای خالی، تمام‌صفحه می‌شود.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Data Portability */}
          <div className={`flex items-center gap-1.5 p-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl`}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadPrograms}
              className="hidden"
              accept=".json"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 ${isLight ? 'hover:bg-slate-200/50 text-emerald-600' : 'hover:bg-slate-850 text-emerald-400'} rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer`}
              title="آپلود کل برنامه‌ها و سیرها"
            >
              <Upload className="w-4 h-4" />
              <span className="text-[10px] font-bold">آپلود</span>
            </button>
            <div className={`w-[1px] h-4 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
            <button
              onClick={handleDownloadPrograms}
              className={`p-2 ${isLight ? 'hover:bg-slate-200/50 text-indigo-600' : 'hover:bg-slate-850 text-indigo-400'} rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer`}
              title="دانلود کل برنامه‌ها و سیرها"
            >
              <Download className="w-4 h-4" />
              <span className="text-[10px] font-bold">دانلود</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className={`flex items-center gap-1.5 p-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl`}>
            <button
              onClick={handleZoomOut}
              className={`p-1.5 ${isLight ? 'hover:bg-slate-200/50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-850 text-slate-400 hover:text-white'} rounded-lg transition-colors cursor-pointer`}
              title="بزرگنمایی -"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'} font-mono font-bold px-1.5`}>{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className={`p-1.5 ${isLight ? 'hover:bg-slate-200/50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-850 text-slate-400 hover:text-white'} rounded-lg transition-colors cursor-pointer`}
              title="بزرگنمایی +"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className={`p-1.5 ${isLight ? 'hover:bg-slate-200/50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-850 text-slate-400 hover:text-white'} rounded-lg transition-colors border-r ${isLight ? 'border-slate-200' : 'border-slate-800'} ml-0.5 pl-2 cursor-pointer`}
              title="ریست کردن اندازه"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportMap}
              className={`p-1.5 ${isLight ? 'hover:bg-slate-200/50 text-emerald-600 hover:text-emerald-700' : 'hover:bg-slate-850 text-emerald-500 hover:text-emerald-400'} rounded-lg transition-colors border-r ${isLight ? 'border-slate-200' : 'border-slate-800'} ml-0.5 pl-2 cursor-pointer`}
              title="خروجی عکس (دانلود نمودار)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Controls */}
          <div className={`flex items-center gap-1 p-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl`}>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                viewMode === 'all' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              همه برنامه‌ها
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                viewMode === 'single' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
            >
              فقط برنامه فعلی
            </button>
          </div>

          {/* Orientation Controls */}
          <div className={`flex items-center gap-1 p-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-xl`}>
            <button
              onClick={() => setOrientation('horizontal')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                orientation === 'horizontal' 
                  ? 'bg-emerald-600 text-white' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
              title="نمای افقی (راست به چپ)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                orientation === 'vertical' 
                  ? 'bg-emerald-600 text-white' 
                  : `${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'}`
              }`}
              title="نمای عمودی (بالا به پایین)"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick instructions indicator */}
          <div className={`text-[10px] flex items-center gap-1 ${isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-indigo-950/20 border-indigo-900/30 text-slate-350'} py-1.5 px-3 rounded-xl border`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>کلیک روی گام‌ها = باز شدن جزئیات و ویرایش</span>
          </div>
        </div>
      </div>

      {/* Infinite Canvas Mind Map Stage */}
      {(() => {
        const canvasElement = (
          <div 
            ref={containerRef}
            onDoubleClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('button') && !target.closest('input') && !target.closest('form') && !target.closest('.node-card')) {
                setIsFullscreen(!isFullscreen);
              }
            }}
            className={`${isFullscreen ? `fixed inset-0 z-[9999] w-screen h-screen ${isLight ? 'bg-white' : 'bg-slate-950'} p-6` : `w-full h-[65vh] ${isLight ? 'bg-[#f7faf8] border-slate-200' : 'bg-slate-950/60 border-slate-850'}`} border rounded-3xl relative overflow-hidden select-none transition-all duration-300 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            title="با دوبار کلیک بر فضای خالی تمام صفحه شوید"
          >
            
            {isFullscreen && (
              <button 
                onClick={() => setIsFullscreen(false)} 
                className="absolute top-4 right-4 z-50 p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                <span>خروج از تمام‌صفحه</span>
              </button>
            )}

            {/* Mind Map Canvas Transform wrapper */}
            <div 
              ref={mapRef}
              className="absolute origin-top-right transition-transform duration-75 text-right p-20 flex items-center justify-start min-w-[3000px] h-full"
              style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                direction: 'rtl'
              }}
            >
              
              {/* MIND MAP HIERARCHICAL STRUCTURE (Right-to-Left branch flow) */}
              <div className="flex items-center gap-16 relative">
                
                {/* 1. CENTRAL ROOT HUB NODE */}
                <div className="relative flex items-center">
                  <div className={`px-6 py-4 bg-gradient-to-tr ${isLight ? 'from-emerald-500 to-teal-600 ring-slate-100 text-white' : 'from-indigo-600 to-purple-600 ring-indigo-950/80 text-white'} border border-emerald-400 font-black rounded-2xl shadow-xl z-20 w-52 text-center flex flex-col gap-1 ring-4`}>
                    <Compass className="w-6 h-6 mx-auto text-white animate-spin-slow mb-1" />
                    <span className="text-sm font-black tracking-wide">نقشه ذهنی کل اهداف</span>
                    <span className="text-[10px] font-medium opacity-80">{programs.length} برنامه جامع</span>
                  </div>
                  
                  <div className={`absolute left-[-64px] top-1/2 -translate-y-1/2 w-16 h-[2px] ${isLight ? 'bg-emerald-300' : 'bg-indigo-500/50'} z-0`} />
                </div>

                {/* 2. PROGRAMS COLUMN BRANCHES */}
                <div className={`flex flex-col gap-12 relative pr-8 border-r border-dashed ${isLight ? 'border-slate-300' : 'border-slate-850'}`}>
                  
                  {programs.length === 0 ? (
                    <div className={`p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border border-dashed rounded-2xl text-center text-xs text-slate-500 w-72`}>
                      <p dir="rtl">هیچ برنامه‌ای یافت نشد.</p>
                      <button 
                        onClick={() => setShowAddProgram(true)}
                        className="mt-2 text-emerald-600 font-bold hover:underline cursor-pointer"
                      >
                        ساخت اولین برنامه جامع
                      </button>
                    </div>
                  ) : (
                    displayedPrograms.map((program) => {
                      const isProgramCollapsed = collapsedIds.has(program.id);
                      const activeClass = program.id === activeProgramId ? (isLight ? 'ring-2 ring-emerald-500 border-emerald-400' : 'ring-2 ring-indigo-500') : '';

                      return (
                        <div 
                          key={program.id} 
                          className={`flex items-center gap-12 relative transition-all duration-300 opacity-100`}
                        >
                          {/* Program Node Bubble */}
                          <div className="relative flex items-center group">
                            {/* Horizontal line extending right to the programs column vertical line */}
                            <div className={`absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-[2px] ${isLight ? 'bg-slate-300' : 'bg-slate-800/60'} z-0`} />
                            
                            <div className={`px-5 py-3.5 ${isLight ? 'bg-white border-slate-200 shadow text-slate-800' : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-100'} border rounded-xl shadow-lg z-20 w-64 text-right flex flex-col gap-1.5 relative transition-all ${activeClass}`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold ${isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-indigo-400 bg-indigo-950/40 border-indigo-900/20'} px-2 py-0.5 rounded border`}>برنامه جامع</span>
                                {program.paths.length > 0 && (
                                  <button 
                                    onClick={(e) => toggleCollapse(program.id, e)}
                                    className={`p-1 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'} rounded-md text-slate-400 hover:text-slate-800 transition-all cursor-pointer`}
                                    title={isProgramCollapsed ? 'باز کردن زیرمجموعه‌ها' : 'بستن زیرمجموعه‌ها'}
                                  >
                                    {isProgramCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                              <h3 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{program.title}</h3>
                              {program.description && (
                                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} line-clamp-1`}>{program.description}</p>
                              )}
                              <p className="text-[9px] text-slate-500 font-medium">{program.paths.length} سیر مستقل</p>
                            </div>

                            {/* Connector line leading left to paths */}
                            {!isProgramCollapsed && program.paths.length > 0 && (
                              <div className={`absolute left-[-48px] top-1/2 -translate-y-1/2 w-[48px] h-[2px] ${isLight ? 'bg-slate-300' : 'bg-slate-800/60'} z-0`} />
                            )}
                          </div>

                          {/* 3. PATHS COLUMN BRANCHES */}
                          {!isProgramCollapsed && program.paths.length > 0 && (
                            <div className={`flex flex-col gap-8 relative pr-8 border-r border-dashed ${isLight ? 'border-slate-300' : 'border-slate-800/60'}`}>
                              
                              {program.paths.map((path) => {
                                 const isPathCollapsed = collapsedIds.has(path.id);
                                 const pathMainNodes = path.nodes.filter(n => n.parentId === null);

                                 return (
                                   <div 
                                     key={path.id} 
                                     className={`flex items-center gap-12 relative transition-all duration-300 opacity-100`}
                                   >
                                     {/* Path Node Bubble */}
                                     <div className="relative flex items-center">
                                       {/* Horizontal line extending right to the paths column vertical line */}
                                       <div className={`absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-[2px] ${isLight ? 'bg-slate-300' : 'bg-slate-800/50'} z-0`} />
                                       
                                       <div className={`px-4 py-3 ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'} border rounded-xl shadow-md z-20 w-56 text-right flex flex-col gap-1`}>
                                         <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-1.5">
                                             <span className={`w-2 h-2 rounded-full bg-${path.color}-500`} />
                                             <span className="text-[9px] font-bold text-slate-400">سیر / شاخه</span>
                                           </div>
                                           {pathMainNodes.length > 0 && (
                                             <button 
                                               onClick={(e) => toggleCollapse(path.id, e)}
                                               className={`p-0.5 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'} rounded text-slate-400 hover:text-slate-800 cursor-pointer`}
                                             >
                                               {isPathCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                             </button>
                                           )}
                                         </div>
                                         <h4 className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{path.title}</h4>
                                         <span className="text-[9px] text-slate-500">{pathMainNodes.length} گام برنامه‌ریزی</span>
                                       </div>

                                       {/* Connector line leading left to main nodes */}
                                       {!isPathCollapsed && pathMainNodes.length > 0 && (
                                         <div className={`absolute left-[-48px] top-1/2 -translate-y-1/2 w-[48px] h-[2px] ${isLight ? 'bg-slate-300' : 'bg-slate-800/50'} z-0`} />
                                       )}
                                     </div>

                                     {/* 4. STEPS (MAIN NODES) */}
                                     {!isPathCollapsed && pathMainNodes.length > 0 && (
                                       <div className={`flex flex-col gap-6 relative pr-8 border-r border-dashed ${isLight ? 'border-slate-300' : 'border-slate-800/40'}`}>
                                         
                                         {pathMainNodes.map((mainNode) => {
                                           const isNodeCollapsed = collapsedIds.has(mainNode.id);
                                           const subNodes = path.nodes.filter(n => n.parentId === mainNode.id);
                                           const StatusIcon = STATUS_ICONS[mainNode.status];

                                           return (
                                             <div 
                                               key={mainNode.id} 
                                               className={`flex items-center gap-12 relative transition-all duration-300 opacity-100`}
                                             >
                                               {/* Step Node Bubble */}
                                               <div className="relative flex items-center">
                                                 {/* Horizontal line extending right to steps column vertical line */}
                                                 <div className={`absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-[2px] ${isLight ? 'bg-slate-200' : 'bg-slate-800/40'} z-0`} />
                                                 
                                                 <div 
                                                   onClick={() => setSelectedNode({ node: mainNode, pathId: path.id, programId: program.id })}
                                                   className={`px-4 py-3 ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm' : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'} border rounded-xl z-20 w-60 text-right flex flex-col gap-1.5 transition-all cursor-pointer group node-card`}
                                                 >
                                                   <div className="flex items-center justify-between">
                                                     <div className="flex items-center gap-1">
                                                       <span className={`text-[9px] ${isLight ? 'text-slate-500 bg-slate-100' : 'text-slate-500 bg-slate-900'} px-1 py-0.5 rounded`}>گام اصلی</span>
                                                       <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border ${STATUS_COLORS[mainNode.status]}`}>
                                                         {mainNode.status === 'COMPLETED' ? 'انجام شده' : mainNode.status === 'IN_PROGRESS' ? 'در حال اقدام' : mainNode.status === 'BLOCKED' ? 'مانع دار' : 'شروع نشده'}
                                                       </span>
                                                     </div>
                                                     {subNodes.length > 0 && (
                                                       <button 
                                                         onClick={(e) => {
                                                           e.stopPropagation();
                                                           toggleCollapse(mainNode.id, e);
                                                         }}
                                                         className={`p-0.5 ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'} rounded text-slate-400 hover:text-slate-800 cursor-pointer`}
                                                       >
                                                         {isNodeCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                       </button>
                                                     )}
                                                   </div>
                                                   
                                                   <div className="flex items-start gap-1.5">
                                                     <StatusIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                     <h5 className={`text-xs font-bold ${isLight ? 'text-slate-800 group-hover:text-emerald-600' : 'text-slate-200 group-hover:text-indigo-400'} transition-colors`}>
                                                       {mainNode.title}
                                                     </h5>
                                                   </div>
                                                   {mainNode.checklist.length > 0 && (
                                                     <span className="text-[9px] text-slate-500">
                                                       پیشرفت چک‌لیست: {mainNode.checklist.filter(c => c.completed).length} از {mainNode.checklist.length} کار
                                                     </span>
                                                   )}
                                                 </div>

                                                 {/* Connector line leading left to subnodes */}
                                                 {!isNodeCollapsed && subNodes.length > 0 && (
                                                   <div className={`absolute left-[-48px] top-1/2 -translate-y-1/2 w-[48px] h-[2px] ${isLight ? 'bg-slate-200' : 'bg-slate-800/30'} z-0`} />
                                                 )}
                                               </div>

                                               {/* 5. SUBSTEPS BRANCHES */}
                                               {!isNodeCollapsed && subNodes.length > 0 && (
                                                 <div className={`flex flex-col gap-3 relative pr-4 border-r ${isLight ? 'border-slate-300' : 'border-slate-800/30'}`}>
                                                   {subNodes.map((subNode) => {
                                                     const SubStatusIcon = STATUS_ICONS[subNode.status];

                                                     return (
                                                       <div 
                                                         key={subNode.id}
                                                         onClick={() => setSelectedNode({ node: subNode, pathId: path.id, programId: program.id })}
                                                         className={`relative px-3.5 py-2.5 ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm' : 'bg-slate-950/40 hover:bg-slate-900/60 border-slate-850 hover:border-slate-750 text-slate-300'} border rounded-lg z-20 w-52 text-right flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md group/sub node-card opacity-100`}
                                                       >
                                                         {/* Horizontal line extending right from subnode to the main node's vertical trunk */}
                                                         <div className={`absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[2px] ${isLight ? 'bg-slate-200' : 'bg-slate-800/30'} z-0`} />
                                                         
                                                         <div className="flex items-center gap-1.5 relative z-10">
                                                           <SubStatusIcon className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                                                           <span className={`text-[11px] font-bold ${isLight ? 'text-slate-800 group-hover/sub:text-emerald-600' : 'text-slate-300 group-hover/sub:text-indigo-400'} transition-colors`}>
                                                             {subNode.title}
                                                           </span>
                                                         </div>
                                                         <span className="text-[8px] text-slate-500 font-mono relative z-10">زیرمجموعه فرعی</span>
                                                       </div>
                                                     );
                                                   })}
                                                 </div>
                                               )}

                                             </div>
                                           );
                                         })}
                                       </div>
                                     )}

                                   </div>
                                 );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}

                </div>

              </div>

            </div>

          </div>
        );

        return isFullscreen ? createPortal(canvasElement, document.body) : canvasElement;
      })()}

      {/* Program Addition inline dialog inside Mind Map page */}
      {showAddProgram && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddProgram(false)} />
          <div className={`relative ${isLight ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-800 border-slate-700 text-slate-100'} border rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] text-right animate-in zoom-in-95 duration-200`} dir="rtl">
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'} mb-2 flex items-center gap-1.5`}>
              <FolderPlus className="w-5 h-5 text-emerald-500" />
              ساخت برنامه جامع جدید
            </h3>
            <form onSubmit={handleAddProgramSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">عنوان برنامه</label>
                <input
                  type="text"
                  placeholder="مثال: رشد فردی و کاری ۱۴۰۵"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-850' : 'bg-slate-900 border-slate-750 text-white'} rounded-xl text-xs focus:outline-none`}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">توضیحات</label>
                <textarea
                  placeholder="این برنامه چه اهدافی را دنبال می‌کند..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-850' : 'bg-slate-900 border-slate-750 text-white'} rounded-xl text-xs focus:outline-none resize-none`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddProgram(false)}
                  className={`px-3.5 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-700 text-slate-200'} text-xs font-semibold rounded-lg cursor-pointer`}
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  ایجاد برنامه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Node Details Modal Popup */}
      {selectedNode && (
        <NodeEditorModal
          node={selectedNode.node}
          parentTitle={
            selectedNode.node.parentId 
              ? (programs.find(p => p.id === selectedNode.programId)
                  ?.paths.find(pth => pth.id === selectedNode.pathId)
                  ?.nodes.find(n => n.id === selectedNode.node.parentId)?.title)
              : undefined
          }
          onClose={() => setSelectedNode(null)}
          onUpdate={(updated) => handleUpdateNode(selectedNode.programId, selectedNode.pathId, updated)}
          onDelete={(nodeId) => handleDeleteNode(selectedNode.programId, selectedNode.pathId, nodeId)}
          onAddSubnode={(parentId, title, desc) => handleAddSubnodeToParent(selectedNode.programId, selectedNode.pathId, parentId, title, desc)}
        />
      )}

    </div>
  );
}
