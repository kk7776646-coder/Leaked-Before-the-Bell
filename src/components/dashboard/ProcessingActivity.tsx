import React from 'react';
import { Card } from '../common/Card';
import { Activity, CheckCircle2, Cpu, FileCheck } from 'lucide-react';

export const ProcessingActivity: React.FC = () => {
  const activities = [
    {
      id: 'ACT-101',
      title: 'OCR Feature Extraction Complete',
      target: 'LB-1042 (CHEM-402)',
      timestamp: 'Just now',
      status: 'High Match Flagged',
      statusColor: 'text-rose-500',
      icon: <Cpu className="w-3.5 h-3.5 text-blue-500" />,
    },
    {
      id: 'ACT-102',
      title: 'Telegram Gateways Mirror Indexed',
      target: '@EduExams_Archive (120 files)',
      timestamp: '2 mins ago',
      status: 'Indexed',
      statusColor: 'text-emerald-500',
      icon: <Activity className="w-3.5 h-3.5 text-purple-500" />,
    },
    {
      id: 'ACT-103',
      title: 'Structural Alignment Scan',
      target: 'LB-1043 (PHYS-301)',
      timestamp: '5 mins ago',
      status: 'Vector Matched',
      statusColor: 'text-amber-500',
      icon: <FileCheck className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'ACT-104',
      title: 'Historical Database Comparison',
      target: 'LB-1046 (ECE-410)',
      timestamp: '15 mins ago',
      status: 'Dismissed (Public)',
      statusColor: 'text-slate-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span>Real-Time Indexing Pipeline</span>
        </div>
      }
      subtitle="Live feed of OCR extraction & intelligence matching"
    >
      <div className="space-y-3">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20">
            <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{item.target}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
