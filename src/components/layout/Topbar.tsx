import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Monitor,
  Check,
  User,
  LogOut,
  Settings,
  Shield,
  Building2,
  ChevronDown,
  Database,
} from 'lucide-react';
import { useTheme, ThemeMode } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const CurrentThemeIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  // User initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LK';

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrator'
      : user?.role === 'SECURITY_OFFICER'
      ? 'Security Officer'
      : 'Operator';

  return (
    <header className="h-16 border-b border-[#E1E6EF] dark:border-[#0B2455] bg-white dark:bg-[#071A3D] px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-20 font-sans">
      {/* Left Anchor Area */}
      <div className="flex items-center gap-3 shrink-0 min-w-0 sm:min-w-[40px]">
      </div>

      {/* Center Search Input - Centered for every condition */}
      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex items-center justify-center px-1 sm:px-4">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8190AD] pointer-events-none" />
          <input
            id="topbar-search-input"
            type="text"
            placeholder="Search detected items, exams, leaks..."
            className="w-full h-9 pl-9 pr-12 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all shadow-2xs"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 h-5 px-1.5 text-[10px] font-mono font-medium text-[#8190AD] bg-white dark:bg-[#0B2455] rounded border border-[#E1E6EF] dark:border-[#0B2455] pointer-events-none select-none shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Switcher in Topbar */}
        <div className="relative shrink-0" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="w-9 h-9 rounded-lg bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] hover:bg-[#E5E9F2] dark:hover:bg-[#0B2455] flex items-center justify-center text-[#64748B] dark:text-[#94A0B5] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5CFF]/40"
            title={`Current theme: ${theme} (Click to switch)`}
            aria-label="Toggle theme menu"
            aria-expanded={isThemeMenuOpen}
          >
            <CurrentThemeIcon className="w-4 h-4 text-[#172033] dark:text-white" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8190AD] border-b border-[#E1E6EF] dark:border-[#0B2455] mb-1">
                Appearance
              </div>
              {[
                { mode: 'light' as ThemeMode, label: 'Light', icon: Sun },
                { mode: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                { mode: 'system' as ThemeMode, label: 'System', icon: Monitor },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setTheme(mode);
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    theme === mode
                      ? 'bg-[#F5F8FF] dark:bg-[#020617] text-[#0B5CFF] font-medium'
                      : 'text-[#64748B] dark:text-[#94A0B5] hover:bg-[#F5F7FB] dark:hover:bg-[#020617]/70 hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>
                  {theme === mode && <Check className="w-3.5 h-3.5 text-[#0B5CFF]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="w-9 h-9 rounded-lg bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] hover:bg-[#E5E9F2] dark:hover:bg-[#0B2455] flex items-center justify-center text-[#64748B] dark:text-[#94A0B5] transition-colors cursor-pointer relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5CFF]/40"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E11D48]"></span>
        </button>

        {/* USER PROFILE IN TOP-RIGHT */}
        <div className="relative shrink-0 ml-1" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#F5F8FF] dark:bg-[#020617] border border-[#B7C2D9]/60 dark:border-[#0B2455] hover:border-[#0B5CFF] transition-all cursor-pointer shadow-2xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5CFF]/40"
          >
            <div className="relative">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0B5CFF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {initials}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#071A3D]"
                title="Active Session"
              />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#172033] dark:text-white leading-tight max-w-[130px] truncate">
                {user?.fullName || 'Exam Operations'}
              </span>
              <span className="text-[10px] font-semibold text-[#0B5CFF] dark:text-[#06B6D4] leading-tight">
                {roleLabel}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#8190AD] group-hover:text-[#172033] dark:group-hover:text-white transition-transform duration-150" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Info */}
              <div className="px-4 py-3 border-b border-[#E1E6EF] dark:border-[#0B2455]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5CFF] text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#172033] dark:text-white truncate">
                      {user?.fullName || 'Exam Operations'}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A0B5] truncate mt-0.5">
                      {user?.email || 'security.officer@leaklens.local'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5F8FF] dark:bg-[#020617] text-[#0B5CFF] dark:text-[#06B6D4] border border-[#B7C2D9]/60 dark:border-[#0B2455]">
                        <Shield className="w-2.5 h-2.5" />
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.organization && (
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#F1F4F9] dark:border-[#0B2455]/60 text-[11px] text-[#64748B] dark:text-[#8190AD] truncate">
                    <Building2 className="w-3 h-3 text-[#8190AD] shrink-0" />
                    <span className="truncate">{user.organization}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="px-4 py-2 bg-[#F5F8FF] dark:bg-[#020617]/50 flex items-center justify-between text-[11px]">
                <span className="text-[#64748B] dark:text-[#94A0B5]">Session Status</span>
                <span className="flex items-center gap-1.5 font-semibold text-[#10B981]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  Active
                </span>
              </div>

              {/* Navigation Links */}
              <div className="p-1.5 space-y-0.5 border-b border-[#E1E6EF] dark:border-[#0B2455]">
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#172033] dark:text-[#E2E7F0] hover:bg-[#F5F7FB] dark:hover:bg-[#020617] rounded-xl transition-colors font-medium cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#8190AD]" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/settings?tab=test-data"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#172033] dark:text-[#E2E7F0] hover:bg-[#F5F7FB] dark:hover:bg-[#020617] rounded-xl transition-colors font-medium cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#0B5CFF]" />
                  <span>Test Data System</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


