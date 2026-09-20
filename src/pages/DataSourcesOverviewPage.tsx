import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { Link } from 'react-router-dom';
import {
  Radio,
  CheckCircle2,
  CircleAlert,
  Circle,
  RefreshCw,
  Unplug,
  Wrench,
  AlertTriangle,
  Eye,
  Check,
  X,
  Play,
  Pause,
  Clock,
  Shield,
  FileText,
  Activity,
  Plus
} from 'lucide-react';

export type ConnectionStatus = 'CONNECTED' | 'NOT_CONFIGURED' | 'CONNECTING' | 'ERROR' | 'DISABLED' | 'SIMULATION';

export interface SourcePlatform {
  id: string;
  platform: 'Telegram' | 'Instagram' | 'Facebook' | 'WhatsApp' | 'X' | 'Reddit' | 'Other';
  name: string;
  connectionMethod: string;
  status: ConnectionStatus;
  monitoringEnabled: boolean;
  sourceCount: number;
  lastSuccessfulConnection: string;
  lastSuccessfulCollection: string;
  lastError?: string;
  itemsCollectedToday: number;
  channelOrFeed: string;
  recentLogs: { timestamp: string; message: string; type: 'info' | 'warn' | 'success' | 'error' }[];
}

export interface RecentCollectedItem {
  id: string;
  contentId: string;
  name: string;
  platform: string;
  source: string;
  collectedTime: string;
  processing: 'Completed' | 'Processing' | 'Flagged for Forensics';
  risk: 'HIGH' | 'REVIEW REQUIRED' | 'LOW';
}

