import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../types/alert';
import { AlertSeverityBadge } from './AlertSeverityBadge';
import { Button } from '../common/Button';
import { AlertTriangle, ShieldCheck, ArrowRight, Clock, FileSearch } from 'lucide-react';

interface AlertDetailsProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({ alert, onAcknowledge }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 font-sans">
        <div>
          <span className="font-mono text-xs font-medium text-slate-400">{alert.id}</span>
          <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-slate-100">{alert.subject}</h3>
          <span className="text-xs font-mono text-slate-500">Code: {alert.subjectCode}</span>
        </div>
        <AlertSeverityBadge severity={alert.severity} />
      </div>

      <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 font-sans">
        <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Trigger reason:
        </span>
        <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed font-normal">
          {alert.reason}
        </p>
      </div>

      <div className="space-y-2 font-sans">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Detailed surveillance findings:</span>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
          {alert.details}
        </p>
      </div>

      <div className="space-y-2 font-sans">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Protocol action recommendation:</span>
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-950 dark:text-blue-200">
          {alert.recommendedAction}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Detected {alert.detectedTime}
        </span>

        <div className="flex items-center gap-2">
          {onAcknowledge && alert.status === 'New' && (
            <Button
              size="sm"
              variant="outline"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge Alert
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            icon={<FileSearch className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/candidates/${alert.candidateId}`)}
          >
            Inspect Paper {alert.candidateId}
          </Button>
        </div>
      </div>
    </div>
  );
};
