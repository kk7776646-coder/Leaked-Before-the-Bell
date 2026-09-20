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
  Lock,
  FileCheck,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

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
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 truncate">LeakLens</h1>
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Exam Intelligence</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={onToggle}
            className="mx-auto w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <Lock className="w-5 h-5" />
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
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
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

      {/* Profile Details at Bottom - ONLY shown when Sidebar is OPEN */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[var(--sidebar-border)] bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20">
                EX
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800"
                title="Active & Authenticated"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                Exam Operations
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                  Security Officer
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
