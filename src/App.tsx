import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  HelpCircle, 
  Compass, 
  Plus, 
  Info, 
  BookOpen, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  GitCommit,
  Award,
  Flame,
  Layers
} from 'lucide-react';
import { Program, RoadmapPath, RoadmapNode, Challenge, AppTheme, AppMode, AppTab, TodoItem, WeeklyTask, CalendarEvent, Message } from './types';
import { loadPrograms, savePrograms, loadChallenges, saveChallenges, loadTodos, saveTodos, loadWeeklyTasks, saveWeeklyTasks, loadEvents, saveEvents, DecryptedBackup } from './utils/localStorage';
import * as jalaali from 'jalaali-js';
import { INITIAL_PROGRAMS } from './data/initialData';
import Header from './components/Header';
import Flowchart from './components/Flowchart';
import ChallengesTracker from './components/ChallengesTracker';
import MindMap from './components/MindMap';
import DailyTodos from './components/DailyTodos';
import Sidebar from './components/Sidebar';
import WeeklyPlanner from './components/WeeklyPlanner';
import Events from './components/Events';
import AiConsultant from './components/AiConsultant';

const THEME_CLASSES: Record<AppTheme, string> = {
  'cyber-gradient': 'from-indigo-950 via-slate-900 to-purple-950',
  'forest-zen': 'from-emerald-950 via-zinc-900 to-teal-950',
  'sunset-glow': 'from-slate-950 via-purple-950 to-orange-950/40',
  'royal-classic': 'from-blue-950 via-slate-900 to-indigo-950',
  'midnight-deep': 'from-black via-neutral-950 to-zinc-900',
  'light-emerald': 'from-[#fcfdfc] via-[#f1fcf5] to-[#e8f7ee]',
  'light-royal': 'from-[#f9fbfe] via-[#f0f4f9] to-[#e6ecf5]',
  'light-warm': 'from-[#fffdfa] via-[#fdf7f0] to-[#f8eee0]',
};

