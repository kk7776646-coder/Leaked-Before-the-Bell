import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Database, Search, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { mockHistoricalPapers } from '../data/mockHistoricalPapers';

export const HistoricalPapersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockHistoricalPapers.filter((p: any) => {
    const title = p.paperTitle || p.title || '';
    const code = p.subjectCode || p.code || '';
    const subject = p.subject || '';
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Historical Secure Exam Vault"
        description="Vectorized database of past secure examination papers, question banks, and rubric embeddings for real-time RAG comparison."
      />

      <Card className="mb-6 font-sans">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search historical papers by course code, subject, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
        {filtered.map((paper: any) => (
          <Card key={paper.id} className="flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <SubjectIcon subject={paper.subject} size={14} className="text-blue-500 shrink-0" />
                  {paper.subjectCode || paper.code}
                </span>
                <span className="inline-flex items-center text-[10px] text-emerald-600 font-medium font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Vectorized
                </span>
              </div>
              <div className="flex items-start gap-2 mb-1">
                <SubjectIcon subject={paper.subject} size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-900 dark:text-slate-100">
                    {paper.paperTitle || paper.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    {paper.subject}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-2">
                Year: {paper.year || '2025'} • Questions: {paper.totalQuestions || paper.questionCount || 40}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-sans">Embeddings v2.4</span>
              <Button variant="outline" size="sm">
                View Vault Record
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ResponsiveContainer>
  );
};
