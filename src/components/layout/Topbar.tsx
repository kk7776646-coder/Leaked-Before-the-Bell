import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ShieldCheck, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../hooks/useTheme';

export const Topbar: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CurrentThemeIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-900/50">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>System Secure & Active</span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden sm:block w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search detected items, exams, alerts..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          />
        </div>

        {/* Theme Switcher in Topbar */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            title={`Current theme: ${theme} (Click to switch)`}
            aria-label="Toggle theme menu"
            aria-expanded={isThemeMenuOpen}
          >
            <CurrentThemeIcon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
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
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>
                  {theme === mode && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
          <div
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs ring-2 ring-blue-500/20 cursor-default select-none"
            title="Exam Operations (Security Officer)"
            aria-label="Exam Operations profile"
          >
            EX
          </div>
        </div>
      </div>
    </header>
  );
};

