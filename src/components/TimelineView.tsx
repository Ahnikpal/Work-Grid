import React, { useMemo, useRef, useEffect } from 'react';
import { useProjectStore } from '../store';
import { Task, Priority } from '../types';
import { Avatar, Badge, cn } from './ui';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  differenceInDays, 
  addDays,
  startOfDay
} from 'date-fns';

const DAY_WIDTH = 100;
const ROW_HEIGHT = 48;

export const TimelineView = () => {
  const { tasks, filter } = useProjectStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalWidth = days.length * DAY_WIDTH;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      const matchStatus = filter.status.length === 0 || filter.status.includes(task.status);
      const matchPriority = filter.priority.length === 0 || filter.priority.includes(task.priority);
      const matchAssignee = filter.assignee.length === 0 || filter.assignee.includes(task.assignee.id);
      
      // Ensure task overlaps with current month
      const taskDue = new Date(task.dueDate);
      const taskStart = task.startDate ? new Date(task.startDate) : taskDue;
      
      return matchStatus && matchPriority && matchAssignee && 
             (taskStart <= monthEnd && taskDue >= monthStart);
    });
  }, [tasks, filter, monthStart, monthEnd]);

  // Scroll to today on mount
  useEffect(() => {
    if (timelineRef.current) {
      const todayIndex = days.findIndex((d: Date) => isSameDay(d, new Date()));
      if (todayIndex !== -1) {
        timelineRef.current.scrollLeft = (todayIndex * DAY_WIDTH) - (timelineRef.current.clientWidth / 2);
      }
    }
  }, []);

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      low: 'bg-blue-500/20 border-blue-500/30 text-blue-500',
      medium: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500',
      high: 'bg-amber-500/20 border-amber-500/30 text-amber-500',
      critical: 'bg-rose-500/20 border-rose-500/30 text-rose-500',
    };
    return colors[priority];
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Timeline Header */}
      <div className="overflow-x-auto flex-1 custom-scrollbar" ref={timelineRef}>
        <div style={{ width: `${totalWidth}px` }} className="relative min-h-full">
          {/* Days Header */}
          <div className="flex sticky top-0 z-20 bg-card border-b border-border shadow-sm">
            {days.map((day: Date, idx: number) => {
              const today = isSameDay(day, new Date());
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "shrink-0 border-r border-border/50 flex flex-col items-center justify-center p-2 transition-colors",
                    today ? "bg-primary/10" : "bg-card"
                  )}
                  style={{ width: `${DAY_WIDTH}px`, height: '64px' }}
                >
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", today ? "text-primary" : "text-muted-foreground")}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={cn("text-lg font-bold leading-none mt-1", today ? "text-primary" : "text-foreground")}>
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Grid & Today Line */}
          <div className="absolute inset-0 pt-16 pointer-events-none">
            {days.map((day: Date, idx: number) => (
              <div 
                key={idx}
                className="absolute top-0 bottom-0 border-r border-border/20"
                style={{ left: `${idx * DAY_WIDTH}px`, width: `${DAY_WIDTH}px` }}
              />
            ))}
            
            {/* Today Line */}
            {days.some((d: Date) => isSameDay(d, new Date())) && (() => {
              const todayIdx = days.findIndex((d: Date) => isSameDay(d, new Date()));
              return (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-primary z-10 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{ left: `${todayIdx * DAY_WIDTH + (DAY_WIDTH / 2)}px` }}
                />
              );
            })()}
          </div>

          {/* Task Bars */}
          <div className="pt-16 pb-8 space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground italic">
                No tasks to display in this range
              </div>
            ) : (
              filteredTasks.slice(0, 100).map((task: Task, idx: number) => {
                const due = new Date(task.dueDate);
                const start = task.startDate ? new Date(task.startDate) : due;
                
                // Clamping dates to month bounds for visualization
                const viewStart = start < monthStart ? monthStart : start;
                const viewEnd = due > monthEnd ? monthEnd : due;
                
                const leftDays = differenceInDays(startOfDay(viewStart), startOfDay(monthStart));
                const durationDays = Math.max(1, differenceInDays(startOfDay(viewEnd), startOfDay(viewStart)) + 1);
                
                const left = leftDays * DAY_WIDTH;
                const width = durationDays * DAY_WIDTH;

                return (
                  <div 
                    key={task.id} 
                    className="relative group h-12"
                  >
                    <div 
                      className={cn(
                        "absolute top-1 bottom-1 rounded-lg border flex items-center px-4 transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer overflow-hidden z-0",
                        getPriorityColor(task.priority)
                      )}
                      style={{ 
                        left: `${left + 4}px`, 
                        width: `${width - 8}px`,
                      }}
                    >
                      <span className="text-xs font-bold truncate tracking-tight">{task.title}</span>
                      <div className="ml-auto shrink-0 flex items-center gap-2">
                        <span className="text-[10px] font-medium opacity-70 whitespace-nowrap">
                          {format(due, 'MMM d')}
                        </span>
                        <Avatar initials={task.assignee.initials} color={task.assignee.color} size="sm" className="h-5 w-5 ring-offset-2 ring-offset-card" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
