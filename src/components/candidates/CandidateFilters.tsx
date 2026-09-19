import React from 'react';
import { SearchInput } from '../common/SearchInput';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

interface CandidateFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedRisk: string;
  onRiskChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedDocType: string;
  onDocTypeChange: (val: string) => void;
  onReset: () => void;
}

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedRisk,
  onRiskChange,
  selectedStatus,
  onStatusChange,
  selectedDocType,
  onDocTypeChange,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 mb-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 font-sans">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
          <span>Candidate Surveillance Filters</span>
        </div>
        <Button onClick={onReset} variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search subject, code, ID..."
        />

        <Select
          label="Risk Assessment Level"
          value={selectedRisk}
          onChange={(e) => onRiskChange(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Risk Levels' },
            { value: 'HIGH', label: 'High Risk (Score ≥ 70)' },
            { value: 'REVIEW REQUIRED', label: 'Review Required (40-69)' },
            { value: 'LOW', label: 'Low Risk (Score < 40)' },
          ]}
        />

        <Select
          label="Review Status"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Review Statuses' },
            { value: 'UNREVIEWED', label: 'Unreviewed' },
            { value: 'UNDER_REVIEW', label: 'Under Review' },
            { value: 'VERIFIED', label: 'Verified Leak' },
            { value: 'ESCALATED', label: 'Escalated' },
            { value: 'DISMISSED', label: 'Dismissed' },
          ]}
        />

        <Select
          label="Document Input Format"
          value={selectedDocType}
          onChange={(e) => onDocTypeChange(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Document Formats' },
            { value: 'Mobile Photo', label: 'Mobile Photo' },
            { value: 'PDF Document', label: 'PDF Document' },
            { value: 'Scanned Image', label: 'Scanned Image' },
            { value: 'Multi-page Scan', label: 'Multi-page Scan' },
          ]}
        />
      </div>
    </div>
  );
};