export default function App() {
  // Auth State
  const [currentUser] = useState<{ username: string; role: 'admin' | 'user' }>({ 
    username: 'کاربر', 
    role: 'user' 
  });

  // App Settings
  const [theme, setTheme] = useState<AppTheme>('cyber-gradient');
  const [mode, setMode] = useState<AppMode>('advanced');
  const [activeTab, setActiveTab] = useState<AppTab>('daily-todos');

  // Isolated Data State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string>('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);

  // Responsive Sidebar: Closed by default on all screens
  useEffect(() => {
    const handleResize = () => {
      // Auto-close if resizing down, but don't auto-open
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Initial restoration check
  useEffect(() => {
    const savedTheme = localStorage.getItem('roadmap_planner_theme') as AppTheme;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedMode = localStorage.getItem('roadmap_planner_mode') as AppMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // 2. Load data
  useEffect(() => {
    const userPrograms = loadPrograms(currentUser.username);
    setPrograms(userPrograms);
    if (userPrograms.length > 0) {
      setActiveProgramId(userPrograms[0].id);
    } else {
      setActiveProgramId('');
    }

    const userChallenges = loadChallenges(currentUser.username);
    setChallenges(userChallenges);

    const userTodos = loadTodos(currentUser.username);
    setTodos(userTodos);

    const userWeekly = loadWeeklyTasks(currentUser.username);
    setWeeklyTasks(userWeekly);

    const userEvents = loadEvents(currentUser.username);
    setEvents(userEvents);
  }, [currentUser]);

  // Automated Task Generation from Events
  const refreshAutoTasks = (currentTodos: TodoItem[], currentEvents: CalendarEvent[]): { updatedTodos: TodoItem[]; changed: boolean } => {
    if (!currentUser) return { updatedTodos: currentTodos, changed: false };
    
    const now = new Date();
    const todayJ = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const todayStr = `${todayJ.jy}/${String(todayJ.jm).padStart(2, '0')}/${String(todayJ.jd).padStart(2, '0')}`;
    
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    const tomorrowJ = jalaali.toJalaali(tomorrowDate.getFullYear(), tomorrowDate.getMonth() + 1, tomorrowDate.getDate());
    const tomorrowStr = `${tomorrowJ.jy}/${String(tomorrowJ.jm).padStart(2, '0')}/${String(tomorrowJ.jd).padStart(2, '0')}`;
    
    let updatedTodos = [...currentTodos];
    let changed = false;

    const neededTasks: { title: string; sourceEventId: string; dateType: 'today' | 'tomorrow' }[] = [];
    currentEvents.forEach(event => {
      const [eY, eM, eD] = event.date.split('/').map(Number);
      
      const isTodayEvent = (event.isYearly && eM === todayJ.jm && eD === todayJ.jd) || 
                          (!event.isYearly && event.date === todayStr);
                          
      const isTomorrowEvent = (event.isYearly && eM === tomorrowJ.jm && eD === tomorrowJ.jd) || 
                             (!event.isYearly && event.date === tomorrowStr);

      if (isTodayEvent) {
        neededTasks.push({ title: event.title, sourceEventId: event.id, dateType: 'today' });
      } else if (isTomorrowEvent) {
        neededTasks.push({ title: `فردا: ${event.title}`, sourceEventId: event.id, dateType: 'tomorrow' });
      }
    });

    // Filter out auto-tasks that are no longer relevant
    const initialCount = updatedTodos.length;
    updatedTodos = updatedTodos.filter(t => {
      if (!t.isAutoGenerated) return true;
      // Keep if it's in neededTasks
      return neededTasks.some(nt => nt.sourceEventId === t.sourceEventId && nt.title === t.title);
    });
    if (updatedTodos.length !== initialCount) changed = true;

    // Add missing needed tasks
    neededTasks.forEach(nt => {
      const exists = updatedTodos.some(t => t.sourceEventId === nt.sourceEventId && t.title === nt.title);
      if (!exists) {
        updatedTodos.push({
          id: `auto-${nt.sourceEventId}-${nt.dateType}-${Date.now()}`,
          title: nt.title,
          completed: false,
          subTasks: [],
          createdAt: new Date().toISOString(),
          isAutoGenerated: true,
          sourceEventId: nt.sourceEventId
        });
        changed = true;
      }
    });

    return { updatedTodos, changed };
  };

  useEffect(() => {
    const result = refreshAutoTasks(todos, events);
    if (result.changed) {
      setTodos(result.updatedTodos);
      saveTodos(result.updatedTodos, currentUser.username);
    }
  }, [events, currentUser]);

  // Sync Programs on Edit
  const handleUpdateProgramsList = (updatedList: Program[]) => {
    setPrograms(updatedList);
    savePrograms(updatedList, currentUser.username);
  };

  // Sync Challenges on Edit
  const handleUpdateChallengesList = (updatedList: Challenge[]) => {
    setChallenges(updatedList);
    saveChallenges(updatedList, currentUser.username);
  };

  // Sync Todos on Edit
  const handleUpdateTodosList = (updatedList: TodoItem[]) => {
    setTodos(updatedList);
    saveTodos(updatedList, currentUser.username);
  };

  // Sync Weekly Tasks
  const handleUpdateWeeklyTasks = (updatedList: WeeklyTask[]) => {
    setWeeklyTasks(updatedList);
    saveWeeklyTasks(updatedList, currentUser.username);
  };

  const handleUpdateEvents = (updatedList: CalendarEvent[]) => {
    setEvents(updatedList);
    saveEvents(updatedList, currentUser.username);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    const updatedList = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updatedList);
    saveEvents(updatedList, currentUser.username);
  };

  const handleAddProgram = (title: string, description: string, timingData?: { timingType: 'days' | 'date', dueDate?: string, durationDays?: number }) => {
    const newProg: Program = {
      id: `prog-${Date.now()}`,
      title,
      description,
      paths: [],
      createdAt: new Date().toISOString(),
      timingType: timingData?.timingType || 'date',
      dueDate: timingData?.dueDate,
      durationDays: timingData?.durationDays
    };
    const updated = [...programs, newProg];
    handleUpdateProgramsList(updated);
    setActiveProgramId(newProg.id);
  };

  const handleUpdateProgram = (updatedProgram: Program) => {
    const updated = programs.map(p => p.id === updatedProgram.id ? updatedProgram : p);
    handleUpdateProgramsList(updated);
  };

  const handleUpdateProgramTitleDesc = (id: string, title: string, description: string, timingData?: { timingType: 'days' | 'date', dueDate?: string, durationDays?: number }) => {
    const updated = programs.map(p => p.id === id ? { 
      ...p, 
      title, 
      description,
      timingType: timingData?.timingType || p.timingType,
      dueDate: timingData?.dueDate,
      durationDays: timingData?.durationDays
    } : p);
    handleUpdateProgramsList(updated);
  };

  const handleDeleteProgram = (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    handleUpdateProgramsList(updated);
    if (updated.length > 0) {
      setActiveProgramId(updated[0].id);
    } else {
      const fallbackProg: Program = {
        id: `prog-${Date.now()}`,
        title: 'برنامه مطالعه روزانه',
        description: 'یک برنامه ساده برای مطالعه کتاب‌های جدید در سال جاری',
        paths: [],
        createdAt: new Date().toISOString()
      };
      handleUpdateProgramsList([fallbackProg]);
      setActiveProgramId(fallbackProg.id);
    }
  };

  const handleRestoreBackup = (backup: DecryptedBackup) => {
    if (backup.programs && backup.programs.length > 0) {
      handleUpdateProgramsList(backup.programs);
      setActiveProgramId(backup.programs[0].id);
    }
    if (backup.challenges) {
      handleUpdateChallengesList(backup.challenges);
    }
    if (backup.todos) {
      handleUpdateTodosList(backup.todos);
    }
  };

  const handleResetToDefaults = () => {
    handleUpdateProgramsList(INITIAL_PROGRAMS);
    if (INITIAL_PROGRAMS.length > 0) {
      setActiveProgramId(INITIAL_PROGRAMS[0].id);
    }
    
    // Reset to default challenges too
    if (currentUser) {
      const defaultChallenges = [
        {
          id: 'chal-1',
          title: 'چالش ۳۰ روزه یادگیری و کدنویسی مستمر',
          durationDays: 30,
          completedDays: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16],
          createdAt: new Date().toISOString()
        },
        {
          id: 'chal-2',
          title: 'عادت سحرخیزی (بیداری قبل از ۷ صبح)',
          durationDays: 15,
          completedDays: [1, 2, 3, 5, 6, 7, 10],
          createdAt: new Date().toISOString()
        }
      ];
      handleUpdateChallengesList(defaultChallenges);
    }
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('roadmap_planner_theme', newTheme);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('roadmap_planner_mode', newMode);
  };

  const activeProgram = programs.find(p => p.id === activeProgramId) || programs[0];

  // Calculate statistics for active program
  const getStats = () => {
    if (!activeProgram) return { pathsCount: 0, totalNodes: 0, completedNodes: 0, pendingNodes: 0 };
    
    let totalNodes = 0;
    let completedNodes = 0;
    let pendingNodes = 0;

    activeProgram.paths.forEach(p => {
      p.nodes.forEach(n => {
        totalNodes++;
        if (n.status === 'COMPLETED') completedNodes++;
        else pendingNodes++;
      });
    });

    return {
      pathsCount: activeProgram.paths.length,
      totalNodes,
      completedNodes,
      pendingNodes
    };
  };

  const stats = getStats();

  const isLight = theme.startsWith('light-');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'daily-todos':
        return <DailyTodos todos={todos} onUpdateTodos={handleUpdateTodosList} weeklyTasks={weeklyTasks} onUpdateWeeklyTasks={handleUpdateWeeklyTasks} isLight={isLight} />;
      case 'weekly-planner':
        return <WeeklyPlanner theme={theme} tasks={weeklyTasks} onUpdateTasks={handleUpdateWeeklyTasks} />;
      case 'challenges':
        return <ChallengesTracker challenges={challenges} onUpdateChallenges={handleUpdateChallengesList} isLight={isLight} />;
      case 'programs':
        return (
          <div className="space-y-6">
            <>
              {/* Quick Stats bar & Core Flowchart / Mind Map based on Mode */}
              {mode === 'diagram' ? (
                <MindMap 
                  programs={programs}
                  activeProgramId={activeProgramId}
                  onUpdateProgram={handleUpdateProgram}
                  onUpdateAllPrograms={handleUpdateProgramsList}
                  onAddProgram={handleAddProgram}
                  isLight={isLight}
                />
              ) : (
                <>
                  {/* Quick Stats bar */}
                  {activeProgram && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                        <div>
                          <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>تعداد سیرها (شاخه‌ها)</p>
                          <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>{stats.pathsCount}</p>
                        </div>
                        <div className={`p-2 ${isLight ? 'bg-slate-100 text-emerald-600 border-slate-200' : 'bg-slate-950 text-indigo-400 border-slate-800'} rounded-xl border`}>
                          <GitBranch className="w-5 h-5" />
                        </div>
                      </div>

                      <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                        <div>
                          <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>کل گام‌های برنامه‌ریزی</p>
                          <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} mt-1`}>{stats.totalNodes}</p>
                        </div>
                        <div className={`p-2 ${isLight ? 'bg-slate-100 text-sky-600 border-slate-200' : 'bg-slate-950 text-sky-400 border-slate-800'} rounded-xl border`}>
                          <GitCommit className="w-5 h-5" />
                        </div>
                      </div>

                      <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                        <div>
                          <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>گام‌های تکمیل‌شده</p>
                          <p className="text-lg font-black text-emerald-600 mt-1">{stats.completedNodes}</p>
                        </div>
                        <div className={`p-2 ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-950 text-emerald-400 border-slate-800'} rounded-xl border`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>

                      <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900/70 border-slate-850'} border p-4 rounded-2xl flex items-center justify-between transition-all duration-300`}>
                        <div>
                          <p className={`text-[10px] ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}`}>در حال اقدام یا تعلیق</p>
                          <p className="text-lg font-black text-amber-600 mt-1">{stats.pendingNodes}</p>
                        </div>
                        <div className={`p-2 ${isLight ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-950 text-amber-400 border-slate-800'} rounded-xl border`}>
                          <Activity className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Core Flowchart */}
                  {activeProgram ? (
                    <Flowchart 
                      program={activeProgram}
                      mode={mode}
                      onUpdateProgram={handleUpdateProgram}
                      isLight={isLight}
                    />
                  ) : (
                    <div className="text-center py-20 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-4">
                      <Compass className="w-10 h-10 text-slate-650 mx-auto animate-spin-slow" />
                      <p className="text-xs text-slate-400">یک برنامه جامع جدید بسازید تا فلوچارت آن آماده شود.</p>
                      <button
                        onClick={() => handleAddProgram('برنامه مطالعه روزانه', 'یک برنامه ساده برای مطالعه کتاب‌های جدید در سال جاری')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                      >
                        ایجاد یک برنامه پیش‌فرض
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          </div>
        );
      case 'strategic-mind-map':
        return (
          <div className={`p-12 text-center rounded-3xl border border-dashed ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <h2 className="text-xl font-black mb-4">بارش فکری</h2>
            <p className="text-sm text-slate-500">این بخش به زودی بازطراحی خواهد شد.</p>
          </div>
        );
      case 'events':
        return (
          <Events 
            events={events}
            onAddEvent={(e) => handleUpdateEvents([...events, e])}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={(id) => handleUpdateEvents(events.filter(e => e.id !== id))}
            theme={theme}
          />
        );
      case 'ai-consultant':
        return (
          <AiConsultant 
            theme={theme} 
            messages={aiMessages}
            onUpdateMessages={setAiMessages}
            onClose={() => setActiveTab('daily-todos')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${THEME_CLASSES[theme]} ${isLight ? 'text-slate-800' : 'text-slate-100'} font-sans antialiased selection:bg-emerald-500 selection:text-white pb-24 transition-all duration-300`} 
      dir="rtl"
    >
      
      {/* Background radial overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[150px]" />
      </div>

      {/* Header Container */}
      <Header 
        programs={programs}
        challenges={challenges}
        todos={todos}
        activeProgramId={activeProgramId}
        username={currentUser.username}
        activeTheme={theme}
        activeMode={mode}
        activeTab={activeTab}
        onSelectProgram={setActiveProgramId}
        onAddProgram={handleAddProgram}
        onUpdateProgramTitleDesc={handleUpdateProgramTitleDesc}
        onDeleteProgram={handleDeleteProgram}
        onRestoreBackup={handleRestoreBackup}
        onResetToDefaults={handleResetToDefaults}
        onThemeChange={handleThemeChange}
        onModeChange={handleModeChange}
        onTabChange={setActiveTab}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
      />

      {/* Main Content Stage */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Render Tab based on state */}
        {renderActiveTab()}

      </main>
    </div>
  );
}
