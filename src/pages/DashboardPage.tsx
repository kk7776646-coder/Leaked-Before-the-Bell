import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { SummaryCard } from '../components/common/SummaryCard';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { DocumentTypeIcon } from '../components/common/DocumentTypeIcon';
import {
  ShieldAlert,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Radio,
  FileCheck2,
  Loader2,
  Database,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, DetectedContentRecord, AlertRecord } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<{
    scannedToday: number;
    scannedTotal: number;
    activeAlerts: number;
    highRiskAlerts: number;
    pendingReviews: number;
    reviewQueueCount: number;
    historicalPaperCount: number;
    realPaperCount: number;
  } | null>(null);
  const [recentItems, setRecentItems] = useState<DetectedContentRecord[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, detectedData, alertsData] = await Promise.all([
        api.getDashboardStats(),
        api.getDetectedContents({ status: 'ACTIVE' }),
        api.getAlerts(),
      ]);
      setStats(statsData);
      setRecentItems(detectedData.slice(0, 5));
      setRecentAlerts(alertsData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Dashboard"
        description="Real-time exam security overview, detected content forensic intake, and live alert telemetry."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
            <Link to="/detected-content">
              <Button variant="primary" size="sm" icon={<FileSearch className="w-4 h-4" />}>
                Detected Content
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Detected Content"
          value={stats ? stats.scannedTotal : (loading ? '—' : 0)}
          icon={<FileSearch className="w-5 h-5 text-blue-600" />}
          variant="info"
          valueClassName="text-slate-900 dark:text-slate-100"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-slate-500 font-sans font-medium">
              <span>{stats?.scannedToday || 0} scanned today</span>
            </div>
          }
        />

        <SummaryCard
          title="High Risk Alerts"
          value={stats ? stats.highRiskAlerts : (loading ? '—' : 0)}
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          variant="danger"
          valueClassName="text-rose-600"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-rose-600 font-sans font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats?.activeAlerts || 0} active alerts</span>
            </div>
          }
        />

        <SummaryCard
          title="Pending Reviews"
          value={stats ? stats.pendingReviews : (loading ? '—' : 0)}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          variant="warning"
          valueClassName="text-amber-600"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-amber-600 font-sans font-medium">
              <span>Requires Examiner Signoff</span>
            </div>
          }
        />

        <SummaryCard
          title="Ground Truth Papers"
          value={stats ? stats.realPaperCount : (loading ? '—' : 0)}
          icon={<FileCheck2 className="w-5 h-5 text-emerald-600" />}
          variant="success"
          valueClassName="text-slate-900 dark:text-slate-100"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats?.historicalPaperCount || 0} Historical in Vault</span>
            </div>
          }
        />
      </div>

      {/* Main Grid: Monitoring Sources & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px] gap-6 font-sans items-start">
        {/* Left Column: Recent Flagged Content & Monitored Sources */}
        <div className="min-w-0 space-y-6">
          {/* Recent Flagged Content */}
          <Card
            title="Recent Detected Content"
            subtitle="Live monitored content stream and question match results"
            action={
              <Link to="/detected-content">
                <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            }
          >
            {loading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading recent content...</p>
              </div>
            ) : recentItems.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileSearch className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No content
                </p>
                <p className="text-xs text-slate-500">
                  No detected content available yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {recentItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <SubjectIcon subject={item.subject} size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 truncate">
                          <DocumentTypeIcon type={item.contentType} size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-blue-600">{item.id}</span>
                          <span>•</span>
                          <span>{item.subject}</span>
                          <span>•</span>
                          <span className={item.risk === 'HIGH' ? 'font-bold text-rose-600' : 'text-slate-600'}>
                            {item.risk} Risk ({item.riskScore}/100)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/detected-content/${item.id}`} className="shrink-0 ml-3">
                      <Button variant="outline" size="sm">
                        Forensics <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Monitored Source Feeds */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>Monitored Intake Channels</span>
                </div>
                <span className="text-xs font-sans text-slate-500 font-medium">4 Channels Configured</span>
              </div>
            }
            subtitle="Configured ingestion channels and public social feeds"
            action={
              <Link to="/sources">
                <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Manage Channels
                </Button>
              </Link>
            }
          >
            <div className="space-y-3 font-sans">
              {[
                { name: 'Telegram Exam Discussion Feeds', platform: 'Telegram', status: 'Online', latency: '48ms', description: 'Monitored group ingestion & OCR trigger' },
                { name: 'Public Education Forum Scraper', platform: 'Other', status: 'Online', latency: '120ms', description: 'Real-time question dump monitoring' },
                { name: 'Social Community Watcher', platform: 'X', status: 'Online', latency: '85ms', description: 'Public post hash & snippet analyzer' },
                { name: 'Authorized Intake Stream', platform: 'Upload', status: 'Active', latency: 'Direct', description: 'Secure ingest pipeline' },
              ].map((channel, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <SocialPlatformIcon platform={channel.platform} size={18} />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{channel.name}</h4>
                      <p className="text-[11px] text-slate-500">{channel.description}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {channel.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Recent Alerts & Quick Navigation */}
        <div className="space-y-6 font-sans">
          <Card
            title="System Alerts & Telemetry"
            subtitle="Automated alerts raised by forensic engine"
          >
            {loading ? (
              <div className="py-8 text-center space-y-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading alerts...</p>
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No alerts</p>
                <p className="text-[11px] text-slate-500">No active alerts at this time.</p>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 font-sans"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link to="/alerts">
                <Button variant="outline" className="w-full">
                  View All Alerts
                </Button>
              </Link>
            </div>
          </Card>

          <Card
            title="Monitoring Modules"
            subtitle="Direct navigation to security workflows"
          >
            <div className="space-y-2 font-sans">
              <Link to="/detected-content" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileSearch className="w-4 h-4 mr-2" /> Detected Content ({stats?.scannedTotal || 0})
                </Button>
              </Link>
              <Link to="/review" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" /> Review Queue ({stats?.pendingReviews || 0})
                </Button>
              </Link>
              <Link to="/real-papers" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck2 className="w-4 h-4 mr-2" /> Verified Baseline Papers ({stats?.realPaperCount || 0})
                </Button>
              </Link>
              <Link to="/historical" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" /> Historical Paper Vault ({stats?.historicalPaperCount || 0})
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ResponsiveContainer>
  );
};
