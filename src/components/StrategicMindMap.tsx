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
  ArchiveRestore
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
  const [showArchived, setShowArchived] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme.startsWith('light-');

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('roadmap_brainstorming_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure every project has at least one node (root)
        const validated = parsed.map((p: any) => {
          if (!p.nodes || p.nodes.length === 0) {
            return {
              ...p,
              nodes: [
                {
                  id: 'root',
                  text: 'موضوع مرکزی',
                  x: 1400,
                  y: 1400,
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
        title: 'پروژه جدید بارش فکری',
        createdAt: new Date().toISOString(),
        isArchived: false,
        nodes: [
          {
            id: 'root',
            text: 'موضوع مرکزی',
            x: 1400,
            y: 1400,
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
          x: 1400,
          y: 1400,
          color: COLORS[0],
          children: [],
          tasks: []
        }
      ]
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setIsSidebarOpen(true);
  };

  const toggleArchiveProject = (id: string) => {
    const updatedProjects = projects.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p);
    setProjects(updatedProjects);
    
    // If we just archived the currently active project, switch to another active one if available
    if (id === activeProjectId) {
      const firstActive = updatedProjects.find(p => !p.isArchived);
      if (firstActive) {
        setActiveProjectId(firstActive.id);
      } else if (updatedProjects.length > 0) {
        setActiveProjectId(updatedProjects[0].id);
      } else {
        setActiveProjectId(null);
      }
    }
  };

  const deleteProject = (id: string) => {
    if (confirm('آیا از حذف کامل این پروژه اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
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
    // Position the new node relative to parent with some offset
    const newNode: BrainstormingNode = {
      id: newNodeId,
      text: 'موضوع جدید',
      x: parent.x + (Math.random() - 0.5) * 300,
      y: parent.y + 180,
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

  const addTask = (nodeId: string) => {
    if (!activeProject) return;
    const node = activeProject.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const newTask: ChecklistItem = {
      id: 'task-' + Date.now(),
      text: 'اقدام جدید',
      completed: false
    };

    updateNode(nodeId, { tasks: [...node.tasks, newTask] });
  };

  const toggleTask = (nodeId: string, taskId: string) => {
    if (!activeProject) return;
    const node = activeProject.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const updatedTasks = node.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateNode(nodeId, { tasks: updatedTasks });
  };

  const updateTaskText = (nodeId: string, taskId: string, text: string) => {
    if (!activeProject) return;
    const node = activeProject.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const updatedTasks = node.tasks.map(t => t.id === taskId ? { ...t, text } : t);
    updateNode(nodeId, { tasks: updatedTasks });
  };

  const deleteTask = (nodeId: string, taskId: string) => {
    if (!activeProject) return;
    const node = activeProject.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const updatedTasks = node.tasks.filter(t => t.id !== taskId);
    updateNode(nodeId, { tasks: updatedTasks });
  };

  const handleDownload = () => {
    if (!activeProject) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `brainstorming_${activeProject.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.id && json.nodes) {
          // Ensure ID is unique if importing
          const importedProject = { ...json, id: 'proj-imported-' + Date.now() };
          setProjects([importedProject, ...projects]);
          setActiveProjectId(importedProject.id);
          setIsSidebarOpen(true);
        }
      } catch (err) {
        alert('خطا در خواندن فایل');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScreenshot = async () => {
    if (canvasRef.current) {
      const dataUrl = await toPng(canvasRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `brainstorming_${activeProject?.title || 'project'}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const centerView = () => {
    if (canvasRef.current) {
      const container = canvasRef.current.parentElement;
      if (!container) return;

      const rootNode = activeProject?.nodes.find(n => n.id === 'root') || activeProject?.nodes[0];
      if (rootNode) {
        // Center the root node in the viewport
        container.scrollTo({
          left: rootNode.x - container.clientWidth / 2 + 96,
          top: rootNode.y - container.clientHeight / 2 + 40,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      const timer = setTimeout(centerView, 300);
      return () => clearTimeout(timer);
    }
  }, [activeProjectId]);

  const selectedNode = activeProject?.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden relative" dir="rtl">
      
      {/* Top Header / Action Bar */}
      <div className={`px-6 py-4 border-b flex items-center justify-between gap-4 z-50 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-xl border transition-all ${
              isSidebarOpen 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-400'
            }`}
            title="باز و بسته کردن منو"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          
          <h2 className={`text-sm font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>
            {activeProject?.title || 'بارش فکری'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={centerView}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
            title="مرکز نقشه"
          >
            <Maximize2 className="w-4.5 h-4.5" />
            <span className="text-[10px] font-bold hidden sm:inline">تمرکز</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".json" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
            title="آپلود پروژه"
          >
            <Upload className="w-4.5 h-4.5" />
            <span className="text-[10px] font-bold hidden sm:inline">آپلود</span>
          </button>
          <button 
            onClick={handleDownload}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
            title="دانلود پروژه"
          >
            <Download className="w-4.5 h-4.5" />
            <span className="text-[10px] font-bold hidden sm:inline">دانلود</span>
          </button>
          <button 
            onClick={handleScreenshot}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
            title="عکس از نقشه"
          >
            <Camera className="w-4.5 h-4.5" />
            <span className="text-[10px] font-bold hidden sm:inline">عکس گرفتن</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Editor (On the Right) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`h-full border-l flex flex-col overflow-hidden relative z-40 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                
                {/* Node Editor Section */}
                {selectedNode ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                          <Type className="w-4 h-4" />
                        </div>
                        <h3 className={`font-black text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>ویرایش موضوع</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedNodeId(null)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">عنوان موضوع</label>
                        <textarea
                          value={selectedNode.text}
                          onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                          placeholder="چیزی بنویسید..."
                          className={`w-full px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none border transition-all resize-none h-24 leading-relaxed ${
                            isLight 
                              ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' 
                              : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 block">رنگ گره</label>
                        <div className="grid grid-cols-4 gap-2">
                          {COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => updateNode(selectedNode.id, { color })}
                              className={`h-8 rounded-lg border-2 transition-transform active:scale-90 ${
                                selectedNode.color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <ListTodo className="w-3.5 h-3.5" />
                            لیست اقدامات
                          </label>
                          <button 
                            onClick={() => addTask(selectedNode.id)}
                            className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          >
                            <PlusCircle className="w-3 h-3" />
                            افزودن
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {selectedNode.tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 group">
                              <button 
                                onClick={() => toggleTask(selectedNode.id, task.id)}
                                className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-indigo-500'}`}
                              >
                                {task.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </button>
                              <input 
                                type="text"
                                value={task.text}
                                onChange={(e) => updateTaskText(selectedNode.id, task.id, e.target.value)}
                                className={`flex-1 bg-transparent text-[11px] font-medium focus:outline-none border-b border-transparent focus:border-indigo-500/30 py-0.5 transition-all ${
                                  task.completed ? 'line-through opacity-40 text-slate-500' : isLight ? 'text-slate-700' : 'text-slate-200'
                                }`}
                              />
                              <button 
                                onClick={() => deleteTask(selectedNode.id, task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {selectedNode.tasks.length === 0 && (
                            <div className={`text-center py-6 border border-dashed rounded-2xl opacity-40 text-[10px] font-bold ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
                              هنوز اقدامی تعریف نشده است
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 flex gap-2">
                        <button
                          onClick={() => addNode(selectedNode.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          انشعاب جدید
                        </button>
                        {selectedNode.id !== 'root' && (
                          <button
                            onClick={() => deleteNode(selectedNode.id)}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-3.5 rounded-2xl transition-all border border-rose-500/20"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeProject ? (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <h3 className={`font-black text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>تنظیمات پروژه فعلی</h3>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">عنوان پروژه</label>
                        <input
                          type="text"
                          value={activeProject.title}
                          onChange={(e) => updateProjectTitle(activeProject.id, e.target.value)}
                          className={`w-full px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none border transition-all ${
                            isLight 
                              ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' 
                              : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Plus className="w-4 h-4" />
                          </div>
                          <h3 className={`font-black text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>پروژه‌ها</h3>
                        </div>
                        <button 
                          onClick={createProject}
                          className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tabs for Active/Archived */}
                      <div className={`flex p-1 rounded-xl gap-1 ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
                        <button
                          onClick={() => setShowArchived(false)}
                          className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                            !showArchived 
                              ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          فعال
                        </button>
                        <button
                          onClick={() => setShowArchived(true)}
                          className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                            showArchived 
                              ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' 
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          بایگانی
                        </button>
                      </div>

                      <div className="space-y-2">
                        {projects.filter(p => p.isArchived === showArchived).map(project => (
                          <div 
                            key={project.id}
                            className={`group flex flex-col p-2 rounded-xl border transition-all cursor-pointer ${
                              activeProjectId === project.id
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                : isLight ? 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700' : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800 text-slate-400'
                            }`}
                            onClick={() => setActiveProjectId(project.id)}
                          >
                            <div className="flex items-center justify-between">
                              {editingProjectId === project.id ? (
                                <input
                                  autoFocus
                                  value={project.title}
                                  onChange={(e) => updateProjectTitle(project.id, e.target.value)}
                                  onBlur={() => setEditingProjectId(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingProjectId(null)}
                                  className="bg-white/20 text-white px-2 py-1 rounded text-[11px] font-bold w-full focus:outline-none"
                                />
                              ) : (
                                <span className="text-[11px] font-bold truncate flex-1 ml-2">{project.title}</span>
                              )}
                              <div className={`flex items-center gap-1 transition-opacity ${editingProjectId === project.id ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingProjectId(project.id); }}
                                  className={`p-1 rounded-md ${activeProjectId === project.id ? 'hover:bg-white/20 text-white/70' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'}`}
                                >
                                  <Settings2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleArchiveProject(project.id); }}
                                  className={`p-1 rounded-md ${activeProjectId === project.id ? 'hover:bg-white/20 text-white/70' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-500'}`}
                                  title={project.isArchived ? 'بازگردانی' : 'بایگانی'}
                                >
                                  {project.isArchived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                  className={`p-1 rounded-md ${activeProjectId === project.id ? 'hover:bg-white/20 text-white/70' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500'}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {projects.filter(p => p.isArchived === showArchived).length === 0 && (
                          <div className="text-center py-8 opacity-40 text-[9px] font-bold border border-dashed rounded-xl">
                            پروژه‌ای در این بخش نیست
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <button 
                      onClick={createProject}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-xl"
                    >
                      شروع اولین پروژه
                    </button>
                  </div>
                )}

                <div className="mt-auto p-4 border border-dashed rounded-3xl opacity-60 text-center">
                  <Move className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="text-[9px] font-bold leading-relaxed">
                    موضوعات را جابه‌جا کنید.
                    <br/>برای ویرایش، روی موضوع کلیک کنید.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Area */}
        <div 
          className={`flex-1 relative overflow-auto custom-scrollbar ${
            isLight ? 'bg-white' : 'bg-black'
          }`} 
        >
          <div 
            ref={canvasRef}
            className="min-w-[3000px] min-h-[3000px] relative p-40"
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {activeProject?.nodes.map(node => node.children.map(childId => {
                const child = activeProject.nodes.find(n => n.id === childId);
                if (!child) return null;
                
                // Calculate line points (center to center)
                const x1 = node.x + 96;
                const y1 = node.y + 35;
                const x2 = child.x + 96;
                const y2 = child.y + 35;

                return (
                  <path
                    key={`${node.id}-${child.id}`}
                    d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              }))}
            </svg>

            {activeProject?.nodes.map(node => (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                   const updatedNodes = activeProject.nodes.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n);
                   updateActiveProjectNodes(updatedNodes);
                }}
                initial={false}
                animate={{ x: node.x, y: node.y }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                  if (!isSidebarOpen) setIsSidebarOpen(true);
                }}
                className={`absolute w-48 p-4 rounded-2xl border-2 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 ${
                  selectedNodeId === node.id
                    ? 'border-white scale-105 shadow-2xl z-40 ring-4 ring-indigo-500/20'
                    : 'border-transparent shadow-lg z-20'
                }`}
                style={{ backgroundColor: node.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white text-[11px] font-black text-right leading-relaxed drop-shadow-sm flex-1 line-clamp-3">
                    {node.text}
                  </p>
                  {node.tasks.length > 0 && (
                    <div className="bg-white/20 px-1.5 py-0.5 rounded text-[8px] text-white font-bold shrink-0">
                      {node.tasks.filter(t => t.completed).length}/{node.tasks.length}
                    </div>
                  )}
                </div>
                
                {selectedNodeId === node.id && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 text-indigo-600 shadow-xl z-50 border border-slate-100"
                  >
                    <Plus className="w-3 h-3" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State when no project */}
        {!activeProject && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-10 bg-slate-50 dark:bg-slate-950">
            <div className="p-8 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-6">
              <GitBranch className="w-16 h-16 text-indigo-500 opacity-20" />
            </div>
            <h3 className={`text-xl font-black mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>هیچ پروژه‌ای فعال نیست</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-8">یک پروژه جدید بسازید تا بارش فکری خود را آغاز کنید.</p>
            <button 
              onClick={createProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              ایجاد اولین پروژه
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
