import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import {
  api,
  CandidateRecord,
  IngestionHierarchyResult,
  UploadRecord,
  UploadResponseItem,
} from '../../services/api';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Archive,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Layers,
  Sparkles,
  Info,
  Edit3,
  Check,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Download,
  Copy,
  RotateCw,
  FlaskConical,
  CheckCheck,
  FileCode,
  HardDrive,
  RefreshCw,
  Folder,
  FolderUp,
  Files,
  FileUp,
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (candidate: CandidateRecord) => void;
}

interface StagedFile {
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
  uploadId?: string;
  sha256?: string;
  error?: string;
  isDuplicate?: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'VAULT'>('UPLOAD');
  const [stage, setStage] = useState<'SELECT' | 'UPLOADING' | 'UPLOADED_CONFIRMED' | 'INSPECTING' | 'REVIEW_PAPERS' | 'COMMITTING'>('SELECT');
  
  // Staged files queue
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [platform, setPlatform] = useState<string>('Upload');
  const [source, setSource] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [overallError, setOverallError] = useState<string | null>(null);
  const [activeStepText, setActiveStepText] = useState<string>('');
  const [overallUploadProgress, setOverallUploadProgress] = useState<number>(0);
  const [uploadedReceipts, setUploadedReceipts] = useState<UploadResponseItem[]>([]);

