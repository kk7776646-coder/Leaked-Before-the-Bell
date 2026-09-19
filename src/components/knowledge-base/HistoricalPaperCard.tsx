import React from 'react';
import { HistoricalPaper } from '../../types/exam';
import { BookOpen, FileText, Calendar, Hash } from 'lucide-react';

interface HistoricalPaperCardProps {
  paper: HistoricalPaper;
}

export const HistoricalPaperCard: React.FC<HistoricalPaperCardProps> = ({ paper }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">{paper.paperRefCode}</span>
          <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 mt-0.5">{paper.paperTitle}</h4>
          <span className="text-xs font-mono text-slate-500">{paper.subjectCode}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
          {paper.year}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Semester:</span>
          <span>{paper.semester}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Total Questions:</span>
          <span>{paper.totalQuestions} Questions</span>
        </div>
      </div>
    </div>
  );
};
