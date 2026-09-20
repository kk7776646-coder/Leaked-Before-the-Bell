import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';
import { Button } from '../common/Button';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
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
  documentId?: string;
  source?: string;
  detectedDate?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
  filename,
  mimeType,
  fileSize,
  pageCount,
  pages,
  documentId,
  source,
  detectedDate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="truncate pr-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              title="Open in new tab"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Stage */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-slate-900/50">
          <DocumentViewer
            documentId={documentId}
            url={url}
            filename={filename}
            mimeType={mimeType}
            fileSize={fileSize}
            pageCount={pageCount}
            pages={pages}
            source={source}
            detectedDate={detectedDate}
            height="72vh"
          />
        </div>
      </div>
    </div>
  );
};
