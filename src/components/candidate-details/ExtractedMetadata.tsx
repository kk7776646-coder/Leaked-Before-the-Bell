import React from 'react';
import { Card } from '../common/Card';
import { Candidate } from '../../types/candidate';
import { Calendar, Clock, Award, FileSpreadsheet, Hash, Layers } from 'lucide-react';

interface ExtractedMetadataProps {
  metadata: Candidate['metadata'];
}

export const ExtractedMetadata: React.FC<ExtractedMetadataProps> = ({ metadata }) => {
  const items = [
    { label: 'Academic Term / Semester', value: metadata.semester, icon: <Calendar className="w-4 h-4 text-blue-500" /> },
    { label: 'Scheduled Exam Date', value: metadata.examDate, icon: <Clock className="w-4 h-4 text-emerald-500" /> },
    { label: 'Exam Session', value: metadata.session, icon: <Layers className="w-4 h-4 text-purple-500" /> },
    { label: 'Maximum Marks', value: `${metadata.maxMarks} Marks`, icon: <Award className="w-4 h-4 text-amber-500" /> },
    { label: 'Time Allowed', value: metadata.duration, icon: <Clock className="w-4 h-4 text-rose-500" /> },
    { label: 'Page Count', value: `${metadata.pages} Pages`, icon: <Hash className="w-4 h-4 text-indigo-500" /> },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>Extracted Examination Metadata</span>
        </div>
      }
      subtitle="Header parameters parsed from OCR & EXIF attributes"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40"
          >
            <div className="flex items-center gap-2 mb-1">
              {item.icon}
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-sans">
                {item.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
