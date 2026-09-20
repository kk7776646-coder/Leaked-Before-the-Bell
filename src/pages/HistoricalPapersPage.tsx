import React, { useState, useEffect } from 'react';
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
  FileText, 
  Loader2, 
  Eye, 
  Plus,
  FlaskConical
} from 'lucide-react';
import { api, HistoricalPaperRecord } from '../services/api';
import { DocumentViewerModal } from '../components/document-viewer/DocumentViewerModal';
import { UniversalDocumentUploader } from '../components/upload/UniversalDocumentUploader';

export const HistoricalPapersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [papers, setPapers] = useState<HistoricalPaperRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<HistoricalPaperRecord | null>(null);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<HistoricalPaperRecord | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTrial, setIsGeneratingTrial] = useState(false);

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

  const confirmDeleteAll = async () => {
    setIsProcessing(true);
    try {
      const res = await api.deleteAllHistoricalPapers();
      showToast(res.message || 'All historical papers and storage files deleted.', 'success');
      setDeleteAllModalOpen(false);
      fetchPapers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete all historical papers.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateTrial = async () => {
    setIsGeneratingTrial(true);
    try {
      const res = await api.generateTrialHistoricalPaper();
      showToast('Physical trial examination paper generated, saved to storage, and vectorized.', 'success');
      await fetchPapers();
      if (res.paper) {
        setViewTarget(res.paper);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate trial paper.', 'error');
    } finally {
      setIsGeneratingTrial(false);
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
        action={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={isGeneratingTrial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              disabled={isGeneratingTrial}
              onClick={handleGenerateTrial}
              title="Generate a real physical trial examination PDF for testing"
            >
              {isGeneratingTrial ? 'Generating PDF...' : 'Add Trial Paper'}
            </Button>
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
              Upload Documents
            </Button>
          </div>
        }
      />

      {/* Search Bar and Quick Actions */}
      <Card className="mb-6 font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Add Papers (PDF / Folder / ZIP)
            </Button>
          </div>
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
          <div className="max-w-md mx-auto space-y-4">
            <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No historical papers in repository
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Upload past examination papers, entire semester folders, or ZIP archives to build the reference vector database for similarity matching.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                icon={isGeneratingTrial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5 text-purple-600" />}
                disabled={isGeneratingTrial}
                onClick={handleGenerateTrial}
              >
                {isGeneratingTrial ? 'Generating...' : 'Add Real Trial Paper'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => setUploadModalOpen(true)}
              >
                Upload Historical Documents
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <Card key={paper.id} className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <SubjectIcon code={paper.subjectCode} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={paper.title}>
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {paper.subject} • {paper.subjectCode}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {paper.year}
                </span>
              </div>

              {paper.ocrSnippet && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 mb-3">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono line-clamp-2 leading-relaxed">
                    "{paper.ocrSnippet}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{paper.totalQuestions} Questions Indexed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setViewTarget(paper)}
                    title="View Original Document"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownload(paper)}
                    title="Download Source Document"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => setDeleteTarget(paper)}
                    title="Delete Historical Paper"
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
        title="Delete historical paper?"
        message="This will permanently remove the document file and its vectorized embeddings from the repository."
        confirmLabel="Delete"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={deleteTarget ? `Document: ${deleteTarget.title} (${deleteTarget.subjectCode})` : undefined}
        isLoading={isProcessing}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteAllModalOpen}
        title={`Delete all ${papers.length} historical papers?`}
        message="This will permanently purge all uploaded past exam documents, binary storage files, and vector index records from the system. This action cannot be undone."
        confirmLabel="Delete All Papers"
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
          title={viewTarget.title}
          subtitle={`Subject: ${viewTarget.subject} (${viewTarget.subjectCode}) • Year: ${viewTarget.year} • Indexed: ${viewTarget.dateIndexed}`}
          url={api.getHistoricalDocumentUrl(viewTarget.id)}
          filename={viewTarget.filename || `${viewTarget.title}.pdf`}
          mimeType={viewTarget.filename?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'}
          fileSize={viewTarget.fileSize}
          pageCount={2}
          source={`Historical Vault • ${viewTarget.subjectCode}`}
          detectedDate={viewTarget.dateIndexed}
        />
      )}

      {/* Universal Multi-File / Folder / ZIP Ingestion Modal */}
      <UniversalDocumentUploader
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        mode="historical"
        onSuccess={() => {
          fetchPapers();
          showToast('Historical exam documents ingested and vectorized.', 'success');
        }}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
