import React from 'react';
import { Candidate } from '../../types/candidate';
import { CandidateRiskScore } from '../candidates/CandidateRiskScore';
import { CandidateStatusBadge } from '../candidates/CandidateStatusBadge';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Shield, Clock, FileText, Share2, AlertOctagon } from 'lucide-react';

interface CandidateOverviewProps {
  candidate: Candidate;
  onStatusChange?: (newStatus: Candidate['reviewStatus']) => void;
}

export const CandidateOverview: React.FC<CandidateOverviewProps> = ({
  candidate,
  onStatusChange,
}) => {
  return (
    <Card className="mb-6 border-l-4 border-l-blue-600 dark:border-l-blue-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-semibold text-sm rounded-md">
              {candidate.id}
            </span>
            <CandidateStatusBadge status={candidate.reviewStatus} />
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Detected {candidate.detectedTime}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-heading font-semibold text-slate-900 dark:text-slate-100">
            {candidate.subject}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-mono font-medium">
              Code: {candidate.subjectCode}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Format: {candidate.documentType}
            </span>
            <span>Source: <strong className="font-medium text-slate-800 dark:text-slate-200">{candidate.source}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-medium text-slate-500 font-sans">
              Overall Risk Score
            </span>
            <div className="flex items-center gap-2">
              <CandidateRiskScore score={candidate.riskScore} level={candidate.riskLevel} size="lg" />
            </div>
          </div>

          {onStatusChange && (
            <div className="flex flex-wrap items-center gap-2 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-4">
              <Button
                size="sm"
                variant="danger"
                icon={<AlertOctagon className="w-3.5 h-3.5" />}
                onClick={() => onStatusChange('VERIFIED')}
              >
                Confirm Leak
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onStatusChange('DISMISSED')}
              >
                Dismiss False Alarm
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
