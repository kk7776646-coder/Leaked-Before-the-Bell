import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronUp } from 'lucide-react';
import { mockCurrentUser } from '../../data/mockUser';

interface AdminProfileProps {
  isCollapsed?: boolean;
  onOpenProfileModal: () => void;
  onOpenSignOutModal: () => void;
}

interface PortalNavTooltipProps {
  label: string;
  targetRef: React.RefObject<HTMLElement | null>;
  isVisible: boolean;
}

const PortalNavTooltip: React.FC<PortalNavTooltipProps> = ({
  label,
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

  return (
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
    </div>
  );
};

export const AdminProfile: React.FC<AdminProfileProps> = ({
  isCollapsed = false,
  onOpenProfileModal,
  onOpenSignOutModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle ESC key to close popover
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    onOpenProfileModal();
  };

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    navigate('/settings');
  };

  const handleSignOutClick = () => {
    setIsMenuOpen(false);
    onOpenSignOutModal();
  };

  return (
    <div
      ref={containerRef}
      className="relative shrink-0 border-t border-slate-200 dark:border-slate-800 p-2.5 transition-colors"
    >
      {/* Upward Account Menu Popover */}
      {isMenuOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute bottom-full left-2 mb-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {/* Menu Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-heading font-semibold text-slate-900 dark:text-white">
              {mockCurrentUser.name}
            </p>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 truncate">
              {mockCurrentUser.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleProfileClick}
              className="w-full text-left px-3.5 py-2 text-xs font-sans font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <span>Profile</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleSettingsClick}
              className="w-full text-left px-3.5 py-2 text-xs font-sans font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
              <span>Account settings</span>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOutClick}
              className="w-full text-left px-3.5 py-2 text-xs font-sans font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" strokeWidth={1.8} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Profile Trigger Button */}
      {!isCollapsed ? (
        /* Expanded Sidebar Layout */
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {mockCurrentUser.initials}
            </div>

            {/* Name & Role */}
            <div className="min-w-0">
              <h2 className="font-heading font-semibold text-xs text-slate-900 dark:text-white truncate leading-snug">
                {mockCurrentUser.name}
              </h2>
              <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 truncate leading-none">
                {mockCurrentUser.role}
              </p>
            </div>
          </div>

          {/* Upward Chevron Indicator */}
          <ChevronUp
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={1.8}
          />
        </button>
      ) : (
        /* Collapsed Sidebar Layout */
        <div className="w-full flex justify-center">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            aria-label="Admin Profile menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="w-9 h-9 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 shadow-xs hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {mockCurrentUser.initials}
          </button>

          {/* Tooltip for Collapsed Mode */}
          {isCollapsed && (
            <PortalNavTooltip
              label={`${mockCurrentUser.name} (${mockCurrentUser.role})`}
              targetRef={buttonRef}
              isVisible={isHovered && !isMenuOpen}
            />
          )}
        </div>
      )}
    </div>
  );
};
