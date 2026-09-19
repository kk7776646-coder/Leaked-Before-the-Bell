import React from 'react';
import { formatScore, getRiskColorClass } from '../../utils/formatScore';
import { ShieldAlert, CircleAlert, CheckCircle2 } from 'lucide-react';

interface CandidateRiskScoreProps {
  score: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CandidateRiskScore: React.FC<CandidateRiskScoreProps> = ({
  score,
  level,
  size = 'md',
}) => {
  const colors = getRiskColorClass(score);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-mono font-medium rounded gap-1',
    md: 'px-2.5 py-1 text-sm font-mono font-medium rounded-md gap-1.5',
    lg: 'px-4 py-2 text-xl font-mono font-semibold rounded-lg shadow-xs gap-2',
  };

  const getRiskIcon = (s: number) => {
    if (s >= 70) return <ShieldAlert className="w-3.5 h-3.5 shrink-0" />;
    if (s >= 40) return <CircleAlert className="w-3.5 h-3.5 shrink-0" />;
    return <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <div className="inline-flex items-center gap-2 font-sans">
      <span className={`inline-flex items-center ${sizeClasses[size]} ${colors.bg} ${colors.text} border ${colors.border}`}>
        {getRiskIcon(score)}
        <span>{formatScore(score)}</span>
      </span>
      {level && (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {level}
        </span>
      )}
    </div>
  );
};
