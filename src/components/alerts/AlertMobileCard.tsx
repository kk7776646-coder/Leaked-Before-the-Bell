import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../types/alert';
import { AlertSeverityBadge } from './AlertSeverityBadge';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';

interface AlertMobileCardProps {
  alert: Alert;
  onSelectAlert?: (alert: Alert) => void;
}

export const AlertMobileCard: React.FC<AlertMobileCardProps> = ({ alert, onSelectAlert }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => onSelectAlert?.(alert)}
      className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-slate-400 font-medium">{alert.id}</span>
          <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
            {alert.subject} ({alert.subjectCode})
          </h4>
        </div>
        <AlertSeverityBadge severity={alert.severity} />
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-sans">
        {alert.reason}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-sans">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {alert.detectedTime}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/candidates/${alert.candidateId}`);
          }}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Candidate {alert.candidateId}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
