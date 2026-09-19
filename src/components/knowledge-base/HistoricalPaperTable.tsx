import React from 'react';
import { HistoricalPaper } from '../../types/exam';
import { HistoricalPaperCard } from './HistoricalPaperCard';
import { BookOpen, FileText } from 'lucide-react';

interface HistoricalPaperTableProps {
  papers: HistoricalPaper[];
}

export const HistoricalPaperTable: React.FC<HistoricalPaperTableProps> = ({ papers }) => {
  if (papers.length === 0) return null;

  return (
    <>
      {/* Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {papers.map((p) => (
          <HistoricalPaperCard key={p.id} paper={p} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs min-w-[768px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs">
              <th className="px-4 py-3.5">Reference code</th>
              <th className="px-4 py-3.5">Paper title</th>
              <th className="px-4 py-3.5">Subject & code</th>
              <th className="px-4 py-3.5">Academic year</th>
              <th className="px-4 py-3.5">Max marks</th>
              <th className="px-4 py-3.5">Duration</th>
              <th className="px-4 py-3.5">File format</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {papers.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3.5 font-mono font-medium text-blue-600 dark:text-blue-400">
                  {p.paperRefCode}
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                  {p.paperTitle}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{p.subject}</p>
                  <p className="text-[11px] font-mono text-slate-500">{p.subjectCode}</p>
                </td>
                <td className="px-4 py-3.5 font-mono font-medium text-slate-700 dark:text-slate-300">
                  {p.year} ({p.semester})
                </td>
                <td className="px-4 py-3.5 font-mono font-medium text-slate-800 dark:text-slate-200">
                  {p.maxMarks} Marks
                </td>
                <td className="px-4 py-3.5 text-slate-500">
                  {p.duration}
                </td>
                <td className="px-4 py-3.5 text-slate-500">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {p.fileType}
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
