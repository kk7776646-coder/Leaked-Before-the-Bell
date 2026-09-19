import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  BellRing,
  ClipboardCheck,
  X,
  Archive,
  CalendarDays,
  Settings,
  Activity,
} from 'lucide-react';
import { AppLogo } from '../common/AppLogo';
import { AdminProfile } from './AdminProfile';
import { ProfileModal } from '../modals/ProfileModal';
import { SignOutModal } from '../modals/SignOutModal';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  if (!isOpen) return null;

  const mainNav = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
    { label: 'Candidates', path: '/candidates', icon: <FileSearch className="w-5 h-5 shrink-0" strokeWidth={1.8} />, badge: '24' },
    { label: 'Alerts', path: '/alerts', icon: <BellRing className="w-5 h-5 shrink-0" strokeWidth={1.8} />, badge: '5', badgeColor: 'bg-rose-500 text-white' },
    { label: 'Review Queue', path: '/review-queue', icon: <ClipboardCheck className="w-5 h-5 shrink-0" strokeWidth={1.8} />, badge: '3', badgeColor: 'bg-amber-500 text-white' },
  ];

  const knowledgeNav = [
    { label: 'Historical Papers', path: '/knowledge-base/historical-papers', icon: <Archive className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
    { label: 'Exam Metadata', path: '/knowledge-base/exam-metadata', icon: <CalendarDays className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
  ];

  const systemNav = [
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
  ];

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-in Navigation Drawer */}
      <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo className="w-10 h-10 shrink-0" />
            <div>
              <h1 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                Leaked Before the Bell
              </h1>
              <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                Exam Security
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Surveillance Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-sans font-semibold text-slate-400 dark:text-slate-500">
              Surveillance
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-sans font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full ${
                        item.badgeColor || 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Knowledge Base Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-sans font-semibold text-slate-400 dark:text-slate-500">
              Knowledge Base
            </div>
            <nav className="space-y-1">
              {knowledgeNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-sans font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="p-3 m-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1 font-sans">
            <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Scanner Engine
            </span>
            <span className="text-[11px] font-sans font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Active indexing on 12 public & darknet gateways.
          </p>
        </div>

        {/* Pinned Admin Profile / Account Section */}
        <AdminProfile
          isCollapsed={false}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSignOutModal={() => setIsSignOutModalOpen(true)}
        />
      </div>

      {/* Profile Detail Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={() => {
          console.log('Mock Admin signed out on mobile');
        }}
      />
    </div>
  );
};
