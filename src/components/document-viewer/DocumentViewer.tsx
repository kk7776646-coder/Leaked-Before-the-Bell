import React from 'react';
import { PdfViewer } from './PdfViewer';
import { ImageViewer } from './ImageViewer';
import { FileText, Image as ImageIcon, Download, Calendar, Layers, ShieldCheck, Database, HardDrive } from 'lucide-react';
import { Button } from '../common/Button';

export interface DocumentViewerProps {
  documentId?: string;
  url: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  pageCount?: number;
  pages?: Array<{
    pageNumber: number;
    renderedImagePath?: string;
    text?: string;
    extractionMethod?: string;
    nativeTextLength?: number;
    ocrConfidence?: number;
    imageCoverage?: number;
  }>;
  images?: Array<{
    url: string;
    name: string;
    pageNumber: number;
  }>;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onDownload?: () => void;
  detectedDate?: string;
  source?: string;
  processingStatus?: string;
  showMetadataBar?: boolean;
  className?: string;
  height?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  url,
  filename,
  mimeType = '',
  fileSize,
  pageCount = 1,
  pages = [],
  images = [],
  currentPage,
  onPageChange,
  onDownload,
  detectedDate,
  source,
  processingStatus,
  showMetadataBar = true,
  className = '',
  height = '580px',
}) => {
  const isPdf =
    mimeType === 'application/pdf' ||
    filename.toLowerCase().endsWith('.pdf') ||
    url.toLowerCase().endsWith('.pdf');

  const isImage =
    mimeType.startsWith('image/') ||
    /\.(png|jpe?g|webp)$/i.test(filename) ||
    images.length > 0;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-2.5 font-sans ${className}`}>
      {/* Optional Top Metadata Bar */}
      {showMetadataBar && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              {isPdf ? (
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
              )}
              <span className="truncate max-w-xs">{filename}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-600">•</span>

            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              {isPdf ? 'PDF' : isImage ? 'IMAGE' : 'DOCUMENT'}
            </span>

            {fileSize && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {formatFileSize(fileSize)}
                </span>
              </>
            )}

            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              {pageCount || pages.length || 1} {(pageCount || pages.length || 1) === 1 ? 'page' : 'pages'}
            </span>

            {source && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                  {source}
                </span>
              </>
            )}

            {detectedDate && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 text-[11px]">
                  {new Date(detectedDate).toLocaleDateString()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {processingStatus && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  processingStatus === 'Processed' || processingStatus === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {processingStatus}
              </span>
            )}
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
      )}

      {/* Primary Visual Viewer */}
      {isPdf ? (
        <PdfViewer
          url={url}
          filename={filename}
          pageCount={pageCount}
          pages={pages}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onDownload={handleDownload}
          documentId={documentId}
          height={height}
        />
      ) : (
        <ImageViewer
          url={url}
          filename={filename}
          images={images}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onDownload={handleDownload}
          height={height}
        />
      )}
    </div>
  );
};
