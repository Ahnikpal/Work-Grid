import React, { useMemo } from 'react';
import { useProjectStore } from '../store';
import { Status, Priority } from '../types';
import { Filter as FilterIcon, X, Calendar, User as UserIcon, Tag, CheckCircle2 } from 'lucide-react';
import { Badge, Button, cn } from './ui';

export const FilterBar = () => {
  const { filter, setFilter, users } = useProjectStore();

  const handleStatusToggle = (status: Status) => {
    const newStatuses = filter.status.includes(status)
      ? filter.status.filter(s => s !== status)
      : [...filter.status, status];
    setFilter({ status: newStatuses });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const newPriorities = filter.priority.includes(priority)
      ? filter.priority.filter(p => p !== priority)
      : [...filter.priority, priority];
    setFilter({ priority: newPriorities });
  };

  const handleUserToggle = (userId: string) => {
    const newUserIds = filter.assignee.includes(userId)
      ? filter.assignee.filter(id => id !== userId)
      : [...filter.assignee, userId];
    setFilter({ assignee: newUserIds });
  };

  const clearFilters = () => {
    setFilter({
      status: [],
      priority: [],
      assignee: [],
      dateRange: { from: '', to: '' },
    });
  };

  const hasActiveFilters = filter.status.length > 0 || 
                          filter.priority.length > 0 || 
                          filter.assignee.length > 0 || 
                          filter.dateRange.from !== '';

  return (
    <div className="bg-card border-b border-border px-6 py-3 flex flex-wrap items-center gap-4 sticky top-16 z-40">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
        <FilterIcon className="h-4 w-4" />
        <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Filters:</span>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border/50">
        {(['todo', 'in-progress', 'in-review', 'done'] as Status[]).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusToggle(status)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
              filter.status.includes(status)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {status.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="h-6 w-[1px] bg-border" />

      {/* Priority Filter */}
      <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border/50">
        {(['low', 'medium', 'high', 'critical'] as Priority[]).map((priority) => (
          <button
            key={priority}
            onClick={() => handlePriorityToggle(priority)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
              filter.priority.includes(priority)
                ? "bg-primary/20 text-primary border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {priority}
          </button>
        ))}
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={clearFilters}
          className="ml-auto h-8 text-[10px] uppercase font-bold tracking-widest text-destructive hover:bg-destructive/10"
        >
          <X className="mr-1 h-3 w-3" />
          Clear All
        </Button>
      )}
    </div>
  );
};
