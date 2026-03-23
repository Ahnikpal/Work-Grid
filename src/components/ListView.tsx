import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProjectStore } from '../store';
import { Task, Status, Priority } from '../types';
import { Avatar, Badge, cn } from './ui';
import { ChevronUp, ChevronDown, Clock, User as UserIcon, MoreHorizontal } from 'lucide-react';
import { format, isToday, isBefore, differenceInDays } from 'date-fns';

type SortKey = 'title' | 'priority' | 'dueDate';
type SortOrder = 'asc' | 'desc';

const ROW_HEIGHT = 64; 
const BUFFER_COUNT = 5;

export const ListView = () => {
  const { tasks, filter, updateTaskStatus } = useProjectStore();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'dueDate', order: 'asc' });
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and Sort
  const processedTasks = useMemo(() => {
    let result = tasks.filter((task: Task) => {
      const matchStatus = filter.status.length === 0 || filter.status.includes(task.status);
      const matchPriority = filter.priority.length === 0 || filter.priority.includes(task.priority);
      const matchAssignee = filter.assignee.length === 0 || filter.assignee.includes(task.assignee.id);
      return matchStatus && matchPriority && matchAssignee;
    });

    result.sort((a: Task, b: Task) => {
      if (sortConfig.key === 'priority') {
        const priorityScore: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const valA = priorityScore[a.priority];
        const valB = priorityScore[b.priority];
        return sortConfig.order === 'asc' ? valA - valB : valB - valA;
      }

      const valA = a[sortConfig.key as keyof Task] as string;
      const valB = b[sortConfig.key as keyof Task] as string;
      
      if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filter, sortConfig]);

  // Virtual Scrolling Logic
  const containerHeight = containerRef.current?.clientHeight || 0;
  const totalHeight = processedTasks.length * ROW_HEIGHT;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_COUNT);
  const endIndex = Math.min(
    processedTasks.length - 1,
    Math.floor((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_COUNT
  );

  const visibleTasks = processedTasks.slice(startIndex, endIndex + 1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const toggleSort = (key: SortKey) => {
    setSortConfig((prev: { key: SortKey; order: SortOrder }) => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPriorityBadge = (priority: Priority) => {
    const colors = {
      low: 'bg-blue-500/10 text-blue-500',
      medium: 'bg-emerald-500/10 text-emerald-500',
      high: 'bg-amber-500/10 text-amber-500',
      critical: 'bg-rose-500/10 text-rose-500',
    };
    return <Badge variant="priority" className={cn("capitalize px-2 py-0.5", colors[priority])}>{priority}</Badge>;
  };

  const getStatusBadge = (status: Status) => {
    const colors = {
      todo: 'bg-muted/50 text-muted-foreground',
      'in-progress': 'bg-blue-500/10 text-blue-500',
      'in-review': 'bg-amber-500/10 text-amber-500',
      done: 'bg-emerald-500/10 text-emerald-500',
    };
    return <Badge variant="priority" className={cn("capitalize px-2 py-0.5", colors[status])}>{status.replace('-', ' ')}</Badge>;
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Table Header */}
      <div className="flex items-center px-6 py-3 border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground z-10 sticky top-0">
        <div className="flex-[3] flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('title')}>
          Task Name {sortConfig.key === 'title' && (sortConfig.order === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </div>
        <div className="flex-1">Status</div>
        <div className="flex-1 flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('priority')}>
          Priority {sortConfig.key === 'priority' && (sortConfig.order === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </div>
        <div className="flex-1">Assignee</div>
        <div className="flex-1 flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('dueDate')}>
          Due Date {sortConfig.key === 'dueDate' && (sortConfig.order === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </div>
      </div>

      {/* Virtual Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative"
        onScroll={handleScroll}
      >
        {processedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm font-medium">No tasks found</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {visibleTasks.map((task, index) => {
              const actualIndex = startIndex + index;
              return (
                <div 
                  key={task.id}
                  className="absolute left-0 right-0 flex items-center px-6 border-b border-border/50 hover:bg-muted/10 transition-colors group"
                  style={{ 
                    height: `${ROW_HEIGHT}px`, 
                    transform: `translateY(${actualIndex * ROW_HEIGHT}px)` 
                  }}
                >
                  <div className="flex-[3] flex items-center gap-3">
                    <div className={cn("h-4 w-4 rounded border border-border flex items-center justify-center shrink-0 transition-all", task.status === 'done' ? "bg-emerald-500 border-emerald-500" : "group-hover:border-primary")}>
                      {task.status === 'done' && <CheckIcon />}
                    </div>
                    <span className={cn("text-sm font-medium truncate", task.status === 'done' && "text-muted-foreground line-through")}>{task.title}</span>
                  </div>

                  <div className="flex-1">
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                      className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer hover:text-primary transition-all p-1 rounded hover:bg-muted/50"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    {getPriorityBadge(task.priority)}
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <Avatar initials={task.assignee.initials} color={task.assignee.color} size="sm" />
                    <span className="text-xs font-medium hidden lg:inline">{task.assignee.name}</span>
                  </div>

                  <div className="flex-1 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {getDueDateLabel(task)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4.5L3.5 7L9 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getDueDateLabel = (task: Task) => {
  const due = new Date(task.dueDate);
  const now = new Date();
  
  if (isToday(due)) return <span className="text-amber-500 font-bold">Due Today</span>;
  if (isBefore(due, now)) {
    const days = differenceInDays(now, due);
    if (days > 7) return <span className="text-rose-500 font-bold uppercase tracking-tighter text-[10px]">{days} days overdue</span>;
    return <span className="text-rose-500">{format(due, 'MMM d')}</span>;
  }
  return format(due, 'MMM d');
};
