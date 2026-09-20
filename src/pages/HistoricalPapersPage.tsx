import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast, ToastNotification } from '../components/common/Toast';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { 
  Database, 
  Search, 
  Upload, 
  Trash2, 
  Download, 
  CheckCircle2, 
  X,
  FileText,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api, HistoricalPaperRecord } from '../services/api';

export const HistoricalPapersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [papers, setPapers] = useState<HistoricalPaperRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<HistoricalPaperRecord | null>(null);
  const [viewTarget, setViewTarget] = useState<HistoricalPaperRecord | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadYear, setUploadYear] = useState<number>(2025);
  const [uploadQuestions, setUploadQuestions] = useState<number>(30);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPapers = async (search = searchTerm) => {
    try {
      const data = await api.getHistoricalPapers(search);
      setPapers(data);
    } catch (err: any) {
      console.error('Failed to load historical papers:', err);
      showToast(err.message || 'Failed to fetch historical papers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchPapers(val);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      await api.deleteHistoricalPaper(deleteTarget.id);
      showToast(`Historical paper ${deleteTarget.title} deleted from vault.`, 'success');
      setDeleteTarget(null);
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete historical paper.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a valid document or PDF file to upload.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('subject', uploadSubject);
      formData.append('subjectCode', uploadCode);
      formData.append('year', String(uploadYear));
      formData.append('totalQuestions', String(uploadQuestions));

      await api.uploadHistoricalPaper(formData);
      showToast(`Historical paper ${uploadTitle || uploadFile.name} uploaded and vectorized.`, 'success');

      // Reset form
      setUploadFile(null);
      setUploadTitle('');
      setUploadSubject('');
      setUploadCode('');
      setUploadModalOpen(false);
      fetchPapers();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload historical paper.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (paper: HistoricalPaperRecord) => {
    const link = document.createElement('a');
    link.href = api.getHistoricalDocumentUrl(paper.id);
    link.download = paper.filename || `${paper.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Historical Exam Paper Vault & Vector Index"
        description="Repository of previous years' examinations. Ingested papers are indexed for question similarity matching."
      />

      {/* Search Bar */}
      <Card className="mb-6 font-sans">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vault by title, subject, code, year..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </Card>

      {/* Grid of Papers */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading historical repository...</p>
        </div>
      ) : papers.length === 0 ? (
        <Card className="py-14 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No historical papers in repository
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload past examination papers to build the reference vector database for similarity matching.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload First Historical Paper
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          {papers.map((paper) => (
            <Card key={paper.id} className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {paper.subjectCode}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{paper.year}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <SubjectIcon subject={paper.subject} size={14} />
                    {paper.subject}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Parsed Questions:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{paper.totalQuestions} Questions</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Embeddings:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{paper.vectorEmbeddingsCount} Vectors</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>File Size:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">{(paper.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">ID: {paper.id}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewTarget(paper)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownload(paper)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => setDeleteTarget(paper)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete historical paper?"
        message="This will permanently remove the document and its vectorized embeddings from the repository."
        confirmLabel="Delete"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={deleteTarget ? `Document: ${deleteTarget.title} (${deleteTarget.subjectCode})` : undefined}
        isLoading={isProcessing}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* View Record Details Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setViewTarget(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {viewTarget.subjectCode}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Vectorized & Active
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {viewTarget.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Subject: {viewTarget.subject} • Examination Year: {viewTarget.year} • Indexed: {viewTarget.dateIndexed}
            </p>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Physical File Reference</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{viewTarget.filename}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">OCR Extracted Text Snippet</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto">
                  "{viewTarget.ocrSnippet || viewTarget.extractedText}"
                </p>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                <span>Vector Embeddings: {viewTarget.vectorEmbeddingsCount}</span>
                <span>File Size: {(viewTarget.fileSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => handleDownload(viewTarget)}
              >
                Download
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  const target = viewTarget;
                  setViewTarget(null);
                  setDeleteTarget(target);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Add Historical Exam Document
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingest historical papers into the secure vault. Documents are OCR-processed and vectorized for similarity matching.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">{uploadError}</div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* File input */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document File (PDF / Images)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        if (!uploadTitle) {
                          setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className="hidden"
                  />
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[240px]">{uploadFile.name}</span>
                      <span className="text-slate-400 font-mono">({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Choose file</span> or drag & drop
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025 Mathematics End-Semester Examination"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MATH-201"
                    value={uploadCode}
                    onChange={(e) => setUploadCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={uploadYear}
                    onChange={(e) => setUploadYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={uploadQuestions}
                    onChange={(e) => setUploadQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isProcessing || !uploadFile}
                  icon={isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                >
                  {isProcessing ? 'Vectorizing...' : 'Upload & Vectorize'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
