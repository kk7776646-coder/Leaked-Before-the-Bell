import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Alert } from '../../types/alert';
import { BellRing, ArrowRight, AlertCircle } from 'lucide-react';

interface RecentAlertsProps {
  alerts: Alert[];
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts }) => {
  const navigate = useNavigate();

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-amber-500" />
          <span>Active Priority Alerts</span>
        </div>
      }
      subtitle="Early warning notifications requiring review"
      action={
        <button
          onClick={() => navigate('/alerts')}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>All Alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-3 font-sans">
        {alerts.slice(0, 4).map((alert) => (
          <div
            key={alert.id}
            onClick={() => navigate(`/candidates/${alert.candidateId}`)}
            className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex items-start gap-3"
          >
            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              alert.severity === 'HIGH'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : alert.severity === 'MEDIUM'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">
                  {alert.subject} ({alert.subjectCode})
                </span>
                <Badge
                  variant={alert.severity === 'HIGH' ? 'danger' : alert.severity === 'MEDIUM' ? 'warning' : 'info'}
                  size="sm"
                >
                  {alert.severity} RISK
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {alert.reason}
              </p>

              <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-slate-400 font-mono">
                <span>ID: {alert.candidateId}</span>
                <span>{alert.detectedTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
