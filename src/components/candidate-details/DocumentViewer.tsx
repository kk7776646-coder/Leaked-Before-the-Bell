import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CandidateRecord, api } from '../../services/api';
import { DocumentViewer as MasterDocumentViewer } from '../document-viewer/DocumentViewer';
import {
  FileText,
  Image as ImageIcon,
  Download,
  AlertCircle,
  FileCheck,
  FileSearch,
  CheckCircle2,
  Layers,
  Sparkles,
  AlertTriangle,
  Cpu,
  Eye,
  Info,
  ExternalLink,
  Target,
} from 'lucide-react';

export interface CandidateDocumentViewerProps {
  candidate: CandidateRecord;
  targetPage?: number;
  onPageChange?: (page: number) => void;
}

export const DocumentViewer: React.FC<CandidateDocumentViewerProps> = ({
  candidate,
  targetPage,
  onPageChange,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'pages' | 'metadata'>('preview');
  const [selectedPageNum, setSelectedPageNum] = useState<number>(targetPage || 1);

  useEffect(() => {
    if (targetPage && targetPage !== selectedPageNum) {
      setSelectedPageNum(targetPage);
    }
  }, [targetPage]);

  const documentUrl = api.getCandidateDocumentUrl(candidate.id);
  const isPdf = candidate.mimeType === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
  const isImage = candidate.mimeType.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(candidate.name);

  const pages = candidate.extractionSummary?.pages || [];
  const extractionMethod = candidate.extractionMethod || (isImage ? 'OCR_IMAGE' : 'NATIVE_PDF_TEXT');
  const ocrConfidence = candidate.ocrConfidence ?? (candidate.extractionSummary?.overallOcrConfidence ?? 90);
  const totalPages = candidate.pagesCount || candidate.extractionSummary?.totalPages || (pages.length > 0 ? pages.length : 1);
  const uncertainty = candidate.uncertaintyReason;

  const handlePageChange = (pageNum: number) => {
    setSelectedPageNum(pageNum);
    onPageChange?.(pageNum);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = candidate.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
            ) : (
              <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
            )}
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-xs">
              {candidate.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Original Document
              </button>
              {pages.length > 0 && (
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'pages'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Page Breakdown ({pages.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('ocr')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'ocr'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                OCR Extracted Text
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'metadata'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
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
        <div className="flex flex-wrap items-center gap-3">
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

      {/* TAB 1: ORIGINAL VISUAL DOCUMENT (THE REAL FILE) */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          <MasterDocumentViewer
            documentId={candidate.id}
            url={documentUrl}
            filename={candidate.name}
            mimeType={candidate.mimeType}
            fileSize={candidate.size}
            pageCount={totalPages}
            pages={pages}
            currentPage={selectedPageNum}
            onPageChange={handlePageChange}
            onDownload={handleDownload}
            showMetadataBar={false}
            height="620px"
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Viewing exact uploaded original binary (unaltered visual evidence).</span>
            <span>Security Hash: <span className="font-mono text-slate-700 dark:text-slate-300">{candidate.sha256.substring(0, 16)}...</span></span>
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
                      onClick={() => handlePageChange(p.pageNumber)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
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
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Target className="w-3.5 h-3.5 text-blue-500" />}
                          onClick={() => {
                            handlePageChange(curPage.pageNumber);
                            setActiveTab('preview');
                          }}
                        >
                          View in Document Viewer
                        </Button>
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
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <FileSearch className="w-3.5 h-3.5 text-blue-500" />
              OCR / Machine Extracted Text ({candidate.questions?.length || 0} question blocks)
            </span>
            <span className="font-mono text-[11px]">Engine: Page-by-Page Hybrid Pipeline (pdf-lib + Tesseract.js OCR)</span>
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
