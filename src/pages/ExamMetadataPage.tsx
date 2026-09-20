import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ActionMenu } from '../components/common/ActionMenu';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast, ToastNotification } from '../components/common/Toast';
import { SubjectIcon } from '../components/common/SubjectIcon';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  Plus, 
  Search, 
  Filter, 
  Archive, 
  Trash2, 
  RotateCcw, 
  Edit3, 
  Eye, 
  X,
  Clock,
  Layers,
  Loader2
} from 'lucide-react';
import { api, ExamMetadataRecord } from '../services/api';

export const ExamMetadataPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [exams, setExams] = useState<ExamMetadataRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [archiveTarget, setArchiveTarget] = useState<ExamMetadataRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamMetadataRecord | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ExamMetadataRecord | null>(null);
  const [viewTarget, setViewTarget] = useState<ExamMetadataRecord | null>(null);
  const [editTarget, setEditTarget] = useState<ExamMetadataRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State (Add / Edit)
  const [formSubject, setFormSubject] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formExamName, setFormExamName] = useState('End-Semester Examination');
  const [formExamDate, setFormExamDate] = useState('2026-10-15');
  const [formSession, setFormSession] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [formSemester, setFormSemester] = useState('Fall 2026');
  const [formMaxMarks, setFormMaxMarks] = useState(100);
  const [formDuration, setFormDuration] = useState('3 Hours');
  const [formExamType, setFormExamType] = useState('Theoretical & Numerical');
  const [formChiefExaminer, setFormChiefExaminer] = useState('Dr. R. K. Verma');

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchExams = async (status = statusFilter, search = searchTerm) => {
    try {
      const data = await api.getExamMetadata({ status, search });
      setExams(data);
    } catch (err: any) {
      console.error('Failed to load exam metadata:', err);
      showToast(err.message || 'Failed to fetch exam metadata', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchExams(statusFilter, val);
  };

  const handleFilterChange = (filter: 'ALL' | 'ACTIVE' | 'ARCHIVED') => {
    setStatusFilter(filter);
  };

  // Open Edit Modal with prefilled values
  const openEditModal = (exam: ExamMetadataRecord) => {
    setEditTarget(exam);
    setFormSubject(exam.subject);
    setFormCode(exam.subjectCode);
    setFormExamName(exam.examName);
    setFormExamDate(exam.examDate);
    setFormSession(exam.session);
    setFormSemester(exam.semester);
    setFormMaxMarks(exam.maxMarks);
    setFormDuration(exam.duration);
    setFormExamType(exam.examType);
    setFormChiefExaminer(exam.chiefExaminer);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject || !formCode) return;

    setIsProcessing(true);
    try {
      if (editTarget) {
        await api.updateExamMetadata(editTarget.id, {
          subject: formSubject,
          subjectCode: formCode,
          examName: formExamName,
          examDate: formExamDate,
          session: formSession,
          semester: formSemester,
          maxMarks: Number(formMaxMarks),
          duration: formDuration,
          examType: formExamType,
          chiefExaminer: formChiefExaminer,
        });
        showToast('Exam metadata saved.', 'success');
        setEditTarget(null);
      } else {
        await api.createExamMetadata({
          subject: formSubject,
          subjectCode: formCode,
          examName: formExamName,
          examDate: formExamDate,
          session: formSession,
          semester: formSemester,
          maxMarks: Number(formMaxMarks),
          duration: formDuration,
          examType: formExamType,
          chiefExaminer: formChiefExaminer,
        });
        showToast('Exam metadata created.', 'success');
        setIsAddModalOpen(false);
      }
      fetchExams();
    } catch (err: any) {
      showToast(err.message || 'Failed to save exam metadata', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    setIsProcessing(true);
    try {
      await api.archiveExamMetadata(archiveTarget.id);
      showToast('Exam metadata archived.', 'success');
      setArchiveTarget(null);
      fetchExams();
    } catch (err: any) {
      showToast(err.message || 'Could not archive this item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return;
    setIsProcessing(true);
    try {
      await api.restoreExamMetadata(restoreTarget.id);
      showToast('Exam metadata restored.', 'success');
      setRestoreTarget(null);
      fetchExams();
    } catch (err: any) {
      showToast(err.message || 'Could not restore this item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      await api.deleteExamMetadata(deleteTarget.id);
      showToast('Exam metadata deleted.', 'success');
      setDeleteTarget(null);
      fetchExams();
    } catch (err: any) {
      showToast(err.message || 'Could not delete this item.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Official Exam Configuration & Metadata"
        description="Configuration of active and upcoming examinations, schedules, marks distributions, and subject codes used for pattern matching."
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditTarget(null);
              setFormSubject('');
              setFormCode('');
              setIsAddModalOpen(true);
            }}
          >
            Create Exam Schedule
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="mb-6 font-sans">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by subject, code, or examiner..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {filter === 'ALL' ? 'All' : filter === 'ACTIVE' ? 'Active' : 'Archived'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading exam configurations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Subject & Code</th>
                  <th className="py-3 px-4 font-semibold">Exam Title</th>
                  <th className="py-3 px-4 font-semibold">Date & Session</th>
                  <th className="py-3 px-4 font-semibold">Semester</th>
                  <th className="py-3 px-4 font-semibold">Chief Examiner</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No exam configurations found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <SubjectIcon subject={exam.subject} size={16} />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {exam.subject}
                            </div>
                            <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                              {exam.subjectCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {exam.examName}
                        <div className="text-[11px] text-slate-400 font-normal">
                          {exam.maxMarks} Marks • {exam.duration}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        <div>{exam.examDate}</div>
                        <div className="text-[11px] text-slate-400">{exam.session} Session</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {exam.semester}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {exam.chiefExaminer}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            exam.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {exam.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setViewTarget(exam)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => openEditModal(exam)}
                          />

                          <ActionMenu
                            items={[
                              ...(exam.status === 'ACTIVE'
                                ? [
                                    {
                                      id: 'archive',
                                      label: 'Archive Configuration',
                                      icon: <Archive className="w-3.5 h-3.5" />,
                                      variant: 'warning' as const,
                                      onClick: () => setArchiveTarget(exam),
                                    },
                                  ]
                                : [
                                    {
                                      id: 'restore',
                                      label: 'Restore Configuration',
                                      icon: <RotateCcw className="w-3.5 h-3.5" />,
                                      variant: 'primary' as const,
                                      onClick: () => setRestoreTarget(exam),
                                    },
                                  ]),
                              {
                                id: 'delete',
                                label: 'Delete Configuration',
                                icon: <Trash2 className="w-3.5 h-3.5" />,
                                variant: 'danger' as const,
                                onClick: () => setDeleteTarget(exam),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Exam Modal */}
      {(isAddModalOpen || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditTarget(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {editTarget ? 'Edit Exam Metadata Configuration' : 'Create Exam Schedule & Metadata'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter official subject parameters to guide automatic paper pattern matching.
            </p>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-301"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Title / Stage
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Examination 2026"
                  value={formExamName}
                  onChange={(e) => setFormExamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formExamDate}
                    onChange={(e) => setFormExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Session
                  </label>
                  <select
                    value={formSession}
                    onChange={(e: any) => setFormSession(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    required
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={formMaxMarks}
                    onChange={(e) => setFormMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chief Examiner / Authority
                </label>
                <input
                  type="text"
                  value={formChiefExaminer}
                  onChange={(e) => setFormChiefExaminer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditTarget(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isProcessing}
                  icon={isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                >
                  {isProcessing ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Configuration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete exam metadata?"
        message="This will remove the configuration. Active papers tied to this subject code will lose baseline metadata linkages."
        confirmLabel="Delete"
        confirmVariant="danger"
        confirmIcon={<Trash2 className="w-4 h-4" />}
        detailsNotice={deleteTarget ? `Subject: ${deleteTarget.subject} (${deleteTarget.subjectCode})` : undefined}
        isLoading={isProcessing}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(archiveTarget)}
        title="Archive exam configuration?"
        message="This schedule will be archived and excluded from active matching routines."
        confirmLabel="Archive"
        confirmVariant="secondary"
        confirmIcon={<Archive className="w-4 h-4 text-amber-500" />}
        detailsNotice={archiveTarget ? `Subject: ${archiveTarget.subject} (${archiveTarget.subjectCode})` : undefined}
        isLoading={isProcessing}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(restoreTarget)}
        title="Restore exam configuration?"
        message="This schedule will be restored to active monitoring and matching."
        confirmLabel="Restore"
        confirmVariant="primary"
        confirmIcon={<RotateCcw className="w-4 h-4" />}
        isLoading={isProcessing}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setRestoreTarget(null)}
      />

      {/* View Exam Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setViewTarget(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {viewTarget.subjectCode}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {viewTarget.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {viewTarget.examName} — {viewTarget.subject}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Scheduled for {viewTarget.examDate} ({viewTarget.session} Session)
            </p>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-medium block">Semester</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewTarget.semester}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Maximum Marks</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewTarget.maxMarks}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewTarget.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Chief Examiner</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewTarget.chiefExaminer}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => {
                  const t = viewTarget;
                  setViewTarget(null);
                  openEditModal(t);
                }}
              >
                Edit Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </ResponsiveContainer>
  );
};
