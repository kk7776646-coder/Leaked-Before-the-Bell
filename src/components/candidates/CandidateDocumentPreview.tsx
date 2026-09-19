import React from 'react';
import { FileText, Eye, ShieldAlert } from 'lucide-react';
import { Candidate } from '../../types/candidate';

interface CandidateDocumentPreviewProps {
  candidate: Candidate;
  isScanning?: boolean;
}

export const CandidateDocumentPreview: React.FC<CandidateDocumentPreviewProps> = ({
  candidate,
  isScanning = false,
}) => {
  return (
    <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-900 text-slate-100 p-5 shadow-lg overflow-hidden font-mono text-xs select-none">
      {/* Document Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-[10px] mb-4 font-sans">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-slate-200 font-mono">{candidate.id}.RAW_SCAN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">{candidate.documentType}</span>
          <span className="text-amber-400 font-medium">{candidate.metadata.pages} Page(s)</span>
        </div>
      </div>

      {/* Simulated Paper Background / Watermark */}
      <div className="relative p-6 bg-slate-950/80 rounded-lg border border-slate-800/80 text-slate-300 font-serif leading-relaxed overflow-hidden min-h-[300px]">
        {/* Animated Scan Line */}
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan shadow-[0_0_15px_#22d3ee] z-20" />
        )}

        {/* Paper Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg] select-none text-center">
          <div className="text-5xl font-semibold font-sans text-rose-500">
            POTENTIALLY SUSPICIOUS
          </div>
        </div>

        {/* Simulated Document Header */}
        <div className="text-center pb-4 border-b border-slate-800/60 mb-4 space-y-1">
          <p className="font-semibold text-sm text-white font-sans">
            NATIONAL EXAMINATION BOARD
          </p>
          <p className="text-xs text-blue-400 font-mono">
            {candidate.subject} ({candidate.subjectCode})
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            SEMESTER: {candidate.metadata.semester} | MAX MARKS: {candidate.metadata.maxMarks}
          </p>
        </div>

        {/* OCR Snippet with highlighting */}
        <div className="space-y-3 font-mono text-[11px] leading-relaxed text-slate-300">
          <p className="bg-amber-950/30 border-l-2 border-amber-500 p-2 text-amber-200/90 rounded-r">
            [OCR HIGHLIGHT - MATCH CONFIDENCE {candidate.riskScore}%]
          </p>
          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-normal">
            {candidate.ocrText}
          </pre>
        </div>
      </div>

      {/* Document Footer Source */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Captured Source: {candidate.source}</span>
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          Checksum Validated
        </span>
      </div>
    </div>
  );
};
