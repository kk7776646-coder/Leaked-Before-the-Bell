import React, { useState, useRef } from 'react';
import { Button } from '../common/Button';
import { api, HistoricalPaperRecord, RealPaperRecord } from '../../services/api';
import {
  Upload,
  FolderUp,
  Files,
  FileText,
  Image as ImageIcon,
  Archive,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface UniversalUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'historical' | 'verified' | 'detected';
  onSuccess?: (data?: any) => void;
  title?: string;
  description?: string;
}

export interface StagedItem {
  id: string;
  file: File;
  name: string;
  relativePath?: string;
  size: number;
  type: string;
  status: 'READY' | 'UPLOADING' | 'UPLOADED' | 'DUPLICATE' | 'FAILED';
  progress: number;
  loadedBytes: number;
  totalBytes: number;
  sha256?: string;
  error?: string;
  isDuplicate?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string, mimeType: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'zip' || mimeType.includes('zip')) {
    return <Archive className="w-4 h-4 text-amber-500 shrink-0" />;
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mimeType.startsWith('image/')) {
    return <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
  }
  return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
}

export const UniversalDocumentUploader: React.FC<UniversalUploaderProps> = ({
  isOpen,
  onClose,
  mode,
  onSuccess,
  title,
  description,
}) => {
  const [stagedFiles, setStagedFiles] = useState<StagedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<{
    uploaded: number;
    duplicate: number;
    failed: number;
  } | null>(null);

  // Optional metadata overrides
  const [showMetadataOptions, setShowMetadataOptions] = useState(false);
  const [subjectOverride, setSubjectOverride] = useState('');
  const [codeOverride, setCodeOverride] = useState('');
  const [yearOverride, setYearOverride] = useState<number>(new Date().getFullYear());
  const [questionsOverride, setQuestionsOverride] = useState<number>(30);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const modalTitle =
    title ||
    (mode === 'historical'
      ? 'Ingest Historical Exam Papers'
      : mode === 'verified'
      ? 'Ingest Verified Baseline Papers'
      : 'Ingest Examination Documents');

  const modalDescription =
    description ||
    (mode === 'historical'
      ? 'Upload single papers, multi-file batches, folders, or ZIP archives. Documents are OCR-extracted and indexed into the vector similarity database.'
      : mode === 'verified'
      ? 'Upload trusted exam papers, folders, or ZIP archives. Ingested papers enter the baseline in PENDING status for official verification.'
      : 'Upload exam documents, folders, or ZIP archives for automated layout analysis and question indexing.');

  // Handle incoming File list
  const addFilesToQueue = (files: File[]) => {
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setSuccessSummary(null);

    const newItems: StagedItem[] = [];

    for (const file of files) {
      // Ignore hidden or OS system files (.DS_Store, Thumbs.db)
      if (file.name.startsWith('.') || file.name === 'Thumbs.db') continue;

      const relativePath = (file as any).webkitRelativePath || file.name;
      const itemId = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).substring(2, 7)}`;

      // Prevent duplicate additions in the local queue
      const alreadyInQueue = stagedFiles.some(
        (existing) => existing.name === file.name && existing.size === file.size && existing.relativePath === relativePath
      );

      if (!alreadyInQueue) {
        newItems.push({
          id: itemId,
          file,
          name: file.name,
          relativePath,
          size: file.size,
          type: file.type || 'application/octet-stream',
          status: 'READY',
          progress: 0,
          loadedBytes: 0,
          totalBytes: file.size,
        });
      }
    }

    if (newItems.length > 0) {
      setStagedFiles((prev) => [...prev, ...newItems]);
    }

    // Reset native input values so the exact same files or new ones can be selected immediately
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFilesToQueue(files);
  };

  const handleFolderPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFilesToQueue(files);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const fileList: File[] = [];
      const queue: any[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
          if (entry) {
            queue.push(entry);
          } else {
            const file = item.getAsFile();
            if (file) fileList.push(file);
          }
        }
      }

      if (queue.length > 0) {
        const readEntry = async (entry: any, pathPrefix = ''): Promise<void> => {
          if (entry.isFile) {
            return new Promise((resolve) => {
              entry.file((file: File) => {
                // Attach synthetic relative path
                Object.defineProperty(file, 'webkitRelativePath', {
                  value: pathPrefix ? `${pathPrefix}/${file.name}` : file.name,
                  writable: true,
                });
                fileList.push(file);
                resolve();
              }, () => resolve());
            });
          } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const entries: any[] = await new Promise((resolve) => {
              dirReader.readEntries((results: any[]) => resolve(results || []), () => resolve([]));
            });
            for (const child of entries) {
              await readEntry(child, pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name);
            }
          }
        };

        for (const rootEntry of queue) {
          await readEntry(rootEntry);
        }
      }

      if (fileList.length > 0) {
        addFilesToQueue(fileList);
        return;
      }
    }

    const fallbackFiles = Array.from(e.dataTransfer.files ?? []);
    if (fallbackFiles.length > 0) {
      addFilesToQueue(fallbackFiles);
    }
  };

  const removeItem = (id: string) => {
    if (isUploading) return;
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    if (isUploading) return;
    setStagedFiles([]);
    setSuccessSummary(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // Perform upload
  const handleUpload = async () => {
    const pendingItems = stagedFiles.filter((f) => f.status === 'READY' || f.status === 'FAILED');
    if (pendingItems.length === 0) {
      setErrorMessage('No pending files to upload. Click "+ Add More Files" to stage documents.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setOverallProgress(5);

    // Update status to UPLOADING
    setStagedFiles((prev) =>
      prev.map((item) =>
        item.status === 'READY' || item.status === 'FAILED'
          ? { ...item, status: 'UPLOADING', progress: 10, error: undefined }
          : item
      )
    );

    try {
      const formData = new FormData();
      const relativePaths: string[] = [];

      for (const item of pendingItems) {
        formData.append('files', item.file, item.name);
        relativePaths.push(item.relativePath || item.name);
      }

      formData.append('relativePaths', JSON.stringify(relativePaths));

      if (subjectOverride.trim()) formData.append('subject', subjectOverride.trim());
      if (codeOverride.trim()) formData.append('subjectCode', codeOverride.trim());
      if (yearOverride) formData.append('year', String(yearOverride));
      if (questionsOverride) formData.append('totalQuestions', String(questionsOverride));

      // Use XMLHttpRequest for real upload progress
      const xhr = new XMLHttpRequest();
      const uploadUrl = mode === 'historical' ? '/api/historical/upload' : mode === 'verified' ? '/api/real-papers/upload' : '/api/candidates/upload';

      const uploadPromise = new Promise<{
        success: boolean;
        totalCount: number;
        uploadedCount: number;
        duplicateCount: number;
        failedCount: number;
        items: Array<{
          id: string;
          title?: string;
          filename: string;
          relativePath?: string;
          status: 'UPLOADED' | 'DUPLICATE' | 'FAILED';
          isDuplicate?: boolean;
          message?: string;
          error?: string;
        }>;
      }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 90);
            setOverallProgress(percent);
            setStagedFiles((prev) =>
              prev.map((item) =>
                item.status === 'UPLOADING'
                  ? {
                      ...item,
                      progress: percent,
                      loadedBytes: Math.round((item.size * percent) / 100),
                    }
                  : item
              )
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (err) {
              reject(new Error('Invalid response format received from server.'));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || err.message || `Upload failed with HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with HTTP ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during file upload.')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted.')));

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      const response = await uploadPromise;
      setOverallProgress(100);

      const serverItems = response.items || [];

      // Update item statuses based on response
      setStagedFiles((prev) =>
        prev.map((item) => {
          const match = serverItems.find(
            (si) =>
              si.filename === item.name ||
              (si.relativePath && (si.relativePath === item.relativePath || si.relativePath.endsWith(item.name)))
          );

          if (match) {
            return {
              ...item,
              status: match.status,
              isDuplicate: match.isDuplicate || match.status === 'DUPLICATE',
              error: match.error,
              progress: 100,
              loadedBytes: item.size,
            };
          }

          // Fallback if not individually matched
          return {
            ...item,
            status: response.uploadedCount > 0 ? 'UPLOADED' : 'FAILED',
            progress: 100,
            loadedBytes: item.size,
          };
        })
      );

      const uploaded = response.uploadedCount || (response.items ? response.items.filter((i) => i.status === 'UPLOADED').length : 0);
      const duplicate = response.duplicateCount || (response.items ? response.items.filter((i) => i.status === 'DUPLICATE').length : 0);
      const failed = response.failedCount || (response.items ? response.items.filter((i) => i.status === 'FAILED').length : 0);

      setSuccessSummary({ uploaded, duplicate, failed });

      // Notify parent to refresh list immediately
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during ingestion.');
      setStagedFiles((prev) =>
        prev.map((item) =>
          item.status === 'UPLOADING' ? { ...item, status: 'FAILED', error: err.message } : item
        )
      );
    } finally {
      setIsUploading(false);
      // Reset input refs so selecting files again works immediately
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const totalBytes = stagedFiles.reduce((acc, f) => acc + f.size, 0);
  const pendingCount = stagedFiles.filter((f) => f.status === 'READY' || f.status === 'FAILED').length;
  const completedCount = stagedFiles.filter((f) => f.status === 'UPLOADED' || f.status === 'DUPLICATE').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                mode === 'historical'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : mode === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {mode === 'verified' ? <ShieldCheck className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{modalTitle}</h2>
              <p className="text-xs text-slate-500 line-clamp-1">{modalDescription}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Summary Banner */}
          {successSummary && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Batch complete:</strong> {successSummary.uploaded} uploaded & indexed
                  {successSummary.duplicate > 0 && `, ${successSummary.duplicate} duplicates identified`}
                  {successSummary.failed > 0 && `, ${successSummary.failed} failed`}.
                </span>
              </div>
              <button
                onClick={() => setSuccessSummary(null)}
                className="text-slate-400 hover:text-slate-600 text-xs underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Hidden File / Folder Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,application/pdf,image/png,image/jpeg,image/webp,application/zip"
            onChange={handleFilesPicked}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory=""
            // @ts-ignore
            directory=""
            multiple
            onChange={handleFolderPicked}
            className="hidden"
          />

          {/* Dropzone & Action Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Documents (PDF, Images, ZIP, Folders)
              </label>
              <span className="text-[11px] text-slate-400">Multi-file & folders supported</span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-xl transition-all text-center flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                <Upload className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Drag and drop examination files or folders here
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports PDF question papers, single or multi-page images (PNG, JPG, WEBP), and recursive ZIP archives
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  icon={<Files className="w-3.5 h-3.5" />}
                >
                  Choose Files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isUploading}
                  icon={<FolderUp className="w-3.5 h-3.5" />}
                >
                  Choose Folder
                </Button>
              </div>
            </div>
          </div>

          {/* Staged Items Queue */}
          {stagedFiles.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    Queue: {stagedFiles.length} item{stagedFiles.length !== 1 ? 's' : ''} ({formatBytes(totalBytes)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Files
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={clearQueue}
                    disabled={isUploading}
                    className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              {/* Progress bar during active upload */}
              {isUploading && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              )}

              {/* Item List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {stagedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      {getFileIcon(item.name, item.type)}
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-sm">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                          {item.relativePath && item.relativePath !== item.name && (
                            <span className="truncate max-w-[180px] font-mono text-slate-500">
                              📁 {item.relativePath}
                            </span>
                          )}
                          <span>{formatBytes(item.size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'READY' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Ready
                        </span>
                      )}
                      {item.status === 'UPLOADING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Ingesting
                        </span>
                      )}
                      {item.status === 'UPLOADED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
                        </span>
                      )}
                      {item.status === 'DUPLICATE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          Duplicate
                        </span>
                      )}
                      {item.status === 'FAILED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1" title={item.error}>
                          Failed
                        </span>
                      )}

                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Metadata Accordion */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/20">
            <button
              type="button"
              onClick={() => setShowMetadataOptions(!showMetadataOptions)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Subject & Metadata Options (Optional)</span>
              </div>
              {showMetadataOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMetadataOptions && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <p className="text-[11px] text-slate-400">
                  Leave fields empty to allow OCR AI to automatically detect subject, code, year, and questions from header texts.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Subject Override (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-detected from OCR"
                      value={subjectOverride}
                      onChange={(e) => setSubjectOverride(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Subject Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CS501"
                      value={codeOverride}
                      onChange={(e) => setCodeOverride(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Examination Year
                    </label>
                    <input
                      type="number"
                      min={2000}
                      max={2030}
                      value={yearOverride}
                      onChange={(e) => setYearOverride(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Estimated Questions Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={questionsOverride}
                      onChange={(e) => setQuestionsOverride(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {stagedFiles.length > 0 ? (
              <span>
                {completedCount > 0 ? `${completedCount} processed` : ''}
                {pendingCount > 0 && ` · ${pendingCount} ready for upload`}
              </span>
            ) : (
              <span>Select files or a directory to begin</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
            >
              {completedCount > 0 && pendingCount === 0 ? 'Close' : 'Cancel'}
            </Button>

            {pendingCount > 0 && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading || pendingCount === 0}
                icon={
                  isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )
                }
              >
                {isUploading
                  ? `Ingesting (${overallProgress}%)...`
                  : `Upload & Ingest ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
              </Button>
            )}

            {pendingCount === 0 && completedCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add More Files
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
