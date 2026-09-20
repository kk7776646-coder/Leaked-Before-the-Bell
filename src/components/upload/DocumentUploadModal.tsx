import React, { useState, useRef } from 'react';
import { Button } from '../common/Button';
import { api, CandidateRecord } from '../../services/api';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  FileUp,
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (candidate: CandidateRecord) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [platform, setPlatform] = useState<string>('Upload');
  const [source, setSource] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    setSelectedFiles(fileArr);
    setError(null);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one document or image file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadStep('Uploading file(s) to secure storage...');

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (subject) formData.append('subject', subject);
      if (subjectCode) formData.append('subjectCode', subjectCode);
      if (platform) formData.append('platform', platform);
      if (source) formData.append('source', source);

      setUploadStep('Running OCR extraction and question parsing...');
      const result = await api.uploadCandidateDocument(formData);

      setUploadStep('Executing similarity comparison against Real Papers vault...');
      await new Promise((r) => setTimeout(r, 400));

      onUploadSuccess(result.candidate);
      onClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload and process document.');
    } finally {
      setIsUploading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FileUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Upload Candidate Document / Leak Evidence
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Ingest a suspected document, screenshot, or multi-page exam scan to trigger real-time OCR and question-level forensic comparison.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* File Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            {selectedFiles.length === 0 ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse
                  </span>{' '}
                  <span className="text-slate-500">or drag and drop files</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  PDF, PNG, JPG, JPEG, WEBP (Up to 50MB)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedFiles.length} file(s) selected
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {selectedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {f.name.endsWith('.pdf') ? (
                          <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                          {f.name}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono shrink-0 ml-2">
                        {formatFileSize(f.size)}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFiles([]);
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Choose different files
                </button>
              </div>
            )}
          </div>

          {/* Optional Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. MATH-201"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform / Origin
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="Upload">Examiner / Manual Upload</option>
                <option value="Telegram">Telegram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Reddit">Reddit</option>
                <option value="Facebook">Facebook</option>
                <option value="X">X (Twitter)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Channel / Source Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Channel @exam_prep_2026"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Progress Banner during Upload */}
          {isUploading && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                  Processing Document
                </span>
                <span className="text-blue-700 dark:text-blue-300 text-[11px]">
                  {uploadStep}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUploading || selectedFiles.length === 0}
              icon={isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            >
              {isUploading ? 'Analyzing...' : 'Upload & Analyze Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
