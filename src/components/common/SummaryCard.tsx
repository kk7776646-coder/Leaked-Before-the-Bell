import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'neutral' | 'danger' | 'warning' | 'info' | 'success';
  valueClassName?: string;
  subtitle?: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  variant = 'neutral',
  valueClassName = 'text-slate-900 dark:text-slate-100',
  subtitle,
}) => {
  const iconBgClasses = {
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-180 ease-in-out h-full select-none font-sans">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${iconBgClasses[variant]}`}>
            {icon}
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight">
          <span className={valueClassName}>{value}</span>
        </div>
      </div>
      {subtitle && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 font-sans">
          {subtitle}
        </div>
      )}
    </div>
  );
};

