import React from 'react';
import { Search, Bell, Shield, Radio, Menu } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

interface TopbarProps {
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <AppLogo className="w-9 h-9" />
          <span className="font-heading font-semibold text-xs text-slate-900 dark:text-white">
            Leaked Before the Bell
          </span>
        </div>
      </div>

      {/* Quick Search Input (Desktop/Tablet) */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidate ID, OCR keyword, subject code..."
            className="w-full pl-9 pr-4 py-1.5 text-xs font-sans bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Live Surveillance Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-sans font-medium text-emerald-700 dark:text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-time surveillance</span>
        </div>

        {/* Security Clearance Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-sans font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span>Level-3 Analyst</span>
        </div>

        {/* Alerts Bell Button */}
        <button
          type="button"
          title="Recent system alerts"
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  );
};
