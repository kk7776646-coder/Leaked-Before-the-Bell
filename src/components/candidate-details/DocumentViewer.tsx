import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Candidate } from '../../types/candidate';
import { CandidateDocumentPreview } from '../candidates/CandidateDocumentPreview';
import { ZoomIn, ZoomOut, RotateCw, Scan, Maximize2, Layers } from 'lucide-react';

interface DocumentViewerProps {
  candidate: Candidate;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ candidate }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isScanning, setIsScanning] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-blue-500" />
          <span>Interactive Document Surveillance Viewer</span>
        </div>
      }
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showComparison ? 'primary' : 'outline'}
            icon={<Layers className="w-3.5 h-3.5" />}
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Single View' : 'Compare Master Template'}
          </Button>

          <Button
            size="sm"
            variant={isScanning ? 'secondary' : 'outline'}
            onClick={() => setIsScanning(!isScanning)}
          >
            {isScanning ? 'Pause Scanline' : 'Start Scanline'}
          </Button>
        </div>
      }
    >
      {/* Zoom Controls Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-500 font-medium">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Source Gateway: <strong className="font-medium text-slate-200">{candidate.source}</strong>
        </span>
      </div>

      {/* Main View Area */}
      <div
        className={`grid gap-4 transition-all duration-300 ${
          showComparison ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
      >
        <div>
          <div className="mb-2 text-xs font-medium text-slate-400 font-sans flex items-center justify-between">
            <span>Flagged Candidate Scan</span>
            <span className="text-rose-400 font-mono font-medium">LB-1042</span>
          </div>
          <CandidateDocumentPreview candidate={candidate} isScanning={isScanning} />
        </div>

        {showComparison && (
          <div>
            <div className="mb-2 text-xs font-medium text-slate-400 font-sans flex items-center justify-between">
              <span>Official Master Repository Reference</span>
              <span className="text-emerald-400 font-mono font-medium">VERIFIED_MASTER_V2</span>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-5 font-mono text-xs text-slate-200 min-h-[300px]">
              <div className="p-2 mb-3 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300 text-[11px]">
                OFFICIAL TEMPLATE: {candidate.subjectCode} (Spring 2026 Master Repository)
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {candidate.ocrText}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
