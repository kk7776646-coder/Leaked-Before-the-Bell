import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ActionMenu } from '../components/common/ActionMenu';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast, ToastNotification } from '../components/common/Toast';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { DocumentTypeIcon } from '../components/common/DocumentTypeIcon';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { DocumentUploadModal } from '../components/upload/DocumentUploadModal';
import { 
  FileSearch, 
  Search, 
  Upload, 
  CheckCircle2, 
  ShieldAlert,
  FileText,
  Eye,
  Trash2,
  Archive,
  RotateCcw,
  X,
  Loader2,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, CandidateRecord } from '../services/api';

export const CandidatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  const [items, setItems] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CandidateRecord | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<CandidateRecord | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<CandidateRecord | null>(null);
  const [viewTarget, setViewTarget] = useState<CandidateRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCandidates = async (
    currentStatus = statusFilter, 
    currentRisk = riskFilter, 
    currentType = typeFilter, 
    currentSearch = searchTerm
  ) => {
    try {
      const data = await api.getCandidates({
        status: currentStatus,
        risk: currentRisk,
        type: currentType,
        search: currentSearch,
      });
      setItems(data);
    } catch (err: any) {
      console.error('Failed to load candidates:', err);
      showToast(err.message || 'Failed to fetch candidate list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter, riskFilter, typeFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchCandidates(statusFilter, riskFilter, typeFilter, val);
  };

  const handleRiskChange = (risk: string) => {
    setRiskFilter(risk);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleStatusChange = (st: 'ALL' | 'ACTIVE' | 'ARCHIVED') => {
    setStatusFilter(st);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      await api.deleteCandidate(deleteTarget.id);
      showToast(`Document ${deleteTarget.id} deleted.`, 'success');
      setDeleteTarget(null);
      fetchCandidates();
    } catch (err: any) {
      showToast(err.message || 'Could not delete this item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setIsProcessing(true);
    try {
      await api.archiveCandidate(archiveTarget.id);
      showToast(`Document ${archiveTarget.id} archived.`, 'success');
      setArchiveTarget(null);
      fetchCandidates();
    } catch (err: any) {
      showToast(err.message || 'Could not archive this item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setIsProcessing(true);
    try {
      await api.restoreCandidate(restoreTarget.id);
      showToast(`Document ${restoreTarget.id} restored to active intake.`, 'success');
      setRestoreTarget(null);
      fetchCandidates();
    } catch (err: any) {
      showToast(err.message || 'Could not restore this item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSuccess = (newCandidate: CandidateRecord) => {
    showToast(`Document ${newCandidate.name} (${newCandidate.id}) uploaded and analyzed.`, 'success');
    fetchCandidates();
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50';
      case 'REVIEW REQUIRED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50';
      case 'LOW':
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800';
    }
  };

  const getReviewBadge = (review: string) => {
    switch (review) {
      case 'Needs Verification':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50';
      case 'Pending':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50';
      case 'Reviewed':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50';
      case 'Dismissed':
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Detected Content Intake & Investigation"
        description="Public social channels and user-uploaded question papers flagged for question matching and forensic similarity analysis."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Document
            </Button>
            <Link to="/data-sources">
              <Button variant="outline" size="sm">
                Monitored Sources Status
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="mb-6 font-sans">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search detected items by ID, filename, subject, source..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status View: Active / Archived / All */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {(['ACTIVE', 'ARCHIVED', 'ALL'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'ACTIVE' ? 'Active' : st === 'ARCHIVED' ? 'Archived' : 'All'}
                </button>
              ))}
            </div>

            {/* Risk filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium mr-1">Risk:</span>
              {['ALL', 'HIGH', 'REVIEW REQUIRED', 'LOW'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => handleRiskChange(risk)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                    riskFilter === risk
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {risk === 'REVIEW REQUIRED' ? 'Review' : risk}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium mr-1">Type:</span>
              {['ALL', 'Question Image', 'PDF', 'Screenshot', 'Document'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                    typeFilter === type
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Detected Content Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading detected documents from database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Content Item & ID</th>
                  <th className="py-3 px-4 font-semibold">Origin & Platform</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Assessed Risk</th>
                  <th className="py-3 px-4 font-semibold">Processing</th>
                  <th className="py-3 px-4 font-semibold">Review State</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <FileSearch className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          No detected documents found
                        </h4>
                        <p className="text-xs text-slate-500">
                          Upload a real PDF or screenshot from your machine to trigger real OCR text extraction and question forensics.
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Upload className="w-3.5 h-3.5" />}
                          onClick={() => setUploadModalOpen(true)}
                        >
                          Upload First Document
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <DocumentTypeIcon type={item.contentType} size={15} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{item.name}</span>
                        </div>
                        <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{item.id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <SocialPlatformIcon platform={item.platform} size={15} className="shrink-0" />
                          <span>{item.platform}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{item.source}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <SubjectIcon subject={item.subject} size={14} className="text-blue-500 shrink-0" />
                          <span>{item.subject}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadge(item.risk)}`}>
                          {item.risk === 'HIGH' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                          {item.risk}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {item.processing}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getReviewBadge(item.review)}`}>
                          {item.review}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {item.confidence}%
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/candidates/${item.id}`}>
                            <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                              Forensics
                            </Button>
                          </Link>

                          <ActionMenu
                            items={[
                              {
                                id: 'view',
                                label: 'Inspect Extracted Content',
                                icon: <Eye className="w-3.5 h-3.5" />,
                                onClick: () => setViewTarget(item),
                              },
                              ...(item.status === 'ACTIVE'
                                ? [
                                    {
                                      id: 'archive',
                                      label: 'Archive Detected Item',
                                      icon: <Archive className="w-3.5 h-3.5" />,
                                      variant: 'warning' as const,
                                      onClick: () => setArchiveTarget(item),
                                    },
                                  ]
                                : [
                                    {
                                      id: 'restore',
                                      label: 'Restore to Active Queue',
                                      icon: <RotateCcw className="w-3.5 h-3.5" />,
                                      variant: 'primary' as const,
                                      onClick: () => setRestoreTarget(item),
                                    },
                                  ]),
                              {
                                id: 'delete',
                                label: 'Delete Detected Item',
                                icon: <Trash2 className="w-3.5 h-3.5" />,
                                variant: 'danger' as const,
                                onClick: () => setDeleteTarget(item),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Real Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete detected content?"
        message="This will remove this detected item and its associated physical file and processed OCR cache from storage."
        confirmLabel="Delete"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={deleteTarget ? `Item ID: ${deleteTarget.id} (${deleteTarget.name})` : undefined}
        isLoading={isProcessing}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(archiveTarget)}
        title="Archive detected content?"
        message="This item will be hidden from the active detection queue, while preserving related alert records and historical analysis."
        confirmLabel="Archive"
        confirmVariant="secondary"
        confirmIcon={<Archive className="w-4 h-4 text-amber-500" />}
        detailsNotice={archiveTarget ? `Item ID: ${archiveTarget.id} (${archiveTarget.name})` : undefined}
        isLoading={isProcessing}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(restoreTarget)}
        title="Restore this detected item?"
        message="It will be moved back to the active monitoring and investigation queue."
        confirmLabel="Restore"
        confirmVariant="primary"
        confirmIcon={<RotateCcw className="w-4 h-4" />}
        isLoading={isProcessing}
        onConfirm={confirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      {/* View Item Details Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setViewTarget(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {viewTarget.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRiskBadge(viewTarget.risk)}`}>
                {viewTarget.risk} RISK
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {viewTarget.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Detected from {viewTarget.platform} ({viewTarget.source}) • Timestamp: {viewTarget.detectedTime}
            </p>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Extracted OCR Text</span>
                <p className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 italic max-h-40 overflow-y-auto">
                  "{viewTarget.extractedText}"
                </p>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Confidence Score: {viewTarget.confidence}%</span>
                <span>Review Status: {viewTarget.review}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link to={`/candidates/${viewTarget.id}`} onClick={() => setViewTarget(null)}>
                <Button variant="primary" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Full Forensics Matrix
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
