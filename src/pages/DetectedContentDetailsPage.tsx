import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  RefreshCw,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { api, DetectedContentRecord } from '../services/api';
import { ReviewDecision } from '../types/review';

export const DetectedContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<DetectedContentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const fetchContent = () => {
    if (!id) return;
    setLoading(true);
    api
      .getDetectedContentById(id)
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load detected content:', err);
        setError(err.message || 'Detected content record not found.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContent();
  }, [id]);

  const handleSubmitDecision = async (itemId: string, decision: ReviewDecision, notes: string) => {
    if (!content) return;
    try {
      await api.submitReviewDecision(content.id, decision, notes, 'Chief Examiner (Verification Unit)');
      setContent({
        ...content,
        review:
          decision === 'Mark as Reviewed'
            ? 'Reviewed'
            : decision === 'Dismiss Item'
            ? 'Dismissed'
            : 'Pending',
      });
      setToast({
        type: 'success',
        text: `Review decision '${decision}' saved for ${content.id}.`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Could not save review decision.',
      });
    }
  };

  const handleDelete = async () => {
    if (!content) return;
    try {
      await api.deleteDetectedContent(content.id);
      navigate('/detected-content');
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to delete content record.',
      });
    }
  };

  const handleArchive = async () => {
    if (!content) return;
    try {
      const updated = await api.archiveDetectedContent(content.id);
      setContent(updated);
      setToast({
        type: 'info',
        text: `${content.id} moved to archive.`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to archive content.',
      });
    }
  };

  const handleRestore = async () => {
    if (!content) return;
    try {
      const updated = await api.restoreDetectedContent(content.id);
      setContent(updated);
      setToast({
        type: 'success',
        text: `${content.id} restored to active intake.`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        text: err.message || 'Failed to restore content.',
      });
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="py-24 text-center space-y-3 font-sans">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading detected content forensics & comparison matrix...</p>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error || !content) {
    return (
      <ResponsiveContainer>
        <div className="py-16 text-center space-y-4 max-w-md mx-auto font-sans">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {error || 'Detected Content Not Found'}
          </h2>
          <p className="text-xs text-slate-500">
            The requested content record does not exist or has been removed.
          </p>
          <Link to="/detected-content">
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
      {/* Top Breadcrumbs & Record Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 font-sans">
        <div className="flex items-center gap-2">
          <Link to="/detected-content">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Detected Content
            </Button>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
            {content.id}
          </span>
          {content.status === 'ARCHIVED' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              ARCHIVED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {content.status === 'ACTIVE' ? (
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

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5 shadow-xs font-sans">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <SubjectIcon subject={content.subject} size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {content.name}
                </h1>
                <Badge
                  variant={
                    content.risk === 'HIGH'
                      ? 'danger'
                      : content.risk === 'REVIEW REQUIRED'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {content.risk} RISK ({content.riskScore}/100)
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-sans">
                <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                  {content.subjectCode || 'GEN-EXAM'} • {content.subject}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <SocialPlatformIcon platform={content.platform} size={14} />
                  {content.source}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {content.detectedTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="text-right px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Review Status
              </span>
              <span
                className={`text-xs font-bold ${
                  content.review === 'Reviewed'
                    ? 'text-emerald-600'
                    : content.review === 'Needs Verification'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                }`}
              >
                {content.review}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 ONE-GLANCE COMPARISON SUMMARY SCORECARD AT TOP OF DETAILS 🌟 */}
      <div className="mb-6">
        <ComparisonSummaryScorecard
          item={content}
          onReAnalyzed={(updated) => setContent(updated)}
        />
      </div>

      {/* Main Grid: Document Viewer + Question Evidence & Decision Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-sans items-start">
        {/* Left Column: Real Document Viewer & Extracted OCR Text */}
        <div className="xl:col-span-7 space-y-6">
          <DocumentViewer candidate={content} />
        </div>

        {/* Right Column: Question Forensics Matrix & Evidence & Review Action */}
        <div className="xl:col-span-5 space-y-6">
          {/* Question Forensics Matrix */}
          <QuestionForensicsMatrix candidate={content} />

          {/* Reference Paper Metadata Alignment Card */}
          {content.matchedReferencePaper && (
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
                      {content.matchedReferencePaper.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      VERIFIED REAL PAPER
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {content.matchedReferencePaper.title || content.subject}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
                    <div>Subject Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{content.matchedReferencePaper.subjectCode || content.subjectCode}</span></div>
                    <div>Max Marks: <span className="font-semibold text-slate-700 dark:text-slate-300">{content.matchedReferencePaper.maximumMarks || 100}</span></div>
                    <div>Overlap: <span className="font-semibold text-slate-700 dark:text-slate-300">{content.matchedReferencePaper.overlapPercentage || content.riskScore}%</span></div>
                    <div>Questions: <span className="font-semibold text-slate-700 dark:text-slate-300">{content.matchedReferencePaper.matchedQuestionsCount || content.questions?.length || 5} matched</span></div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Document Technical Integrity Telemetry */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Source File & Ingestion Telemetry</span>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-sans">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">SHA-256 Digest</span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={content.sha256}>
                  {content.sha256}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Storage Location</span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {content.storagePath}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Extracted Question Blocks</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {content.questions?.length || 0} blocks
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Processing State</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {content.processing}
                </span>
              </div>
            </div>
          </Card>

          {/* Human Review Decision Panel */}
          <ReviewDecisionPanel
            item={{
              id: content.id,
              candidateId: content.id,
              subject: content.subject,
              subjectCode: content.subjectCode,
              riskScore: content.riskScore,
              riskLevel: content.risk,
              evidenceCount: content.forensicResults?.length || 0,
              detectedTime: content.detectedTime,
              reviewerStatus: content.review as any,
              priority: content.risk === 'HIGH' ? 'High Priority' : 'Standard Priority',
            }}
            onSubmitDecision={handleSubmitDecision}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Content Record?"
        message="This will permanently delete the content item from disk and clear all question extraction and forensics cache."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={`Record ID: ${content.id} • Filename: ${content.name}`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
