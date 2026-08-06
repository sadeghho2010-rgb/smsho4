import { Program, Challenge, RoadmapPath, RoadmapNode, TodoItem, WeeklyTask, CalendarEvent } from '../types';
import { INITIAL_PROGRAMS } from '../data/initialData';

const getProgramsKey = (username: string) => `long_term_roadmap_planner_programs_${username || 'guest'}`;
const getChallengesKey = (username: string) => `long_term_roadmap_planner_challenges_${username || 'guest'}`;
const getTodosKey = (username: string) => `long_term_roadmap_planner_todos_${username || 'guest'}`;
const getWeeklyTasksKey = (username: string) => `long_term_roadmap_planner_weekly_${username || 'guest'}`;
const getEventsKey = (username: string) => `long_term_roadmap_planner_events_${username || 'guest'}`;

export const loadPrograms = (username: string): Program[] => {
  try {
    const key = getProgramsKey(username);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((p: any): Program => ({
          id: p.id || `prog-${Date.now()}-${Math.random()}`,
          title: p.title || 'برنامه جامع',
          description: p.description || '',
          paths: Array.isArray(p.paths) ? p.paths.map((path: any): RoadmapPath => ({
            id: path.id || `path-${Date.now()}-${Math.random()}`,
            title: path.title || 'سیر جدید',
            description: path.description || '',
            color: path.color || 'indigo',
            nodes: Array.isArray(path.nodes) ? path.nodes.map((node: any): RoadmapNode => ({
              id: node.id || `node-${Date.now()}-${Math.random()}`,
              title: node.title || 'گام جدید',
              description: node.description || '',
              status: node.status || 'NOT_STARTED',
              parentId: node.parentId !== undefined ? node.parentId : null,
              checklist: Array.isArray(node.checklist) ? node.checklist.map((c: any) => ({
                id: c.id || `item-${Date.now()}-${Math.random()}`,
                text: c.text || '',
                completed: !!c.completed
              })) : [],
              createdAt: node.createdAt || new Date().toISOString()
            })) : []
          })) : [],
          createdAt: p.createdAt || new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load programs from localStorage:', error);
  }
  return INITIAL_PROGRAMS;
};

export const savePrograms = (programs: Program[], username: string) => {
  try {
    const key = getProgramsKey(username);
    localStorage.setItem(key, JSON.stringify(programs));
  } catch (error) {
    console.error('Failed to save programs to localStorage:', error);
  }
};

// Challenges and habits storage
export const loadChallenges = (username: string): Challenge[] => {
  try {
    const key = getChallengesKey(username);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((c: any): Challenge => ({
          id: c.id || `chal-${Date.now()}-${Math.random()}`,
          title: c.title || 'عادت جدید',
          durationDays: Number(c.durationDays) || 30,
          completedDays: Array.isArray(c.completedDays) ? c.completedDays.filter((d: any) => typeof d === 'number') : [],
          createdAt: c.createdAt || new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load challenges from localStorage:', error);
  }
  // Default demo challenges for new users
  return [
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
};

export const saveChallenges = (challenges: Challenge[], username: string) => {
  try {
    const key = getChallengesKey(username);
    localStorage.setItem(key, JSON.stringify(challenges));
  } catch (error) {
    console.error('Failed to save challenges to localStorage:', error);
  }
};

export const loadTodos = (username: string): TodoItem[] => {
  try {
    const key = getTodosKey(username);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((t: any): TodoItem => ({
          id: t.id || `todo-${Date.now()}-${Math.random()}`,
          title: t.title || 'کار جدید',
          description: t.description || '',
          completed: !!t.completed,
          subTasks: Array.isArray(t.subTasks) ? t.subTasks.map((s: any) => ({
            id: s.id || `sub-${Date.now()}-${Math.random()}`,
            title: s.title || '',
            completed: !!s.completed
          })) : [],
          createdAt: t.createdAt || new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load todos from localStorage:', error);
  }
  // Default demo todos
  return [];
};

export const saveTodos = (todos: TodoItem[], username: string) => {
  try {
    const key = getTodosKey(username);
    localStorage.setItem(key, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error);
  }
};

export const loadWeeklyTasks = (username: string): WeeklyTask[] => {
  try {
    const key = getWeeklyTasksKey(username);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load weekly tasks from localStorage:', error);
  }
  return [];
};

export const saveWeeklyTasks = (tasks: WeeklyTask[], username: string) => {
  try {
    const key = getWeeklyTasksKey(username);
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save weekly tasks to localStorage:', error);
  }
};

export const loadEvents = (username: string): CalendarEvent[] => {
  try {
    const key = getEventsKey(username);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load events from localStorage:', error);
  }
  return [];
};

export const saveEvents = (events: CalendarEvent[], username: string) => {
  try {
    const key = getEventsKey(username);
    localStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events to localStorage:', error);
  }
};

export const downloadBackup = (programs: Program[], challenges: Challenge[], todos: TodoItem[], username: string) => {
  const data = {
    username,
    backupDate: new Date().toISOString(),
    programs,
    challenges,
    todos
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const date = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("download", `long_term_roadmap_backup_${username || 'guest'}_${date}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export interface DecryptedBackup {
  programs: Program[];
  challenges: Challenge[];
  todos?: TodoItem[];
}

export const parseBackupFile = (file: File): Promise<DecryptedBackup> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result);
        
        // Support legacy format as well as new format
        if (Array.isArray(parsed)) {
          resolve({
            programs: parsed,
            challenges: [],
            todos: []
          });
        } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.programs)) {
          resolve({
            programs: parsed.programs,
            challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
            todos: Array.isArray(parsed.todos) ? parsed.todos : []
          });
        } else {
          reject(new Error('فرمت فایل پشتیبان معتبر نیست.'));
        }
      } catch {
        reject(new Error('خطا در خواندن فایل. لطفا مطمئن شوید فایل JSON معتبر انتخاب کرده‌اید.'));
      }
    };
    reader.onerror = () => reject(new Error('خطا در خواندن فایل.'));
    reader.readAsText(file);
  });
};

