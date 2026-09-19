import React from 'react';
import { Card } from '../common/Card';
import { Candidate } from '../../types/candidate';
import { Grid, HelpCircle, LayoutGrid, FileCode2 } from 'lucide-react';

interface StructuralAnalysisProps {
  structure: Candidate['structure'];
}

export const StructuralAnalysis: React.FC<StructuralAnalysisProps> = ({ structure }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-purple-500" />
          <span>Structural & Typographic Alignment</span>
        </div>
      }
      subtitle="Layout grid geometry and question hierarchy checks"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 font-sans">
            <LayoutGrid className="w-4 h-4 text-blue-500" />
            <span>Document Layout Parameters</span>
          </div>
          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1">
              <span className="text-slate-500">Total sections:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">{structure.sections}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1">
              <span className="text-slate-500">Parsed question count:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">{structure.questionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Marks breakdown:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">{structure.marksDistribution}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 font-sans">
            <FileCode2 className="w-4 h-4 text-amber-500" />
            <span>Instruction Pattern Matching</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-mono leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            {structure.instructionPattern}
          </p>
        </div>
      </div>
    </Card>
  );
};
