import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { DocumentTypeIcon } from '../components/common/DocumentTypeIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { CheckCircle2, XCircle, Clock, Upload, ShieldCheck, Filter, Search } from 'lucide-react';
import { mockRealPapers } from '../data/mockRealPapers';
import { RealPaper, VerificationStatus } from '../types/realPaper';

export const RealPapersPage: React.FC = () => {
  const [papers, setPapers] = useState<RealPaper[]>(mockRealPapers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload form state
  const [filename, setFilename] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const handleVerify = (id: string) => {
    setPapers(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              verificationStatus: 'VERIFIED' as VerificationStatus,
              verifiedBy: 'Chief Examiner (Admin Unit)',
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : p
      )
    );
  };

  const handleReject = (id: string) => {
    setPapers(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              verificationStatus: 'REJECTED' as VerificationStatus,
              verifiedBy: 'Chief Examiner (Admin Unit)',
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : p
      )
    );
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename || !subject || !subjectCode) return;

    const newPaper: RealPaper = {
      id: `RP-2026-${Math.floor(100 + Math.random() * 900)}`,
      documentId: `doc_rp_${Date.now()}`,
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      subject,
      subjectCode,
      exam: 'End-Semester Examination',
      examType: 'Regular End-Term',
      year: 2026,
      semester: 'Spring 2026',
      session: 'Morning',
      examDate: '2026-05-25',
      duration: '3 Hours',
      maximumMarks: 100,
      pageCount: 4,
      verificationStatus: 'PENDING',
      extractedText: 'Newly uploaded reference paper awaiting OCR and human verification.',
      structuredData: {
        sections: 3,
        questions: [
          {
            id: `Q-${Date.now()}-1`,
            paperId: `RP-2026-${Math.floor(100 + Math.random() * 900)}`,
            questionNumber: '1',
            fullQuestionNumber: 'Q1',
            questionText: 'Sample extracted question from newly uploaded real paper.',
            normalizedText: 'sample extracted question newly uploaded real paper',
            questionType: 'SHORT_ANSWER',
            topic: 'General',
            difficulty: 'Medium',
            marks: 20,
            required: true,
            section: 'Section A',
            position: 1,
            pageNumber: 1,
            extractionConfidence: 0.92,
          },
        ],
      },
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPapers([newPaper, ...papers]);
    setFilename('');
    setSubject('');
    setSubjectCode('');
    setUploadModalOpen(false);
  };

  const filtered = papers.filter((p) => {
    const matchesSearch = p.subject.toLowerCase().includes(searchTerm.toLowerCase()) || p.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) || p.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Real Papers Vault"
        description="Trusted repository of official, institution-authorized, human-verified actual examination papers for forensic question-level comparison."
        action={
          <Button variant="primary" onClick={() => setUploadModalOpen(true)} icon={<Upload className="w-4 h-4" />}>
            Upload Trusted Paper
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by subject code, name, or file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Verification Status:</span>
            {['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Papers Table */}
      <Card>
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Subject & Code</th>
                <th className="py-3 px-4 font-semibold">Filename</th>
                <th className="py-3 px-4 font-semibold">Exam Type</th>
                <th className="py-3 px-4 font-semibold">Max Marks</th>
                <th className="py-3 px-4 font-semibold">Verification Status</th>
                <th className="py-3 px-4 font-semibold">Verified By</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((paper) => (
                <tr key={paper.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <SubjectIcon subject={paper.subject} size={16} className="text-blue-500 shrink-0" />
                      <span>{paper.subject}</span>
                    </div>
                    <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 pl-6">{paper.subjectCode}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <DocumentTypeIcon type={paper.filename} size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-xs">{paper.filename}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{paper.examType}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{paper.maximumMarks} Marks</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <StatusIcon status={paper.verificationStatus} size={12} />
                      {paper.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {paper.verifiedBy || 'Awaiting verification'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {paper.verificationStatus !== 'VERIFIED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerify(paper.id)}
                        icon={<ShieldCheck className="w-3.5 h-3.5" />}
                      >
                        Verify
                      </Button>
                    )}
                    {paper.verificationStatus !== 'REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(paper.id)}
                        icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      >
                        Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Modal Simulation */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl font-sans">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Upload Trusted Real Paper</h3>
            <p className="text-xs text-slate-500 mb-4">
              Uploaded papers will be processed through OCR and queued for human verification before serving as trusted comparison references.
            </p>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Filename</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS501_EndSem_Final.pdf"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS501"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Upload & Queue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};
