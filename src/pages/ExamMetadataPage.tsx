import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Database, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';
import { mockExamMetadata } from '../data/mockExamMetadata';

export const ExamMetadataPage: React.FC = () => {
  return (
    <ResponsiveContainer>
      <PageHeader
        title="Current Exam Metadata Configuration"
        description="Active examination parameters, schedules, authorized maximum marks, duration limits, and chief examiner configurations."
      />

      <div className="space-y-6 font-sans">
        <Card title="Active Examination Schedule & Parameters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockExamMetadata.map((exam: any) => (
              <div key={exam.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {exam.subjectCode}
                  </span>
                  <span className="inline-flex items-center text-[10px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {exam.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{exam.subject}</h4>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Date: {exam.examDate} ({exam.session})</div>
                  <div>Max Marks: {exam.maxMarks} • Duration: {exam.duration}</div>
                  <div>Type: {exam.examType}</div>
                  <div>Chief Examiner: {exam.chiefExaminer}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};
