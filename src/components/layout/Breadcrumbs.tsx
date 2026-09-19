import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatBreadcrumb = (str: string) => {
    if (str === 'knowledge-base') return 'Knowledge Base';
    if (str === 'historical-papers') return 'Historical Papers';
    if (str === 'exam-metadata') return 'Exam Metadata';
    if (str === 'review-queue') return 'Review Queue';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 overflow-x-auto no-scrollbar">
      <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                {formatBreadcrumb(value)}
              </span>
            ) : (
              <Link to={to} className="hover:text-blue-600 dark:hover:text-blue-400 shrink-0">
                {formatBreadcrumb(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