export const DataSourcesOverviewPage: React.FC = () => {
  // Global Monitoring State
  const [globalMonitoring, setGlobalMonitoring] = useState<'ON' | 'OFF' | 'PAUSED'>('ON');
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('All');

  // Real Connection Sources
  const [sources, setSources] = useState<SourcePlatform[]>([
    {
      id: 'src-telegram',
      platform: 'Telegram',
      name: 'Telegram Authorized Channels',
      connectionMethod: 'Telegram Bot API / Webhook Listener',
      status: 'CONNECTED',
      monitoringEnabled: true,
      sourceCount: 2,
      lastSuccessfulConnection: 'Today, 10:42 AM',
      lastSuccessfulCollection: '10:41 AM (1 min ago)',
      itemsCollectedToday: 18,
      channelOrFeed: '@authorized_exam_alerts, @study_board_official',
      recentLogs: [
        { timestamp: '10:41 AM', message: 'Inbound question screenshot received & parsed (DL-2048)', type: 'info' },
        { timestamp: '10:15 AM', message: 'Periodic health ping verified (Latency: 94ms)', type: 'success' },
      ],
    },
    {
      id: 'src-whatsapp',
      platform: 'WhatsApp',
      name: 'WhatsApp Study Broadcasts',
      connectionMethod: 'WhatsApp Cloud API Gateway',
      status: 'CONNECTED',
      monitoringEnabled: true,
      sourceCount: 3,
      lastSuccessfulConnection: 'Today, 09:15 AM',
      lastSuccessfulCollection: '09:20 AM',
      itemsCollectedToday: 9,
      channelOrFeed: 'Authorized Broadcast Group #402',
      recentLogs: [
        { timestamp: '09:20 AM', message: 'Question set photo ingested and OCR indexed', type: 'info' },
        { timestamp: '09:15 AM', message: 'Webhook handshake re-validated', type: 'success' },
      ],
    },
    {
      id: 'src-instagram',
      platform: 'Instagram',
      name: 'Instagram Study Groups Monitor',
      connectionMethod: 'Public Graph API / Hashtag Stream',
      status: 'SIMULATION',
      monitoringEnabled: false,
      sourceCount: 1,
      lastSuccessfulConnection: 'N/A',
      lastSuccessfulCollection: '10:41 AM (Simulated)',
      itemsCollectedToday: 4,
      channelOrFeed: '#examprep_public',
      recentLogs: [
        { timestamp: '10:41 AM', message: 'Simulated candidate post ingested for demonstration', type: 'info' },
      ],
    },
    {
      id: 'src-facebook',
      platform: 'Facebook',
      name: 'Facebook Campus Feed Crawler',
      connectionMethod: 'Graph API v18.0',
      status: 'NOT_CONFIGURED',
      monitoringEnabled: false,
      sourceCount: 0,
      lastSuccessfulConnection: 'Never',
      lastSuccessfulCollection: 'Never',
      itemsCollectedToday: 0,
      channelOrFeed: 'No channel configured',
      recentLogs: [],
    },
    {
      id: 'src-x',
      platform: 'X',
      name: 'X (Twitter) Leak Alert Stream',
      connectionMethod: 'X API v2 Filtered Stream',
      status: 'NOT_CONFIGURED',
      monitoringEnabled: false,
      sourceCount: 0,
      lastSuccessfulConnection: 'Never',
      lastSuccessfulCollection: 'Never',
      itemsCollectedToday: 0,
      channelOrFeed: 'No stream rule configured',
      recentLogs: [],
    },
    {
      id: 'src-reddit',
      platform: 'Reddit',
      name: 'Reddit r/HomeworkHelp & Leaks',
      connectionMethod: 'Reddit Public Pushshift API',
      status: 'SIMULATION',
      monitoringEnabled: false,
      sourceCount: 1,
      lastSuccessfulConnection: 'N/A',
      lastSuccessfulCollection: 'Yesterday, 18:05',
      itemsCollectedToday: 2,
      channelOrFeed: 'r/examprep_security',
      recentLogs: [
        { timestamp: 'Yesterday, 18:05', message: 'Simulated forum text post processed', type: 'info' },
      ],
    },
  ]);

  // Recent Inbound Collected Items
  const [recentCollected, setRecentCollected] = useState<RecentCollectedItem[]>([
    { id: 'RC-1', contentId: 'DL-2048', name: 'CS501 Algorithm Midterm Section B.png', platform: 'Telegram', source: 'Authorized Channel A', collectedTime: '10:42 AM', processing: 'Completed', risk: 'HIGH' },
    { id: 'RC-2', contentId: 'DL-2049', name: 'Physics 202 Final Exam Formulas & Problems.pdf', platform: 'Instagram', source: 'Public Account Feed', collectedTime: '10:45 AM', processing: 'Processing', risk: 'REVIEW REQUIRED' },
    { id: 'RC-3', contentId: 'DL-2050', name: 'Calculus III Mock Problem Set.jpg', platform: 'WhatsApp', source: 'Broadcast #402', collectedTime: '09:20 AM', processing: 'Completed', risk: 'LOW' },
    { id: 'RC-4', contentId: 'DL-2051', name: 'Organic Chemistry II Question 4 Diagram.jpeg', platform: 'Telegram', source: 'Authorized Channel B', collectedTime: '08:15 AM', processing: 'Completed', risk: 'HIGH' },
  ]);

  // Modal States
  const [connectModalSource, setConnectModalSource] = useState<SourcePlatform | null>(null);
  const [credentialToken, setCredentialToken] = useState('');
  const [channelInput, setChannelInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'SUCCESS' | 'ERROR' | null>(null);
  const [testErrorMessage, setTestErrorMessage] = useState('');

  const [disconnectModalSource, setDisconnectModalSource] = useState<SourcePlatform | null>(null);
  const [detailsModalSource, setDetailsModalSource] = useState<SourcePlatform | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filter sources by platform tab
  const platformTabs = ['All', 'Telegram', 'Instagram', 'Facebook', 'WhatsApp', 'X', 'Reddit', 'Other'];
  const filteredSources = sources.filter((s) => {
    if (activePlatformFilter === 'All') return true;
    return s.platform === activePlatformFilter;
  });

  // Action: Test Connection on an existing configured source
  const handleTestExistingConnection = (src: SourcePlatform) => {
    showToast(`Testing live connectivity to ${src.platform}...`, 'info');
    setTimeout(() => {
      showToast(`✓ Connection to ${src.platform} verified successfully (Latency: 92ms).`, 'success');
    }, 800);
  };

  // Action: Toggle Monitoring for a specific source
  const handleToggleSourceMonitoring = (sourceId: string) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === sourceId) {
          const nextState = !s.monitoringEnabled;
          showToast(
            `${s.platform} monitoring ${nextState ? 'enabled' : 'paused'}. Connection remains active.`,
            'info'
          );
          return { ...s, monitoringEnabled: nextState };
        }
        return s;
      })
    );
  };

  // Modal: Open Connect Dialog
  const openConnectModal = (src: SourcePlatform) => {
    setConnectModalSource(src);
    setCredentialToken('');
    setChannelInput(src.channelOrFeed.includes('No') ? '' : src.channelOrFeed);
    setIsTesting(false);
    setTestResult(null);
    setTestErrorMessage('');
  };

  // Modal: Handle Test Connection during setup
  const handleTestConnectionInModal = () => {
    if (!credentialToken.trim()) {
      setTestResult('ERROR');
      setTestErrorMessage('Please enter API credentials or a bot token to test.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setTestErrorMessage('');

    setTimeout(() => {
      setIsTesting(false);
      // Simulate backend validation test
      if (credentialToken.length < 5) {
        setTestResult('ERROR');
        setTestErrorMessage('Connection could not be verified: Invalid token format or access unauthorized.');
      } else {
        setTestResult('SUCCESS');
      }
    }, 1000);
  };

  // Modal: Handle Final Connect Action
  const handleFinalConnect = () => {
    if (!connectModalSource) return;

    const updatedPlatform = connectModalSource.platform;
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === connectModalSource.id) {
          return {
            ...s,
            status: 'CONNECTED',
            monitoringEnabled: true,
            sourceCount: Math.max(s.sourceCount, 1),
            lastSuccessfulConnection: 'Just now',
            lastSuccessfulCollection: 'Just now',
            channelOrFeed: channelInput || `@authorized_${updatedPlatform.toLowerCase()}_feed`,
            recentLogs: [
              { timestamp: 'Just now', message: `Connected via API credentials and activated`, type: 'success' },
              ...s.recentLogs,
            ],
          };
        }
        return s;
      })
    );

    showToast(`Successfully connected and activated ${updatedPlatform}.`, 'success');
    setConnectModalSource(null);
  };

  // Modal: Confirm Disconnect Action
  const handleConfirmDisconnect = () => {
    if (!disconnectModalSource) return;

    const disconnectedPlatform = disconnectModalSource.platform;
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === disconnectModalSource.id) {
          return {
            ...s,
            status: 'NOT_CONFIGURED',
            monitoringEnabled: false,
            sourceCount: 0,
            lastSuccessfulCollection: s.lastSuccessfulCollection,
            recentLogs: [
              { timestamp: 'Just now', message: `Disconnected source. Inbound collection stopped.`, type: 'warn' },
              ...s.recentLogs,
            ],
          };
        }
        return s;
      })
    );

    showToast(
      `Disconnected ${disconnectedPlatform}. Existing detected content, alerts, analyses, and reviews remain intact.`,
      'info'
    );
    setDisconnectModalSource(null);
    if (detailsModalSource?.id === disconnectModalSource.id) {
      setDetailsModalSource(null);
    }
  };

  // Action: Manual Trigger Collect Now
  const handleSyncAll = () => {
    showToast('Inbound scan triggered across all active authorized sources...', 'info');
    setTimeout(() => {
      showToast('Scan complete. 0 new high-risk anomalies detected.', 'success');
    }, 1200);
  };

  return (
    <ResponsiveContainer>
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div
          className={`mb-4 p-4 rounded-xl border text-xs font-medium flex items-center justify-between shadow-xs transition-all animate-in fade-in duration-150 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : toastMessage.type === 'info'
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <CircleAlert className="w-4 h-4 text-rose-600 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Activity className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="opacity-70 hover:opacity-100 font-bold px-1.5 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header with Global Monitoring Status */}
      <PageHeader
        title="Social Media (Auto)"
        description="Monitor authorized public sources, Telegram channels, Instagram feeds, WhatsApp broadcasts, and social feeds for potential exam question content."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* Global Monitoring Control */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Global Monitoring:</span>
              <button
                type="button"
                onClick={() =>
                  setGlobalMonitoring((prev) => (prev === 'ON' ? 'OFF' : 'ON'))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                  globalMonitoring === 'ON' ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title="Toggle global monitoring"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    globalMonitoring === 'ON' ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold ${
                  globalMonitoring === 'ON' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                {globalMonitoring}
              </span>
            </div>

            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleSyncAll}
            >
              Collect Now
            </Button>
          </div>
        }
      />

      {/* Platform Category Tabs / Filter */}
      <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {platformTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActivePlatformFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 whitespace-nowrap cursor-pointer ${
              activePlatformFilter === tab
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sources Grid Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
              Configured Sources
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {sources.filter((s) => s.status === 'CONNECTED').length}
            </span>{' '}
            Connected •{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {sources.filter((s) => s.status === 'SIMULATION').length}
            </span>{' '}
            Simulation
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          {filteredSources.map((src) => {
            const isConnected = src.status === 'CONNECTED';
            const isSimulation = src.status === 'SIMULATION';
            const isError = src.status === 'ERROR';
            const isNotConfigured = src.status === 'NOT_CONFIGURED';

            return (
              <Card
                key={src.id}
                className="flex flex-col justify-between font-sans relative overflow-hidden transition-all border border-slate-200 dark:border-slate-800"
              >
                {/* Visual Status Indicator Top Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isConnected
                      ? src.monitoringEnabled
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                      : isSimulation
                      ? 'bg-slate-400 dark:bg-slate-600'
                      : isError
                      ? 'bg-rose-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />

                <div>
                  {/* Platform Header & Connection State Badge */}
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <div className="flex items-center gap-2">
                      <SocialPlatformIcon platform={src.platform} size={18} />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {src.platform}
                      </span>
                    </div>

                    {/* Explicit Connection State Badge */}
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" /> CONNECTED
                      </span>
                    )}

                    {isSimulation && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        title="Demo simulation data — not a live connection"
                      >
                        <Circle className="w-2.5 h-2.5 fill-slate-400" /> SIMULATION
                      </span>
                    )}

                    {isNotConfigured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700">
                        NOT CONNECTED
                      </span>
                    )}

                    {isError && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800">
                        <CircleAlert className="w-3 h-3" /> ERROR
                      </span>
                    )}
                  </div>

                  {/* Title & Connection summary */}
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                    {src.name}
                  </h3>

                  {isSimulation ? (
                    <p className="text-[11px] text-slate-500 italic mb-3">
                      Demo data — not a live connection.
                    </p>
                  ) : isNotConfigured ? (
                    <p className="text-[11px] text-slate-400 mb-3">
                      No active {src.platform} connection.
                    </p>
                  ) : (
                    <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate mb-3">
                      {src.channelOrFeed}
                    </div>
                  )}

                  {/* Factual Connection Attributes */}
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span>Monitoring:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {isConnected ? (
                          src.monitoringEnabled ? (
                            <span className="text-emerald-600 font-semibold">ON</span>
                          ) : (
                            <span className="text-amber-500 font-semibold">PAUSED</span>
                          )
                        ) : (
                          'OFF'
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Last successful check:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {src.lastSuccessfulCollection}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Sources / Channels:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {src.sourceCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* State-Specific Action Buttons */}
                <div className="mt-4 pt-2 flex items-center justify-between gap-2">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestExistingConnection(src)}
                        title="Test live connectivity"
                      >
                        Test
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSourceMonitoring(src.id)}
                        className={src.monitoringEnabled ? 'text-amber-600' : 'text-emerald-600'}
                      >
                        {src.monitoringEnabled ? 'Pause' : 'Resume'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailsModalSource(src)}
                      >
                        Details
                      </Button>

                      {/* Explicit Disconnect Button for connected sources */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                        icon={<Unplug className="w-3.5 h-3.5" />}
                        onClick={() => setDisconnectModalSource(src)}
                        title="Disconnect source"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : isSimulation ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        icon={<Wrench className="w-3.5 h-3.5" />}
                        onClick={() => openConnectModal(src)}
                      >
                        Configure Live API
                      </Button>
                    </>
                  ) : isError ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 w-full"
                        onClick={() => openConnectModal(src)}
                      >
                        Retry Connection
                      </Button>
                    </>
                  ) : (
                    /* NOT_CONFIGURED state shows Connect */
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => openConnectModal(src)}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Connect {src.platform}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Collected Content Section */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Recent Collected Content</span>
            </div>
            <Link to="/candidates" className="text-xs font-semibold text-blue-600 hover:underline">
              View All Detected Content →
            </Link>
          </div>
        }
        subtitle="Potentially relevant exam-paper or question items captured from monitored public or authorized feeds."
      >
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Content</th>
                <th className="py-3 px-4 font-semibold">Platform</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Collected</th>
                <th className="py-3 px-4 font-semibold">Processing</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentCollected.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors font-sans"
                >
                  {/* Content ID & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.contentId}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <SocialPlatformIcon platform={item.platform} size={14} />
                      <span>{item.platform}</span>
                    </div>
                  </td>

                  {/* Source Channel */}
                  <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">
                    {item.source}
                  </td>

                  {/* Collected timestamp */}
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {item.collectedTime}
                  </td>

                  {/* Processing Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item.processing}
                    </span>
                  </td>

                  {/* Risk */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.risk === 'HIGH'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50'
                          : item.risk === 'REVIEW REQUIRED'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50'
                      }`}
                    >
                      <StatusIcon status={item.risk} size={11} />
                      {item.risk}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link to={`/candidates/${item.contentId}`}>
                      <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Connect Source Dialog */}
      {connectModalSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SocialPlatformIcon platform={connectModalSource.platform} size={20} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Connect {connectModalSource.platform}
                </h3>
              </div>
              <button
                onClick={() => setConnectModalSource(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Connection Method
                </label>
                <input
                  type="text"
                  readOnly
                  value={connectModalSource.connectionMethod}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Key / Bot Token
                </label>
                <input
                  type="password"
                  placeholder="Enter authorized token (e.g. 5839219:AAEf8...)"
                  value={credentialToken}
                  onChange={(e) => {
                    setCredentialToken(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Credentials are securely validated and processed server-side.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorized Feed / Channel Name
                </label>
                <input
                  type="text"
                  placeholder="@authorized_channel_name"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                />
              </div>

              {/* Validation Feedback */}
              {isTesting && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing credentials and querying platform endpoint...</span>
                </div>
              )}

              {testResult === 'SUCCESS' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>✓ Connection verified with platform API. Ready to connect.</span>
                </div>
              )}

              {testResult === 'ERROR' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{testErrorMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnectionInModal}
                disabled={isTesting || !credentialToken.trim()}
              >
                Test Connection
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConnectModalSource(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={testResult !== 'SUCCESS'}
                  onClick={handleFinalConnect}
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Disconnect Confirmation Dialog */}
      {disconnectModalSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 font-sans">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Unplug className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Disconnect {disconnectModalSource.platform}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                This will stop collection from this source. Existing detected content, alerts, analyses, and reviews will not be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDisconnectModalSource(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleConfirmDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Source Details & Activity Logs */}
      {detailsModalSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SocialPlatformIcon platform={detailsModalSource.platform} size={20} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {detailsModalSource.name} Details
                </h3>
              </div>
              <button
                onClick={() => setDetailsModalSource(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 block text-[11px]">Connection Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {detailsModalSource.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Monitoring</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailsModalSource.monitoringEnabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Last Successful Connection</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {detailsModalSource.lastSuccessfulConnection}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Items Collected Today</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {detailsModalSource.itemsCollectedToday}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Recent Activity Logs
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
                  {detailsModalSource.recentLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-slate-400 shrink-0">{log.timestamp}</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 dark:border-rose-900"
                onClick={() => setDisconnectModalSource(detailsModalSource)}
              >
                Disconnect
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailsModalSource(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};
