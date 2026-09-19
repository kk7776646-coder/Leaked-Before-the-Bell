import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ReviewItem, ReviewDecision } from '../../types/review';
import { ClipboardCheck, AlertTriangle, XCircle, ArrowUpRight, Send } from 'lucide-react';

interface ReviewDecisionPanelProps {
  item: ReviewItem;
  onSubmitDecision: (itemId: string, decision: ReviewDecision, notes: string) => void;
}

export const ReviewDecisionPanel: React.FC<ReviewDecisionPanelProps> = ({
  item,
  onSubmitDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<ReviewDecision>('Mark as Reviewed');
  const [notes, setNotes] = useState(item.reviewerNotes || '');

  const decisions: { id: ReviewDecision; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'Mark as Reviewed', label: 'Verify Leak & Mark Reviewed', icon: <ClipboardCheck className="w-4 h-4 text-rose-500" />, color: 'hover:border-rose-500' },
    { id: 'Needs More Evidence', label: 'Request Deeper Evidence', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, color: 'hover:border-amber-500' },
    { id: 'Escalate', label: 'Escalate to Board Committee', icon: <ArrowUpRight className="w-4 h-4 text-purple-500" />, color: 'hover:border-purple-500' },
    { id: 'Dismiss Candidate', label: 'Dismiss False Positive', icon: <XCircle className="w-4 h-4 text-slate-400" />, color: 'hover:border-slate-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDecision(item.id, selectedDecision, notes);
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-emerald-500" />
          <span>Analyst Investigation Audit Decision</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
        <div className="space-y-2">
          <label className="font-medium text-slate-800 dark:text-slate-200">
            Select investigation decision:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {decisions.map((d) => {
              const isSelected = selectedDecision === d.id;
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setSelectedDecision(d.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 font-medium text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {d.icon}
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-medium text-slate-800 dark:text-slate-200">
            Official audit & reviewer notes:
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record detailed analyst observations, cross-references, or security council dispatch notes..."
            className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" icon={<Send className="w-3.5 h-3.5" />}>
            Submit Formal Investigation Decision
          </Button>
        </div>
      </form>
    </Card>
  );
};
