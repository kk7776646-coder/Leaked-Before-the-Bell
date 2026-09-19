import React from 'react';
import { Alert } from '../../types/alert';
import { AlertSeverityBadge } from './AlertSeverityBadge';
import { Button } from '../common/Button';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            alert.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
          }`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs text-slate-400 font-medium">{alert.id}</span>
            <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100">{alert.subject}</h4>
          </div>
        </div>
        <AlertSeverityBadge severity={alert.severity} />
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">{alert.reason}</p>

      <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg text-xs space-y-1 font-sans">
        <p className="font-medium text-slate-800 dark:text-slate-200">Recommended Protocol:</p>
        <p className="text-slate-600 dark:text-slate-400">{alert.recommendedAction}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-mono text-slate-400">Detected {alert.detectedTime}</span>
        <div className="flex items-center gap-2">
          {onAcknowledge && alert.status !== 'Acknowledged' && (
            <Button
              size="sm"
              variant="outline"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/candidates/${alert.candidateId}`)}
          >
            Inspect Paper
          </Button>
        </div>
      </div>
    </div>
  );
};
