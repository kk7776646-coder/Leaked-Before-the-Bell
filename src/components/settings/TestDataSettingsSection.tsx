import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  FlaskConical,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info,
  Clock,
} from 'lucide-react';
import { api, TestDataStatusResponse } from '../../services/api';

export const TestDataSettingsSection: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<TestDataStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
    links?: { label: string; to: string }[];
  } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await api.getTestDataStatus();
      setStatus(data);
    } catch (err: any) {
      console.error('Failed to load test data status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddTrialPaper = async () => {
    setActionLoading('trial');
    setFeedback(null);
    try {
      const res = await api.addTrialPaper({
        subject: 'Compiler Design',
        subjectCode: 'CS-801',
        year: 2026,
      });
      setFeedback({
        type: 'success',
        message: 'Trial Historical Paper added successfully.',
        details: `Created baseline paper ${res.paper.id} (${res.paper.title}) with ${res.paper.totalQuestions} questions and physical PDF storage.`,
        links: [
          { label: 'View in Historical Vault', to: '/historical-data' },
        ],
      });
      await fetchStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to create trial paper',
        details: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddFakeSuspicious = async () => {
    setActionLoading('suspicious');
    setFeedback(null);
    try {
      const res = await api.addFakeSuspiciousPaper({
        subject: 'Compiler Design',
        subjectCode: 'CS-801',
        platform: 'Telegram',
        source: '@exam_leaks_tg (Channel)',
      });
      setFeedback({
        type: 'success',
        message: 'Fake Suspicious Document generated and evaluated.',
        details: `Document ${res.candidate.id} evaluated with ${res.candidate.riskScore}% question match. ${res.alert ? `Generated Alert ${res.alert.id}.` : ''} Review item ${res.review?.id || ''} queued for verification.`,
        links: [
          { label: 'View in Detected Content', to: '/detected-content' },
          { label: 'View in Alerts', to: '/alerts' },
          { label: 'View in Review Queue', to: '/review' },
        ],
      });
      await fetchStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to create suspicious test document',
        details: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddFakeNormal = async () => {
    setActionLoading('normal');
    setFeedback(null);
    try {
      const res = await api.addFakeNormalPaper({
        subject: 'Environmental Studies',
        subjectCode: 'ENV-201',
        platform: 'Reddit',
        source: 'r/student_study_notes',
      });
      setFeedback({
        type: 'success',
        message: 'Fake Normal Document generated.',
        details: `Document ${res.candidate.id} evaluated with ${res.candidate.riskScore}% risk score (Low Risk / Non-matching benign material).`,
        links: [
          { label: 'View in Detected Content', to: '/detected-content' },
        ],
      });
      await fetchStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to create normal test document',
        details: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateDataset = async () => {
    setActionLoading('dataset');
    setFeedback(null);
    try {
      const res = await api.generateTestDataset();
      setFeedback({
        type: 'success',
        message: 'Complete Test Dataset generated successfully.',
        details: `Generated ${res.historicalPapers.length} historical baseline(s), ${res.suspiciousCandidates.length} suspicious document(s), ${res.normalCandidates.length} normal study document(s), and ${res.alertsGenerated.length} alert(s).`,
        links: [
          { label: 'View Historical Vault', to: '/historical-data' },
          { label: 'View Detected Content', to: '/detected-content' },
          { label: 'View Alerts', to: '/alerts' },
        ],
      });
      await fetchStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to generate test dataset',
        details: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearTestData = async () => {
    setActionLoading('clear');
    setFeedback(null);
    try {
      const res = await api.clearTestData();
      setShowConfirmClear(false);
      setFeedback({
        type: 'info',
        message: 'Test Data cleared successfully.',
        details: `${res.message} Deleted ${res.deletedFilesCount} physical test PDF files. Real user records remain intact.`,
      });
      await fetchStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to clear test data',
        details: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Counts Card */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Test Data</span>
          </div>
        }
        subtitle="Create controlled test documents to validate upload, document processing, comparison, alerts and review workflows."
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Development & Testing Data Isolation</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  All test records are generated as physical files on disk, processed through genuine OCR and comparison pipelines, and clearly tagged as test fixtures.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loadingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Trial Papers
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testHistoricalCount ?? '—'}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({status?.realHistoricalCount ?? 0} real)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Test Captures
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testCandidatesCount ?? '—'}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({status?.realCandidatesCount ?? 0} real)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Test Alerts
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testAlertsCount ?? '—'}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({status?.realAlertsCount ?? 0} real)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Test Reviews
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testReviewsCount ?? '—'}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({status?.realReviewsCount ?? 0} real)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-xs">{feedback.message}</div>
              {feedback.details && (
                <div className="text-[11px] opacity-90 leading-relaxed font-mono">
                  {feedback.details}
                </div>
              )}
              {feedback.links && feedback.links.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {feedback.links.map((link, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => navigate(link.to)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Data Actions List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          Available Test Data Operations
        </h3>

        {/* 1. Add Trial Paper */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Trial Historical Paper
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Generates a 2-page examination PDF (Compiler Design CS-801) and indexes it into the historical vault as a baseline reference.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTrialPaper}
              disabled={actionLoading !== null}
              className="shrink-0 cursor-pointer self-start sm:self-center"
            >
              {actionLoading === 'trial' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Add Trial Paper</span>
              )}
            </Button>
          </div>
        </div>

        {/* 2. Add Fake Suspicious Paper */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Fake Suspicious Document
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Generates a simulated leaked document containing matching examination questions, processes OCR, and evaluates forensic similarity to trigger an alert.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFakeSuspicious}
              disabled={actionLoading !== null}
              className="shrink-0 cursor-pointer self-start sm:self-center text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              {actionLoading === 'suspicious' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Add Fake Suspicious Paper</span>
              )}
            </Button>
          </div>
        </div>

        {/* 3. Add Fake Normal Paper */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Fake Normal Document
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Generates a benign academic study notes document, runs forensic cross-comparison, and verifies low similarity.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFakeNormal}
              disabled={actionLoading !== null}
              className="shrink-0 cursor-pointer self-start sm:self-center"
            >
              {actionLoading === 'normal' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Add Fake Normal Paper</span>
              )}
            </Button>
          </div>
        </div>

        {/* 4. Generate Test Dataset */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Generate Complete Test Dataset
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Generates a complete multi-document package with trial historical baselines, suspicious social captures, benign study sheets, and corresponding alerts and reviews.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateDataset}
              disabled={actionLoading !== null}
              className="shrink-0 cursor-pointer self-start sm:self-center"
            >
              {actionLoading === 'dataset' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                  <span>Generating Dataset...</span>
                </>
              ) : (
                <span>Generate Test Dataset</span>
              )}
            </Button>
          </div>
        </div>

        {/* 5. Clear Test Data */}
        <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-rose-950 dark:text-rose-200">
                  Clear Test Data
                </div>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 mt-0.5 leading-relaxed">
                  Surgically deletes only test fixtures and associated physical files from disk. Real user uploads and real historical papers remain untouched.
                </p>
              </div>
            </div>

            {showConfirmClear ? (
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmClear(false)}
                  disabled={actionLoading !== null}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearTestData}
                  disabled={actionLoading !== null}
                  className="cursor-pointer"
                >
                  {actionLoading === 'clear' ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <span>Confirm Clear</span>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmClear(true)}
                disabled={actionLoading !== null || (status?.totalTestItems ?? 0) === 0}
                className="shrink-0 cursor-pointer self-start sm:self-center text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-100/50"
              >
                <span>Clear Test Data</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
