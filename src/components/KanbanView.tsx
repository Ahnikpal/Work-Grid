import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../store';
import { Task, Status, PresenceUser } from '../types';
import { Avatar, Badge, cn } from './ui';
import { Calendar, MoreVertical, GripVertical, Clock } from 'lucide-react';
import { format, isToday, isBefore, differenceInDays } from 'date-fns';

const COLUMN_TYPES: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-muted/50' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500/10' },
  { id: 'in-review', label: 'In Review', color: 'bg-amber-500/10' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500/10' },
];

export const KanbanView = () => {
  const { tasks, filter, updateTaskStatus, presenceUsers } = useProjectStore();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<Status | null>(null);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchStatus = filter.status.length === 0 || filter.status.includes(task.status);
      const matchPriority = filter.priority.length === 0 || filter.priority.includes(task.priority);
      const matchAssignee = filter.assignee.length === 0 || filter.assignee.includes(task.assignee.id);
      return matchStatus && matchPriority && matchAssignee;
    });
  }, [tasks, filter]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom ghost image (opacity reduction and shadow)
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.6';
    ghost.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setDropTarget(status);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDropTarget(null);
  };

  return (
    <div className="flex h-full gap-6 p-6 overflow-x-auto custom-scrollbar">
      {COLUMN_TYPES.map(col => {
        const colTasks = filteredTasks.filter((t: Task) => t.status === col.id);
        const isTarget = dropTarget === col.id;

        return (
          <div 
            key={col.id}
            className={cn(
              "flex flex-col w-80 shrink-0 rounded-xl transition-colors duration-200",
              isTarget ? "bg-primary/5 ring-2 ring-primary/20" : "bg-card/50"
            )}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between p-4 mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", col.color.replace('50', '500').replace('/10', ''))} />
                <h3 className="font-bold text-sm uppercase tracking-wider">{col.label}</h3>
                <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
                  {colTasks.length}
                </Badge>
              </div>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-3 pb-6">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">No tasks</span>
                </div>
              ) : (
                colTasks.map((task: Task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isDragging={draggedTask?.id === task.id}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    presence={presenceUsers.filter((u: PresenceUser) => u.currentTaskId === task.id)}
                  />
                ))
              )}
              {/* Placeholder during drag */}
              {isTarget && draggedTask && draggedTask.status !== col.id && (
                <div className="h-32 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 animate-pulse" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TaskCard = ({ task, isDragging, onDragStart, onDragEnd, presence }: { 
  task: Task, 
  isDragging: boolean, 
  onDragStart: (e: React.DragEvent) => void,
  onDragEnd: () => void,
  presence: PresenceUser[]
}) => {
  const priorityColor = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    high: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    critical: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const getDueDateLabel = () => {
    const due = new Date(task.dueDate);
    const now = new Date();
    
    if (isToday(due)) return <span className="text-amber-500 font-bold">Due Today</span>;
    if (isBefore(due, now)) {
      const days = differenceInDays(now, due);
      if (days > 7) return <span className="text-rose-500 font-bold">{days} days overdue</span>;
      return <span className="text-rose-500 font-bold">{format(due, 'MMM d')} (overdue)</span>;
    }
    return format(due, 'MMM d');
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-card border border-border/50 rounded-xl p-4 shadow-sm group cursor-grab active:cursor-grabbing transition-all hover:border-primary/50",
        isDragging && "opacity-0 scale-95"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge variant="priority" className={cn("capitalize px-2 py-0.5 text-[10px]", priorityColor[task.priority])}>
          {task.priority}
        </Badge>
        <div className="flex -space-x-2">
          {presence.length > 0 && presence.slice(0, 2).map((user: PresenceUser, i: number) => (
            <div 
              key={user.id} 
              className="h-5 w-5 rounded-full border-2 border-card ring-1 ring-primary/20 flex items-center justify-center text-[8px] text-white font-bold transition-all animate-bounce-short"
              style={{ backgroundColor: user.color, animationDelay: `${i * 100}ms` }}
              title={`${user.name} is viewing`}
            >
              {user.initials}
            </div>
          ))}
          {presence.length > 2 && (
            <div className="h-5 w-5 rounded-full bg-muted border-2 border-card ring-1 ring-primary/20 flex items-center justify-center text-[8px] font-bold">
              +{presence.length - 2}
            </div>
          )}
        </div>
      </div>

      <h4 className="font-semibold text-sm leading-tight mb-4 group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-all">
          <Clock className="h-3 w-3" />
          {getDueDateLabel()}
        </div>
        <Avatar initials={task.assignee.initials} color={task.assignee.color} size="sm" />
      </div>
    </div>
  );
};
