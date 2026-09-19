import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  FileSearch,
  CheckSquare,
  Bell,
  Database,
  Settings,
  X,
  FileCheck,
  FileText
} from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'MONITORING',
      items: [
        { to: '/candidates', label: 'Candidates', icon: FileSearch },
        { to: '/alerts', label: 'Alerts', icon: ShieldAlert },
        { to: '/review', label: 'Review Queue', icon: CheckSquare },
        { to: '/sources', label: 'Social Media (Auto)', icon: Bell },
      ],
    },
    {
      title: 'KNOWLEDGE BASE',
      items: [
        { to: '/historical', label: 'Historical Data', icon: Database },
        { to: '/real-papers', label: 'Real Papers', icon: FileCheck },
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

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative flex flex-col w-72 max-w-full bg-white dark:bg-slate-900 h-full shadow-2xl z-10 font-sans">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              LL
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">LeakLens</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
