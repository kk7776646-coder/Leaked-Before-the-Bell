import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  FileSearch,
  CheckSquare,
  Bell,
  Database,
  Settings,
  ChevronLeft,
  FileCheck,
  FileText,
  Bot
} from 'lucide-react';
import { LeakLensLogo } from '../common/LeakLensLogo';
import { useAssistant } from '../assistant/AssistantContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);
  const { isOpen: isAssistantOpen, toggleAssistant, triggerRef } = useAssistant();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'MONITORING',
      items: [
        { to: '/detected-content', label: 'Detected Content', icon: FileSearch },
        { to: '/alerts', label: 'Alerts', icon: ShieldAlert },
        { to: '/review', label: 'Review Queue', icon: CheckSquare },
        { to: '/sources', label: 'Social Media (Auto)', icon: Bell },
      ],
    },
    {
      title: 'KNOWLEDGE BASE',
      items: [
        { to: '/historical', label: 'Historical Data', icon: Database },
        { to: '/real-papers', label: 'Verified Papers', icon: FileCheck },
      ],
    },
    {
      title: 'EXAM CONFIGURATION',
      items: [{ to: '/metadata', label: 'Exam Metadata', icon: FileText }],
    },
    {
      title: 'SYSTEM',
      items: [{ to: '/settings', label: 'Settings', icon: Settings }],
    },
  ];

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, label: string) => {
    if (!isCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2 });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-[var(--sidebar-background)] border-r border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] transition-all duration-200 ease-in-out select-none shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--sidebar-border)] shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden">
            <LeakLensLogo className="w-9 h-9" />
            <div className="truncate">
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 truncate">LeakLens</h1>
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Exam Intelligence</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={onToggle}
            className="mx-auto w-10 h-10 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <LeakLensLogo className="w-8 h-8" />
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="w-7 h-7 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 shadow-xs ml-2 cursor-pointer"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3.5">
        {/* Assistant Action (Positioned Above Dashboard) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-0.5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none">
                INTELLIGENCE
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                COPILOT
              </span>
            </div>
          )}
          <button
            ref={triggerRef}
            type="button"
            onClick={toggleAssistant}
            onMouseEnter={(e) => handleMouseEnter(e, 'LeakLens AI Assistant')}
            onMouseLeave={handleMouseLeave}
            aria-expanded={isAssistantOpen}
            aria-controls="assistant-drawer"
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.99] cursor-pointer select-none relative shadow-2xs ${
              isAssistantOpen
                ? 'bg-blue-600 text-white font-semibold border border-blue-600 shadow-sm'
                : 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Toggle LeakLens AI Assistant (or drag from right edge)"
            aria-label="Toggle LeakLens AI Assistant"
          >
            <Bot className={`w-4 h-4 shrink-0 ${isAssistantOpen ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="truncate">AI Assistant</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isAssistantOpen ? 'bg-white' : 'bg-blue-500 animate-pulse'}`} />
              </div>
            )}
          </button>
        </div>

        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                    onMouseLeave={handleMouseLeave}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.99] cursor-pointer select-none relative ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200/80 dark:border-slate-700/80 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Tooltip Portal / Fixed overlay when collapsed */}
      {isCollapsed && tooltip && (
        <div
          style={{ top: tooltip.top }}
          className="fixed left-16 ml-2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xl z-50 pointer-events-none whitespace-nowrap border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
        >
          {tooltip.label}
        </div>
      )}
    </aside>
  );
};
