import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { DocumentTypeIcon } from '../components/common/DocumentTypeIcon';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { FileSearch, Search, Filter, ArrowUpRight, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CandidatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const candidates = [
    { id: 'C-8AD6', name: 'CS501 Study Forum Questions.pdf', subject: 'Computer Science', platform: 'Telegram', source: 'Telegram / LeakChannel_A', risk: 'High', overlap: '94%', questions: 45, date: '2026-09-19 11:42' },
    { id: 'C-8EF5', name: 'CS501 EndSem ExamPaper 2026.pdf', subject: 'Computer Science', platform: 'Other', source: 'Darknet Pastebin', risk: 'High', overlap: '98%', questions: 50, date: '2026-09-19 10:15' },
    { id: 'C-910C', name: 'Midterm Practice Mock Set B.pdf', subject: 'Mathematics', platform: 'Instagram', source: 'Student Study Portal', risk: 'Medium', overlap: '72%', questions: 30, date: '2026-09-19 09:20' },
    { id: 'C-6BD5', name: 'Physics 202, Final Exam Leak V2.pdf', subject: 'Physics', platform: 'WhatsApp', source: 'WhatsApp Group #4', risk: 'High', overlap: '89%', questions: 40, date: '2026-09-18 22:10' },
    { id: 'C-7F89', name: 'Calculus III Prep Material.pdf', subject: 'Mathematics', platform: 'X', source: 'Discord Study Hub', risk: 'Low', overlap: '15%', questions: 25, date: '2026-09-18 18:05' },
  ];

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || c.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Detected Items"
        description="Publicly accessible and authorized social sources monitored for viral exam-question content, screenshots, PDFs, and question papers analyzed against historical and verified exam vaults."
        action={
          <Button variant="primary" icon={<Upload className="w-4 h-4" />}>
            Upload New Paper
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Risk Filter:</span>
            {['ALL', 'High', 'Medium', 'Low'].map((rf) => (
              <button
                key={rf}
                onClick={() => setRiskFilter(rf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  riskFilter === rf
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Detection ID</th>
                <th className="py-3 px-4 font-semibold">Document Name</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Platform Source</th>
                <th className="py-3 px-4 font-semibold">Question Overlap</th>
                <th className="py-3 px-4 font-semibold">Risk Level</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors font-sans">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <DocumentTypeIcon type={item.name} size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-[220px]">{item.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <SubjectIcon subject={item.subject} size={14} className="text-blue-500 shrink-0" />
                    <span>{item.subject}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 flex items-center gap-1.5">
                    <SocialPlatformIcon platform={item.platform} size={14} className="shrink-0" />
                    <span>{item.platform}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">{item.overlap}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <StatusIcon status={item.risk} size={12} />
                      {item.risk} Risk
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{item.date}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/candidates/${item.id}`}>
                      <Button variant="outline" size="sm">
                        Forensics <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ResponsiveContainer>
  );
};
