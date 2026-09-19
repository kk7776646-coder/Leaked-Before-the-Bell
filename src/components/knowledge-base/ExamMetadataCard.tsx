import React from 'react';
import { ExamMetadata } from '../../types/exam';
import { CalendarCheck, Clock, UserCheck } from 'lucide-react';

interface ExamMetadataCardProps {
  exam: ExamMetadata;
}

export const ExamMetadataCard: React.FC<ExamMetadataCardProps> = ({ exam }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-slate-400 font-medium">{exam.id}</span>
          <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100">{exam.subject}</h4>
          <span className="text-xs font-mono text-slate-500">{exam.subjectCode}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
          exam.status === 'In Progress'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            : exam.status === 'Printed'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        }`}>
          {exam.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Scheduled Date:</span>
          <span>{exam.examDate}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Session:</span>
          <span>{exam.session}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
        <UserCheck className="w-3.5 h-3.5 text-blue-500" />
        <span>Chief Examiner: {exam.chiefExaminer}</span>
      </p>
    </div>
  );
};
