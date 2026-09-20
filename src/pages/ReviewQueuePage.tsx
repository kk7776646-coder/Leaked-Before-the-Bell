import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { SummaryCard } from '../components/common/SummaryCard';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { PageFilterMenu, FilterFieldDefinition, PageFilterValues } from '../components/common/PageFilterMenu';
import {
  ShieldAlert,
  CircleAlert,
  CheckCircle2,
  Search,
  ClipboardCheck,
  RefreshCw,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { api, CandidateRecord } from '../services/api';

const DEFAULT_REVIEW_FILTERS: PageFilterValues = {
  status: 'ALL',
  risk: 'ALL',
  subject: 'ALL',
  reviewer: 'ALL',
  dateFrom: '',
  dateTo: '',
};

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<PageFilterValues>(DEFAULT_REVIEW_FILTERS);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getCandidates({ status: 'ALL' });
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Stats derived honestly from actual database candidates
  const stats = useMemo(() => {
    const needsVerification = candidates.filter(
      (c) => c.review === 'Needs Verification' || c.review === 'Pending'
    ).length;
    const reviewed = candidates.filter((c) => c.review === 'Reviewed').length;
    const highRisk = candidates.filter((c) => c.risk === 'HIGH').length;
    const total = candidates.length;
    return { needsVerification, reviewed, highRisk, total };
  }, [candidates]);

  // Subject options from real items
  const subjectOptions = useMemo(() => {
    const subjects = Array.from(new Set(candidates.map((c) => c.subject).filter(Boolean)));
    return subjects.map((s) => ({ label: s, value: s }));
  }, [candidates]);

  const filterFields: FilterFieldDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        label: 'Review Status',
        type: 'chips',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Needs Verification', value: 'Needs Verification' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Reviewed', value: 'Reviewed' },
          { label: 'Dismissed', value: 'Dismissed' },
        ],
      },
      {
        id: 'risk',
        label: 'Risk Level',
        type: 'chips',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'High', value: 'HIGH' },
          { label: 'Review Required', value: 'REVIEW REQUIRED' },
          { label: 'Low', value: 'LOW' },
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
        id: 'reviewer',
        label: 'Assigned Reviewer',
        type: 'select',
        placeholder: 'All Reviewers',
        options: [
          { label: 'Chief Examiner', value: 'Chief Examiner' },
          { label: 'Subject Expert', value: 'Subject Expert' },
          { label: 'Security Lead', value: 'Security Lead' },
        ],
      },
      {
        id: 'date',
        label: 'Date Range',
        type: 'date-range',
      },
    ],
    [subjectOptions]
  );

  const filteredItems = useMemo(() => {
    return candidates.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          (item.subjectCode || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Review Status
      if (filterValues.status && filterValues.status !== 'ALL') {
        if (item.review !== filterValues.status) return false;
      }

      // Risk Level
      if (filterValues.risk && filterValues.risk !== 'ALL') {
        if (item.risk !== filterValues.risk) return false;
      }

      // Subject
      if (filterValues.subject && filterValues.subject !== 'ALL') {
        if (item.subject !== filterValues.subject) return false;
      }

      // Date
      if (filterValues.dateFrom || filterValues.dateTo) {
        const itemDateStr = item.uploadedAt || item.detectedTime;
        if (itemDateStr) {
          const itemTime = new Date(itemDateStr).getTime();
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
  }, [candidates, searchTerm, filterValues]);

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
    setFilterValues(DEFAULT_REVIEW_FILTERS);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50';
      case 'REVIEW REQUIRED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50';
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50';
    }
  };

  const getReviewBadge = (review: string) => {
    switch (review) {
      case 'Needs Verification':
      case 'Pending':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50';
      case 'Reviewed':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50';
      case 'Dismissed':
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Human Review & Verification Queue"
        description="Prioritized list of detected content awaiting Chief Examiner review and verification against examination papers."
        action={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchQueue}
          >
            Refresh Queue
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Needs Verification"
          value={stats.needsVerification}
          icon={<CircleAlert className="w-5 h-5 text-rose-600" />}
          variant="danger"
          subtitle={<span className="text-xs text-rose-600">Pending Reviewer Attention</span>}
        />
        <SummaryCard
          title="High Risk Items"
          value={stats.highRisk}
          icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
          variant="warning"
          subtitle={<span className="text-xs text-amber-600">Over 75% Risk Score</span>}
        />
        <SummaryCard
          title="Reviewed & Completed"
          value={stats.reviewed}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          variant="success"
          subtitle={<span className="text-xs text-emerald-600">Determinations Saved</span>}
        />
        <SummaryCard
          title="Total In Queue"
          value={stats.total}
          icon={<ClipboardCheck className="w-5 h-5 text-blue-600" />}
          variant="info"
          subtitle={<span className="text-xs text-slate-500">Active Monitored Items</span>}
        />
      </div>

      {/* Compact Search & Single Filter Toolbar */}
      <Card className="mb-6 p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="search-reviews-input"
              placeholder="Search reviews by ID, title, or subject..."
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
              onReset={() => setFilterValues(DEFAULT_REVIEW_FILTERS)}
            />
          </div>
        </div>
      </Card>

      {/* Review Queue Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading review queue...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {hasActiveFilters ? 'No review items found' : 'No reviews pending'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try changing or clearing your filters.'
                : 'All detected content items have completed review.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Content Item & ID</th>
                  <th className="py-3 px-4 font-semibold">Subject & Code</th>
                  <th className="py-3 px-4 font-semibold">Calculated Risk</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold">Parsed Blocks</th>
                  <th className="py-3 px-4 font-semibold">Review Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                        {item.name}
                      </div>
                      <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {item.id}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <SubjectIcon subject={item.subject} size={14} className="shrink-0" />
                        <span>{item.subject}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.subjectCode}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadge(
                          item.risk
                        )}`}
                      >
                        {item.risk === 'HIGH' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                        {item.risk} ({item.riskScore}/100)
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {item.confidence}%
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.questions?.length || 0} questions
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getReviewBadge(
                          item.review
                        )}`}
                      >
                        {item.review}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/detected-content/${item.id}`)}
                      >
                        Review Item <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </ResponsiveContainer>
  );
};
