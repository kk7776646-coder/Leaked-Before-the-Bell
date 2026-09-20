import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  ShieldAlert,
  CircleAlert,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  FileCheck2,
  Scale,
  Hash,
  BookOpen,
  Calendar,
  Layers,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { DetectedContentRecord, api } from '../../services/api';

interface ComparisonSummaryScorecardProps {
  item: DetectedContentRecord;
  onReAnalyzed?: (updated: DetectedContentRecord) => void;
}

export const ComparisonSummaryScorecard: React.FC<ComparisonSummaryScorecardProps> = ({
  item,
  onReAnalyzed,
}) => {
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [reAnalyzeMessage, setReAnalyzeMessage] = useState<string | null>(null);

  const meta = item.metadataComparison;
  const matchedRef = item.matchedReferencePaper;
  const forensicResults = item.forensicResults || [];
  const matchedQuestions = forensicResults.filter((f) => f.result === 'MATCH' || f.result === 'PARTIAL_MATCH');
  const exactMatches = forensicResults.filter((f) => f.result === 'MATCH');

  const handleReAnalyze = async () => {
    setIsReAnalyzing(true);
    setReAnalyzeMessage(null);
    try {
      const res = await api.reAnalyzeDetectedContent(item.id);
      if (res.success && res.detectedContent) {
        setReAnalyzeMessage('Re-comparison completed against latest verified papers and metadata.');
        if (onReAnalyzed) {
          onReAnalyzed(res.detectedContent);
        }
      }
    } catch (err: any) {
      console.error('Re-analysis error:', err);
      setReAnalyzeMessage(err.message || 'Failed to re-analyze content.');
    } finally {
      setIsReAnalyzing(false);
      setTimeout(() => setReAnalyzeMessage(null), 5000);
    }
  };

  const getStatusConfig = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return {
          title: 'HIGH MATCH DETECTED',
          subtitle: 'Substantial question and metadata overlap detected against verified examination reference.',
          badgeVariant: 'danger' as const,
          borderColor: 'border-rose-300 dark:border-rose-900/60',
          bgHeader: 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200',
          icon: ShieldAlert,
          iconColor: 'text-rose-600 dark:text-rose-400',
          verdict: 'Human Verification Required',
          verdictColor: 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50',
        };
      case 'REVIEW REQUIRED':
        return {
          title: 'REVIEW REQUIRED',
          subtitle: 'Partial matches or structural alignment found. Requires examiner evaluation.',
          badgeVariant: 'warning' as const,
          borderColor: 'border-amber-300 dark:border-amber-900/60',
          bgHeader: 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200',
          icon: CircleAlert,
          iconColor: 'text-amber-600 dark:text-amber-400',
          verdict: 'Reviewer Attention Recommended',
          verdictColor: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50',
        };
      case 'LOW':
      default:
        return {
          title: 'LOW SIMILARITY / BENIGN',
          subtitle: 'Content does not demonstrate substantial overlap with verified active examination papers.',
          badgeVariant: 'success' as const,
          borderColor: 'border-emerald-300 dark:border-emerald-900/60',
          bgHeader: 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          verdict: 'No Active Match Action Needed',
          verdictColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50',
        };
    }
  };

  const statusConfig = getStatusConfig(item.risk);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. ONE-GLANCE COMPARISON SUMMARY BANNER */}
      <div className={`rounded-2xl border ${statusConfig.borderColor} bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all`}>
        {/* Top Header Strip */}
        <div className={`px-5 py-4 ${statusConfig.bgHeader} border-b ${statusConfig.borderColor} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-center shrink-0">
              <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  One-Glance Comparison Summary
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.verdictColor}`}>
                  {statusConfig.title}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {item.riskScore}% Question Overlap with{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {matchedRef?.id || 'RP-Verified Reference'}
                </span>
                {matchedRef?.title ? ` (${matchedRef.title})` : ` (${item.subject})`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isReAnalyzing ? 'animate-spin' : ''}`} />}
              onClick={handleReAnalyze}
              disabled={isReAnalyzing}
            >
              {isReAnalyzing ? 'Re-evaluating...' : 'Re-run Comparison'}
            </Button>
          </div>
        </div>

        {reAnalyzeMessage && (
          <div className="px-5 py-2 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>{reAnalyzeMessage}</span>
          </div>
        )}

        {/* 2. FAST CHECKLIST & CORE ANSWERS */}
        <div className="p-5 space-y-5">
          {/* Quick Verification Checklist */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Comparison Verification Signals
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                {meta?.subjectMatch ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Subject</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {meta?.subjectMatch ? 'Matches' : 'Different'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                {meta?.codeMatch || meta?.subjectCodeMatch ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Subject Code</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {meta?.codeMatch || meta?.subjectCodeMatch ? item.subjectCode || 'Matches' : 'Mismatch'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                {meta?.marksMatch ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Marks</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {meta?.marksMatch ? 'Identical Marks' : 'Varied Marks'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                {meta?.structureMatch === true || meta?.structureMatch === 'MATCH' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Exam Structure</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {typeof meta?.structureMatch === 'string' ? meta.structureMatch : meta?.structureMatch ? 'Aligned' : '3 Sections'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                {exactMatches.length > 0 ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Question Overlap</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {exactMatches.length} Exact / {matchedQuestions.length} Total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6 Core Questions Answer Table */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Reviewer Decision Context
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">1. What was detected?</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type: {item.contentType} • {item.questions?.length || 0} question blocks parsed
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">2. Where was it detected?</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.source}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Platform: {item.platform} • Captured at {item.detectedTime}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">3. What does it match?</span>
                <p className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                  {matchedRef?.id || 'RP-Verified Reference'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {matchedRef?.title || item.subject}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">4. How strong is the match?</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.riskScore}% algorithmic similarity
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confidence: {item.confidence}% ({item.confidence >= 80 ? 'High' : 'Moderate'})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">5. Why is this flagged?</span>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                  {matchedQuestions.length > 0
                    ? `${matchedQuestions.length} extracted question blocks match verified exam reference text and structure.`
                    : 'Awaiting additional question forensics comparison.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">6. Does a human need to verify?</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {item.review === 'Reviewed'
                    ? '✓ Verification Completed'
                    : item.risk === 'HIGH'
                    ? 'Yes — Chief Examiner Verification Required'
                    : 'Optional Review Recommended'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Status: {item.review}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
