import React from 'react';
import { Card } from '../common/Card';
import { ReviewItem } from '../../types/review';
import { FileSearch, ShieldAlert } from 'lucide-react';

interface ReviewEvidencePanelProps {
  item: ReviewItem;
}

export const ReviewEvidencePanel: React.FC<ReviewEvidencePanelProps> = ({ item }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-blue-500" />
          <span>Surveillance Evidence Summary</span>
        </div>
      }
    >
      <div className="space-y-3 text-xs font-sans">
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Candidate reference:</span>
            <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{item.candidateId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Subject course:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{item.subject} ({item.subjectCode})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Flagged risk level:</span>
            <span className="font-mono font-medium text-rose-500">{item.riskScore}% ({item.riskLevel})</span>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-950 dark:text-amber-200 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Automatic surveillance algorithms flagged {item.evidenceCount} suspicious triggers including verbatim OCR question matching and timing precede anomalies.
          </p>
        </div>
      </div>
    </Card>
  );
};
