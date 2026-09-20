import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverEffect?: boolean;
  overflowVisible?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  action,
  subtitle,
  footer,
  hoverEffect = false,
  overflowVisible = false,
}) => {
  const isOverflowVisible = overflowVisible || className.includes('overflow-visible');
  const overflowClass = isOverflowVisible ? 'overflow-visible' : 'overflow-hidden';

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] ${overflowClass} transition-all duration-300 ${
        hoverEffect ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_12px_30px_rgba(148,163,184,0.18)] dark:hover:shadow-[0_12px_30px_rgba(2,6,23,0.4)] hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {(title || action || subtitle) && (
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-5 font-sans">{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 font-sans">
          {footer}
        </div>
      )}
    </div>
  );
};
