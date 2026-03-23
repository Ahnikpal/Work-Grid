import { create } from 'zustand';
import { Task, Status, Priority, User, PresenceUser } from './types';
import { generateMockTasks, USERS } from './mockData';

interface ProjectState {
  tasks: Task[];
  users: User[];
  presenceUsers: PresenceUser[];
  filter: {
    status: Status[];
    priority: Priority[];
    assignee: string[];
    dateRange: { from: string; to: string };
  };
  draggedTaskId: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  updatePresence: (presence: PresenceUser[]) => void;
  setFilter: (filter: Partial<ProjectState['filter']>) => void;
  setDraggedTaskId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  tasks: generateMockTasks(500),
  users: USERS,
  presenceUsers: [],
  filter: {
    status: [],
    priority: [],
    assignee: [],
    dateRange: { from: '', to: '' },
  },
  draggedTaskId: null,

  setTasks: (tasks: Task[]) => set({ tasks }),
  
  updateTaskStatus: (taskId: string, status: Status) => set((state: ProjectState) => ({
    tasks: state.tasks.map((task: Task) => 
      task.id === taskId ? { ...task, status } : task
    ),
  })),

  updatePresence: (presenceUsers: PresenceUser[]) => set({ presenceUsers }),

  setFilter: (newFilter: Partial<ProjectState['filter']>) => set((state: ProjectState) => ({
    filter: { ...state.filter, ...newFilter },
  })),

  setDraggedTaskId: (id: string | null) => set({ draggedTaskId: id }),
}));
