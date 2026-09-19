import React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
      mode: 'system',
      label: 'System',
      description: 'Automatically match OS settings',
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      mode: 'light',
      label: 'Light',
      description: 'Clean high-contrast light design',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      mode: 'dark',
      label: 'Dark',
      description: 'Eye-safe twilight dark design',
      icon: <Moon className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {options.map((item) => {
        const isActive = theme === item.mode;
        return (
          <button
            key={item.mode}
            type="button"
            onClick={() => setTheme(item.mode)}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              isActive
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0 font-sans">
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium text-xs text-slate-900 dark:text-slate-100">{item.label}</span>
                {isActive && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                {item.description}
              </p>
              {item.mode === 'system' && isActive && (
                <span className="inline-block mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Active OS theme: {resolvedTheme.toUpperCase()}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
