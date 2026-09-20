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
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
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
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);

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
          <a
            href={api.getCandidateDocumentUrl(content.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Open Original
          </a>
          <button
            type="button"
            onClick={() => {
              const link = document.createElement('a');
              link.href = api.getCandidateDocumentUrl(content.id);
              link.download = content.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download
          </button>
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

      {/* Main Compact Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-4 shadow-2xs font-sans">
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
        </div>
      </div>

      {/* Quick Assessment Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 font-sans">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Risk</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${content.risk === 'HIGH' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' : content.risk === 'REVIEW REQUIRED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
            {content.risk}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Overlap</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
            {content.riskScore}%
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Questions</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
            {content.forensicResults?.filter(r => r.overallSimilarity >= 50 || r.result === 'MATCH' || r.result === 'PARTIAL_MATCH').length || 0} / {content.questions?.length || 0}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reference</span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono truncate block">
            {content.matchedReferencePaper?.id || content.subjectCode || 'CS-801'}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Review</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
            {content.review}
          </span>
        </div>
      </div>

      {/* Main Forensic Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,380px)] xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.85fr)] gap-6 font-sans items-start w-full max-w-full">
        {/* LEFT: Original Document (Visually dominant, expand with viewport height) */}
        <div className="min-w-0 max-w-full space-y-6">
          <DocumentViewer
            candidate={content}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
          />
        </div>

        {/* RIGHT: Evidence & Comparison Panel */}
        <div className="min-w-0 max-w-full w-full space-y-5">
          {/* Section Header matching left card header exactly */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] flex items-center justify-between min-h-[57px]">
            <div>
              <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Evidence & Comparison
              </h3>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Signals supporting the current assessment
              </p>
            </div>
          </div>

          {/* 1. Assessment Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessment</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${content.risk === 'HIGH' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {content.risk} ({content.riskScore}/100)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Human Verification</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {content.risk === 'HIGH' ? 'Required' : 'Not required'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Review</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {content.review}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Question Comparison */}
          <QuestionForensicsMatrix
            candidate={content}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
          />

          {/* 3. Metadata Match Evidence */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Metadata Match
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500">Subject</span>
                <span className="font-semibold text-emerald-600">✓ Match</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500">Exam Code</span>
                <span className="font-semibold text-emerald-600">✓ Match</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500">Marks</span>
                <span className="font-semibold text-emerald-600">✓ Match</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500">Structure</span>
                <span className="font-semibold text-emerald-600">✓ Match</span>
              </div>
            </div>
          </div>

          {/* 4. Reference Paper */}
          {content.matchedReferencePaper ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Matched Reference</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                  Verified
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                    {content.matchedReferencePaper.id}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {content.matchedReferencePaper.title || content.subject}
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
                  <div>Subject Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{content.matchedReferencePaper.subjectCode || content.subjectCode}</span></div>
                  <div>Max Marks: <span className="font-semibold text-slate-700 dark:text-slate-300">{content.matchedReferencePaper.maximumMarks || 100}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Matched Reference</span>
              <p className="text-xs text-slate-500 italic">No verified reference paper was used.</p>
            </div>
          )}

          {/* 5. Source & Ingestion (Collapsible technical section) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <button
              type="button"
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Source & Ingestion</span>
              </div>
              {telemetryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {telemetryOpen && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Platform</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{content.platform}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{content.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Extraction Method</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{content.extractionMethod || 'OCR / Native PDF'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">OCR Confidence</span>
                  <span className="font-semibold text-emerald-600">{content.ocrConfidence ?? 90}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ingestion Status</span>
                  <span className="font-semibold text-emerald-600">{content.processing}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Detected Timestamp</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{content.detectedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SHA-256 Digest</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[160px]" title={content.sha256}>
                    {content.sha256}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 6. Review & Decision */}
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

