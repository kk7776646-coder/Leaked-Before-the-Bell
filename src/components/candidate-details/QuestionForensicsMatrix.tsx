import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FileSearch, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionForensicResult, MatchResult } from '../../types/realPaper';

interface QuestionForensicsMatrixProps {
  candidateId: string;
}

export const QuestionForensicsMatrix: React.FC<QuestionForensicsMatrixProps> = ({ candidateId }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Mock forensic results for candidate paper matching verified real papers and historical vault
  const forensicResults: QuestionForensicResult[] = [
    {
      candidateQuestionId: 'Q1(a)',
      referenceType: 'VERIFIED_REAL_PAPER',
      referencePaperId: 'RP-2026-DBMS-01',
      referenceQuestionId: 'RP-Q1a',
      textSimilarity: 0.98,
      semanticSimilarity: 0.99,
      typeMatch: 'MATCH',
      marksMatch: 'MATCH',
      sectionMatch: 'MATCH',
      numberMatch: 'MATCH',
      positionMatch: 'MATCH',
      topicMatch: 'MATCH',
      contextSimilarity: 0.97,
      overallSimilarity: 0.98,
      result: 'MATCH',
      confidence: 'HIGH',
      evidence: [
        { field: 'question_text', candidateValue: 'Explain ACID properties in relational database systems with suitable examples.', referenceValue: 'Explain the ACID properties in relational database systems with suitable examples for each property.', result: 'MATCH', confidence: 0.98 },
        { field: 'marks', candidateValue: 10, referenceValue: 10, result: 'MATCH', confidence: 1.0 },
        { field: 'section', candidateValue: 'Section A', referenceValue: 'Section A', result: 'MATCH', confidence: 1.0 },
        { field: 'position', candidateValue: 1, referenceValue: 1, result: 'MATCH', confidence: 1.0 },
      ],
    },
    {
      candidateQuestionId: 'Q1(b)',
      referenceType: 'VERIFIED_REAL_PAPER',
      referencePaperId: 'RP-2026-DBMS-01',
      referenceQuestionId: 'RP-Q1b',
      textSimilarity: 0.94,
      semanticSimilarity: 0.96,
      typeMatch: 'MATCH',
      marksMatch: 'MATCH',
      sectionMatch: 'MATCH',
      numberMatch: 'MATCH',
      positionMatch: 'MATCH',
      topicMatch: 'MATCH',
      contextSimilarity: 0.95,
      overallSimilarity: 0.95,
      result: 'MATCH',
      confidence: 'HIGH',
      evidence: [
        { field: 'question_text', candidateValue: 'Discuss serializability and conflict serializability using precedence graphs.', referenceValue: 'Discuss serializability and conflict serializability testing using precedence graphs.', result: 'MATCH', confidence: 0.94 },
        { field: 'marks', candidateValue: 10, referenceValue: 10, result: 'MATCH', confidence: 1.0 },
        { field: 'section', candidateValue: 'Section A', referenceValue: 'Section A', result: 'MATCH', confidence: 1.0 },
        { field: 'position', candidateValue: 2, referenceValue: 2, result: 'MATCH', confidence: 1.0 },
      ],
    },
    {
      candidateQuestionId: 'Q2',
      referenceType: 'VERIFIED_REAL_PAPER',
      referencePaperId: 'RP-2026-DBMS-01',
      referenceQuestionId: 'RP-Q2',
      textSimilarity: 0.91,
      semanticSimilarity: 0.93,
      typeMatch: 'MATCH',
      marksMatch: 'MATCH',
      sectionMatch: 'MATCH',
      numberMatch: 'MATCH',
      positionMatch: 'PARTIAL_MATCH',
      topicMatch: 'MATCH',
      contextSimilarity: 0.90,
      overallSimilarity: 0.91,
      result: 'PARTIAL_MATCH',
      confidence: 'MEDIUM',
      evidence: [
        { field: 'question_text', candidateValue: 'Consider relation R(A,B,C,D,E) with FDs... find candidate keys and normalize 3NF.', referenceValue: 'Consider relation R(A, B, C, D, E) with functional dependencies... find candidate keys and normalize up to 3NF.', result: 'MATCH', confidence: 0.91 },
        { field: 'position', candidateValue: 3, referenceValue: 4, result: 'PARTIAL_MATCH', confidence: 0.8 },
      ],
    },
    {
      candidateQuestionId: 'Q3',
      referenceType: 'VERIFIED_REAL_PAPER',
      referencePaperId: 'RP-2026-DBMS-01',
      referenceQuestionId: 'RP-Q3',
      textSimilarity: 0.86,
      semanticSimilarity: 0.89,
      typeMatch: 'MATCH',
      marksMatch: 'MATCH',
      sectionMatch: 'MATCH',
      numberMatch: 'DIFFERENT',
      positionMatch: 'DIFFERENT',
      topicMatch: 'MATCH',
      contextSimilarity: 0.85,
      overallSimilarity: 0.86,
      result: 'PARTIAL_MATCH',
      confidence: 'MEDIUM',
      evidence: [
        { field: 'question_text', candidateValue: 'Explain B+ tree insertion with example and key 45.', referenceValue: 'Explain B+ tree insertion algorithm with a suitable example. Show tree state after inserting key 45.', result: 'MATCH', confidence: 0.86 },
        { field: 'number_match', candidateValue: 'Q3', referenceValue: 'Q5', result: 'DIFFERENT', confidence: 0.9 },
      ],
    },
    {
      candidateQuestionId: 'Q4',
      referenceType: 'NONE',
      textSimilarity: 0.12,
      semanticSimilarity: 0.20,
      typeMatch: 'UNCERTAIN',
      marksMatch: 'UNCERTAIN',
      sectionMatch: 'UNCERTAIN',
      numberMatch: 'UNCERTAIN',
      positionMatch: 'UNCERTAIN',
      topicMatch: 'UNCERTAIN',
      contextSimilarity: 0.10,
      overallSimilarity: 0.12,
      result: 'NO_REFERENCE',
      confidence: 'HIGH',
      evidence: [
        { field: 'reference_search', candidateValue: 'Custom unverified question block', referenceValue: null, result: 'NO_REFERENCE', confidence: 0.99 },
      ],
    },
  ];

  const getResultBadge = (result: MatchResult) => {
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Question-Level Forensic Comparison Engine (v1.0)</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-signal forensic analysis comparing candidate paper against Trusted Real Papers (RP-2026-DBMS-01) and Historical Vault. Preserves evidence and uncertainty without automated leak declarations.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Forensic Confidence</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">0.87 (High)</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sources Separation per Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Exam Configuration</h4>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">DBMS (CS501)</div>
          <p className="text-xs text-slate-500 mt-0.5">End-Term • 100 Marks • 3 Hours</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trusted Real Paper Reference</h4>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">RP-2026-DBMS-01 (Verified)</div>
          <p className="text-xs text-slate-500 mt-0.5">Chief Examiner Verified • 100% Match Baseline</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-600">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Historical References</h4>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">HP-2025-DBMS-03 Vault</div>
          <p className="text-xs text-slate-500 mt-0.5">Vectorized RAG Similarities Available</p>
        </Card>
      </div>

      {/* Question Matrix Table */}
      <Card title="Question Forensic Matrix" subtitle="Click any row to inspect field-level evidence and similarity breakdowns">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Candidate Q</th>
                <th className="py-3 px-4 font-semibold">Reference Q</th>
                <th className="py-3 px-4 font-semibold">Text Similarity</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Marks</th>
                <th className="py-3 px-4 font-semibold">Section</th>
                <th className="py-3 px-4 font-semibold">Position</th>
                <th className="py-3 px-4 font-semibold">Result</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {forensicResults.map((item) => {
                const isExpanded = expandedRow === item.candidateQuestionId;
                return (
                  <React.Fragment key={item.candidateQuestionId}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : item.candidateQuestionId)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.candidateQuestionId}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {item.referenceQuestionId || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {item.textSimilarity > 0 ? `${Math.round(item.textSimilarity * 100)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.typeMatch}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.marksMatch}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.sectionMatch}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.positionMatch}</td>
                      <td className="py-3 px-4">{getResultBadge(item.result)}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/80 dark:bg-slate-900/80">
                        <td colSpan={9} className="p-4">
                          <div className="space-y-3 font-sans">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                              Field-Level Forensic Evidence — {item.candidateQuestionId}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.evidence.map((ev, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">{ev.field}</span>
                                    <span className="font-mono text-blue-600 font-bold">{Math.round(ev.confidence * 100)}% Conf</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                    <div><strong className="text-slate-700 dark:text-slate-200">Candidate:</strong> {String(ev.candidateValue)}</div>
                                    <div><strong className="text-slate-700 dark:text-slate-200">Reference:</strong> {String(ev.referenceValue)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
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
      </Card>
    </div>
  );
};
