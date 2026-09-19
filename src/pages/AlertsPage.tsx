import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { SummaryCard } from '../components/common/SummaryCard';
import { mockAlerts } from '../data/mockAlerts';
import { Alert, AlertSeverity, AlertStatus } from '../types/alert';
import { ShieldAlert, CircleAlert, CheckCircle2, Search, Filter, Eye, BellRing, RefreshCw } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Compute summary stats from real data
  const stats = useMemo(() => {
    const total = alerts.length;
    const highRisk = alerts.filter(a => a.severity === 'HIGH').length;
    const reviewRequired = alerts.filter(a => a.status === 'Under Review').length;
    const unresolved = alerts.filter(a => a.status === 'New' || a.status === 'Under Review').length;
    return { total, highRisk, reviewRequired, unresolved };
  }, [alerts]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesSearch = 
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = riskFilter === 'ALL' || a.severity === riskFilter;
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [alerts, searchTerm, riskFilter, statusFilter]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Acknowledged' as AlertStatus } : a));
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Alerts"
        description="Review system-generated alerts."
      />

      {/* Top Compact Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Alerts"
          value={stats.total}
          icon={<BellRing className="w-6 h-6" />}
          variant="neutral"
        />
        <SummaryCard
          title="High Risk"
          value={stats.highRisk}
          icon={<ShieldAlert className="w-6 h-6" />}
          variant="danger"
          valueClassName="text-rose-600"
        />
        <SummaryCard
          title="Review Required"
          value={stats.reviewRequired}
          icon={<CircleAlert className="w-6 h-6" />}
          variant="warning"
          valueClassName="text-amber-600"
        />
        <SummaryCard
          title="Unresolved"
          value={stats.unresolved}
          icon={<RefreshCw className="w-6 h-6" />}
          variant="info"
          valueClassName="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6 p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search alerts, ID, candidate, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Risk:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((rf) => (
              <button
                key={rf}
                onClick={() => setRiskFilter(rf)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  riskFilter === rf
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {rf}
              </button>
            ))}

            <span className="text-xs text-slate-500 font-medium ml-2">Status:</span>
            {['ALL', 'New', 'Under Review', 'Acknowledged', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Table / State */}
      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-xs text-slate-500 font-sans">Loading alerts...</p>
        </Card>
      ) : error ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-xs text-rose-600 font-sans">Unable to load alerts.</p>
          <Button size="sm" variant="outline" onClick={() => setError(false)}>Retry</Button>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card className="p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {searchTerm || riskFilter !== 'ALL' || statusFilter !== 'ALL' ? 'No results match the current filters.' : 'No alerts found.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-0">
          {/* Mobile Card List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {filteredAlerts.map((a) => (
              <Card key={a.id} className="p-4 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{a.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    a.severity === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {a.severity === 'HIGH' ? <ShieldAlert className="w-3 h-3" /> : <CircleAlert className="w-3 h-3" />}
                    {a.severity}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SubjectIcon subject={a.subject} size={14} />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.subject}</p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">Candidate: {a.candidateId} • {a.detectedTime}</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg font-sans">
                  {a.reason}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase">{a.status}</span>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/candidates/${a.candidateId}`)}>
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs min-w-[768px] font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <th className="px-4 py-3">Alert</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Detected</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {a.id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-medium">
                      {a.candidateId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                        <SubjectIcon subject={a.subject} size={14} />
                        <span className="truncate max-w-[180px]">{a.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        a.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                        a.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}>
                        {a.severity === 'HIGH' ? <ShieldAlert className="w-3 h-3" /> :
                         a.severity === 'MEDIUM' ? <CircleAlert className="w-3 h-3" /> :
                         <CheckCircle2 className="w-3 h-3" />}
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={a.reason}>
                      {a.reason}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {a.detectedTime}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        a.status === 'New' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                        a.status === 'Under Review' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' :
                        'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/candidates/${a.candidateId}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};
