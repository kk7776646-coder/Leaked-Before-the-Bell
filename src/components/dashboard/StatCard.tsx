import React from 'react';
import { Card } from '../common/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  accentColor?: 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  subtitle,
  accentColor = 'blue',
}) => {
  const borderAccents = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-700',
    rose: 'hover:border-rose-300 dark:hover:border-rose-700',
    amber: 'hover:border-amber-300 dark:hover:border-amber-700',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    purple: 'hover:border-purple-300 dark:hover:border-purple-700',
  };

  const iconBg = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card hoverEffect className={borderAccents[accentColor]}>
      <div className="flex items-start justify-between gap-3 font-sans">
        <div className="space-y-1">
          <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="text-2xl font-heading font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </div>
          {change && (
            <p className={`text-xs font-sans font-medium flex items-center gap-1 ${
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              <span>{change}</span>
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg[accentColor]} shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
