import React from 'react';
import { LayoutDashboard, ListTodo, CalendarRange, Settings, HelpCircle, LogOut } from 'lucide-react';
import { cn } from './ui';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const NAV_ITEMS = [
  { id: 'kanban', label: 'Kanban Board', icon: LayoutDashboard },
  { id: 'list', label: 'List View', icon: ListTodo },
  { id: 'timeline', label: 'Timeline View', icon: CalendarRange },
];

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground">V</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Velozity</span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all group",
                activeView === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                activeView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-border">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive rounded-md hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
};
