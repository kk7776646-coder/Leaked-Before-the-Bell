import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AssistantProvider } from '../assistant/AssistantContext';
import { AiAssistantDrawer } from '../assistant/AiAssistantDrawer';
import { AssistantEdgeHandle } from '../assistant/AssistantEdgeHandle';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar />
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
