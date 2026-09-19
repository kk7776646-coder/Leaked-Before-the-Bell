import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  BellRing,
  ClipboardCheck,
  Archive,
  CalendarDays,
  Settings,
  Activity,
} from 'lucide-react';
import { SidebarToggle } from './SidebarToggle';
import { AppLogo } from '../common/AppLogo';
import { AdminProfile } from './AdminProfile';
import { ProfileModal } from '../modals/ProfileModal';
import { SignOutModal } from '../modals/SignOutModal';

interface NavItemData {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface PortalNavTooltipProps {
  label: string;
  badge?: string;
  targetRef: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
}

const PortalNavTooltip: React.FC<PortalNavTooltipProps> = ({
  label,
  badge,
  targetRef,
  isVisible,
}) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const updatePosition = () => {
        if (targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          setPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + 10,
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setPosition(null);
    }
  }, [isVisible, targetRef]);

  if (!isVisible || !position) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-50%)',
      }}
      className="z-[9999] px-3.5 py-1.5 text-[12px] font-sans font-medium bg-slate-900 text-white dark:bg-slate-950 dark:text-white border border-slate-700/80 rounded-full shadow-xl pointer-events-none whitespace-nowrap flex items-center gap-2 animate-in fade-in duration-100 ring-1 ring-white/10"
    >
      <span>{label}</span>
      {badge && (
        <span className="bg-rose-500 text-white px-2 py-0.5 text-[10px] rounded-full font-mono font-medium leading-none">
          {badge}
        </span>
      )}
    </div>,
    document.body
  );
};

const SidebarNavItem: React.FC<{ item: NavItemData; isCollapsed: boolean }> = ({
  item,
  isCollapsed,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <NavLink
        ref={linkRef}
        to={item.path}
        aria-label={item.label}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={({ isActive }) =>
          `relative flex items-center ${
            isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'justify-between px-3 py-2'
          } rounded-lg text-xs sm:text-sm font-sans font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
            isActive
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
          }`
        }
      >
        <div className="flex items-center gap-2.5">
          {item.icon}
          {!isCollapsed && <span>{item.label}</span>}
        </div>

        {!isCollapsed && item.badge && (
          <span
            className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full ${
              item.badgeColor || 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {item.badge}
          </span>
        )}

        {isCollapsed && item.badge && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </NavLink>

      {isCollapsed && (
        <PortalNavTooltip
          label={item.label}
          badge={item.badge}
          targetRef={linkRef}
          isVisible={isHovered}
        />
      )}
    </>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  className = '',
}) => {
  const mainNav: NavItemData[] = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
    { label: 'Candidates', path: '/candidates', icon: <FileSearch className="w-5 h-5 shrink-0" strokeWidth={1.8} />, badge: '24' },
    { label: 'Alerts', path: '/alerts', icon: <BellRing className="w-5 h-5 shrink-0" strokeWidth={1.8} />, badge: '5', badgeColor: 'bg-rose-500 text-white' },
    { label: 'Review Queue', path: '/review-queue', icon: <ClipboardCheck className="w-5 h-5 shrink-0" strokeWidth={1.8} />, badge: '3', badgeColor: 'bg-amber-500 text-white' },
  ];

  const knowledgeNav: NavItemData[] = [
    { label: 'Historical Papers', path: '/knowledge-base/historical-papers', icon: <Archive className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
    { label: 'Exam Metadata', path: '/knowledge-base/exam-metadata', icon: <CalendarDays className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
  ];

  const systemNav: NavItemData[] = [
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5 shrink-0" strokeWidth={1.8} /> },
  ];

  const logoRef = useRef<HTMLButtonElement>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const [isStatusHovered, setIsStatusHovered] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Main sidebar navigation"
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex flex-col h-full select-none transition-all duration-200 ease-in-out relative ${className}`}
      >
        {/* Brand Header */}
        <div className="h-18 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0">
          {!isCollapsed ? (
            /* Expanded Mode: Logo + Title + Collapse Toggle */
            <div className="flex items-center justify-between w-full min-w-0 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <AppLogo className="w-11 h-11 shrink-0" />
                <div className="min-w-0">
                  <h1 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-snug">
                    Leaked Before the Bell
                  </h1>
                  <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 truncate leading-none">
                    Exam Security Platform
                  </p>
                </div>
              </div>

              <SidebarToggle isCollapsed={false} onToggle={onToggle} />
            </div>
          ) : (
            /* Collapsed Mode: Clickable Logo Icon to Expand */
            <div className="w-full flex justify-center">
              <button
                ref={logoRef}
                type="button"
                onClick={onToggle}
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                onFocus={() => setIsLogoHovered(true)}
                onBlur={() => setIsLogoHovered(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <AppLogo className="w-11 h-11" />
              </button>
              <PortalNavTooltip
                label="Expand sidebar"
                targetRef={logoRef}
                isVisible={isLogoHovered}
              />
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Section 1: Surveillance */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-sans font-semibold text-slate-400 dark:text-slate-500">
                Surveillance
              </div>
            )}
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <SidebarNavItem key={item.path} item={item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          </div>

          {/* Section 2: Knowledge Base */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-sans font-semibold text-slate-400 dark:text-slate-500">
                Knowledge Base
              </div>
            )}
            <nav className="space-y-1">
              {knowledgeNav.map((item) => (
                <SidebarNavItem key={item.path} item={item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          </div>
        </div>

        {/* System Status Footer */}
        {!isCollapsed ? (
          <div className="p-3 m-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors shrink-0">
            <div className="flex items-center justify-between text-xs mb-1 font-sans">
              <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                <Activity className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.8} />
                Scanner Engine
              </span>
              <span className="text-[11px] font-sans font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Active indexing on 12 public & darknet gateways.
            </p>
          </div>
        ) : (
          <div className="p-3 my-3 flex justify-center shrink-0">
            <div
              ref={statusRef}
              tabIndex={0}
              onMouseEnter={() => setIsStatusHovered(true)}
              onMouseLeave={() => setIsStatusHovered(false)}
              onFocus={() => setIsStatusHovered(true)}
              onBlur={() => setIsStatusHovered(false)}
              aria-label="Scanner Engine: Online"
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 cursor-pointer outline-none"
            />
            <PortalNavTooltip
              label="Scanner Engine: Online"
              targetRef={statusRef}
              isVisible={isStatusHovered}
            />
          </div>
        )}

        {/* Pinned Admin Profile / Account Section */}
        <AdminProfile
          isCollapsed={isCollapsed}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSignOutModal={() => setIsSignOutModalOpen(true)}
        />
      </aside>

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
          // Mock sign out action feedback
          console.log('Mock Admin signed out');
        }}
      />
    </>
  );
};

