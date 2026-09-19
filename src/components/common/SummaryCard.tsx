import React from 'react';
import { Card } from './Card';

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
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600',
    info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <Card hoverEffect className="p-5 flex flex-col justify-between rounded-2xl border-slate-200/90 dark:border-slate-800 h-full">
      <div>
        <p className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="mt-2 text-2xl font-bold font-mono tracking-tight">
          <span className={valueClassName}>{value}</span>
        </div>
        {subtitle && <div className="mt-1.5">{subtitle}</div>}
      </div>
      <div className="mt-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${iconBgClasses[variant]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
