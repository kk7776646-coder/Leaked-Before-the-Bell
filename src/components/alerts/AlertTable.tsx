import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../types/alert';
import { AlertSeverityBadge } from './AlertSeverityBadge';
import { AlertMobileCard } from './AlertMobileCard';
import { Button } from '../common/Button';
import { Eye, CheckCircle2 } from 'lucide-react';

interface AlertTableProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onSelectAlert?: (alert: Alert) => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts, onAcknowledge, onSelectAlert }) => {
  const navigate = useNavigate();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile Card List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {alerts.map((a) => (
          <AlertMobileCard key={a.id} alert={a} onSelectAlert={onSelectAlert} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs min-w-[768px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs">
              <th className="px-4 py-3.5">Alert reference</th>
              <th className="px-4 py-3.5">Subject & code</th>
              <th className="px-4 py-3.5">Severity</th>
              <th className="px-4 py-3.5">Surveillance trigger reason</th>
              <th className="px-4 py-3.5">Detected time</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {alerts.map((a) => (
              <tr
                key={a.id}
                onClick={() => onSelectAlert?.(a)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                  {a.id}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{a.subject}</p>
                  <p className="text-[11px] font-mono text-slate-500">{a.subjectCode}</p>
                </td>
                <td className="px-4 py-3.5">
                  <AlertSeverityBadge severity={a.severity} />
                </td>
                <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={a.reason}>
                  {a.reason}
                </td>
                <td className="px-4 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                  {a.detectedTime}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    a.status === 'New' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {onAcknowledge && a.status === 'New' && (
                      <button
                        onClick={() => onAcknowledge(a.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg cursor-pointer"
                        title="Acknowledge Alert"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/candidates/${a.candidateId}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Inspect Candidate Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
