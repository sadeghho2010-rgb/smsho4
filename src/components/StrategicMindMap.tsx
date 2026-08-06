import React, { useState, useEffect, useRef } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Maximize2, 
  Camera, 
  Archive, 
  ChevronDown, 
  Type, 
  X, 
  PlusCircle, 
  ArchiveRestore, 
  FolderOpen,
  Settings2,
  MousePointer2,
  Download,
  Palette,
  Minus,
  Navigation,
  Layers,
  Zap,
  Bold,
  Italic,
  FileJson,
  FileText,
  Import,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { AppTheme, BrainstormingProject, BrainstormingNode } from '../types';

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
      createNewProject('نقشه ذهنی جدید');
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
      nodes: [{
        id: 'root',
        text: 'موضوع مرکزی',
        x: 2000,
        y: 2000,
        color: COLORS[0],
        children: [],
        tasks: []
      }]
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    return newProject;
  }

  const updateNodes = (newNodes: BrainstormingNode[]) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, nodes: newNodes } : p));
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
      tasks: []
    };

    const updatedNodes = activeProject.nodes
      .map(n => n.id === targetParentId ? { ...n, children: [...n.children, newNodeId] } : n)
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

  // Pan & Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.min(2, Math.max(0.2, s + delta)));
    } else {
      setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
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

  const exportToPNG = async () => {
    if (stageRef.current) {
      const dataUrl = await toPng(stageRef.current, { backgroundColor: isLight ? '#fcfcfc' : '#020617', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `mindmap_${activeProject?.title}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-[#fcfcfc] dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative" dir="rtl">
      
      {/* Top Bar */}
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
          <div className="flex items-center gap-1">
             <button onClick={() => setScale(Math.max(0.2, scale - 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Minus className="w-4 h-4" /></button>
             <span className="text-[11px] font-black w-12 text-center text-slate-500">{Math.round(scale * 100)}%</span>
             <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportToPNG} className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-[12px] font-black flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            <Camera className="w-4 h-4" />
            عکس
          </button>
          <button onClick={centerView} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500"><Maximize2 className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseMove={(e) => isPanning && setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }))}
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

          {/* Render Connections & Nodes manually here for simplicity or recursively */}
          <svg className="absolute inset-[-5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible">
            {activeProject?.nodes.map(node => node.children.map(childId => {
              const child = activeProject.nodes.find(n => n.id === childId);
              if (!child) return null;
              const isRoot = node.id === 'root';
              const isRight = child.x > node.x;
              const x1 = isRoot ? node.x + 90 : (isRight ? node.x + 150 : node.x);
              const y1 = node.y + (isRoot ? 30 : 22);
              const x2 = isRight ? child.x : child.x + 150;
              const y2 = child.y + 22;
              const cp1x = x1 + (x2 - x1) * 0.5;
              return <path key={`${node.id}-${childId}`} d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`} fill="none" stroke={BORDER_COLORS[COLORS.indexOf(node.color)] || '#4F46E5'} strokeWidth="1.5" strokeOpacity="0.4" />;
            }))}
          </svg>

          {activeProject?.nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isEditing = editingNodeId === node.id;
            const isRoot = node.id === 'root';
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
                    isRoot ? 'bg-indigo-600 border-indigo-500 text-white' : isLight ? 'bg-white border-transparent' : 'bg-slate-900 border-slate-800 text-white'
                  } ${isSelected ? 'ring-4 ring-indigo-500/20 !border-indigo-500 scale-105' : ''}`}
                  style={{ backgroundColor: !isRoot ? node.color : undefined, borderRight: !isRoot ? `4px solid ${BORDER_COLORS[COLORS.indexOf(node.color)] || '#4F46E5'}` : undefined }}
                >
                  {isEditing ? (
                    <textarea autoFocus value={node.text} onChange={(e) => updateNodes(activeProject.nodes.map(n => n.id === node.id ? { ...n, text: e.target.value } : n))} onBlur={() => setEditingNodeId(null)} className="w-full bg-transparent border-none outline-none text-inherit text-center resize-none font-black text-[13px]" />
                  ) : (
                    <span className="text-[13px] font-black leading-tight text-center">{node.text}</span>
                  )}
                  {isSelected && !isEditing && (
                    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-2xl border">
                      <button onClick={() => addNode(node.id)} className="p-2 text-indigo-600"><PlusCircle className="w-4.5 h-4.5" /></button>
                      <button onClick={() => addNode(node.id, true)} className="p-2 text-indigo-600"><Layers className="w-4.5 h-4.5" /></button>
                      {!isRoot && <button onClick={() => deleteNode(node.id)} className="p-2 text-rose-500"><Trash2 className="w-4.5 h-4.5" /></button>}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
