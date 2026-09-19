import React from 'react';
import { ExamMetadata } from '../../types/exam';
import { ExamMetadataCard } from './ExamMetadataCard';
import { CalendarCheck, Clock, UserCheck } from 'lucide-react';

interface ExamMetadataTableProps {
  exams: ExamMetadata[];
}

export const ExamMetadataTable: React.FC<ExamMetadataTableProps> = ({ exams }) => {
  if (exams.length === 0) return null;

  return (
    <>
      {/* Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {exams.map((e) => (
          <ExamMetadataCard key={e.id} exam={e} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs min-w-[768px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs">
              <th className="px-4 py-3.5">Exam reference</th>
              <th className="px-4 py-3.5">Subject & code</th>
              <th className="px-4 py-3.5">Scheduled date</th>
              <th className="px-4 py-3.5">Session</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Chief examiner</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {exams.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                  {e.id}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{e.subject}</p>
                  <p className="text-[11px] font-mono text-slate-500">{e.subjectCode}</p>
                </td>
                <td className="px-4 py-3.5 font-mono font-medium text-slate-800 dark:text-slate-200">
                  {e.examDate}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                  {e.session} ({e.duration})
                </td>
                <td className="px-4 py-3.5 text-slate-500">
                  {e.examType}
                </td>
                <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                  {e.chiefExaminer}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    e.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : e.status === 'Printed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
