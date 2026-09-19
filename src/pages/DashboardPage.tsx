import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskOverviewChart } from '../components/dashboard/RiskOverviewChart';
import { RecentCandidatesTable } from '../components/dashboard/RecentCandidatesTable';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { ProcessingActivity } from '../components/dashboard/ProcessingActivity';
import { mockDashboardStats } from '../data/mockDashboardStats';
import { mockCandidates } from '../data/mockCandidates';
import { mockAlerts } from '../data/mockAlerts';
import { Badge } from '../components/common/Badge';
import { FileSearch, ShieldAlert, BellRing, ClipboardCheck, Clock, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <ResponsiveContainer>
      <PageHeader
        title="Surveillance & Early-Warning Executive Overview"
        description="Real-time document intelligence, multimodal OCR matching, and automated exam paper surveillance feed."
        badge={<Badge variant="info">LIVE SURVEILLANCE ACTIVE</Badge>}
      />

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Documents Scanned (24h)"
          value={mockDashboardStats.scannedToday.toLocaleString()}
          change={mockDashboardStats.scannedChange24h}
          isPositive={true}
          subtitle="Across 12 web & darknet gateways"
          icon={<FileSearch className="w-5 h-5" />}
          accentColor="blue"
        />

        <StatCard
          title="Flagged Candidates"
          value={mockDashboardStats.candidatesDetected}
          change={mockDashboardStats.candidatesChange24h}
          isPositive={false}
          subtitle="Potentially suspicious documents"
          icon={<ShieldAlert className="w-5 h-5" />}
          accentColor="rose"
        />

        <StatCard
          title="Active System Alerts"
          value={mockDashboardStats.activeAlerts}
          change={mockDashboardStats.alertsChange24h}
          isPositive={false}
          subtitle="Action required by security team"
          icon={<BellRing className="w-5 h-5" />}
          accentColor="amber"
        />

        <StatCard
          title="Pending Investigation Review"
          value={mockDashboardStats.reviewQueueCount}
          change={mockDashboardStats.reviewQueueChange24h}
          isPositive={true}
          subtitle="Awaiting analyst decision"
          icon={<ClipboardCheck className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RiskOverviewChart />
        </div>
        <div className="lg:col-span-1">
          <RecentAlerts alerts={mockAlerts} />
        </div>
      </div>

      {/* Bottom Grid: Recent Candidates & Real-Time Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentCandidatesTable candidates={mockCandidates} />
        </div>
        <div className="lg:col-span-1">
          <ProcessingActivity />
        </div>
      </div>
    </ResponsiveContainer>
  );
};
