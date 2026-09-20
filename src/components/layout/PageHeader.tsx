import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1 tracking-wide uppercase">
            {breadcrumb}
          </div>
        )}
        <h1 className="text-2xl font-bold font-heading tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {description && (
          <p className="text-sm font-sans text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