  // Vault / recent uploads
  const [vaultUploads, setVaultUploads] = useState<UploadRecord[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  // Test suite state
  const [isTestingSuite, setIsTestingSuite] = useState(false);
  const [testSuiteReport, setTestSuiteReport] = useState<any>(null);
  
  // Inspection hierarchy result
  const [inspectionResult, setInspectionResult] = useState<IngestionHierarchyResult | null>(null);
  const [userPaperOverrides, setUserPaperOverrides] = useState<
    Record<string, { subject?: string; subjectCode?: string; maxMarks?: number; duration?: string; examDate?: string }>
  >({});
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'VAULT') {
      fetchVaultUploads();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const fetchVaultUploads = async () => {
    setVaultLoading(true);
    try {
      const data = await api.getUploads();
      setVaultUploads(data);
    } catch (err: any) {
      console.error('Failed to load uploads vault:', err);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming: StagedFile[] = Array.from(files).map((f) => {
      const relPath = (f as any).webkitRelativePath || f.name;
      return {
        id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        name: f.name,
        relativePath: relPath !== f.name ? relPath : undefined,
        size: f.size,
        type: f.type,
        status: 'READY' as const,
        progress: 0,
        loadedBytes: 0,
        totalBytes: f.size,
      };
    });

    setStagedFiles((prev) => [...prev, ...incoming]);
    setOverallError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSha(text);
    setTimeout(() => setCopiedSha(null), 2500);
  };

  // Perform upload to /api/uploads
  const handlePerformUpload = async () => {
    const readyToUpload = stagedFiles.filter((f) => f.status === 'READY' || f.status === 'FAILED');
    if (readyToUpload.length === 0) {
      setOverallError('Please select at least one valid file to upload.');
      return;
    }

    setStage('UPLOADING');
    setOverallError(null);
    setOverallUploadProgress(0);

    // Update all staged files to UPLOADING
    setStagedFiles((prev) =>
      prev.map((item) =>
        item.status === 'READY' || item.status === 'FAILED'
          ? { ...item, status: 'UPLOADING', progress: 5 }
          : item
      )
    );

    try {
      const filesToUpload = readyToUpload.map((item) => item.file);
      const relativePaths = readyToUpload.map((item) => item.relativePath || item.name);
      
      const res = await api.uploadFiles(
        filesToUpload,
        {
          platform,
          source,
          notes: 'Uploaded via LeakLens Upload Manager',
          relativePaths,
        },
        (percent, loaded, total) => {
          setOverallUploadProgress(percent);
          setStagedFiles((prev) =>
            prev.map((item) =>
              item.status === 'UPLOADING'
                ? {
                    ...item,
                    progress: percent,
                    loadedBytes: Math.round((loaded / total) * item.size),
                  }
                : item
            )
          );
        }
      );

      setUploadedReceipts(res.uploads);

      // Match responses back to staged files by filename
      setStagedFiles((prev) =>
        prev.map((item) => {
          const match = res.uploads.find((u) => u.original_filename === item.name);
          if (match) {
            return {
              ...item,
              status: match.status === 'UPLOAD_FAILED' ? 'FAILED' : match.status === 'DUPLICATE' ? 'DUPLICATE' : 'UPLOADED',
              uploadId: match.upload_id,
              sha256: match.sha256,
              error: match.error,
              isDuplicate: match.is_duplicate,
              progress: 100,
              loadedBytes: item.size,
            };
          }
          return item;
        })
      );

      setStage('UPLOADED_CONFIRMED');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setOverallError(err.message || 'Upload failed.');
      setStagedFiles((prev) =>
        prev.map((item) => (item.status === 'UPLOADING' ? { ...item, status: 'FAILED', error: err.message } : item))
      );
      setStage('SELECT');
    }
  };

  // Retry a single failed staged file
  const handleRetrySingleFile = async (stagedItem: StagedFile) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === stagedItem.id ? { ...item, status: 'UPLOADING', progress: 10, error: undefined } : item))
    );

    try {
      const res = await api.uploadFiles([stagedItem.file], {
        platform,
        source,
        relativePaths: [stagedItem.relativePath || stagedItem.name],
      });
      const itemRes = res.uploads[0];
      setStagedFiles((prev) =>
        prev.map((item) => {
          if (item.id === stagedItem.id && itemRes) {
            return {
              ...item,
              status: itemRes.status === 'UPLOAD_FAILED' ? 'FAILED' : itemRes.status === 'DUPLICATE' ? 'DUPLICATE' : 'UPLOADED',
              uploadId: itemRes.upload_id,
              sha256: itemRes.sha256,
              error: itemRes.error,
              isDuplicate: itemRes.is_duplicate,
              progress: 100,
            };
          }
          return item;
        })
      );
    } catch (err: any) {
      setStagedFiles((prev) =>
        prev.map((item) =>
          item.id === stagedItem.id ? { ...item, status: 'FAILED', error: err.message || 'Retry failed.' } : item
        )
      );
    }
  };

  // Run automated upload test suite
  const handleRunUploadTestSuite = async () => {
    setIsTestingSuite(true);
    try {
      const report = await api.runUploadTestSuite();
      setTestSuiteReport(report);
    } catch (err: any) {
      setOverallError(err.message || 'Failed to run upload test suite.');
    } finally {
      setIsTestingSuite(false);
    }
  };

  // Optional downstream Inspection / OCR metadata extraction
  const handleProceedToInspection = async () => {
    const successfulItems = stagedFiles.filter((f) => f.status === 'UPLOADED' || f.status === 'DUPLICATE');
    if (successfulItems.length === 0) {
      setOverallError('No successfully uploaded files to inspect.');
      return;
    }

    setStage('INSPECTING');
    setOverallError(null);
    setActiveStepText('Unpacking files, performing OCR and auto-extracting metadata...');

    try {
      const formData = new FormData();
      successfulItems.forEach((item) => {
        formData.append('files', item.file);
      });
      const relativePaths = successfulItems.map((item) => item.relativePath || item.name);
      formData.append('relative_paths', JSON.stringify(relativePaths));

      if (platform) formData.append('platform', platform);
      if (source) formData.append('source', source);

      const res = await api.inspectCandidateDocument(formData);
      setInspectionResult(res.inspection);

      const initialOverrides: Record<string, any> = {};
      res.inspection.papers.forEach((p) => {
        initialOverrides[p.paperId] = {
          subject: p.metadata.subject.value !== 'Not detected' ? p.metadata.subject.value : '',
          subjectCode: p.metadata.subjectCode.value !== 'Not detected' ? p.metadata.subjectCode.value : '',
          maxMarks: p.metadata.maxMarks.value || undefined,
          duration: p.metadata.duration.value !== 'Not detected' ? p.metadata.duration.value : '',
          examDate: p.metadata.examDate.value !== 'Not detected' ? p.metadata.examDate.value : '',
        };
      });
      setUserPaperOverrides(initialOverrides);
      setStage('REVIEW_PAPERS');
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setOverallError(err.message || 'Inspection failed during document processing.');
      setStage('UPLOADED_CONFIRMED');
    }
  };

  // Commit verified papers to candidates
  const handleConfirmCommit = async () => {
    if (!inspectionResult) return;

    setStage('COMMITTING');
    setOverallError(null);
    setActiveStepText('Committing papers to database and running forensic cross-checks...');

    try {
      const res = await api.confirmIngestion({
        hierarchyResult: inspectionResult,
        platform,
        source: source || (inspectionResult.isArchive ? `Archive: ${inspectionResult.originalFilename}` : 'Direct Intake / Examiner Upload'),
        userPaperOverrides,
      });

      if (res.candidate) {
        onUploadSuccess(res.candidate);
      }
      onClose();
    } catch (err: any) {
      console.error('Commit failed:', err);
      setOverallError(err.message || 'Failed to finalize ingestion.');
      setStage('REVIEW_PAPERS');
    }
  };

  const renderConfidenceBadge = (confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW', confidence: number, source: string) => {
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (confidenceLevel === 'HIGH') {
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    } else if (confidenceLevel === 'MEDIUM') {
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    } else if (source === 'NOT_DETECTED') {
      colorClass = 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${colorClass}`}>
        <span>{confidenceLevel} ({Math.round(confidence * 100)}%)</span>
        <span className="opacity-60">•</span>
        <span className="font-mono text-[9px] truncate max-w-[90px]">{source.replace(/_/g, ' ')}</span>
      </span>
    );
  };

  const totalQueueBytes = stagedFiles.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>LeakLens Document Intake</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                  Multipart Binary Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Single/Multi-file, Folder, and ZIP archive ingestion with SHA-256 validation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={stage === 'UPLOADING' || stage === 'INSPECTING' || stage === 'COMMITTING'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between pt-3 pb-1">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('UPLOAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'UPLOAD'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Upload & Ingest
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('VAULT');
                fetchVaultUploads();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'VAULT'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Uploaded Vault</span>
              {vaultUploads.length > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-mono">
                  {vaultUploads.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleRunUploadTestSuite}
            disabled={isTestingSuite}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isTestingSuite ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
            <span>Run Upload Tests</span>
          </button>
        </div>

        {/* Test Suite Summary Banner (if tested) */}
        {testSuiteReport && (
          <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSuiteReport.summary}</span>
            </div>
            <button
              type="button"
              onClick={() => setTestSuiteReport(null)}
              className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Notification */}
        {overallError && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">{overallError}</div>
          </div>
        )}

        {/* Hidden inputs for Files vs Folder */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,application/pdf,image/png,image/jpeg,image/webp,application/zip"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: '', directory: '' } as any)}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs pr-1">
          {activeTab === 'VAULT' ? (
            /* TAB 2: UPLOADED VAULT HISTORY */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Stored uploads on filesystem (/storage/uploads/)</span>
                <button
                  type="button"
                  onClick={fetchVaultUploads}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {vaultLoading ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : vaultUploads.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <HardDrive className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                  <p>No files uploaded to vault yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {vaultUploads.map((up) => (
                    <div
                      key={up.upload_id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0">
                          {up.original_filename.endsWith('.zip') ? (
                            <Archive className="w-4 h-4 text-amber-500" />
                          ) : up.original_filename.endsWith('.pdf') ? (
                            <FileText className="w-4 h-4 text-red-500" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2 truncate">
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{up.upload_id}</span>
                            <span className="truncate">{up.original_filename}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{formatFileSize(up.size)}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                              SHA: {up.sha256 ? up.sha256.slice(0, 10) : 'N/A'}...
                              {up.sha256 && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(up.sha256)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="Copy SHA-256"
                                >
                                  {copiedSha === up.sha256 ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </span>
                            <span>•</span>
                            <span>{new Date(up.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={api.getUploadFileUrl(up.upload_id)}
                          download={up.original_filename}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Download original binary"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Delete uploaded record ${up.upload_id}?`)) {
                              await api.deleteUpload(up.upload_id);
                              fetchVaultUploads();
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                          title="Delete from vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 1: UPLOAD WORKFLOW */
            <>
              {/* STAGE 1: SELECT & QUEUE FILES */}
              {(stage === 'SELECT' || stage === 'UPLOADING') && (
                <>
                  {/* Action Buttons: [ Upload Files ] & [ Upload Folder ] */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={stage === 'UPLOADING'}
                      className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold transition-all shadow-2xs hover:shadow-xs group"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                        <FileUp className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Upload Files</div>
                        <div className="text-[10px] text-blue-600/80 dark:text-blue-400 font-normal">
                          PDF, Images, ZIP
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      disabled={stage === 'UPLOADING'}
                      className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold transition-all shadow-2xs hover:shadow-xs group"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-700 dark:bg-slate-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                        <FolderUp className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Upload Folder</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          Recursive Directory
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/40 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          Or drag and drop files or folders here
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-md mx-auto">
                        Supports single/multiple PDFs, image scans (PNG, JPG, WEBP), and nested ZIP archives.
                      </p>
                    </div>
                  </div>

                  {/* Staged Files Queue List */}
                  {stagedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                          <span>Staged Intake Queue ({stagedFiles.length} files • {formatFileSize(totalQueueBytes)})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setStagedFiles([])}
                          disabled={stage === 'UPLOADING'}
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          Clear Queue
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {stagedFiles.map((item) => {
                          const isZip = item.name.endsWith('.zip');
                          const isPdf = item.name.endsWith('.pdf');

                          return (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  <div className="shrink-0">
                                    {isZip ? (
                                      <Archive className="w-4 h-4 text-amber-500" />
                                    ) : isPdf ? (
                                      <FileText className="w-4 h-4 text-red-500" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-blue-500" />
                                    )}
                                  </div>
                                  <div className="truncate">
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs truncate block">
                                      {item.name}
                                    </span>
                                    {item.relativePath && (
                                      <span className="text-[10px] text-slate-400 font-mono truncate block">
                                        📁 {item.relativePath}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {formatFileSize(item.size)}
                                  </span>

                                  {/* Status badge */}
                                  {item.status === 'READY' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                                      Ready
                                    </span>
                                  )}
                                  {item.status === 'UPLOADING' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      {item.progress}%
                                    </span>
                                  )}
                                  {item.status === 'UPLOADED' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Uploaded
                                    </span>
                                  )}
                                  {item.status === 'DUPLICATE' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                                      Duplicate
                                    </span>
                                  )}
                                  {item.status === 'FAILED' && (
                                    <div className="flex items-center gap-1">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-medium">
                                        Failed
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRetrySingleFile(item)}
                                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline ml-1"
                                      >
                                        Retry
                                      </button>
                                    </div>
                                  )}

                                  {stage !== 'UPLOADING' && (
                                    <button
                                      type="button"
                                      onClick={() => removeStagedFile(item.id)}
                                      className="text-slate-400 hover:text-red-500 p-0.5"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Progress bar when uploading */}
                              {item.status === 'UPLOADING' && (
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-full transition-all duration-200"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              )}

                              {/* Error message */}
                              {item.error && (
                                <div className="text-[10px] text-red-600 dark:text-red-400">
                                  {item.error}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Channel / Platform Tag
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      >
                        <option value="Upload">Direct Intake / File Upload</option>
                        <option value="Telegram">Telegram Channel</option>
                        <option value="WhatsApp">WhatsApp Group</option>
                        <option value="Reddit">Reddit Community</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="X">X (Twitter)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Source Reference (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Channel @exam_leak_alerts"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STAGE 2: UPLOADED CONFIRMATION RECEIPT */}
              {stage === 'UPLOADED_CONFIRMED' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Binary Files Uploaded & Persisted to Storage</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      All uploaded files have been safely stored with verified SHA-256 signatures. You may now inspect metadata and OCR boundaries, or finish.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {stagedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                            {f.uploadId || 'UP-STORED'}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                              {f.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span>SHA: {f.sha256 ? f.sha256.slice(0, 12) : 'N/A'}...</span>
                              {f.sha256 && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(f.sha256!)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                  {copiedSha === f.sha256 ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                          {f.isDuplicate ? 'DUPLICATE (LINKED)' : 'PERSISTED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 3: INSPECTING / PROCESSING ANIMATION */}
              {stage === 'INSPECTING' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Analyzing & Ingesting Documents
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {activeStepText || 'Extracting text, OCR scanning, and evaluating paper boundaries...'}
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 4: REVIEW DETECTED PAPERS & AUTO-EXTRACTED METADATA */}
              {stage === 'REVIEW_PAPERS' && inspectionResult && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-950 dark:text-blue-100 text-xs">
                        Found {inspectionResult.papers.length} Logical Paper(s) in {inspectionResult.originalFilename}
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                        {inspectionResult.totalPagesCount} total page(s) • {inspectionResult.detectedDocumentsCount} document(s) detected • SHA-256: {inspectionResult.sha256.slice(0, 12)}...
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200 text-[10px] font-bold">
                      {inspectionResult.fileType}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {inspectionResult.papers.map((paper, pIdx) => {
                      const overrides = userPaperOverrides[paper.paperId] || {};
                      const isEditing = editingPaperId === paper.paperId;
                      const displaySubject = overrides.subject !== undefined ? overrides.subject : paper.metadata.subject.value;
                      const displayCode = overrides.subjectCode !== undefined ? overrides.subjectCode : paper.metadata.subjectCode.value;
                      const displayMarks = overrides.maxMarks !== undefined ? overrides.maxMarks : paper.metadata.maxMarks.value;
                      const displayDuration = overrides.duration !== undefined ? overrides.duration : paper.metadata.duration.value;

                      return (
                        <div
                          key={paper.paperId}
                          className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/60 p-4 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                                {pIdx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                                  {displaySubject || 'Uncategorized Examination Paper'}
                                  {displayCode && (
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                                      {displayCode}
                                    </span>
                                  )}
                                </h4>
                                <div className="text-[11px] text-slate-500">
                                  Pages {paper.pageRange.startPage}–{paper.pageRange.endPage} ({paper.pageCount} pages) • {paper.questions.length} questions extracted • OCR Confidence: {Math.round(paper.overallOcrConfidence)}%
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setEditingPaperId(isEditing ? null : paper.paperId)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                              <span>{isEditing ? 'Done' : 'Edit Metadata'}</span>
                            </button>
                          </div>

                          {!isEditing ? (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-1">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                                  <span>Subject</span>
                                  {renderConfidenceBadge(paper.metadata.subject.confidenceLevel, paper.metadata.subject.confidence, paper.metadata.subject.source)}
                                </div>
                                <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {displaySubject || <span className="italic text-slate-400">Not detected</span>}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-1">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                                  <span>Subject Code</span>
                                  {renderConfidenceBadge(paper.metadata.subjectCode.confidenceLevel, paper.metadata.subjectCode.confidence, paper.metadata.subjectCode.source)}
                                </div>
                                <div className="font-mono text-slate-800 dark:text-slate-200">
                                  {displayCode || <span className="italic text-slate-400 font-sans">Not detected</span>}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-1">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                                  <span>Max Marks</span>
                                  {renderConfidenceBadge(paper.metadata.maxMarks.confidenceLevel, paper.metadata.maxMarks.confidence, paper.metadata.maxMarks.source)}
                                </div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {displayMarks ? `${displayMarks} Marks` : <span className="italic text-slate-400">Not detected</span>}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-1">
                                <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                                  <span>Duration</span>
                                  {renderConfidenceBadge(paper.metadata.duration.confidenceLevel, paper.metadata.duration.confidence, paper.metadata.duration.source)}
                                </div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {displayDuration || <span className="italic text-slate-400">Not detected</span>}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2.5">
                              <div className="text-[11px] font-bold text-blue-900 dark:text-blue-200">
                                Override Extracted Metadata
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Subject Name</label>
                                  <input
                                    type="text"
                                    value={overrides.subject || ''}
                                    onChange={(e) => setUserPaperOverrides({
                                      ...userPaperOverrides,
                                      [paper.paperId]: { ...overrides, subject: e.target.value },
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Subject Code</label>
                                  <input
                                    type="text"
                                    value={overrides.subjectCode || ''}
                                    onChange={(e) => setUserPaperOverrides({
                                      ...userPaperOverrides,
                                      [paper.paperId]: { ...overrides, subjectCode: e.target.value },
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Max Marks</label>
                                  <input
                                    type="number"
                                    value={overrides.maxMarks || ''}
                                    onChange={(e) => setUserPaperOverrides({
                                      ...userPaperOverrides,
                                      [paper.paperId]: { ...overrides, maxMarks: parseInt(e.target.value, 10) || undefined },
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Duration</label>
                                  <input
                                    type="text"
                                    value={overrides.duration || ''}
                                    onChange={(e) => setUserPaperOverrides({
                                      ...userPaperOverrides,
                                      [paper.paperId]: { ...overrides, duration: e.target.value },
                                    })}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STAGE 5: COMMITTING ANIMATION */}
              {stage === 'COMMITTING' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Executing Similarity Cross-Check
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Comparing extracted question items against Real Papers vault and generating risk alerts...
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {activeTab === 'VAULT' ? (
              `${vaultUploads.length} record(s) persisted in storage`
            ) : stage === 'SELECT' ? (
              `${stagedFiles.length} file(s) in queue (${formatFileSize(totalQueueBytes)})`
            ) : stage === 'UPLOADED_CONFIRMED' ? (
              'Files safely uploaded to server storage.'
            ) : stage === 'REVIEW_PAPERS' ? (
              'Review extracted properties before committing.'
            ) : null}
          </div>

          <div className="flex gap-2">
            {activeTab === 'VAULT' ? (
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            ) : stage === 'SELECT' ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={stagedFiles.length === 0}
                  onClick={handlePerformUpload}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload All ({stagedFiles.length})
                </Button>
              </>
            ) : stage === 'UPLOADED_CONFIRMED' ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Keep in Vault
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleProceedToInspection}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Auto-Inspect & Ingest
                </Button>
              </>
            ) : stage === 'REVIEW_PAPERS' ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => setStage('UPLOADED_CONFIRMED')}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmCommit}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Confirm & Ingest ({inspectionResult?.papers.length || 1} Papers)
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
