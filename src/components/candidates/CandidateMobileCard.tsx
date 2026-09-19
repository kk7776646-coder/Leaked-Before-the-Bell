import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate } from '../../types/candidate';
import { CandidateRiskScore } from './CandidateRiskScore';
import { CandidateStatusBadge } from './CandidateStatusBadge';
import { FileText, Image, Files, FileQuestion, Eye, Clock } from 'lucide-react';

interface CandidateMobileCardProps {
  candidate: Candidate;
}

export const CandidateMobileCard: React.FC<CandidateMobileCardProps> = ({ candidate }) => {
  const navigate = useNavigate();

  const getDocTypeIcon = (docType: string) => {
    const lower = docType.toLowerCase();
    if (lower.includes('pdf')) return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    if (lower.includes('photo') || lower.includes('image')) return <Image className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    if (lower.includes('multi') || lower.includes('page')) return <Files className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    return <FileQuestion className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div
      onClick={() => navigate(`/candidates/${candidate.id}`)}
      className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-medium text-xs text-blue-600 dark:text-blue-400">
            {candidate.id}
          </span>
          <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
            {candidate.subject}
          </h4>
          <span className="text-xs font-mono text-slate-500">{candidate.subjectCode}</span>
        </div>
        <CandidateStatusBadge status={candidate.reviewStatus} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-sans">
        <div>
          <p className="text-[11px] font-medium text-slate-500">Risk Level</p>
          <CandidateRiskScore score={candidate.riskScore} level={candidate.riskLevel} size="sm" />
        </div>

        <div className="text-right">
          <p className="text-[11px] font-medium text-slate-500">Format</p>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
            {getDocTypeIcon(candidate.documentType)}
            <span>{candidate.documentType}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {candidate.detectedTime}
        </span>
        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          Inspect Details
          <Eye className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
