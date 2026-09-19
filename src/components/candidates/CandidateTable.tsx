import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate } from '../../types/candidate';
import { CandidateRiskScore } from './CandidateRiskScore';
import { CandidateStatusBadge } from './CandidateStatusBadge';
import { CandidateMobileCard } from './CandidateMobileCard';
import { Eye, FileText, Image, Files, FileQuestion } from 'lucide-react';

interface CandidateTableProps {
  candidates: Candidate[];
}

export const CandidateTable: React.FC<CandidateTableProps> = ({ candidates }) => {
  const navigate = useNavigate();

  if (candidates.length === 0) {
    return null;
  }

  const getDocTypeIcon = (docType: string) => {
    const lower = docType.toLowerCase();
    if (lower.includes('pdf')) return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    if (lower.includes('photo') || lower.includes('image')) return <Image className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    if (lower.includes('multi') || lower.includes('page')) return <Files className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    return <FileQuestion className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {candidates.map((c) => (
          <CandidateMobileCard key={c.id} candidate={c} />
        ))}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs min-w-[768px] font-sans">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <th className="px-4 py-3.5">Candidate ID</th>
              <th className="px-4 py-3.5">Subject Name & Code</th>
              <th className="px-4 py-3.5">Doc Format</th>
              <th className="px-4 py-3.5">Risk Score</th>
              <th className="px-4 py-3.5">Review Status</th>
              <th className="px-4 py-3.5">Surveillance Source</th>
              <th className="px-4 py-3.5">Detected Time</th>
              <th className="px-4 py-3.5 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {candidates.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/candidates/${c.id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 font-mono font-medium text-blue-600 dark:text-blue-400">
                  {c.id}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{c.subject}</p>
                  <p className="text-[10px] font-mono text-slate-500">{c.subjectCode}</p>
                </td>
                <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    {getDocTypeIcon(c.documentType)}
                    <span>{c.documentType}</span>
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <CandidateRiskScore score={c.riskScore} level={c.riskLevel} size="sm" />
                </td>
                <td className="px-4 py-3.5">
                  <CandidateStatusBadge status={c.reviewStatus} />
                </td>
                <td className="px-4 py-3.5 text-slate-500 max-w-[180px] truncate" title={c.source}>
                  {c.source}
                </td>
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {c.detectedTime}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/candidates/${c.id}`);
                    }}
                    title="Inspect Candidate Document"
                    aria-label="Inspect Candidate Document"
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
