import React, { useState, useEffect, useRef } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Maximize2, 
  Settings2,
  Download,
  Upload,
  Camera,
  Archive,
  ArrowUpCircle,
  ChevronDown,
  CheckSquare,
  Square,
  Search,
  Move,
  Type,
  ListTodo,
  MoreVertical,
  X,
  PlusCircle,
  ArchiveRestore,
  MoreHorizontal,
  ChevronRight,
  Monitor,
  Layout,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { AppTheme, BrainstormingProject, BrainstormingNode, ChecklistItem } from '../types';

interface StrategicMindMapProps {
  theme: AppTheme;
}

const COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
];

export default function StrategicMindMap({ theme }: StrategicMindMapProps) {
  const [projects, setProjects] = useState<BrainstormingProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLight = theme.startsWith('light-');

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('roadmap_brainstorming_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validated = parsed.map((p: any) => {
          if (!p.nodes || p.nodes.length === 0) {
            return {
              ...p,
              nodes: [
                {
                  id: 'root',
                  text: 'موضوع مرکزی',
                  x: 1500,
                  y: 1500,
                  color: COLORS[0],
                  children: [],
                  tasks: []
                }
              ]
            };
          }
          return p;
        });
        setProjects(validated);
        if (validated.length > 0) {
          const firstActive = validated.find((p: any) => !p.isArchived);
          if (firstActive) setActiveProjectId(firstActive.id);
          else setActiveProjectId(validated[0].id);
        }
      } catch (e) {
        console.error("Error loading brainstorming projects", e);
      }
    } else {
      const defaultProject: BrainstormingProject = {
        id: 'proj-' + Date.now(),
        title: 'بارش فکری جدید',
        createdAt: new Date().toISOString(),
        isArchived: false,
        nodes: [
          {
            id: 'root',
            text: 'موضوع مرکزی',
            x: 1500,
            y: 1500,
            color: COLORS[0],
            children: [],
            tasks: []
          }
        ]
      };
      setProjects([defaultProject]);
      setActiveProjectId(defaultProject.id);
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('roadmap_brainstorming_projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const createProject = () => {
    const newProject: BrainstormingProject = {
      id: 'proj-' + Date.now(),
      title: 'پروژه جدید',
      createdAt: new Date().toISOString(),
      isArchived: false,
      nodes: [
        {
          id: 'root',
          text: 'موضوع مرکزی',
          x: 1500,
          y: 1500,
          color: COLORS[0],
          children: [],
          tasks: []
        }
      ]
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setShowProjectDropdown(false);
  };

  const toggleArchiveProject = (id: string) => {
    const updatedProjects = projects.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p);
    setProjects(updatedProjects);
    
    if (id === activeProjectId) {
      const firstActive = updatedProjects.find(p => !p.isArchived);
      if (firstActive) setActiveProjectId(firstActive.id);
      else if (updatedProjects.length > 0) setActiveProjectId(updatedProjects[0].id);
      else setActiveProjectId(null);
    }
  };

  const deleteProject = (id: string) => {
    if (confirm('آیا از حذف کامل این پروژه اطمینان دارید؟')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      if (activeProjectId === id) {
        setActiveProjectId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const updateActiveProjectNodes = (newNodes: BrainstormingNode[]) => {
    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, nodes: newNodes } : p));
  };

  const updateProjectTitle = (id: string, title: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, title } : p));
  };

  const addNode = (parentId: string) => {
    if (!activeProject) return;
    const parent = activeProject.nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newNodeId = `node-${Date.now()}`;
    const siblingCount = parent.children.length;
    // Spread nodes in a circular way
    const angle = (siblingCount * 60 - 90) * (Math.PI / 180);
    const distance = 250;

    const newNode: BrainstormingNode = {
      id: newNodeId,
      text: 'ایده جدید',
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      children: [],
      tasks: []
    };

    const updatedNodes = activeProject.nodes
      .map(n => n.id === parentId ? { ...n, children: [...n.children, newNodeId] } : n)
      .concat(newNode);
    
    updateActiveProjectNodes(updatedNodes);
    setSelectedNodeId(newNodeId);
  };

  const updateNode = (nodeId: string, updates: Partial<BrainstormingNode>) => {
    if (!activeProject) return;
    const updatedNodes = activeProject.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n);
    updateActiveProjectNodes(updatedNodes);
  };

  const deleteNode = (nodeId: string) => {
    if (!activeProject || nodeId === 'root') return;
    const toDelete = new Set<string>();
    const findChildren = (id: string) => {
      toDelete.add(id);
      const node = activeProject.nodes.find(n => n.id === id);
      node?.children.forEach(findChildren);
    };
    findChildren(nodeId);

    const updatedNodes = activeProject.nodes
      .filter(n => !toDelete.has(n.id))
      .map(n => ({ ...n, children: n.children.filter(childId => childId !== nodeId) }));
    
    updateActiveProjectNodes(updatedNodes);
    setSelectedNodeId(null);
  };

  const handleScreenshot = async () => {
    if (stageRef.current) {
      try {
        const dataUrl = await toPng(stageRef.current, { 
          quality: 1, 
          backgroundColor: isLight ? '#ffffff' : '#000000',
          pixelRatio: 2,
          skipFonts: true
        });
        const link = document.createElement('a');
        link.download = `brainstorming_${activeProject?.title || 'project'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Screenshot failed', err);
      }
    }
  };

  const centerView = () => {
    const rootNode = activeProject?.nodes.find(n => n.id === 'root');
    if (rootNode && canvasRef.current) {
      const container = canvasRef.current;
      container.scrollTo({
        left: rootNode.x - container.clientWidth / 2 + 100,
        top: rootNode.y - container.clientHeight / 2 + 50,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      const timer = setTimeout(centerView, 100);
      return () => clearTimeout(timer);
    }
  }, [activeProjectId]);

  const selectedNode = activeProject?.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden select-none bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800" dir="rtl">
      
      {/* Top Bar Navigation */}
      <div className={`h-16 px-6 border-b flex items-center justify-between z-50 ${isLight ? 'bg-white/80' : 'bg-slate-900/80'} backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50`}>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shadow-sm ${
                isLight ? 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800' : 'bg-slate-950 border-slate-800 hover:border-indigo-500 text-white'
              }`}
            >
              <GitBranch className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-black truncate max-w-[200px]">
                {activeProject?.title || 'انتخاب پروژه'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''} text-slate-400`} />
            </button>

            <AnimatePresence>
              {showProjectDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute top-full right-0 mt-3 w-72 rounded-[32px] border shadow-2xl z-[100] p-2 overflow-hidden ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3 mb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">فهرست پروژه‌ها</span>
                    <button 
                      onClick={createProject} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all text-[10px] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      جدید
                    </button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar space-y-1">
                    {projects.filter(p => !p.isArchived).map(p => (
                      <div key={p.id} className="relative group">
                        <button 
                          onClick={() => { setActiveProjectId(p.id); setShowProjectDropdown(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-right transition-all ${
                            activeProjectId === p.id 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                              : isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${activeProjectId === p.id ? 'bg-white' : 'bg-indigo-500'}`} />
                            <span className="text-xs font-bold truncate">{p.title}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeProjectId === p.id ? 'translate-x-0' : 'translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-40'}`} />
                        </button>
                      </div>
                    ))}
                    {projects.filter(p => !p.isArchived).length === 0 && (
                      <div className="py-8 text-center text-[10px] text-slate-500 font-bold italic">
                        هیچ پروژه‌ای وجود ندارد
                      </div>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => { setShowArchiveModal(true); setShowProjectDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all ${
                        isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Archive className="w-4 h-4 text-amber-500" />
                      مشاهده آرشیو پروژه‌ها
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <div className="flex items-center gap-1.5">
             <button 
               onClick={centerView} 
               className={`p-2.5 rounded-2xl transition-all ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-400'}`} 
               title="بازگشت به مرکز"
             >
               <Maximize2 className="w-4.5 h-4.5" />
             </button>
             <button 
               onClick={handleScreenshot} 
               className={`p-2.5 rounded-2xl transition-all ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-400'}`} 
               title="ذخیره به صورت عکس"
             >
               <Camera className="w-4.5 h-4.5" />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 p-1.5 rounded-2xl ${isLight ? 'bg-white' : 'bg-slate-950'} border border-slate-200 dark:border-slate-800 shadow-sm`}>
            <button 
              onClick={() => setScale(Math.max(0.3, scale - 0.1))} 
              className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-900 text-slate-400'}`}
            >
              <Trash2 className="w-4 h-4 rotate-45" />
            </button>
            <div className="w-12 text-center text-[10px] font-black font-mono tracking-tighter dark:text-slate-500">{Math.round(scale * 100)}%</div>
            <button 
              onClick={() => setScale(Math.min(2, scale + 0.1))} 
              className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-900 text-slate-400'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => { if(activeProject) toggleArchiveProject(activeProject.id); }}
            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 shadow-sm ${
              isLight ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
            }`}
          >
            <Archive className="w-4 h-4" />
            آرشیو پروژه
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Infinite Canvas */}
        <div 
          ref={canvasRef}
          className={`flex-1 relative overflow-auto custom-scrollbar cursor-grab active:cursor-grabbing ${isLight ? 'bg-white' : 'bg-slate-950'}`}
          style={{ 
            backgroundImage: isLight 
              ? 'radial-gradient(#cbd5e1 0.8px, transparent 0.8px)' 
              : 'radial-gradient(#1e293b 0.8px, transparent 0.8px)',
            backgroundSize: '32px 32px'
          }}
        >
          <div 
            ref={stageRef}
            className="min-w-[4000px] min-h-[4000px] relative p-[1000px] origin-top-left transition-transform duration-150 ease-out"
            style={{ transform: `scale(${scale})` }}
          >
            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <filter id="soft-glow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {activeProject?.nodes.map(node => node.children.map(childId => {
                const child = activeProject.nodes.find(n => n.id === childId);
                if (!child) return null;
                
                const x1 = node.x + 104;
                const y1 = node.y + 40;
                const x2 = child.x + 104;
                const y2 = child.y + 40;

                return (
                  <path
                    key={`${node.id}-${child.id}`}
                    d={`M ${x1} ${y1} C ${x1 + (x2-x1)/2} ${y1}, ${x1 + (x2-x1)/2} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                    filter="url(#soft-glow)"
                    className="transition-all duration-300"
                  />
                );
              }))}
            </svg>

            {/* Nodes Layer */}
            {activeProject?.nodes.map(node => (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                   const updatedNodes = activeProject.nodes.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x / scale, y: n.y + info.delta.y / scale } : n);
                   updateActiveProjectNodes(updatedNodes);
                }}
                initial={false}
                animate={{ x: node.x, y: node.y }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                className={`absolute w-52 p-4 rounded-3xl border-4 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 ${
                  selectedNodeId === node.id
                    ? 'border-white scale-110 shadow-2xl z-40 ring-[12px] ring-indigo-500/10'
                    : 'border-transparent shadow-xl z-20'
                }`}
                style={{ 
                  backgroundColor: node.color,
                  boxShadow: `0 20px 40px -12px ${node.color}50`
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-black text-right leading-relaxed line-clamp-4 drop-shadow-md">
                      {node.text}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {node.tasks.length > 0 && (
                      <div className="bg-white/30 backdrop-blur-md px-1.5 py-1 rounded-xl text-[9px] text-white font-black text-center min-w-[32px]">
                        {node.tasks.filter(t => t.completed).length}/{node.tasks.length}
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); addNode(node.id); }}
                      className="p-1.5 bg-white/30 hover:bg-white/50 rounded-xl text-white transition-all active:scale-90"
                      title="افزودن زیرمجموعه"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side Property Editor */}
        <AnimatePresence>
          {selectedNodeId && selectedNode && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className={`absolute top-6 bottom-6 right-6 w-85 rounded-[48px] border shadow-2xl z-[60] flex flex-col overflow-hidden backdrop-blur-2xl ${
                isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'
              }`}
            >
              <div className="p-8 flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <Type className="w-5 h-5" />
                  </div>
                  <h3 className={`text-base font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>ویرایش ایده</h3>
                </div>
                <button 
                  onClick={() => setSelectedNodeId(null)} 
                  className={`p-2.5 rounded-2xl transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block mr-1">عنوان ایده یا موضوع</label>
                  <textarea
                    autoFocus
                    value={selectedNode.text}
                    onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                    className={`w-full px-5 py-4 rounded-[32px] text-sm font-bold focus:outline-none border transition-all resize-none h-32 leading-relaxed ${
                      isLight 
                        ? 'bg-slate-50 border-slate-100 focus:border-indigo-400 text-slate-800 focus:bg-white' 
                        : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white focus:bg-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block mr-1">انتخاب رنگ تم</label>
                  <div className="grid grid-cols-4 gap-3">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateNode(selectedNode.id, { color })}
                        className={`h-10 rounded-2xl border-4 transition-all active:scale-90 ${
                          selectedNode.color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ 
                          backgroundColor: color,
                          boxShadow: selectedNode.color === color ? `0 0 20px ${color}60` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 mr-1">
                      <ListTodo className="w-4 h-4" />
                      لیست اقدامات (Checklist)
                    </span>
                    <button 
                      onClick={() => {
                        const newTask = { id: 'task-'+Date.now(), text: 'اقدام جدید', completed: false };
                        updateNode(selectedNode.id, { tasks: [...selectedNode.tasks, newTask] });
                      }}
                      className="text-[11px] font-black text-indigo-500 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
                    >
                      <PlusCircle className="w-4 h-4" />
                      افزودن مورد
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedNode.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 group animate-in slide-in-from-right-2 duration-200">
                        <button 
                          onClick={() => {
                            const updated = selectedNode.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                            updateNode(selectedNode.id, { tasks: updated });
                          }}
                          className={`shrink-0 transition-all ${task.completed ? 'text-emerald-500 scale-110' : 'text-slate-400 hover:text-indigo-500'}`}
                        >
                          {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                        <input 
                          type="text"
                          value={task.text}
                          onChange={(e) => {
                            const updated = selectedNode.tasks.map(t => t.id === task.id ? { ...t, text: e.target.value } : t);
                            updateNode(selectedNode.id, { tasks: updated });
                          }}
                          className={`flex-1 bg-transparent text-xs font-bold focus:outline-none transition-all ${
                            task.completed ? 'line-through opacity-40 text-slate-500' : isLight ? 'text-slate-700' : 'text-slate-200'
                          }`}
                        />
                        <button 
                          onClick={() => {
                            const updated = selectedNode.tasks.filter(t => t.id !== task.id);
                            updateNode(selectedNode.id, { tasks: updated });
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {selectedNode.tasks.length === 0 && (
                      <div className="text-center py-10 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 opacity-40">
                         <p className="text-[10px] font-bold">هیچ اقدامی ثبت نشده است</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button 
                  onClick={() => addNode(selectedNode.id)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[24px] text-xs font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  زیرمجموعه جدید
                </button>
                {selectedNode.id !== 'root' && (
                  <button 
                    onClick={() => deleteNode(selectedNode.id)}
                    className="p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[24px] transition-all border border-rose-500/20 active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State Overlay */}
        {!activeProject && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-10 bg-slate-50 dark:bg-slate-950">
            <div className="w-32 h-32 rounded-[48px] bg-indigo-600/5 flex items-center justify-center mb-8 animate-pulse">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin-slow" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>شروع خلاقیت و برنامه‌ریزی</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">پروژه‌های بارش فکری (Brainstorming) به شما کمک می‌کنند ایده‌های خام خود را ساختاردهی کنید.</p>
            <button 
              onClick={createProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[32px] text-sm font-black shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              ساخت اولین پروژه
            </button>
          </div>
        )}
      </div>

      {/* Archive Modal Section */}
      <AnimatePresence>
        {showArchiveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowArchiveModal(false)} className="fixed inset-0 bg-black/70 backdrop-blur-lg" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className={`relative w-full max-w-xl rounded-[56px] border shadow-2xl overflow-hidden ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-10 flex items-center justify-between border-b border-dashed border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-[28px] bg-amber-500/10 text-amber-500 shadow-inner">
                    <Archive className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>بایگانی پروژه‌ها</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">مدیریت و بازگردانی ایده‌های آرشیو شده</p>
                  </div>
                </div>
                <button onClick={() => setShowArchiveModal(false)} className={`p-3 rounded-2xl transition-all ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}`}>
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-10 max-h-[450px] overflow-y-auto custom-scrollbar space-y-4">
                {projects.filter(p => p.isArchived).map(project => (
                  <div key={project.id} className={`flex items-center justify-between p-5 rounded-[32px] border transition-all ${
                    isLight ? 'bg-slate-50 border-slate-100 hover:border-indigo-200' : 'bg-slate-950 border-slate-800 hover:border-indigo-900'
                  }`}>
                    <div className="flex flex-col gap-1.5 px-2">
                      <span className={`text-sm font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{project.title}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">ساخته شده: {new Date(project.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleArchiveProject(project.id)}
                        className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all border border-emerald-500/20 active:scale-90"
                        title="خروج از آرشیو"
                      >
                        <ArchiveRestore className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteProject(project.id)}
                        className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-500/20 active:scale-90"
                        title="حذف دائمی"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {projects.filter(p => p.isArchived).length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <FolderOpen className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">آرشیو خالی است</p>
                  </div>
                )}
              </div>

              <div className="p-10 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setShowArchiveModal(false)} 
                  className={`w-full py-5 rounded-[24px] text-xs font-black transition-all ${
                    isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  بستن پنل بایگانی
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
