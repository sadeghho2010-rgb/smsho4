import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Maximize2, 
  Camera, 
  Archive, 
  ChevronDown, 
  CheckSquare, 
  Square, 
  Type, 
  X, 
  PlusCircle, 
  ArchiveRestore, 
  FolderOpen,
  Settings2,
  MousePointer2,
  Download,
  Share2,
  Palette,
  Minus,
  Navigation,
  Layers,
  Zap,
  Bold,
  Italic,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  FileJson,
  FileText,
  Import,
  Smile,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { AppTheme, BrainstormingProject, BrainstormingNode, ChecklistItem } from '../types';

interface StrategicMindMapProps {
  theme: AppTheme;
}

const COLORS = [
  '#F0F4FF', // Light Indigo
  '#ECFDF5', // Light Emerald
  '#FFFBEB', // Light Amber
  '#FEF2F2', // Light Rose
  '#F5F3FF', // Light Violet
  '#ECFEFF', // Light Cyan
  '#FDF2F8', // Light Pink
  '#FFF7ED', // Light Orange
];

const BORDER_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316'
];

const ICONS = ['⭐', '🔥', '✅', '⚠️', '🎯', '💡', '📌', '🚀'];

export default function StrategicMindMap({ theme }: StrategicMindMapProps) {
  const [projects, setProjects] = useState<BrainstormingProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(true);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isLight = theme.startsWith('light-');

  // Load projects
  useEffect(() => {
    const saved = localStorage.getItem('xmind_mindmap_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          const firstActive = parsed.find((p: any) => !p.isArchived) || parsed[0];
          setActiveProjectId(firstActive.id);
        }
      } catch (e) { console.error(e); }
    } else {
      createNewProject('نقشه ذهنی استراتژیک');
    }
  }, []);

  // Save projects
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('xmind_mindmap_v5', JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  function createNewProject(title = 'پروژه جدید') {
    const newProject: BrainstormingProject = {
      id: 'proj-' + Date.now(),
      title,
      createdAt: new Date().toISOString(),
      isArchived: false,
      layoutMode: 'logic',
      nodes: [{
        id: 'root',
        text: 'موضوع مرکزی',
        x: 2000,
        y: 2000,
        color: COLORS[0],
        children: [],
        tasks: [],
        isExpanded: true,
        style: { isBold: true, fontSize: 16 }
      }]
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    return newProject;
  }

  const updateActiveProject = (updates: Partial<BrainstormingProject>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates } : p));
  };

  const updateNodes = (newNodes: BrainstormingNode[]) => {
    updateActiveProject({ nodes: newNodes });
  };

  const addNode = (parentId: string, isSibling = false) => {
    if (!activeProject) return;
    
    let targetParentId = parentId;
    if (isSibling && parentId !== 'root') {
      const parent = activeProject.nodes.find(n => n.children.includes(parentId));
      if (parent) targetParentId = parent.id;
      else return;
    }

    const parentNode = activeProject.nodes.find(n => n.id === targetParentId);
    if (!parentNode) return;

    const newNodeId = `node-${Date.now()}`;
    const siblings = activeProject.nodes.filter(n => parentNode.children.includes(n.id));
    
    // Layout Logic
    const isRoot = targetParentId === 'root';
    const side = isRoot ? (siblings.length % 2 === 0 ? 1 : -1) : (parentNode.x >= 2000 ? 1 : -1);
    
    const hGap = isRoot ? 280 : 200;
    const vGap = 80;
    
    const newNode: BrainstormingNode = {
      id: newNodeId,
      text: 'ایده جدید',
      x: parentNode.x + (side * hGap),
      y: parentNode.y + (siblings.length * vGap - (siblings.length * vGap / 2)),
      color: isRoot ? COLORS[siblings.length % COLORS.length] : parentNode.color,
      children: [],
      tasks: [],
      isExpanded: true,
      style: { fontSize: 14 }
    };

    const updatedNodes = activeProject.nodes
      .map(n => n.id === targetParentId ? { ...n, children: [...n.children, newNodeId], isExpanded: true } : n)
      .concat(newNode);
    
    updateNodes(updatedNodes);
    setSelectedNodeId(newNodeId);
    setEditingNodeId(newNodeId);
  };

  const deleteNode = (nodeId: string) => {
    if (!activeProject || nodeId === 'root') return;
    const toDelete = new Set<string>();
    const findSubtree = (id: string) => {
      toDelete.add(id);
      activeProject.nodes.find(n => n.id === id)?.children.forEach(findSubtree);
    };
    findSubtree(nodeId);

    const updatedNodes = activeProject.nodes
      .filter(n => !toDelete.has(n.id))
      .map(n => ({ ...n, children: n.children.filter(cid => cid !== nodeId) }));
    
    updateNodes(updatedNodes);
    setSelectedNodeId(null);
  };

  const toggleExpand = (nodeId: string) => {
    if (!activeProject) return;
    updateNodes(activeProject.nodes.map(n => n.id === nodeId ? { ...n, isExpanded: !n.isExpanded } : n));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) return;
      if (!selectedNodeId) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        addNode(selectedNodeId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addNode(selectedNodeId, true);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteNode(selectedNodeId);
      } else if (e.key === ' ' && !isPanning) {
        setIsPanning(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsPanning(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeId, editingNodeId, activeProject, isPanning]);

  // Pan & Zoom Logic
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.min(2, Math.max(0.2, s + delta)));
    } else {
      setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const centerView = () => {
    const root = activeProject?.nodes.find(n => n.id === 'root');
    if (root && canvasRef.current) {
      const container = canvasRef.current;
      setOffset({
        x: -root.x + container.clientWidth / (2 * scale),
        y: -root.y + container.clientHeight / (2 * scale)
      });
    }
  };

  useEffect(() => {
    if (activeProjectId) setTimeout(centerView, 100);
  }, [activeProjectId]);

  // Export Logic
  const exportToPNG = async () => {
    if (stageRef.current) {
      const dataUrl = await toPng(stageRef.current, { backgroundColor: isLight ? '#fcfcfc' : '#020617', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `mindmap_${activeProject?.title}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const exportToJSON = () => {
    if (!activeProject) return;
    const blob = new Blob([JSON.stringify(activeProject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.title}.json`;
    link.click();
  };

  const exportToMarkdown = () => {
    if (!activeProject) return;
    const generateMd = (nodeId: string, level: number): string => {
      const node = activeProject.nodes.find(n => n.id === nodeId);
      if (!node) return '';
      let md = `${'  '.repeat(level)}- ${node.text}\n`;
      if (node.isExpanded) {
        node.children.forEach(cid => { md += generateMd(cid, level + 1); });
      }
      return md;
    };
    const mdContent = generateMd('root', 0);
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.title}.md`;
    link.click();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setProjects(prev => [imported, ...prev]);
          setActiveProjectId(imported.id);
        } catch (err) { alert('خطا در بارگذاری فایل'); }
      };
      reader.readAsText(file);
    }
  };

  // Rendering Helper: Recursive Connection Lines
  const renderConnections = (nodeId: string) => {
    const node = activeProject?.nodes.find(n => n.id === nodeId);
    if (!node || !node.isExpanded) return null;

    return node.children.map(childId => {
      const child = activeProject.nodes.find(n => n.id === childId);
      if (!child) return null;

      const isRoot = node.id === 'root';
      const isRight = child.x > node.x;
      const nodeW = isRoot ? 180 : 150;
      const nodeH = isRoot ? 60 : 44;

      const x1 = isRoot ? node.x + 90 : (isRight ? node.x + nodeW : node.x);
      const y1 = node.y + nodeH / 2;
      const x2 = isRight ? child.x : child.x + 150;
      const y2 = child.y + 22;

      const cp1x = x1 + (x2 - x1) * 0.5;
      const cp2x = x1 + (x2 - x1) * 0.5;

      return (
        <React.Fragment key={`conn-${nodeId}-${childId}`}>
          <path
            d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={node.color}
            strokeWidth={isRoot ? "3" : "1.5"}
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
          {renderConnections(childId)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-[#fcfcfc] dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative" dir="rtl">
      
      {/* Top Navigation Bar */}
      <div className="h-14 px-6 border-b flex items-center justify-between z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:border-indigo-400 transition-all"
            >
              <GitBranch className="w-4 h-4 text-indigo-500" />
              <span className="text-[13px] font-black">{activeProject?.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <AnimatePresence>
              {showProjectDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[100]"
                >
                  <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">پروژه‌ها</span>
                    <button onClick={() => { createNewProject(); setShowProjectDropdown(false); }} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {projects.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setActiveProjectId(p.id); setShowProjectDropdown(false); }}
                        className={`w-full text-right px-4 py-3 rounded-xl text-[12px] font-bold flex justify-between items-center transition-all ${activeProjectId === p.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                      >
                        {p.title}
                        {activeProjectId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          
          <div className="flex items-center gap-1">
             <button onClick={() => setScale(Math.max(0.2, scale - 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Minus className="w-4 h-4" /></button>
             <span className="text-[11px] font-black w-12 text-center text-slate-500">{Math.round(scale * 100)}%</span>
             <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-[12px] font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
            >
              <Download className="w-4 h-4" />
              خروجی
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[100]"
                >
                  <button onClick={exportToPNG} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-2"><Camera className="w-4 h-4 text-indigo-500" /> ذخیره به صورت عکس (PNG)</button>
                  <button onClick={exportToJSON} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-2"><FileJson className="w-4 h-4 text-emerald-500" /> دریافت فایل JSON</button>
                  <button onClick={exportToMarkdown} className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500" /> خروجی Markdown</button>
                  <label className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-2 cursor-pointer">
                    <Import className="w-4 h-4 text-violet-500" /> 
                    وارد کردن پروژه
                    <input type="file" accept=".json" onChange={importJSON} className="hidden" />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={centerView} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500" title="تمرکز روی ریشه"><Maximize2 className="w-5 h-5" /></button>
          <button onClick={() => setShowStylePanel(!showStylePanel)} className={`p-2 rounded-xl transition-all ${showStylePanel ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}><Settings2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Infinite Canvas */}
        <div 
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseDown={(e) => { if (e.button === 1 || e.altKey) setIsPanning(true); }}
          onMouseUp={() => setIsPanning(false)}
        >
          <div 
            ref={stageRef}
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}
            onClick={() => { setSelectedNodeId(null); setEditingNodeId(null); }}
          >
            {/* Background Grid */}
            <div className="absolute inset-[-5000px] pointer-events-none" 
              style={{ 
                backgroundImage: isLight 
                  ? 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)' 
                  : 'radial-gradient(#1e293b 1.5px, transparent 1.5px)',
                backgroundSize: '40px 40px'
              }} 
            />

            {/* SVG Connections */}
            <svg className="absolute inset-[-5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible">
              {renderConnections('root')}
            </svg>

            {/* Nodes */}
            {activeProject?.nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const isEditing = editingNodeId === node.id;
              const isRoot = node.id === 'root';
              
              // Check if parent is expanded
              const parent = activeProject.nodes.find(n => n.children.includes(node.id));
              if (parent && !parent.isExpanded) return null;

              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  onDrag={(e, info) => {
                     const updated = activeProject.nodes.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x / scale, y: n.y + info.delta.y / scale } : n);
                     updateNodes(updated);
                  }}
                  initial={false}
                  animate={{ x: node.x, y: node.y }}
                  className={`absolute z-20 group transition-all ${isSelected ? 'z-50' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
                >
                  <div 
                    className={`relative ${isRoot ? 'w-[180px] min-h-[60px]' : 'min-w-[150px] min-h-[44px]'} p-3 rounded-2xl border-2 transition-all flex flex-col justify-center items-center shadow-lg ${
                      isRoot 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : isLight 
                          ? 'bg-white border-transparent' 
                          : 'bg-slate-900 border-slate-800 text-white'
                    } ${isSelected ? 'ring-4 ring-indigo-500/20 !border-indigo-500 scale-105' : ''}`}
                    style={{ 
                      backgroundColor: !isRoot ? node.color : undefined,
                      borderColor: !isRoot && isSelected ? BORDER_COLORS[COLORS.indexOf(node.color)] : undefined,
                      borderRight: !isRoot ? `4px solid ${BORDER_COLORS[COLORS.indexOf(node.color)] || '#4F46E5'}` : undefined
                    }}
                  >
                    {isEditing ? (
                      <textarea
                        autoFocus
                        value={node.text}
                        onChange={(e) => updateNodes(activeProject.nodes.map(n => n.id === node.id ? { ...n, text: e.target.value } : n))}
                        onBlur={() => setEditingNodeId(null)}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingNodeId(null); } }}
                        className="w-full bg-transparent border-none outline-none text-inherit text-center resize-none scrollbar-hide font-black text-[13px] leading-snug"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {node.style?.icon && <span className="text-lg">{node.style.icon}</span>}
                        <span className={`text-[13px] font-black leading-tight text-center ${node.style?.isBold ? 'font-black' : 'font-bold'} ${node.style?.isItalic ? 'italic' : ''}`} style={{ fontSize: node.style?.fontSize ? `${node.style.fontSize}px` : undefined }}>
                          {node.text}
                        </span>
                      </div>
                    )}

                    {/* Expand/Collapse Toggle */}
                    {node.children.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                        className={`absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-110 z-[30]`}
                      >
                        {node.isExpanded ? <Minus className="w-3 h-3 text-slate-400" /> : <Plus className="w-3 h-3 text-indigo-600" />}
                      </button>
                    )}

                    {/* Quick Action Overlays */}
                    <AnimatePresence>
                      {isSelected && !isEditing && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                          <button onClick={() => addNode(node.id)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 rounded-xl transition-all" title="افزودن فرزند (Tab)"><PlusCircle className="w-4.5 h-4.5" /></button>
                          <button onClick={() => addNode(node.id, true)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 rounded-xl transition-all" title="افزودن برادر (Enter)"><Layers className="w-4.5 h-4.5" /></button>
                          {!isRoot && <button onClick={() => deleteNode(node.id)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"><Trash2 className="w-4.5 h-4.5" /></button>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Properties Panel */}
        <AnimatePresence>
          {showStylePanel && (
            <motion.div 
              initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
              className="w-80 border-r bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 flex flex-col gap-8 border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2 text-slate-800 dark:text-white"><Palette className="w-4.5 h-4.5 text-indigo-500" /> استایل و شخصی‌سازی</h3>
                <button onClick={() => setShowStylePanel(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              {selectedNodeId ? (
                <div className="space-y-10">
                  <section>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">انتخاب تم رنگی</label>
                    <div className="grid grid-cols-4 gap-3">
                      {COLORS.map((c, idx) => (
                        <button 
                          key={c}
                          onClick={() => updateNodes(activeProject!.nodes.map(n => n.id === selectedNodeId ? { ...n, color: c } : n))}
                          className={`h-9 rounded-xl border-2 transition-all ${activeProject?.nodes.find(n => n.id === selectedNodeId)?.color === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">قالب‌بندی متن</label>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => {
                           const node = activeProject?.nodes.find(n => n.id === selectedNodeId);
                           const style = node?.style || {};
                           updateNodes(activeProject!.nodes.map(n => n.id === selectedNodeId ? { ...n, style: { ...style, isBold: !style.isBold } } : n));
                         }}
                         className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center transition-all ${activeProject?.nodes.find(n => n.id === selectedNodeId)?.style?.isBold ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'}`}
                       >
                         <Bold className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => {
                           const node = activeProject?.nodes.find(n => n.id === selectedNodeId);
                           const style = node?.style || {};
                           updateNodes(activeProject!.nodes.map(n => n.id === selectedNodeId ? { ...n, style: { ...style, isItalic: !style.isItalic } } : n));
                         }}
                         className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center transition-all ${activeProject?.nodes.find(n => n.id === selectedNodeId)?.style?.isItalic ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'}`}
                       >
                         <Italic className="w-4 h-4" />
                       </button>
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">آیکون و وضعیت</label>
                    <div className="grid grid-cols-4 gap-2">
                       {ICONS.map(icon => (
                         <button 
                           key={icon}
                           onClick={() => {
                             const node = activeProject?.nodes.find(n => n.id === selectedNodeId);
                             const style = node?.style || {};
                             updateNodes(activeProject!.nodes.map(n => n.id === selectedNodeId ? { ...n, style: { ...style, icon: style.icon === icon ? undefined : icon } } : n));
                           }}
                           className={`h-10 text-lg rounded-xl transition-all ${activeProject?.nodes.find(n => n.id === selectedNodeId)?.style?.icon === icon ? 'bg-indigo-50 dark:bg-indigo-900/30 scale-110 shadow-md ring-2 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                         >
                           {icon}
                         </button>
                       ))}
                    </div>
                  </section>

                  <section className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">طرح‌بندی پروژه (Layout)</label>
                    <div className="grid grid-cols-1 gap-2">
                       {[
                         { id: 'logic', label: 'نقشه منطقی (Logic Map)', icon: <GitBranch className="w-4 h-4" /> },
                         { id: 'org', label: 'نمودار سازمانی (Org Chart)', icon: <Layout className="w-4 h-4" /> },
                         { id: 'fishbone', label: 'استخوان ماهی (Fishbone)', icon: <Zap className="w-4 h-4" /> }
                       ].map(mode => (
                         <button 
                           key={mode.id}
                           onClick={() => updateActiveProject({ layoutMode: mode.id as any })}
                           className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-[11px] font-black transition-all ${activeProject?.layoutMode === mode.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                         >
                           {mode.icon}
                           {mode.label}
                         </button>
                       ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 gap-6">
                  <div className="p-8 rounded-[40px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                    <MousePointer2 className="w-16 h-16" />
                  </div>
                  <p className="text-[13px] font-black leading-relaxed px-6">برای ویرایش استایل، یکی از گره‌ها را انتخاب کنید</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Shortcuts Hint */}
        <div className="absolute bottom-10 right-10 z-[60] flex flex-col gap-2 pointer-events-none">
           {[
             { k: 'Tab', v: 'افزودن فرزند' },
             { k: 'Enter', v: 'افزودن هم‌رده' },
             { k: 'Space', v: 'جابجایی صفحه' },
             { k: 'Double Click', v: 'ویرایش متن' }
           ].map(s => (
             <div key={s.k} className="flex items-center justify-end gap-3 opacity-40">
               <span className="text-[10px] font-black dark:text-white">{s.v}</span>
               <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black shadow-sm dark:text-slate-400">{s.k}</kbd>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
}
