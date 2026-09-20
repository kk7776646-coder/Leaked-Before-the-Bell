import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CandidateRecord, api } from '../../services/api';
import {
  FileText,
  Image as ImageIcon,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
  FileCheck,
  FileSearch,
  Code2,
  CheckCircle2,
  Layers,
  Sparkles,
  AlertTriangle,
  Cpu,
  Eye,
  Info,
} from 'lucide-react';

interface DocumentViewerProps {
  candidate: CandidateRecord;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ candidate }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'pages' | 'metadata'>('preview');
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [loadError, setLoadError] = useState(false);

  const documentUrl = api.getCandidateDocumentUrl(candidate.id);
  const isPdf = candidate.mimeType === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
  const isImage = candidate.mimeType.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(candidate.name);

  const pages = candidate.extractionSummary?.pages || [];
  const extractionMethod = candidate.extractionMethod || (isImage ? 'OCR_IMAGE' : 'NATIVE_PDF_TEXT');
  const ocrConfidence = candidate.ocrConfidence ?? (candidate.extractionSummary?.overallOcrConfidence ?? 90);
  const totalPages = candidate.pagesCount || candidate.extractionSummary?.totalPages || (pages.length > 0 ? pages.length : 1);
  const uncertainty = candidate.uncertaintyReason;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = candidate.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <Card
      title={
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="w-4 h-4 text-rose-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-blue-500" />
            )}
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-xs">
              {candidate.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Original Document
              </button>
              {pages.length > 0 && (
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'pages'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Page Breakdown ({pages.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('ocr')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'ocr'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Extracted Text
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'metadata'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Extraction Telemetry
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
        </div>
      }
    >
      {/* 🌟 EXTRACTION TELEMETRY STRIP 🌟 */}
      <div className="mb-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            Method:
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                extractionMethod === 'NATIVE_TEXT'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : extractionMethod === 'OCR'
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : extractionMethod === 'MIXED'
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {extractionMethod === 'NATIVE_TEXT'
                ? 'Native Text PDF'
                : extractionMethod === 'OCR'
                ? 'Scanned Image PDF (OCR 200 DPI)'
                : extractionMethod === 'MIXED'
                ? 'Mixed Multi-Page PDF'
                : 'Direct Screenshot / Image OCR'}
            </span>
          </span>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
          </span>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            OCR Confidence:
            <span
              className={`font-bold ${
                ocrConfidence >= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : ocrConfidence >= 60
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {ocrConfidence}%
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {candidate.processing === 'Failed' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> FAILED EXTRACTION
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> EXTRACTION COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* ⚠️ EXTRACTION UNCERTAINTY WARNING ⚠️ */}
      {uncertainty && (
        <div className="mb-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Extraction Uncertainty Warning</span>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
              {uncertainty}
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: ORIGINAL DOCUMENT (ALWAYS PRESERVED) */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          {isImage && (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={handleZoomOut} icon={<ZoomOut className="w-3.5 h-3.5" />} />
                <span className="font-mono text-slate-600 dark:text-slate-300 w-12 text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} icon={<ZoomIn className="w-3.5 h-3.5" />} />
                <Button variant="ghost" size="sm" onClick={handleRotate} icon={<RotateCw className="w-3.5 h-3.5" />} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                icon={isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              />
            </div>
          )}

          {/* Document Viewer Frame */}
          <div
            className={`w-full bg-slate-900/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[420px] max-h-[620px] relative ${
              isFullscreen ? 'fixed inset-4 z-50 bg-black/95 max-h-none' : ''
            }`}
          >
            {loadError ? (
              <div className="text-center p-8 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Document preview unavailable
                </p>
                <p className="text-xs text-slate-500">
                  The original document file could not be rendered directly in the browser iframe.
                </p>
                <Button variant="outline" size="sm" onClick={handleDownload} icon={<Download className="w-3.5 h-3.5" />}>
                  Download Document
                </Button>
              </div>
            ) : isPdf ? (
              <iframe
                src={`${documentUrl}#toolbar=1&navpanes=0`}
                title={candidate.name}
                className="w-full h-[520px] border-0"
                onError={() => setLoadError(true)}
              />
            ) : isImage ? (
              <div className="overflow-auto w-full h-[520px] flex items-center justify-center p-4">
                <img
                  src={documentUrl}
                  alt={candidate.name}
                  onError={() => setLoadError(true)}
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                  className="max-h-full max-w-full object-contain shadow-lg rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {candidate.name}
                </p>
                <p className="text-xs text-slate-500">
                  Binary document file. Click download to inspect the raw file on your machine.
                </p>
                <Button variant="primary" size="sm" onClick={handleDownload} icon={<Download className="w-3.5 h-3.5" />}>
                  Download {candidate.name}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Viewing exact uploaded original binary (unaltered original layout).</span>
            <span>Security Hash: <span className="font-mono">{candidate.sha256.substring(0, 16)}...</span></span>
          </div>
        </div>
      )}

      {/* TAB 2: PAGE BREAKDOWN (PAGE-LEVEL INDEPENDENT INSPECTION) */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Page selection list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Pages Inspected ({pages.length})
              </h4>
              <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
                {pages.map((p) => {
                  const isSelected = selectedPageNum === p.pageNumber;
                  return (
                    <button
                      key={p.pageNumber}
                      onClick={() => setSelectedPageNum(p.pageNumber)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Page {p.pageNumber}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            p.extractionMethod === 'NATIVE_TEXT'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {p.extractionMethod === 'NATIVE_TEXT' ? 'Native Text' : 'OCR Scan (200DPI)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.text?.length || p.nativeTextLength || 0} chars</span>
                        <span>{p.imageCoverage && p.imageCoverage > 0.1 ? 'Contains Images' : 'Text Dominated'}</span>
                        <span className="font-mono font-medium">{p.ocrConfidence}% conf</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Page Details & Rendered Image / Text */}
            <div className="md:col-span-2 space-y-3">
              {(() => {
                const curPage = pages.find((p) => p.pageNumber === selectedPageNum) || pages[0];
                if (!curPage) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No page data available.
                    </div>
                  );
                }

                return (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Page {curPage.pageNumber} Analysis Details
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          Confidence: <strong className="font-mono text-slate-800 dark:text-slate-200">{curPage.ocrConfidence}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Method</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{curPage.extractionMethod}</span>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Image Coverage</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{((curPage.imageCoverage || 0) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Characters</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{curPage.text?.length || curPage.nativeTextLength || 0} chars</span>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Dimensions</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {curPage.dimensions ? `${Math.round(curPage.dimensions.width)}x${Math.round(curPage.dimensions.height)}` : 'A4'}
                        </span>
                      </div>
                    </div>

                    {/* Rendered Page Image if Scanned OCR was used */}
                    {curPage.renderedImagePath && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          Rendered Page Scan (200 DPI Ghostscript Canvas):
                        </span>
                        <div className="w-full h-64 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
                          <img
                            src={api.getDetectedPageImageUrl(candidate.id, curPage.pageNumber)}
                            alt={`Page ${curPage.pageNumber} render`}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              // If image fails, fallback to general document url
                              (e.target as HTMLImageElement).src = documentUrl;
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Page Extracted Text */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Page {curPage.pageNumber} Extracted Text Stream:
                      </span>
                      <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {curPage.text || 'No text extracted on this page.'}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXTRACTED OCR / NATIVE TEXT */}
      {activeTab === 'ocr' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <FileSearch className="w-3.5 h-3.5 text-blue-500" />
              Complete Extracted Text Output ({candidate.questions?.length || 0} parsed question blocks)
            </span>
            <span className="font-mono">Engine: Page-by-Page Hybrid Pipeline (pdf-lib + Tesseract.js OCR)</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[460px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {candidate.extractedText || 'No text extracted from this file.'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: METADATA & EXTRACTION TELEMETRY */}
      {activeTab === 'metadata' && (
        <div className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Extraction Pipeline Classification</span>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                {extractionMethod}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Average OCR Confidence Score</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {ocrConfidence}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">SHA-256 Checksum</span>
              <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all">
                {candidate.sha256}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Original Filename</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {candidate.name}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">MIME Type / Format</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {candidate.mimeType} ({candidate.contentType})
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">File Size</span>
              <p className="font-mono text-slate-800 dark:text-slate-200">
                {(candidate.size / 1024).toFixed(1)} KB ({candidate.size.toLocaleString()} bytes)
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Uploaded At</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {candidate.uploadedAt ? new Date(candidate.uploadedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Processing Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> {candidate.processing}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
