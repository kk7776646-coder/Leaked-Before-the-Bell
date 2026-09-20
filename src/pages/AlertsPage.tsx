import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { SummaryCard } from '../components/common/SummaryCard';
import { PageFilterMenu, FilterFieldDefinition, PageFilterValues } from '../components/common/PageFilterMenu';
import {
  ShieldAlert,
  CircleAlert,
  CheckCircle2,
  Search,
  BellRing,
  RefreshCw,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { api, AlertRecord } from '../services/api';

const DEFAULT_ALERT_FILTERS: PageFilterValues = {
  risk: 'ALL',
  status: 'ALL',
  subject: 'ALL',
  source: 'ALL',
  dateFrom: '',
  dateTo: '',
};

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<PageFilterValues>(DEFAULT_ALERT_FILTERS);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Compute summary stats from real data
  const stats = useMemo(() => {
    const total = alerts.length;
    const highRisk = alerts.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;
    const reviewRequired = alerts.filter((a) => a.status === 'INVESTIGATING' || a.status === 'ACTIVE').length;
    const unresolved = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'INVESTIGATING').length;
    return { total, highRisk, reviewRequired, unresolved };
  }, [alerts]);

  // Distinct subjects for filter
  const subjectOptions = useMemo(() => {
    const subjects = Array.from(new Set(alerts.map((a) => a.subject).filter(Boolean)));
    return subjects.map((s) => ({ label: s, value: s }));
  }, [alerts]);

  const sourceOptions = useMemo(() => {
    const platforms = Array.from(new Set(alerts.map((a) => a.platform).filter(Boolean)));
    const defaults = ['Telegram', 'WhatsApp', 'Instagram', 'Facebook', 'X', 'Reddit', 'Upload', 'Other'];
    const merged = Array.from(new Set([...platforms, ...defaults]));
    return merged.map((p) => ({ label: p, value: p }));
  }, [alerts]);

  const filterFields: FilterFieldDefinition[] = useMemo(
    () => [
      {
        id: 'risk',
        label: 'Severity / Risk',
        type: 'chips',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'High / Critical', value: 'HIGH' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Low', value: 'LOW' },
        ],
      },
      {
        id: 'status',
        label: 'Alert Status',
        type: 'select',
        placeholder: 'All Statuses',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Investigating', value: 'INVESTIGATING' },
          { label: 'Resolved', value: 'RESOLVED' },
          { label: 'Dismissed', value: 'DISMISSED' },
        ],
      },
      {
        id: 'subject',
        label: 'Subject',
        type: 'select',
        placeholder: 'All Subjects',
        options: subjectOptions,
      },
      {
        id: 'source',
        label: 'Source / Platform',
        type: 'select',
        placeholder: 'All Sources',
        options: sourceOptions,
      },
      {
        id: 'date',
        label: 'Date Range',
        type: 'date-range',
      },
    ],
    [subjectOptions, sourceOptions]
  );

  // Filter alerts against real backend data
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          a.id.toLowerCase().includes(q) ||
          a.candidateId.toLowerCase().includes(q) ||
          (a.subject || '').toLowerCase().includes(q) ||
          (a.title || '').toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Risk
      if (filterValues.risk && filterValues.risk !== 'ALL') {
        if (filterValues.risk === 'HIGH') {
          if (a.severity !== 'HIGH' && a.severity !== 'CRITICAL') return false;
        } else if (a.severity !== filterValues.risk) {
          return false;
        }
      }

      // Status
      if (filterValues.status && filterValues.status !== 'ALL') {
        if (a.status !== filterValues.status) return false;
      }

      // Subject
      if (filterValues.subject && filterValues.subject !== 'ALL') {
        if (a.subject !== filterValues.subject) return false;
      }

      // Source
      if (filterValues.source && filterValues.source !== 'ALL') {
        if (a.platform !== filterValues.source) return false;
      }

      // Date
      if (filterValues.dateFrom || filterValues.dateTo) {
        const timestamp = a.timestamp || a.detectedTime;
        if (timestamp) {
          const itemTime = new Date(timestamp).getTime();
          if (filterValues.dateFrom) {
            const fromTime = new Date(filterValues.dateFrom).getTime();
            if (itemTime < fromTime) return false;
          }
          if (filterValues.dateTo) {
            const toTime = new Date(filterValues.dateTo).setHours(23, 59, 59, 999);
            if (itemTime > toTime) return false;
          }
        }
      }

      return true;
    });
  }, [alerts, searchTerm, filterValues]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== '' ||
      Object.entries(filterValues).some(([key, val]) => {
        if (val === undefined || val === null || val === '' || val === 'ALL') {
          return false;
        }
        return true;
      })
    );
  }, [searchTerm, filterValues]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterValues(DEFAULT_ALERT_FILTERS);
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Alerts"
        description="System alerts raised on similarity threshold breaches, question overlap, and suspicious leaks."
        action={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchAlerts}
          >
            Refresh Alerts
          </Button>
        }
      />

      {/* Top Compact Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Alerts"
          value={stats.total}
          icon={<BellRing className="w-6 h-6 text-blue-600" />}
          variant="neutral"
        />
        <SummaryCard
          title="High Risk"
          value={stats.highRisk}
          icon={<ShieldAlert className="w-6 h-6 text-rose-600" />}
          variant="danger"
          valueClassName="text-rose-600"
        />
        <SummaryCard
          title="Under Investigation"
          value={stats.reviewRequired}
          icon={<CircleAlert className="w-6 h-6 text-amber-600" />}
          variant="warning"
          valueClassName="text-amber-600"
        />
        <SummaryCard
          title="Unresolved Active"
          value={stats.unresolved}
          icon={<RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          variant="info"
          valueClassName="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6 p-3 overflow-visible" overflowVisible>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="search-alerts-input"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PageFilterMenu
              fields={filterFields}
              values={filterValues}
              onApply={(newVals) => setFilterValues(newVals)}
              onReset={() => setFilterValues(DEFAULT_ALERT_FILTERS)}
            />
          </div>
        </div>
      </Card>

      {/* Main Table / State */}
      {loading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-sans">Loading alerts from database...</p>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card className="p-14 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {hasActiveFilters ? 'No alerts found' : 'No alerts'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try changing or clearing your filters.'
              : 'All examined content within acceptable similarity margins.'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs min-w-[768px] font-sans">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Alert</th>
                <th className="px-4 py-3">Content ID</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Timestamp</th>
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
                  <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {a.candidateId}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                      <SubjectIcon subject={a.subject} size={14} />
                      <span className="truncate max-w-[180px]">{a.subject}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        a.severity === 'HIGH' || a.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60'
                          : a.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60'
                      }`}
                    >
                      {a.severity === 'HIGH' || a.severity === 'CRITICAL' ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : a.severity === 'MEDIUM' ? (
                        <CircleAlert className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={a.title || a.description}>
                    {a.title || a.description}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : 'Recent'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        a.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                          : a.status === 'INVESTIGATING'
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/detected-content/${a.candidateId}`)}
                    >
                      Investigate <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ResponsiveContainer>
  );
};
