import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewItem } from '../../types/review';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { CandidateRiskScore } from '../candidates/CandidateRiskScore';
import { ReviewQueueCard } from './ReviewQueueCard';
import { Button } from '../common/Button';
import { ClipboardCheck, Eye } from 'lucide-react';

interface ReviewQueueTableProps {
  items: ReviewItem[];
  onOpenReview: (item: ReviewItem) => void;
}

export const ReviewQueueTable: React.FC<ReviewQueueTableProps> = ({ items, onOpenReview }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile Card List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {items.map((item) => (
          <ReviewQueueCard key={item.id} item={item} onOpenReview={onOpenReview} />
        ))}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs min-w-[768px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs">
              <th className="px-4 py-3.5">Queue reference</th>
              <th className="px-4 py-3.5">Candidate ID</th>
              <th className="px-4 py-3.5">Subject & code</th>
              <th className="px-4 py-3.5">Risk score</th>
              <th className="px-4 py-3.5">Triggers</th>
              <th className="px-4 py-3.5">Reviewer status</th>
              <th className="px-4 py-3.5 text-right">Review action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onOpenReview(item)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                  {item.id}
                </td>
                <td className="px-4 py-3.5 font-mono font-medium text-blue-600 dark:text-blue-400">
                  {item.candidateId}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.subject}</p>
                  <p className="text-[11px] font-mono text-slate-500">{item.subjectCode}</p>
                </td>
                <td className="px-4 py-3.5">
                  <CandidateRiskScore score={item.riskScore} level={item.riskLevel} size="sm" />
                </td>
                <td className="px-4 py-3.5 font-mono font-medium text-amber-600 dark:text-amber-400">
                  {item.evidenceCount} Evidences
                </td>
                <td className="px-4 py-3.5">
                  <ReviewStatusBadge status={item.reviewerStatus} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<ClipboardCheck className="w-3.5 h-3.5" />}
                      onClick={() => onOpenReview(item)}
                    >
                      Review
                    </Button>
                    <button
                      onClick={() => navigate(`/candidates/${item.candidateId}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Inspect Document"
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
