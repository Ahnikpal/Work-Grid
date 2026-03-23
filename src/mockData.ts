import { Task, User, Priority, Status } from './types';
import { addDays, subDays, startOfMonth, endOfMonth, format, isBefore, isAfter, startOfDay } from 'date-fns';

const USERS: User[] = [
  { id: 'u1', name: 'Manik Pal', initials: 'MP', color: '#3b82f6' },
  { id: 'u2', name: 'John Doe', initials: 'JD', color: '#10b981' },
  { id: 'u3', name: 'Alice Smith', initials: 'AS', color: '#f59e0b' },
  { id: 'u4', name: 'Bob Wilson', initials: 'BW', color: '#ef4444' },
  { id: 'u5', name: 'Emma Davis', initials: 'ED', color: '#8b5cf6' },
  { id: 'u6', name: 'Chris Brown', initials: 'CB', color: '#ec4899' },
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

export const generateMockTasks = (count: number): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  for (let i = 1; i <= count; i++) {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const assignee = USERS[Math.floor(Math.random() * USERS.length)];
    
    // Random dates within the current month
    const startOffset = Math.floor(Math.random() * 20) - 10; // -10 to +10 days from now
    const duration = Math.floor(Math.random() * 5) + 1; // 1 to 5 days
    
    const dueDate = addDays(now, startOffset + duration);
    const startDate = Math.random() > 0.1 ? subDays(dueDate, duration) : undefined; // 10% tasks have no start date

    tasks.push({
      id: `task-${i}`,
      title: `Task ${i}: ${getRandomVerb()} ${getRandomNoun()}`,
      status,
      priority,
      assignee,
      startDate: startDate?.toISOString(),
      dueDate: dueDate.toISOString(),
      createdAt: subDays(now, 30).toISOString(),
    });
  }

  return tasks;
};

const getRandomVerb = () => {
  const verbs = ['Implement', 'Design', 'Refactor', 'Fix', 'Test', 'Review', 'Deploy', 'Update', 'Debug', 'Research'];
  return verbs[Math.floor(Math.random() * verbs.length)];
};

const getRandomNoun = () => {
  const nouns = ['Authentication', 'Dashboard', 'API Layer', 'User Profile', 'Database Schema', 'Landing Page', 'CI/CD Pipeline', 'Payment Gateway', 'Search Logic', 'UI Components'];
  return nouns[Math.floor(Math.random() * nouns.length)];
};

export { USERS };
