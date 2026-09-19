import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { ExamMetadataTable } from '../components/knowledge-base/ExamMetadataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { mockExamMetadata } from '../data/mockExamMetadata';
import { Badge } from '../components/common/Badge';

export const CurrentExamMetadataPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredExams = useMemo(() => {
    return mockExamMetadata.filter((e) => {
      const matchesSearch =
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.chiefExaminer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' || e.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus]);

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Knowledge Base: Scheduled Examination Schedule"
        description="Official academic schedule, chief examiner directory, and session timing metadata."
        badge={<Badge variant="neutral">{filteredExams.length} Exams Scheduled</Badge>}
      />

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search subject, examiner, exam ID..."
        />

        <Select
          label="Printing & Session Status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'Printed', label: 'Printed' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Concluded', label: 'Concluded' },
          ]}
        />
      </div>

      {filteredExams.length > 0 ? (
        <ExamMetadataTable exams={filteredExams} />
      ) : (
        <EmptyState
          title="No Scheduled Exams Found"
          description="There are no examination schedules matching your current query parameters."
        />
      )}
    </ResponsiveContainer>
  );
};
