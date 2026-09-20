import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Layers,
  Columns
} from 'lucide-react';
import { Button } from '../common/Button';

export interface ImageViewerProps {
  url: string;
  filename: string;
  images?: Array<{
    url: string;
    name: string;
    pageNumber: number;
  }>;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onDownload?: () => void;
  className?: string;
  height?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  url,
  filename,
  images = [],
  currentPage: externalPage,
  onPageChange,
  onDownload,
  className = '',
  height = '560px',
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const activePage = externalPage ?? internalPage;
  const multiImages = images.length > 0 ? images : [{ url, name: filename, pageNumber: 1 }];
  const totalPages = multiImages.length;

  const currentImage = multiImages.find((img) => img.pageNumber === activePage) || multiImages[0];
  const activeUrl = currentImage?.url || url;

  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [fitMode, setFitMode] = useState<'custom' | 'contain'>('contain');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(totalPages > 1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync internal page when external changes
  useEffect(() => {
    if (externalPage !== undefined && externalPage !== internalPage) {
      setInternalPage(externalPage);
    }
  }, [externalPage]);

  // Reset state when switching images
  useEffect(() => {
    setLoadError(false);
    setIsLoading(true);
    setRotation(0);
  }, [activeUrl, activePage]);

  const handleSetPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setInternalPage(validPage);
    onPageChange?.(validPage);
  };

  const handleNextPage = () => handleSetPage(activePage + 1);
  const handlePrevPage = () => handleSetPage(activePage - 1);

  const handleZoomIn = () => {
    setFitMode('custom');
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setFitMode('custom');
    setZoom(100);
  };

  const handleFitContain = () => {
    setFitMode('contain');
    setZoom(100);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleOpenExternal = () => {
    window.open(activeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg select-none font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : ''
      } ${className}`}
      style={!isFullscreen ? { height } : undefined}
    >
      {/* ─── PRIMARY VIEWER TOOLBAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800 text-slate-200 text-xs shrink-0">
        {/* Left: Page Navigation for Multi-Image */}
        {totalPages > 1 ? (
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
              title="Previous Image"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-200 font-bold">{activePage}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400 font-bold">{totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={activePage >= totalPages}
              title="Next Image"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span className="truncate max-w-[200px] text-slate-300">{filename}</span>
          </div>
        )}

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
            title="Reset Zoom (100%)"
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors font-mono text-[11px] min-w-[52px] text-center"
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
            onClick={handleFitContain}
            title="Fit to Container"
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              fitMode === 'contain'
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Fit Container
          </button>

          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenExternal}
            title="Open Original Image in New Tab"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onDownload && (
            <button
              onClick={onDownload}
              title="Download Original Image"
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

      {/* ─── MAIN STAGE (THUMBNAIL SIDEBAR + IMAGE CANVAS) ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Thumbnails Sidebar for Multi-Image */}
        {showThumbnails && totalPages > 1 && (
          <div className="w-44 sm:w-48 bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-2.5 space-y-2">
            <div className="flex items-center justify-between pb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <span>Uploaded Images ({totalPages})</span>
            </div>

            {multiImages.map((img) => {
              const isSelected = activePage === img.pageNumber;
              return (
                <button
                  key={img.pageNumber}
                  onClick={() => handleSetPage(img.pageNumber)}
                  className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-200">
                    <span className="flex items-center gap-1.5 truncate">
                      <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      Image {img.pageNumber}
                    </span>
                  </div>

                  <div className="h-20 w-full bg-slate-950 rounded border border-slate-800/80 overflow-hidden flex items-center justify-center relative">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Center Image Stage */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-4 relative">
          {loadError ? (
            <div className="text-center p-8 space-y-3 max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">Document preview unavailable</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The original image file could not be loaded or is unavailable.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoadError(false);
                    setIsLoading(true);
                  }}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Retry
                </Button>
                {onDownload && (
                  <Button variant="primary" size="sm" onClick={onDownload} icon={<Download className="w-3.5 h-3.5" />}>
                    Download Original
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 gap-2 bg-slate-950/70 backdrop-blur-2xs z-10">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  Loading Original Image...
                </div>
              )}

              <img
                src={activeUrl}
                alt={filename}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setLoadError(true);
                  setIsLoading(false);
                }}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxHeight: fitMode === 'contain' ? '82vh' : 'none',
                  maxWidth: fitMode === 'contain' ? '100%' : 'none',
                }}
                className="object-contain shadow-2xl rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── FOOTER STATUS STRIP ─── */}
      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-300 truncate">{filename}</span>
          {totalPages > 1 && (
            <>
              <span>•</span>
              <span className="text-slate-500 font-mono">Image {activePage} of {totalPages}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-medium flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Original Visual Screenshot / Scan
          </span>
        </div>
      </div>
    </div>
  );
};
