import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Card } from '../common/Card';
import { riskTrendData, riskCategoryBreakdown } from '../../data/mockDashboardStats';
import { BarChart3, TrendingUp } from 'lucide-react';

export const RiskOverviewChart: React.FC = () => {
  const [viewType, setViewType] = useState<'trend' | 'categories'>('trend');

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span>Surveillance Intelligence Metrics</span>
        </div>
      }
      action={
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewType('trend')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
              viewType === 'trend'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Temporal Trend
          </button>
          <button
            onClick={() => setViewType('categories')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
              viewType === 'categories'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Risk Categories
          </button>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        {viewType === 'trend' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scannedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="highRiskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
              />
              <Area
                type="monotone"
                dataKey="totalScanned"
                name="Total Scanned Docs"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scannedGrad)"
              />
              <Area
                type="monotone"
                dataKey="highRiskCount"
                name="High Risk Detections"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#highRiskGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskCategoryBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-10} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Flagged Instances" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
