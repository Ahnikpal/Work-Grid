import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, Filter as FilterIcon, X } from 'lucide-react';
import { useProjectStore } from '../store';
import { Avatar, Badge, Button, cn } from './ui';

export const TopBar = () => {
  const { presenceUsers } = useProjectStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks, projects..." 
            className="w-full bg-muted/30 border border-input rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Presence Indicators */}
        <div className="flex items-center -space-x-2 mr-2">
          {presenceUsers.slice(0, 3).map((user) => (
            <Avatar 
              key={user.id} 
              initials={user.initials} 
              color={user.color} 
              size="md"
              className="border-2 border-background"
            />
          ))}
          {presenceUsers.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold">
              +{presenceUsers.length - 3}
            </div>
          )}
          <span className="ml-4 text-xs font-semibold text-muted-foreground hidden lg:inline-block">
            {presenceUsers.length} people are viewing this board
          </span>
        </div>

        <div className="h-10 w-[1px] bg-border mx-1" />

        <div className="flex items-center gap-2">
          <button className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
          </button>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none">Manik Pal</p>
              <p className="text-[10px] text-muted-foreground mt-1">Lead Developer</p>
            </div>
            <Avatar initials="MP" color="#3b82f6" size="lg" />
          </div>
        </div>
      </div>
    </header>
  );
};
