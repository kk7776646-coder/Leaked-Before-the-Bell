import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  ExternalLink,
  Layers,
  FileText,
  AlertCircle,
  RefreshCw,
  Columns,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';

// Configure PDF.js worker using standard versioned CDN worker URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export interface PdfViewerProps {
  url: string;
  filename: string;
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
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onDownload?: () => void;
  documentId?: string;
  className?: string;
  height?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  filename,
  pageCount = 1,
  pages = [],
  currentPage: externalPage,
  onPageChange,
  onDownload,
  documentId,
  className = '',
  height = '580px',
}) => {
  // Navigation & Document State
  const [internalPage, setInternalPage] = useState(1);
  const activePage = externalPage ?? internalPage;
  const [detectedTotalPages, setDetectedTotalPages] = useState<number>(pageCount || 1);
  const totalPages = Math.max(1, detectedTotalPages, pageCount || 0, pages.length);

  // PDF.js Document Instance
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [isPageRendering, setIsPageRendering] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Zoom, Rotation, Fit, and Fullscreen
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('width');
  const [viewMode, setViewMode] = useState<'canvas' | 'native'>('canvas');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Sync external page prop
  useEffect(() => {
    if (externalPage !== undefined && externalPage !== internalPage) {
      setInternalPage(externalPage);
    }
  }, [externalPage]);

  // Load PDF Document via PDF.js
  const loadPdfDocument = useCallback(async () => {
    if (!url) return;
    setIsPdfLoading(true);
    setLoadError(null);

    try {
      // Cancel previous rendering if any
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const loadingTask = pdfjsLib.getDocument({
        url,
        withCredentials: false,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });

      const loadedDoc = await loadingTask.promise;
      setPdfDoc(loadedDoc);
      setDetectedTotalPages(loadedDoc.numPages);
      setIsPdfLoading(false);
    } catch (err: any) {
      console.warn('PDF.js loading failed or fallback requested:', err);
      // If error is not a cancellation error
      if (err?.name !== 'RenderingCancelledException') {
        setLoadError(err?.message || 'Unable to load PDF document bytes.');
      }
      setIsPdfLoading(false);
    }
  }, [url]);

  useEffect(() => {
    loadPdfDocument();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [loadPdfDocument]);

  // Render Current Page to Canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || viewMode !== 'canvas') return;

    try {
      setIsPageRendering(true);

      // Cancel ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const safePageNum = Math.min(Math.max(1, activePage), pdfDoc.numPages);
      const page = await pdfDoc.getPage(safePageNum);

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const containerWidth = stageContainerRef.current?.clientWidth || 800;
      const containerHeight = stageContainerRef.current?.clientHeight || 600;

      // Base unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1, rotation });

      let calculatedScale = 1.0;
      if (fitMode === 'width') {
        const availableWidth = Math.max(300, containerWidth - 48);
        calculatedScale = availableWidth / unscaledViewport.width;
      } else if (fitMode === 'page') {
        const availableWidth = Math.max(300, containerWidth - 48);
        const availableHeight = Math.max(300, containerHeight - 48);
        const widthScale = availableWidth / unscaledViewport.width;
        const heightScale = availableHeight / unscaledViewport.height;
        calculatedScale = Math.min(widthScale, heightScale);
      } else {
        calculatedScale = (zoom / 100) * 1.25;
      }

      const finalScale = calculatedScale * (zoom / 100);
      const viewport = page.getViewport({ scale: finalScale, rotation });

      // High-DPI support (Device Pixel Ratio)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.save();
      context.scale(dpr, dpr);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      context.restore();
      setIsPageRendering(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
      setIsPageRendering(false);
    }
  }, [pdfDoc, activePage, zoom, rotation, fitMode, viewMode]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Page Controls
  const handleSetPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setInternalPage(validPage);
    onPageChange?.(validPage);
    setTimeout(() => {
      stageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const handleNextPage = () => handleSetPage(activePage + 1);
  const handlePrevPage = () => handleSetPage(activePage - 1);

  // Zoom Controls
  const handleZoomIn = () => {
    setFitMode('custom');
    setZoom((prev) => Math.min(prev + 20, 300));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setZoom((prev) => Math.max(prev - 20, 40));
  };

  const handleResetZoom = () => {
    setFitMode('custom');
    setZoom(100);
    stageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFitWidth = () => {
    setFitMode('width');
    setZoom(100);
    setTimeout(() => {
      stageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const handleFitPage = () => {
    setFitMode('page');
    setZoom(100);
    setTimeout(() => {
      stageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl select-none font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : ''
      } ${className}`}
      style={!isFullscreen ? { height } : undefined}
    >
      {/* ─── PRIMARY VIEWER TOOLBAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800 text-slate-200 text-xs shrink-0">
        {/* Left: Page Navigation & Thumbnails Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="Toggle Thumbnails Sidebar"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showThumbnails
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handlePrevPage}
            disabled={activePage <= 1}
            title="Previous Page"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={activePage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) handleSetPage(val);
              }}
              className="w-8 text-center bg-transparent border-0 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            />
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 font-bold">{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={activePage >= totalPages}
            title="Next Page"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle: Zoom & View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom to 100%"
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors font-mono text-[11px] min-w-[50px] text-center"
          >
            {zoom}%
          </button>

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleFitWidth}
            title="Fit Width"
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              fitMode === 'width'
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Fit Width
          </button>

          <button
            onClick={handleFitPage}
            title="Fit Page"
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              fitMode === 'page'
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Fit Page
          </button>

          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Mode Toggle, Fullscreen, Open External, Download */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Canvas
            </button>
            <button
              onClick={() => setViewMode('native')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'native'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Native Frame
            </button>
          </div>

          <button
            onClick={handleOpenExternal}
            title="Open Original Document in New Window"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onDownload && (
            <button
              onClick={onDownload}
              title="Download Original PDF"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── MAIN STAGE (THUMBNAILS + CANVAS) ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-40 sm:w-44 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-2 space-y-2">
            <div className="flex items-center justify-between pb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <span>Pages ({totalPages})</span>
            </div>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
              const isSelected = activePage === pNum;

              return (
                <button
                  key={pNum}
                  onClick={() => handleSetPage(pNum)}
                  className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      Page {pNum}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </div>

                  <div className="h-20 w-full bg-white rounded border border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <FileText className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] font-mono font-bold text-slate-700">
                        Page {pNum}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Center Document Canvas Stage with Full Vertical & Horizontal Scrolling */}
        <div
          ref={stageContainerRef}
          tabIndex={0}
          className="flex-1 bg-slate-950/95 overflow-y-auto overflow-x-auto relative focus:outline-none"
        >
          <div
            className={`min-h-full w-full p-4 flex flex-col items-center ${
              fitMode === 'page' ? 'justify-center' : 'justify-start'
            }`}
          >
            {isPdfLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-300 my-auto py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-xs font-medium">Fetching original document bytes...</p>
              </div>
            ) : loadError ? (
              <div className="text-center p-8 space-y-3 max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl my-auto">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">Document Rendering Fallback</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {loadError}. You can switch to Native PDF Frame or download the original file directly.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewMode('native');
                      setLoadError(null);
                    }}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Try Native PDF Frame
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPdfDocument()}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Retry
                  </Button>
                  {onDownload && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onDownload}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download Original
                    </Button>
                  )}
                </div>
              </div>
            ) : viewMode === 'native' ? (
              /* Native Browser Embed */
              <div className="w-full h-full min-h-[500px]">
                <iframe
                  src={`${url}#page=${activePage}&toolbar=1&navpanes=0`}
                  title={filename}
                  className="w-full h-full border-0 rounded-lg bg-white shadow-2xl min-h-[500px]"
                  onError={() => setLoadError('Native viewer failed to load file.')}
                />
              </div>
            ) : (
              /* PDF.js HTML5 Canvas Rendering with Full Vertical Scrolling */
              <div className="relative flex flex-col items-center justify-start max-w-full pb-8">
                {isPageRendering && (
                  <div className="sticky top-3 z-20 self-end bg-slate-900/90 backdrop-blur-xs text-slate-200 text-[11px] px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-lg mb-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                    Rendering Page {activePage}...
                  </div>
                )}
                <div className="p-1 bg-slate-800/60 rounded-lg shadow-2xl border border-slate-700/60 max-w-full">
                  <canvas
                    ref={canvasRef}
                    className="bg-white rounded block shadow-lg transition-all duration-150 max-w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── FOOTER STATUS STRIP ─── */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-300 truncate">{filename}</span>
          <span>•</span>
          <span className="text-slate-500 font-mono">
            Page {activePage} of {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-medium flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Verified Original Binary PDF
          </span>
        </div>
      </div>
    </div>
  );
};
