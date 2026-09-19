import React from 'react';
import { Card } from '../common/Card';
import { Candidate, RiskBreakdownSignal } from '../../types/candidate';
import { ShieldAlert, Info } from 'lucide-react';

interface RiskBreakdownProps {
  signals: RiskBreakdownSignal[];
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ signals }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Multimodal Risk Signal Breakdown</span>
        </div>
      }
      subtitle="Component risk scores from NLP, Computer Vision & Metadata engines"
    >
      <div className="space-y-4">
        {signals.map((signal, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-medium text-slate-800 dark:text-slate-200">{signal.name}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  signal.level === 'High'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : signal.level === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {signal.level}
                </span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{signal.score}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  signal.score >= 70
                    ? 'bg-rose-500'
                    : signal.score >= 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${signal.score}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
              <Info className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              <span>{signal.description}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
