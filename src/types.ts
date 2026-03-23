export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee: User;
  startDate?: string; // ISO string
  dueDate: string; // ISO string
  createdAt: string; // ISO string
}

export interface DragState {
  taskId: string;
  sourceStatus: Status;
  isOver: Status | null;
}

export interface PresenceUser extends User {
  currentTaskId?: string;
  lastActive: number;
}
