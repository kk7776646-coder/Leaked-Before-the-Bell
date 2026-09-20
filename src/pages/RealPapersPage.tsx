import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast, ToastNotification } from '../components/common/Toast';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { 
  FileCheck2, 
  Search, 
  Upload, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Loader2, 
  Lock, 
  Eye, 
  Plus 
} from 'lucide-react';
import { api, RealPaperRecord } from '../services/api';
import { DocumentViewerModal } from '../components/document-viewer/DocumentViewerModal';
import { UniversalDocumentUploader } from '../components/upload/UniversalDocumentUploader';

export const RealPapersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [papers, setPapers] = useState<RealPaperRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<RealPaperRecord | null>(null);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<RealPaperRecord | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPapers = async (search = searchTerm) => {
    try {
      const data = await api.getRealPapers({ search });
      setPapers(data);
    } catch (err: any) {
      console.error('Failed to load real papers:', err);
      showToast(err.message || 'Failed to fetch verified papers', 'error');
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
      await api.deleteRealPaper(deleteTarget.id);
      showToast(`Verified baseline paper ${deleteTarget.filename} deleted.`, 'success');
      setDeleteTarget(null);
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete real paper.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteAll = async () => {
    setIsProcessing(true);
    try {
      const res = await api.deleteAllRealPapers();
      showToast(res.message || 'All verified baseline papers and storage files deleted.', 'success');
      setDeleteAllModalOpen(false);
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete all verified baseline papers.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (paper: RealPaperRecord) => {
    const link = document.createElement('a');
    link.href = api.getRealPaperDocumentUrl(paper.id);
    link.download = paper.filename || `${paper.subjectCode}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Trusted Real Exam Papers Baseline"
        description="Official, chief-examiner verified question papers. Used as absolute ground truth for question forensic comparisons and leak verification."
        action={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {papers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-950/30"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setDeleteAllModalOpen(true)}
              >
                Delete All ({papers.length})
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Verified Baseline
            </Button>
          </div>
        }
      />

      {/* Search Bar and Quick Action */}
      <Card className="mb-6 font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search baseline by paper title, subject, code, SHA-256..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Add Baseline Documents (PDF / Folder / ZIP)
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid of Verified Baseline Papers */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading ground-truth repository...</p>
        </div>
      ) : papers.length === 0 ? (
        <Card className="py-14 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No ground truth exam papers in vault
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Upload official confidential examination papers, folders, or ZIP packages. These act as the ground-truth baseline for automated question-level comparison.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Verified Baseline Papers
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <Card key={paper.id} className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <SubjectIcon code={paper.subjectCode} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={paper.exam || paper.filename}>
                      {paper.exam || paper.filename}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {paper.subject} • {paper.subjectCode}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {paper.verificationStatus || 'VERIFIED'}
                </span>
              </div>

              <div className="space-y-1.5 mb-3 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center justify-between">
                  <span>SHA-256:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={paper.sha256}>
                    {paper.sha256.substring(0, 16)}...
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Questions:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">
                    {paper.structuredData?.questions?.length ?? '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Year: {paper.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setViewTarget(paper)}
                    title="View Document"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownload(paper)}
                    title="Download Document"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => setDeleteTarget(paper)}
                    title="Delete Verified Baseline Paper"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete ground-truth paper?"
        message="This will remove the baseline verification paper from the database and disk storage. Existing leak detections will retain their recorded matches."
        confirmLabel="Delete"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={deleteTarget ? `Document: ${deleteTarget.exam || deleteTarget.filename} (${deleteTarget.subjectCode})` : undefined}
        isLoading={isProcessing}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteAllModalOpen}
        title={`Delete all ${papers.length} verified baseline papers?`}
        message="This will permanently remove all official baseline examination files and records from the ground-truth vault. This action cannot be undone."
        confirmLabel="Delete All Verified Papers"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        isLoading={isProcessing}
        onConfirm={confirmDeleteAll}
        onCancel={() => setDeleteAllModalOpen(false)}
      />

      {/* View Real Document Modal */}
      {viewTarget && (
        <DocumentViewerModal
          isOpen={Boolean(viewTarget)}
          onClose={() => setViewTarget(null)}
          title={viewTarget.exam || viewTarget.filename}
          subtitle={`Verified baseline for ${viewTarget.subject} (${viewTarget.subjectCode}) • Year: ${viewTarget.year}`}
          url={api.getRealPaperDocumentUrl(viewTarget.id)}
          filename={viewTarget.filename || `${viewTarget.subjectCode}.pdf`}
          mimeType={viewTarget.filename?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'}
          fileSize={viewTarget.fileSize}
          pageCount={viewTarget.pageCount || 1}
          source={`Ground Truth • ${viewTarget.subjectCode}`}
          detectedDate={viewTarget.examDate || viewTarget.verifiedAt || `${viewTarget.year}`}
        />
      )}

      {/* Universal Multi-File / Folder / ZIP Ingestion Modal */}
      <UniversalDocumentUploader
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        mode="verified"
        onSuccess={() => {
          fetchPapers();
          showToast('Verified baseline documents ingested successfully.', 'success');
        }}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
