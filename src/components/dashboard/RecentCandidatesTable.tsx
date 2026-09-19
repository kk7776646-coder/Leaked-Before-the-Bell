import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Candidate } from '../../types/candidate';
import { formatScore, getRiskColorClass } from '../../utils/formatScore';
import { getReviewStatusBadgeClass } from '../../utils/riskHelpers';
import { ArrowRight, Eye, ShieldAlert } from 'lucide-react';

interface RecentCandidatesTableProps {
  candidates: Candidate[];
}

export const RecentCandidatesTable: React.FC<RecentCandidatesTableProps> = ({ candidates }) => {
  const navigate = useNavigate();

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Recently Flagged Candidate Documents</span>
        </div>
      }
      subtitle="Early-warning scans detected in the past 24 hours"
      action={
        <button
          onClick={() => navigate('/candidates')}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All 24 Candidates</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="overflow-x-auto -mx-5 -mb-5">
        <table className="w-full text-left text-xs min-w-[600px] font-sans">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <th className="px-5 py-3">Candidate ID</th>
              <th className="px-4 py-3">Subject & Code</th>
              <th className="px-4 py-3">Risk Assessment</th>
              <th className="px-4 py-3">Review Status</th>
              <th className="px-4 py-3">Detected Time</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {candidates.slice(0, 5).map((candidate) => {
              const riskColor = getRiskColorClass(candidate.riskScore);
              return (
                <tr
                  key={candidate.id}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {candidate.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{candidate.subject}</p>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{candidate.subjectCode}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-medium text-xs ${riskColor.bg} ${riskColor.text}`}>
                        {formatScore(candidate.riskScore)}
                      </span>
                      <span className="font-medium text-[11px] text-slate-700 dark:text-slate-300">
                        {candidate.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getReviewStatusBadgeClass(candidate.reviewStatus)}`}>
                      {candidate.reviewStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                    {candidate.detectedTime}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/candidates/${candidate.id}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
