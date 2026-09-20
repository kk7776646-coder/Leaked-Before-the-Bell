import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AssistantProvider } from '../assistant/AssistantContext';
import { AiAssistantDrawer } from '../assistant/AiAssistantDrawer';
import { AssistantEdgeHandle } from '../assistant/AssistantEdgeHandle';
import { isDemoModeActive } from '../../services/api';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [demoActive, setDemoActive] = useState(() => isDemoModeActive());

  useEffect(() => {
    const handleToggle = () => {
      setDemoActive(isDemoModeActive());
    };
    window.addEventListener('leaklens_demo_mode_changed', handleToggle);
    const interval = setInterval(handleToggle, 1000);
    return () => {
      window.removeEventListener('leaklens_demo_mode_changed', handleToggle);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar />
        {demoActive && (
          <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 dark:border-amber-500/10 px-4 py-2.5 flex items-center justify-between gap-4 text-xs text-amber-800 dark:text-amber-400 font-medium shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 shrink-0 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 dark:bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-amber-500"></span>
              </span>
              <span className="truncate">
                <strong>DEMO MODE:</strong> Showing simulated test data. These records are not real examination incidents.
              </span>
            </div>
            <div className="hidden sm:block text-[10px] text-amber-600/80 dark:text-amber-500/70 uppercase font-mono tracking-wider select-none shrink-0">
              Simulated Workspace
            </div>
          </div>
        )}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-200 ease-out">
          {children}
        </main>
      </div>
      <AiAssistantDrawer />
      <AssistantEdgeHandle />
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <AssistantProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AssistantProvider>
  );
};
