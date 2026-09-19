import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { HistoricalPaperTable } from '../components/knowledge-base/HistoricalPaperTable';
import { SearchInput } from '../components/common/SearchInput';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { mockHistoricalPapers } from '../data/mockHistoricalPapers';
import { Badge } from '../components/common/Badge';

export const HistoricalPapersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');

  const filteredPapers = useMemo(() => {
    return mockHistoricalPapers.filter((p) => {
      const matchesSearch =
        p.paperTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paperRefCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYear =
        selectedYear === 'ALL' || p.year.toString() === selectedYear;

      return matchesSearch && matchesYear;
    });
  }, [searchQuery, selectedYear]);

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Knowledge Base: Historical Question Papers"
        description="Master archive of past term examination papers used for n-gram similarity and structural alignment indexing."
        badge={<Badge variant="info">{filteredPapers.length} Master Papers Archived</Badge>}
      />

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, subject, reference code..."
        />

        <Select
          label="Academic Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Years' },
            { value: '2025', label: 'Year 2025' },
            { value: '2024', label: 'Year 2024' },
          ]}
        />
      </div>

      {filteredPapers.length > 0 ? (
        <HistoricalPaperTable papers={filteredPapers} />
      ) : (
        <EmptyState
          title="No Master Papers Found"
          description="There are no archived historical papers matching your current search criteria."
        />
      )}
    </ResponsiveContainer>
  );
};
