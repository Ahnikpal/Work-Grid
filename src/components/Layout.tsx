import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FilterBar } from './FilterBar';
import { useProjectStore } from '../store';
import { USERS } from '../mockData';
import { PresenceUser } from '../types';

export const Layout = ({ children, activeView, onViewChange }: { 
  children: React.ReactNode, 
  activeView: string, 
  onViewChange: (v: string) => void 
}) => {
  const { updatePresence, tasks } = useProjectStore();

  // Simulate Presence
  useEffect(() => {
    const simulatePresence = () => {
      // Pick 2-4 random users (excluding self who is index 0)
      const otherUsers = USERS.slice(1);
      const count = Math.floor(Math.random() * 3) + 2; 
      const active = otherUsers.sort(() => 0.5 - Math.random()).slice(0, count);

      const presence: PresenceUser[] = active.map(user => ({
        ...user,
        currentTaskId: tasks.length > 0 ? tasks[Math.floor(Math.random() * tasks.length)].id : undefined,
        lastActive: Date.now()
      }));

      updatePresence(presence);
    };

    simulatePresence();
    const interval = setInterval(simulatePresence, 8000); // Shift tasks every 8s
    return () => clearInterval(interval);
  }, [updatePresence, tasks.length]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <TopBar />
        <FilterBar />
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};
