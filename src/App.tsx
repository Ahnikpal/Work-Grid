import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { TimelineView } from './components/TimelineView';
import { useProjectStore } from './store';
import { Status, Priority } from './types';

function App() {
  const [activeView, setActiveView] = useState('kanban');
  const { filter, setFilter } = useProjectStore();

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status.length) params.set('status', filter.status.join(','));
    if (filter.priority.length) params.set('priority', filter.priority.join(','));
    if (filter.assignee.length) params.set('assignee', filter.assignee.join(','));
    if (activeView !== 'kanban') params.set('view', activeView);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [filter, activeView]);

  // Sync URL to state on mount and PopState
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status')?.split(',') as Status[] || [];
      const priority = params.get('priority')?.split(',') as Priority[] || [];
      const assignee = params.get('assignee')?.split(',') || [];
      const view = params.get('view') || 'kanban';

      setFilter({ 
        status: status.filter(s => ['todo', 'in-progress', 'in-review', 'done'].includes(s)), 
        priority: priority.filter(p => ['low', 'medium', 'high', 'critical'].includes(p)), 
        assignee 
      });
      setActiveView(view);
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'kanban': return <KanbanView />;
      case 'list': return <ListView />;
      case 'timeline': return <TimelineView />;
      default: return <KanbanView />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </Layout>
  );
}

export default App;
