import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarState, setSidebarState] = useLocalStorage<'expanded' | 'collapsed'>('sidebar', 'expanded');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCollapsed = sidebarState === 'collapsed';
  const handleToggleSidebar = () => {
    setSidebarState(isCollapsed ? 'expanded' : 'collapsed');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary font-sans transition-colors duration-200">
      {/* Desktop / Laptop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full transition-all duration-300">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={handleToggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Slide-In Navigation Drawer */}
      <MobileNavigation
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </div>
  );
};
