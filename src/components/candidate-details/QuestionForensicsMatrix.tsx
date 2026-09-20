import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldCheck, ChevronDown, ChevronUp, FileSearch, Target, ExternalLink } from 'lucide-react';
import { CandidateRecord, QuestionForensicResult } from '../../services/api';
import { Button } from '../common/Button';

interface QuestionForensicsMatrixProps {
  candidate: CandidateRecord;
  onJumpToPage?: (pageNum: number) => void;
  selectedQuestionId?: string;
  onSelectQuestion?: (questionId: string) => void;
}

export const QuestionForensicsMatrix: React.FC<QuestionForensicsMatrixProps> = ({
  candidate,
  onJumpToPage,
  selectedQuestionId,
  onSelectQuestion,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const forensicResults: QuestionForensicResult[] = candidate.forensicResults || [];
  const candidateQuestions = candidate.questions || [];

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'MATCH':
        return <Badge variant="success">MATCH</Badge>;
      case 'PARTIAL_MATCH':
        return <Badge variant="warning">PARTIAL</Badge>;
      case 'DIFFERENT':
        return <Badge variant="danger">DIFFERENT</Badge>;
      case 'NO_REFERENCE':
        return <Badge variant="neutral">NO REF</Badge>;
      default:
        return <Badge variant="warning">UNCERTAIN</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Summary Banner */}
      <Card className="bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 border-blue-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Question-Level Forensic Comparison Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Algorithmic question matching comparing detected paper blocks against Verified Real Papers and Historical Vault.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Forensic Confidence</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {candidate.confidence}% ({candidate.confidence >= 85 ? 'High' : candidate.confidence >= 60 ? 'Medium' : 'Low'})
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Question Matrix Table */}
      <Card
        title="Question Forensic Evidence"
        subtitle={
          forensicResults.length > 0
            ? `${forensicResults.length} extracted question blocks evaluated. Click any row for field-level comparison and page jump.`
            : 'No questions extracted yet.'
        }
      >
        {forensicResults.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <FileSearch className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Question Blocks Detected
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This document does not contain structured exam questions or matches against reference vaults.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Detected Q</th>
                  <th className="py-3 px-4 font-semibold">Page</th>
                  <th className="py-3 px-4 font-semibold">Reference Source</th>
                  <th className="py-3 px-4 font-semibold">Similarity</th>
                  <th className="py-3 px-4 font-semibold">Type Match</th>
                  <th className="py-3 px-4 font-semibold">Marks</th>
                  <th className="py-3 px-4 font-semibold">Result</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {forensicResults.map((item, index) => {
                  const rowKey = `${item.candidateQuestionId || 'Q'}-${item.referencePaperId || 'ref'}-${item.referenceQuestionId || 'target'}-${index}`;
                  const isExpanded = expandedRow === rowKey;
                  // Look up matched candidate question to find its original page number
                  const qObj = candidateQuestions.find(
                    (q) => q.questionNumber === item.candidateQuestionId || q.fullQuestionNumber === item.candidateQuestionId
                  );
                  const pageNumber = qObj?.pageNumber || 1;

                  const isSelected = selectedQuestionId === item.candidateQuestionId;

                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        onClick={() => {
                          setExpandedRow(isExpanded ? null : rowKey);
                          onSelectQuestion?.(item.candidateQuestionId);
                        }}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-150 cursor-pointer select-none ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {item.candidateQuestionId}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpToPage?.(pageNumber);
                            }}
                            title={`Jump to Page ${pageNumber} in original document`}
                            className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Target className="w-3 h-3" />
                            p.{pageNumber}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {item.referencePaperTitle || item.referencePaperId || 'None'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {item.textSimilarity > 0 ? `${Math.round(item.textSimilarity * 100)}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.typeMatch}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.marksMatch}</td>
                        <td className="py-3 px-4">{getResultBadge(item.result)}</td>
                        <td className="py-3 px-4 text-right">
                          <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all duration-150 cursor-pointer">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/80">
                          <td colSpan={8} className="p-4">
                            <div className="space-y-3 font-sans">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                  Field-Level Forensic Evidence — {item.candidateQuestionId} (Source Page {pageNumber})
                                </h5>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Target className="w-3.5 h-3.5 text-blue-500" />}
                                  onClick={() => onJumpToPage?.(pageNumber)}
                                >
                                  View in Document (Page {pageNumber})
                                </Button>
                              </div>

                              {item.evidence && item.evidence.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {item.evidence.map((ev, idx) => (
                                    <div
                                      key={`${ev.field || 'field'}-${idx}`}
                                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">
                                          {ev.field}
                                        </span>
                                        <span className="font-mono text-blue-600 font-bold">
                                          {Math.round(ev.confidence * 100)}% Conf
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                        <div>
                                          <strong className="text-slate-700 dark:text-slate-200">
                                            Detected:
                                          </strong>{' '}
                                          {String(ev.candidateValue)}
                                        </div>
                                        <div>
                                          <strong className="text-slate-700 dark:text-slate-200">
                                            Reference:
                                          </strong>{' '}
                                          {String(ev.referenceValue || 'None')}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">
                                  No field-level evidence details available for this question.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
