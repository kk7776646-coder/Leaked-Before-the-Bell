import React, { useState, useEffect, useMemo } from 'react';
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
import { PageFilterMenu, FilterFieldDefinition, PageFilterValues } from '../components/common/PageFilterMenu';
import {
  FileSearch,
  Search,
  Eye,
  Trash2,
  Archive,
  RotateCcw,
  Loader2,
  ArrowUpRight,
  RotateCw,
  Upload,
  CheckCircle2,
  XCircle,
  FlaskConical,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, DetectedContentRecord } from '../services/api';
import { DocumentUploadModal } from '../components/upload/DocumentUploadModal';

const DEFAULT_FILTER_VALUES: PageFilterValues = {
  risk: 'ALL',
  subject: 'ALL',
  source: 'ALL',
  processing: 'ALL',
  review: 'ALL',
  type: 'ALL',
  dateFrom: '',
  dateTo: '',
};

export const DetectedContentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<PageFilterValues>(DEFAULT_FILTER_VALUES);

  const [rawItems, setRawItems] = useState<DetectedContentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<DetectedContentRecord | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<DetectedContentRecord | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<DetectedContentRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTestSuiteModalOpen, setIsTestSuiteModalOpen] = useState(false);
  const [testSuiteLoading, setTestSuiteLoading] = useState(false);
  const [testSuiteReport, setTestSuiteReport] = useState<any>(null);

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRunTestSuite = async () => {
    setIsTestSuiteModalOpen(true);
    setTestSuiteLoading(true);
    try {
      const report = await api.runIngestionTestSuite();
      setTestSuiteReport(report);
      showToast(`Ingestion test suite completed: ${report.passedCount}/${report.totalTests} passed.`, 'success');
    } catch (err: any) {
      console.error('Failed to run test suite:', err);
      showToast(err.message || 'Failed to run test suite', 'error');
    } finally {
      setTestSuiteLoading(false);
    }
  };

  const fetchDetectedContent = async () => {
    setLoading(true);
    try {
      const data = await api.getDetectedContents({
        status: 'ALL',
      });
      if (Array.isArray(data)) {
        setRawItems(data);
      }
    } catch (err: any) {
      console.warn('Could not refresh detected content, keeping current state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetectedContent();
  }, []);

  // Compute dynamic filter options from real data
  const subjectOptions = useMemo(() => {
    const subjects = Array.from(new Set(rawItems.map((item) => item.subject).filter(Boolean)));
    return subjects.map((sub) => ({ label: sub, value: sub }));
  }, [rawItems]);

  const sourceOptions = useMemo(() => {
    const platforms = Array.from(
      new Set(rawItems.map((item) => item.platform || item.source).filter(Boolean))
    );
    const defaults = ['Telegram', 'WhatsApp', 'Instagram', 'Facebook', 'X', 'Reddit', 'Upload', 'Other'];
    const merged = Array.from(new Set([...platforms, ...defaults]));
    return merged.map((p) => ({ label: p, value: p }));
  }, [rawItems]);

  const filterFields: FilterFieldDefinition[] = useMemo(
    () => [
      {
        id: 'risk',
        label: 'Risk Level',
        type: 'chips',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Low', value: 'LOW' },
          { label: 'Review Required', value: 'REVIEW REQUIRED' },
          { label: 'High', value: 'HIGH' },
        ],
      },
      {
        id: 'subject',
        label: 'Subject',
        type: 'select',
        placeholder: 'All Subjects',
        options: subjectOptions,
      },
      {
        id: 'source',
        label: 'Source / Platform',
        type: 'select',
        placeholder: 'All Sources',
        options: sourceOptions,
      },
      {
        id: 'processing',
        label: 'Processing Status',
        type: 'select',
        placeholder: 'All Processing States',
        options: [
          { label: 'Completed', value: 'Completed' },
          { label: 'Processing', value: 'Processing' },
          { label: 'Failed', value: 'Failed' },
        ],
      },
      {
        id: 'review',
        label: 'Review Status',
        type: 'select',
        placeholder: 'All Review States',
        options: [
          { label: 'Needs Verification', value: 'Needs Verification' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Reviewed', value: 'Reviewed' },
          { label: 'Dismissed', value: 'Dismissed' },
        ],
      },
      {
        id: 'type',
        label: 'Document Type',
        type: 'select',
        placeholder: 'All Document Types',
        options: [
          { label: 'PDF', value: 'PDF' },
          { label: 'Question Image', value: 'Question Image' },
          { label: 'Screenshot', value: 'Screenshot' },
          { label: 'Document', value: 'Document' },
          { label: 'Multi-page Image', value: 'Multi-page Image' },
        ],
      },
      {
        id: 'date',
        label: 'Date Range',
        type: 'date-range',
      },
    ],
    [subjectOptions, sourceOptions]
  );

  // Filter items against real backend data
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSubject = item.subject.toLowerCase().includes(q);
        const matchesCode = (item.subjectCode || '').toLowerCase().includes(q);
        const matchesSource = (item.source || '').toLowerCase().includes(q);
        const matchesPlatform = (item.platform || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesSubject && !matchesCode && !matchesSource && !matchesPlatform) {
          return false;
        }
      }

      // Risk
      if (filterValues.risk && filterValues.risk !== 'ALL') {
        if (item.risk !== filterValues.risk) return false;
      }

      // Subject
      if (filterValues.subject && filterValues.subject !== 'ALL') {
        if (item.subject !== filterValues.subject) return false;
      }

      // Source / Platform
      if (filterValues.source && filterValues.source !== 'ALL') {
        const matchesSrc =
          item.source === filterValues.source ||
          item.platform === filterValues.source;
        if (!matchesSrc) return false;
      }

      // Processing Status
      if (filterValues.processing && filterValues.processing !== 'ALL') {
        if (item.processing !== filterValues.processing) return false;
      }

      // Review Status
      if (filterValues.review && filterValues.review !== 'ALL') {
        if (item.review !== filterValues.review) return false;
      }

      // Document Type
      if (filterValues.type && filterValues.type !== 'ALL') {
        if (item.contentType !== filterValues.type) return false;
      }

      // Date Range
      if (filterValues.dateFrom || filterValues.dateTo) {
        const itemDateStr = item.uploadedAt || item.detectedTime;
        if (itemDateStr) {
          const itemTime = new Date(itemDateStr).getTime();
          if (filterValues.dateFrom) {
            const fromTime = new Date(filterValues.dateFrom).getTime();
            if (itemTime < fromTime) return false;
          }
          if (filterValues.dateTo) {
            const toTime = new Date(filterValues.dateTo).setHours(23, 59, 59, 999);
            if (itemTime > toTime) return false;
          }
        }
      }

      return true;
    });
  }, [rawItems, searchTerm, filterValues]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== '' ||
      Object.entries(filterValues).some(([key, val]) => {
        if (val === undefined || val === null || val === '' || val === 'ALL') {
          return false;
        }
        return true;
      })
    );
  }, [searchTerm, filterValues]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterValues(DEFAULT_FILTER_VALUES);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      await api.deleteDetectedContent(deleteTarget.id);
      showToast(`Detected content ${deleteTarget.id} deleted.`, 'success');
      setDeleteTarget(null);
      fetchDetectedContent();
    } catch (err: any) {
      showToast(err.message || 'Could not delete item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setIsProcessing(true);
    try {
      await api.archiveDetectedContent(archiveTarget.id);
      showToast(`Detected content ${archiveTarget.id} archived.`, 'success');
      setArchiveTarget(null);
      fetchDetectedContent();
    } catch (err: any) {
      showToast(err.message || 'Could not archive item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setIsProcessing(true);
    try {
      await api.restoreDetectedContent(restoreTarget.id);
      showToast(`Detected content ${restoreTarget.id} restored.`, 'success');
      setRestoreTarget(null);
      fetchDetectedContent();
    } catch (err: any) {
      showToast(err.message || 'Could not restore item.', 'error');
    } finally {
      setIsProcessing(false);
    }
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
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50';
      case 'Reviewed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50';
      case 'Dismissed':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Detected Content"
        description="Public social channels and authorized intake feeds flagged for question-level comparison against examination reference vaults."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<FlaskConical className="w-4 h-4 text-purple-500" />}
              onClick={handleRunTestSuite}
            >
              Run Pipeline Test Suite
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCw className="w-4 h-4" />}
              onClick={fetchDetectedContent}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Files / ZIP
            </Button>
            <Link to="/sources">
              <Button variant="outline" size="sm">
                Social Feeds
              </Button>
            </Link>
          </div>
        }
      />

      {/* Compact Search & Single Filter Toolbar */}
      <Card className="mb-6 font-sans p-3 overflow-visible" overflowVisible>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="search-detected-content-input"
              placeholder="Search detected content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PageFilterMenu
              fields={filterFields}
              values={filterValues}
              onApply={(newVals) => setFilterValues(newVals)}
              onReset={() => setFilterValues(DEFAULT_FILTER_VALUES)}
            />
          </div>
        </div>
      </Card>

      {/* Detected Content Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading detected content records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-sans border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Detected Content & ID</th>
                  <th className="py-3 px-4 font-semibold">Origin & Platform</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Comparison & Risk</th>
                  <th className="py-3 px-4 font-semibold">Review State</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <FileSearch className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {hasActiveFilters ? 'No content found' : 'No content'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {hasActiveFilters
                            ? 'Try changing or clearing your filters.'
                            : 'No detected content available yet.'}
                        </p>
                        {hasActiveFilters ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Upload className="w-4 h-4" />}
                            onClick={() => setIsUploadModalOpen(true)}
                          >
                            Upload Files / ZIP
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 shrink-0">
                            <DocumentTypeIcon type={item.contentType} size={16} />
                          </div>
                          <div className="min-w-0 max-w-[220px]">
                            <Link
                              to={`/detected-content/${item.id}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 truncate block text-xs"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              <span className="text-blue-600 font-bold">{item.id}</span>
                              <span>•</span>
                              <span>{Math.round(item.size / 1024)} KB</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <SocialPlatformIcon platform={item.platform} size={14} />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                            {item.source}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <SubjectIcon subject={item.subject} size={14} className="text-slate-400" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {item.subject}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                          {item.subjectCode}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadge(item.risk)}`}>
                            {item.risk}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.riskScore}%
                          </span>
                        </div>
                        {item.matchedReferencePaper && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block mt-0.5 truncate max-w-[140px]">
                            vs {item.matchedReferencePaper.id}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getReviewBadge(item.review)}`}>
                          {item.review}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                        {item.confidence}%
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/detected-content/${item.id}`}>
                            <Button variant="outline" size="sm">
                              Compare <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                          <ActionMenu
                            items={[
                              {
                                id: 'view',
                                label: 'View Comparison',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => navigate(`/detected-content/${item.id}`),
                              },
                              item.status === 'ACTIVE'
                                ? {
                                    id: 'archive',
                                    label: 'Archive',
                                    icon: <Archive className="w-4 h-4" />,
                                    onClick: () => setArchiveTarget(item),
                                  }
                                : {
                                    id: 'restore',
                                    label: 'Restore',
                                    icon: <RotateCcw className="w-4 h-4" />,
                                    onClick: () => setRestoreTarget(item),
                                  },
                              {
                                id: 'delete',
                                label: 'Delete',
                                icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                                variant: 'danger',
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Detected Content Record?"
        message="This will permanently delete the content item from disk and purge associated OCR comparisons."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={`ID: ${deleteTarget?.id} • Name: ${deleteTarget?.name}`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmationModal
        isOpen={!!archiveTarget}
        title="Archive Content Record?"
        message="This content will be archived and hidden from the active comparison queue."
        confirmLabel="Archive"
        confirmVariant="primary"
        confirmIcon={<Archive className="w-4 h-4" />}
        detailsNotice={`ID: ${archiveTarget?.id} • Name: ${archiveTarget?.name}`}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmationModal
        isOpen={!!restoreTarget}
        title="Restore Content Record?"
        message="This content will be returned to the active comparison queue."
        confirmLabel="Restore"
        confirmVariant="primary"
        confirmIcon={<RotateCcw className="w-4 h-4" />}
        detailsNotice={`ID: ${restoreTarget?.id} • Name: ${restoreTarget?.name}`}
        onConfirm={confirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Recursive Document Ingestion & Extraction Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(candidate) => {
          showToast(`Successfully ingested and processed '${candidate.name}'.`, 'success');
          fetchDetectedContent();
        }}
      />

      {/* Ingestion Test Suite Modal */}
      {isTestSuiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Document Ingestion & Metadata Test Suite
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated verification across 27 extraction, parsing, security, and boundary-splitting scenarios.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestSuiteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
              {testSuiteLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Running 27 test scenarios on server fixtures...</p>
                </div>
              ) : testSuiteReport ? (
                <>
                  <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-purple-950 dark:text-purple-100 text-sm">
                        {testSuiteReport.summary}
                      </div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                        Completed at {new Date(testSuiteReport.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                        {testSuiteReport.passedCount} Passed
                      </span>
                      {testSuiteReport.failedCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs">
                          {testSuiteReport.failedCount} Failed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {testSuiteReport.results.map((t: any) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {t.status === 'PASSED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {t.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {t.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6">
                            {t.details}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                          {t.durationMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 py-8">No test results available.</div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestSuiteModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRunTestSuite}
                disabled={testSuiteLoading}
                icon={testSuiteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              >
                Re-run Test Suite
              </Button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};
