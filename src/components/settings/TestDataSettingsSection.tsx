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
  Info,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
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

  const [demoMode, setDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('leaklens_demo_mode') === 'true';
    }
    return false;
  });

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

  const handleToggleDemoMode = (enabled: boolean) => {
    setDemoMode(enabled);
    localStorage.setItem('leaklens_demo_mode', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('leaklens_demo_mode_changed'));
    setFeedback({
      type: 'info',
      message: enabled ? 'Demo Mode Enabled' : 'Demo Mode Disabled',
      details: enabled
        ? 'Simulated examination-security test scenarios are now visible across all application feeds and charts. Navigate to the Dashboard, Alerts, or Review Queue to demonstrate LeakLens capabilities.'
        : 'Simulated test data is now hidden. The workspace has reverted to displaying live production-only data.',
    });
  };

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
        message: '7-Scenario Demonstration Suite Loaded successfully!',
        details: `Cleaned existing test fixtures and generated high-fidelity simulated papers: ${res.historicalPapers.length} historical baseline(s), ${res.suspiciousCandidates.length} high-risk leak capture(s), ${res.normalCandidates.length} benign student share(s), and corresponding security alerts and review queue files.`,
        links: [
          { label: 'Go to Dashboard', to: '/' },
          { label: 'View Alerts Feed', to: '/alerts' },
          { label: 'View Review Queue', to: '/review' },
          { label: 'View Reference Vault', to: '/historical-data' },
        ],
      });
      // Automatically turn on demo mode to let the user see it!
      if (!demoMode) {
        handleToggleDemoMode(true);
      }
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
        message: 'Test Data Cleared',
        details: `${res.message} Real production records remain untouched.`,
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

  const scenarios = [
    {
      id: 1,
      title: "Verified Real Paper",
      type: "Historical Reference",
      desc: "Fictional DBMS CS501 baseline exam paper with 5 authentic questions. Processed and cataloged.",
      risk: "BENIGN",
      platform: "Historical Archive",
      targetUrl: "/historical-data"
    },
    {
      id: 2,
      title: "High-Risk Suspected Leak",
      type: "Social Leak Capture",
      desc: "Simulated exam photo posted in a Telegram channel. Triggers 92% similarity with CS501 and immediate critical alert.",
      risk: "CRITICAL",
      platform: "Telegram Channel",
      targetUrl: "/alerts"
    },
    {
      id: 3,
      title: "Fake Leak",
      type: "Non-incident Capture",
      desc: "Spam content or marketing ads on Instagram. Triggers 0% forensic similarity, cataloged safely as benign.",
      risk: "BENIGN",
      platform: "Instagram",
      targetUrl: "/detected-content"
    },
    {
      id: 4,
      title: "Ambiguous Case",
      type: "Review Required",
      desc: "Distorted photo circulating on a WhatsApp group containing rephrased questions. Flagged for manual audit.",
      risk: "MEDIUM",
      platform: "WhatsApp",
      targetUrl: "/review"
    },
    {
      id: 5,
      title: "Multi-page Paper",
      type: "Historical Reference",
      desc: " Fictional Computer Networks paper establishing a complex baseline across 4 separate pages.",
      risk: "BENIGN",
      platform: "Historical Archive",
      targetUrl: "/historical-data"
    },
    {
      id: 6,
      title: "Blurry/OCR-heavy Document",
      type: "Social Leak Capture",
      desc: "High-noise, low-lighting image circulating on Discord. Cleaned using OCR pipeline to reveal an 86% match.",
      risk: "HIGH",
      platform: "Discord Channel",
      targetUrl: "/alerts"
    },
    {
      id: 7,
      title: "Structural Match",
      type: "Social Leak Capture",
      desc: "Mathematics questions with shuffled structures found on Facebook Groups. AI detects rephrasing and structure.",
      risk: "HIGH",
      platform: "Facebook Group",
      targetUrl: "/detected-content"
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Global Demo Mode Toggle */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-500" />
            <span>Demonstration & Testing Space</span>
          </div>
        }
        subtitle="Manage the global demonstration sandbox to evaluate LeakLens pipelines without altering real-world historical records or active monitoring metrics."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-950/40 bg-amber-50/20 dark:bg-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Demo Mode Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  demoMode 
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {demoMode ? 'ON (Simulated Feeds Visible)' : 'OFF (Live Production Only)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                When <strong>Demo Mode</strong> is active, simulated high-fidelity exam leaks, baseline references, security alerts, and review queue incidents will appear across all panels. Turn it off to strictly hide all test records and isolate real data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggleDemoMode(!demoMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                demoMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <span className="sr-only">Toggle Demo Mode</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  demoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Reference Papers
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testHistoricalCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  +{status?.realHistoricalCount ?? 0} live
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Social Captures
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testCandidatesCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  +{status?.realCandidatesCount ?? 0} live
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Security Alerts
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testAlertsCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  +{status?.realAlertsCount ?? 0} live
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Audit Reviews
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {status?.testReviewsCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  +{status?.realReviewsCount ?? 0} live
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-150 ${
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
              <div className="font-semibold text-xs leading-none">{feedback.message}</div>
              {feedback.details && (
                <div className="text-[11px] opacity-90 leading-relaxed font-sans pt-1">
                  {feedback.details}
                </div>
              )}
              {feedback.links && feedback.links.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2.5">
                  {feedback.links.map((link, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => navigate(link.to)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Scenarios Suite */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>High-Fidelity Demonstration Suite</span>
          </div>
        }
        subtitle="This interactive examination suite injects 7 distinct, professionally synthetic scenarios to showcase OCR capabilities, structural alignment algorithms, and severity triage logic to judges and evaluators."
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Load 7-Scenario Demonstration Package
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                Re-initializes the test sandbox. This automatically purges old test files and generates the comprehensive 7-scenario suite (including DBMS CS501 and Computer Networks CS402 benchmarks).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {showConfirmClear ? (
                <div className="flex items-center gap-2">
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
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Confirm Purge</span>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmClear(true)}
                    disabled={actionLoading !== null || (status?.totalTestItems ?? 0) === 0}
                    className="cursor-pointer text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-rose-600 border-slate-200 dark:border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Clear Data</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGenerateDataset}
                    disabled={actionLoading !== null}
                    className="cursor-pointer"
                  >
                    {actionLoading === 'dataset' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5 mr-1.5" />
                        <span>Inject Suite</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Scenario Grid */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              7 Scenario Profiles Injected in Suite
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_12px_30px_rgba(148,163,184,0.18)] dark:hover:shadow-[0_12px_30px_rgba(2,6,23,0.4)] transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        Scenario {sc.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        sc.risk === 'CRITICAL' || sc.risk === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : sc.risk === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {sc.risk}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {sc.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {sc.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">Platform: <strong>{sc.platform}</strong></span>
                    {demoMode ? (
                      <button
                        type="button"
                        onClick={() => navigate(sc.targetUrl)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400/75 italic">Enable Demo Mode to view</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Fine-Grained Seeders */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Individual Scenario Ingestors</span>
          </div>
        }
        subtitle="Surgically execute individual workflow triggers to test granular comparisons and alerting cycles."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Seeder 1: Baseline */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Inject Historical Baseline</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates a fictional 2-page exam paper (Compiler Design CS-801) as a control reference.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTrialPaper}
              disabled={actionLoading !== null}
              className="w-full text-xs cursor-pointer"
            >
              {actionLoading === 'trial' ? 'Generating...' : 'Seed Baseline'}
            </Button>
          </div>

          {/* Seeder 2: Suspected Leak */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Inject Leak Incident</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates matching examination questions inside a fake social capture to trigger alerts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFakeSuspicious}
              disabled={actionLoading !== null}
              className="w-full text-xs cursor-pointer text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              {actionLoading === 'suspicious' ? 'Processing...' : 'Seed Leak'}
            </Button>
          </div>

          {/* Seeder 3: Benign Upload */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Inject Benign Activity</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates a benign student-authored note sheet with 0% similarity matching.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFakeNormal}
              disabled={actionLoading !== null}
              className="w-full text-xs cursor-pointer text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            >
              {actionLoading === 'normal' ? 'Processing...' : 'Seed Benign Note'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
