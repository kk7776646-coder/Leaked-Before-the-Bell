import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewItem } from '../../types/review';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { CandidateRiskScore } from '../candidates/CandidateRiskScore';
import { Button } from '../common/Button';
import { ClipboardCheck, ArrowRight, UserCheck } from 'lucide-react';

interface ReviewQueueCardProps {
  item: ReviewItem;
  onOpenReview?: (item: ReviewItem) => void;
}

export const ReviewQueueCard: React.FC<ReviewQueueCardProps> = ({ item, onOpenReview }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">{item.candidateId}</span>
          <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100">{item.subject}</h4>
          <span className="text-xs font-mono text-slate-500">{item.subjectCode}</span>
        </div>
        <ReviewStatusBadge status={item.reviewerStatus} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-sans">
        <div>
          <p className="text-[11px] font-medium text-slate-500">Risk Score</p>
          <CandidateRiskScore score={item.riskScore} level={item.riskLevel} size="sm" />
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-slate-500">Evidence Count</p>
          <span className="text-xs font-mono font-medium text-amber-500">{item.evidenceCount} Triggers</span>
        </div>
      </div>

      {item.assignedReviewer && (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Assigned to: {item.assignedReviewer}</span>
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-mono text-slate-400">{item.detectedTime}</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={<ClipboardCheck className="w-3.5 h-3.5" />}
            onClick={() => onOpenReview?.(item)}
          >
            Conduct Review
          </Button>
        </div>
      </div>
    </div>
  );
};
