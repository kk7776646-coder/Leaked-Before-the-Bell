import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { DocumentViewer } from '../components/candidate-details/DocumentViewer';
import { QuestionForensicsMatrix } from '../components/candidate-details/QuestionForensicsMatrix';
import { ReviewDecisionPanel } from '../components/review/ReviewDecisionPanel';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast, ToastNotification } from '../components/common/Toast';
import { ComparisonSummaryScorecard } from '../components/detected-content/ComparisonSummaryScorecard';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Loader2,
  AlertTriangle,
  Trash2,
  Archive,
  RotateCcw,
  FileCheck2,
  LayoutTemplate,
  FileSearch,
  Eye,
} from 'lucide-react';
import { api, CandidateRecord } from '../services/api';
import { ReviewDecision } from '../types/review';

export const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [targetPage, setTargetPage] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<'document' | 'comparison' | 'ocr'>('document');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getCandidateById(id)
      .then((data) => {
        setCandidate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load candidate:', err);
        setError(err.message || 'Candidate document not found.');
        setLoading(false);
      });
  }, [id]);

  const handleSubmitDecision = async (itemId: string, decision: ReviewDecision, notes: string) => {
    if (!candidate) return;
    try {
      await api.submitReviewDecision(candidate.id, decision, notes, 'Chief Security Examiner');
      setCandidate({
        ...candidate,
        review:
          decision === 'Mark as Reviewed'
            ? 'Reviewed'
            : decision === 'Dismiss Item'
            ? 'Dismissed'
            : 'Pending',
      });
      setToast({
        type: 'success',
        text: `Review decision '${decision}' saved for ${candidate.id}.`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Could not save review decision.',
      });
    }
  };

  const handleDelete = async () => {
    if (!candidate) return;
    try {
      await api.deleteCandidate(candidate.id);
      navigate('/candidates');
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to delete candidate.',
      });
    }
  };

  const handleArchive = async () => {
    if (!candidate) return;
    try {
      const updated = await api.archiveCandidate(candidate.id);
      setCandidate(updated);
      setToast({
        type: 'info',
        text: `${candidate.id} has been moved to archive.`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to archive candidate.',
      });
    }
  };

  const handleRestore = async () => {
    if (!candidate) return;
    try {
      const updated = await api.restoreCandidate(candidate.id);
      setCandidate(updated);
      setToast({
        type: 'success',
        text: `${candidate.id} is now active.`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to restore candidate.',
      });
    }
  };

  const handleJumpToPage = (pageNum: number) => {
    setTargetPage(pageNum);
    setMobileTab('document');
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading document forensics and OCR data...</p>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error || !candidate) {
    return (
      <ResponsiveContainer>
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {error || 'Document Not Found'}
          </h2>
          <p className="text-xs text-slate-500">
            The requested document record does not exist or was deleted.
          </p>
          <Link to="/candidates">
            <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Intake Queue
            </Button>
          </Link>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      {/* Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 font-sans">
        <div className="flex items-center gap-2">
          <Link to="/candidates">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Intake Queue
            </Button>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
            {candidate.id}
          </span>
          {candidate.status === 'ARCHIVED' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              ARCHIVED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {candidate.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              icon={<Archive className="w-3.5 h-3.5" />}
              onClick={handleArchive}
            >
              Archive
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleRestore}
            >
              Restore
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Document Title Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-xs font-sans">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <SubjectIcon subject={candidate.subject} size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {candidate.name}
                </h1>
                <Badge
                  variant={
                    candidate.risk === 'HIGH'
                      ? 'danger'
                      : candidate.risk === 'REVIEW REQUIRED'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {candidate.risk} RISK ({candidate.riskScore}/100)
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-sans">
                <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                  {candidate.subjectCode || 'GEN-EXAM'} • {candidate.subject}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <SocialPlatformIcon platform={candidate.platform} size={14} />
                  {candidate.source}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(candidate.detectedTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <div className="text-right px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Review Status
              </span>
              <span
                className={`text-xs font-bold ${
                  candidate.review === 'Reviewed'
                    ? 'text-emerald-600'
                    : candidate.review === 'Needs Verification'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                }`}
              >
                {candidate.review}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 ONE-GLANCE COMPARISON SUMMARY SCORECARD AT TOP OF DETAILS 🌟 */}
      <div className="mb-6">
        <ComparisonSummaryScorecard
          item={candidate}
          onReAnalyzed={(updated) => setCandidate(updated)}
        />
      </div>

      {/* 📱 MOBILE VIEW SELECTOR TABS (Prevents horizontal scroll on small devices) 📱 */}
      <div className="xl:hidden flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 font-sans text-xs font-semibold">
        <button
          onClick={() => setMobileTab('document')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobileTab === 'document'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 text-blue-500" />
          Document
        </button>
        <button
          onClick={() => setMobileTab('comparison')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobileTab === 'comparison'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Comparison
        </button>
        <button
          onClick={() => setMobileTab('ocr')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobileTab === 'ocr'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileSearch className="w-4 h-4 text-amber-500" />
          Decision
        </button>
      </div>

      {/* Main Grid: Document Viewer + Forensics Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-sans items-start">
        {/* Left Column: Real Document Viewer & Extracted OCR (always visible on desktop, tabbed on mobile) */}
        <div className={`xl:col-span-7 space-y-6 ${mobileTab !== 'document' ? 'hidden xl:block' : 'block'}`}>
          <DocumentViewer
            candidate={candidate}
            targetPage={targetPage}
            onPageChange={(page) => setTargetPage(page)}
          />
        </div>

        {/* Right Column: Question Forensics Matrix & Evidence & Review Action */}
        <div className={`xl:col-span-5 space-y-6 ${mobileTab === 'document' ? 'hidden xl:block' : 'block'}`}>
          {/* Question Forensics Matrix (Jump to document page enabled) */}
          <div className={mobileTab === 'ocr' ? 'hidden xl:block' : 'block'}>
            <QuestionForensicsMatrix
              candidate={candidate}
              onJumpToPage={handleJumpToPage}
            />
          </div>

          {/* Reference Paper Metadata Alignment Card */}
          {candidate.matchedReferencePaper && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <span>Matched Examination Reference</span>
                </div>
              }
              subtitle="Reference paper baseline details from ground-truth vault"
            >
              <div className="space-y-3 text-xs font-sans">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {candidate.matchedReferencePaper.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      VERIFIED REAL PAPER
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {candidate.matchedReferencePaper.title || candidate.subject}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
                    <div>Subject Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.matchedReferencePaper.subjectCode || candidate.subjectCode}</span></div>
                    <div>Max Marks: <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.matchedReferencePaper.maximumMarks || 100}</span></div>
                    <div>Overlap: <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.matchedReferencePaper.overlapPercentage || candidate.riskScore}%</span></div>
                    <div>Questions: <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.matchedReferencePaper.matchedQuestionsCount || candidate.questions?.length || 5} matched</span></div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Document Technical Summary */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Document Integrity Telemetry</span>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-sans">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">SHA-256 Digest</span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={candidate.sha256}>
                  {candidate.sha256}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Extracted Question Blocks</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {candidate.questions?.length || 0} blocks
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Processing State</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {candidate.processing}
                </span>
              </div>
            </div>
          </Card>

          {/* Human Review Decision Panel */}
          <ReviewDecisionPanel
            item={{
              id: candidate.id,
              candidateId: candidate.id,
              subject: candidate.subject,
              subjectCode: candidate.subjectCode,
              riskScore: candidate.riskScore,
              riskLevel: candidate.risk,
              evidenceCount: candidate.forensicResults?.length || 0,
              detectedTime: candidate.detectedTime,
              reviewerStatus: candidate.review as any,
              priority: candidate.risk === 'HIGH' ? 'High Priority' : 'Standard Priority',
            }}
            onSubmitDecision={handleSubmitDecision}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Document Record?"
        message="This will permanently delete the uploaded document file from disk, wipe the OCR extraction cache, and remove it from the system."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={`Record ID: ${candidate.id} • Filename: ${candidate.name}`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
