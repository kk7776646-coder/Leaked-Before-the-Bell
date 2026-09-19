import React from 'react';
import { Card } from '../common/Card';
import { EvidenceItem } from '../../types/candidate';
import { GitCommit, AlertCircle, FileSearch, ShieldCheck } from 'lucide-react';

interface EvidenceTimelineProps {
  evidence: EvidenceItem[];
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ evidence }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-blue-500" />
          <span>Chain of Investigation Evidence</span>
        </div>
      }
      subtitle="Auditable timeline of surveillance triggers"
    >
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {evidence.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-slate-900">
              <FileSearch className="w-3 h-3" />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 font-sans">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {item.title}
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {Math.round(item.confidence * 100)}% Confidence
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.detail}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>Type: {item.type}</span>
                <span>Logged at {item.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
