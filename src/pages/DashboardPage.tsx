import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { SummaryCard } from '../components/common/SummaryCard';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { DocumentTypeIcon } from '../components/common/DocumentTypeIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { ShieldAlert, FileSearch, CheckCircle2, AlertTriangle, TrendingUp, Activity, ArrowUpRight, Clock, Database, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDashboardStats } from '../data/mockDashboardStats';
import { mockAlerts } from '../data/mockAlerts';

export const DashboardPage: React.FC = () => {
  return (
    <ResponsiveContainer>
      <PageHeader
        title="Dashboard"
        description="Monitor candidates, alerts, and review activity."
        action={
          <div className="flex items-center gap-2">
            <Link to="/candidates">
              <Button variant="primary" icon={<FileSearch className="w-4 h-4" />}>
                View Candidates
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Candidates Processed (24h)"
          value={mockDashboardStats.scannedToday.toLocaleString()}
          icon={<Activity className="w-6 h-6" />}
          variant="info"
          valueClassName="text-slate-900 dark:text-slate-100"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{mockDashboardStats.scannedChange24h} vs yesterday</span>
            </div>
          }
        />

        <SummaryCard
          title="High Risk Alerts"
          value={mockDashboardStats.activeAlerts}
          icon={<ShieldAlert className="w-6 h-6" />}
          variant="danger"
          valueClassName="text-rose-600"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-rose-600 font-sans font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{mockDashboardStats.alertsChange24h}</span>
            </div>
          }
        />

        <SummaryCard
          title="Pending Reviews"
          value={mockDashboardStats.reviewQueueCount}
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
          valueClassName="text-amber-600"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-amber-600 font-sans font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{mockDashboardStats.reviewQueueChange24h}</span>
            </div>
          }
        />

        <SummaryCard
          title="Historical Papers"
          value="12,450"
          icon={<Database className="w-6 h-6" />}
          variant="success"
          valueClassName="text-slate-900 dark:text-slate-100"
          subtitle={
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Indexed</span>
            </div>
          }
        />
      </div>

      {/* Main Grid: Monitoring Sources & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Left 2 Cols: Monitoring Sources & Flagged Papers */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>Monitoring Sources</span>
                </div>
                <span className="text-xs font-sans text-slate-500 font-medium">Updated 3s ago</span>
              </div>
            }
            subtitle="Sources currently monitored by LeakLens."
          >
            <div className="space-y-3 font-sans">
              {[
                { name: 'Telegram Exam Discussion Channels (42 groups)', platform: 'Telegram', status: 'Active', latency: '120ms', matches: '14 flagged' },
                { name: 'Online Study Forums & Public Dumps', platform: 'Other', status: 'Active', latency: '450ms', matches: '2 flagged' },
                { name: 'Student Communities & Discussion Boards', platform: 'X', status: 'Active', latency: '310ms', matches: '8 flagged' },
                { name: 'Messaging Study Groups', platform: 'Instagram', status: 'Active', latency: '180ms', matches: '5 flagged' },
              ].map((channel, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <SocialPlatformIcon platform={channel.platform} size={20} />
                    <div>
                      <h4 className="text-xs font-sans font-medium text-slate-800 dark:text-slate-200">{channel.name}</h4>
                      <p className="text-[11px] text-slate-500 font-sans">Latency: {channel.latency} • {channel.matches}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium font-sans bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <StatusIcon status="COMPLETED" size={12} />
                    {channel.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Flagged Candidate Papers */}
          <Card
            title="Recent Flagged Candidate Papers"
            subtitle="Papers flagged by paper comparison exceeding similarity thresholds"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {[
                { id: 'C-8AD6', title: 'CS501 Study Forum Questions.pdf', subject: 'Computer Science', risk: 'High', overlap: '94%', time: '14 mins ago' },
                { id: 'C-8EF5', title: 'CS501 EndSem ExamPaper 2026.pdf', subject: 'Computer Science', risk: 'High', overlap: '98%', time: '38 mins ago' },
                { id: 'C-910C', title: 'Midterm Practice Mock Set B.pdf', subject: 'Mathematics', risk: 'Medium', overlap: '72%', time: '1 hour ago' },
              ].map((item, i) => (
                <div key={i} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <SubjectIcon subject={item.subject} size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <DocumentTypeIcon type={item.title} size={14} className="text-slate-400" />
                        <span>{item.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-blue-600">{item.id}</span>
                        <span>•</span>
                        <span>{item.subject}</span>
                        <span>•</span>
                        <span className="font-semibold text-rose-600">{item.overlap} Overlap</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/candidates`}>
                    <Button variant="outline" size="sm">
                      View <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Recent Alerts & Quick Actions */}
        <div className="space-y-6 font-sans">
          <Card
            title="Recent Alerts"
            subtitle="Recent alerts requiring review."
          >
            <div className="space-y-3 font-sans">
              {mockAlerts.slice(0, 3).map((alert: any) => (
                <div key={alert.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 font-sans">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 flex items-center gap-1">
                      <StatusIcon status={alert.severity || 'HIGH'} size={12} />
                      {alert.severity || 'Critical'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp || '10m ago'}</span>
                  </div>
                  <h4 className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-200 mb-1">{alert.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{alert.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/alerts">
                <Button variant="outline" className="w-full">View All Alerts</Button>
              </Link>
            </div>
          </Card>

          <Card
            title="Quick Actions"
            subtitle="Quick controls for exam security officers"
          >
            <div className="space-y-2 font-sans">
              <Link to="/review" className="block">
                <Button variant="primary" className="w-full justify-start">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Open Review Queue (34)
                </Button>
              </Link>
              <Link to="/sources" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Radio className="w-4 h-4 mr-2" /> Manage Sources
                </Button>
              </Link>
              <Link to="/historical" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" /> Search Historical Papers
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ResponsiveContainer>
  );
};
