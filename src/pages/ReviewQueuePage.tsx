import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { SummaryCard } from '../components/common/SummaryCard';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { ReviewItem } from '../types/review';
import { ShieldAlert, CircleAlert, CheckCircle2, Search, Filter, ClipboardCheck, UserCheck, Clock, RefreshCw } from 'lucide-react';

const initialReviewQueue: ReviewItem[] = [
  {
    id: 'REV-101',
    candidateId: 'LB-1042',
    subject: 'Advanced Organic Chemistry II',
    subjectCode: 'CHEM-402',
    riskScore: 94,
    riskLevel: 'HIGH',
    evidenceCount: 4,
    detectedTime: '12 mins ago',
    reviewerStatus: 'Needs Verification',
    priority: 'High Priority',
    assignedReviewer: 'Dr. Sarah Jenkins',
  },
  {
    id: 'REV-102',
    candidateId: 'LB-1043',
    subject: 'Quantum Physics & Special Relativity',
    subjectCode: 'PHYS-301',
    riskScore: 88,
    riskLevel: 'HIGH',
    evidenceCount: 3,
    detectedTime: '38 mins ago',
    reviewerStatus: 'Assigned',
    priority: 'High Priority',
    assignedReviewer: 'Prof. Marcus Vance',
  },
  {
    id: 'REV-103',
    candidateId: 'LB-1045',
    subject: 'Microeconomics Theory III',
    subjectCode: 'ECON-305',
    riskScore: 78,
    riskLevel: 'HIGH',
    evidenceCount: 2,
    detectedTime: '2 hours ago',
    reviewerStatus: 'Needs Verification',
    priority: 'Standard Priority',
  },
  {
    id: 'REV-104',
    candidateId: 'LB-1044',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS-201',
    riskScore: 62,
    riskLevel: 'REVIEW REQUIRED',
    evidenceCount: 1,
    detectedTime: '1 hour ago',
    reviewerStatus: 'Needs Verification',
    priority: 'Standard Priority',
  },
  {
    id: 'REV-105',
    candidateId: 'LB-1047',
    subject: 'Forensic Pathology & Toxicology',
    subjectCode: 'MED-502',
    riskScore: 91,
    riskLevel: 'HIGH',
    evidenceCount: 5,
    detectedTime: '4 hours ago',
    reviewerStatus: 'Completed',
    priority: 'High Priority',
    assignedReviewer: 'Dr. Arthur Sterling',
  },
];

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [queueItems, setQueueItems] = useState<ReviewItem[]>(initialReviewQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const needsVerification = queueItems.filter(i => i.reviewerStatus === 'Needs Verification').length;
    const inReview = queueItems.filter(i => i.reviewerStatus === 'Assigned').length;
    const highRisk = queueItems.filter(i => i.riskLevel === 'HIGH').length;
    const completed = queueItems.filter(i => i.reviewerStatus === 'Completed').length;
    return { needsVerification, inReview, highRisk, completed };
  }, [queueItems]);

  const filteredItems = useMemo(() => {
    return queueItems.filter(item => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || item.reviewerStatus === statusFilter;
      const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [queueItems, searchTerm, statusFilter, riskFilter]);

  const handleOpenReview = (item: ReviewItem) => {
    navigate(`/candidates/${item.candidateId}`);
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Review Queue"
        description="Documents requiring human verification."
      />

      {/* Top Compact Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Needs Verification"
          value={stats.needsVerification}
          icon={<CircleAlert className="w-6 h-6" />}
          variant="warning"
          valueClassName="text-amber-600"
        />
        <SummaryCard
          title="In Review"
          value={stats.inReview}
          icon={<UserCheck className="w-6 h-6" />}
          variant="info"
          valueClassName="text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          title="High Risk Queue"
          value={stats.highRisk}
          icon={<ShieldAlert className="w-6 h-6" />}
          variant="danger"
          valueClassName="text-rose-600"
        />
        <SummaryCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="mb-6 p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate, subject, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            {['ALL', 'Needs Verification', 'Assigned', 'Completed'].map((st) => (
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

            <span className="text-xs text-slate-500 font-medium ml-2">Risk:</span>
            {['ALL', 'HIGH', 'REVIEW REQUIRED', 'LOW'].map((rf) => (
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
          </div>
        </div>
      </Card>

      {/* Main Table / State */}
      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-xs text-slate-500 font-sans">Loading review queue...</p>
        </Card>
      ) : error ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-xs text-rose-600 font-sans">Unable to load review queue.</p>
          <Button size="sm" variant="outline" onClick={() => setError(false)}>Retry</Button>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {searchTerm || statusFilter !== 'ALL' || riskFilter !== 'ALL' ? 'No results match the current filters.' : 'No candidates require review.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-0">
          {/* Mobile Card List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{item.candidateId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    item.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {item.riskLevel === 'HIGH' ? <ShieldAlert className="w-3 h-3" /> : <CircleAlert className="w-3 h-3" />}
                    {item.riskLevel}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SubjectIcon subject={item.subject} size={14} />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.subject}</p>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">Detected {item.detectedTime}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{item.reviewerStatus}</span>
                  <Button size="sm" variant="primary" onClick={() => handleOpenReview(item)}>
                    Review
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
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Review Status</th>
                  <th className="px-4 py-3">Detected</th>
                  <th className="px-4 py-3">Reviewer</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-blue-600 dark:text-blue-400">
                      {item.candidateId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                        <SubjectIcon subject={item.subject} size={14} />
                        <span className="truncate max-w-[200px]">{item.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                        item.riskLevel === 'REVIEW REQUIRED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}>
                        {item.riskLevel === 'HIGH' ? <ShieldAlert className="w-3 h-3" /> : <CircleAlert className="w-3 h-3" />}
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.reviewerStatus === 'Needs Verification' ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' :
                        item.reviewerStatus === 'Assigned' ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' :
                        'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}>
                        {item.reviewerStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {item.detectedTime}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {item.assignedReviewer || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenReview(item)}
                      >
                        Review
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
