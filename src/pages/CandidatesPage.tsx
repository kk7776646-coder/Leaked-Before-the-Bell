import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { CandidateFilters } from '../components/candidates/CandidateFilters';
import { CandidateTable } from '../components/candidates/CandidateTable';
import { EmptyState } from '../components/common/EmptyState';
import { mockCandidates } from '../data/mockCandidates';
import { Badge } from '../components/common/Badge';

export const CandidatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDocType, setSelectedDocType] = useState('ALL');

  const filteredCandidates = useMemo(() => {
    return mockCandidates.filter((c) => {
      const matchesSearch =
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.source.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk =
        selectedRisk === 'ALL' || c.riskLevel === selectedRisk;

      const matchesStatus =
        selectedStatus === 'ALL' || c.reviewStatus === selectedStatus;

      const matchesDocType =
        selectedDocType === 'ALL' || c.documentType === selectedDocType;

      return matchesSearch && matchesRisk && matchesStatus && matchesDocType;
    });
  }, [searchQuery, selectedRisk, selectedStatus, selectedDocType]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRisk('ALL');
    setSelectedStatus('ALL');
    setSelectedDocType('ALL');
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Candidate Surveillance Index"
        description="Comprehensive repository of intercepted examination paper documents, scored for risk anomalies."
        badge={<Badge variant="warning">{filteredCandidates.length} Candidates Loaded</Badge>}
      />

      <CandidateFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRisk={selectedRisk}
        onRiskChange={setSelectedRisk}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedDocType={selectedDocType}
        onDocTypeChange={setSelectedDocType}
        onReset={handleResetFilters}
      />

      {filteredCandidates.length > 0 ? (
        <CandidateTable candidates={filteredCandidates} />
      ) : (
        <EmptyState
          title="No Candidate Documents Match Your Filters"
          description="Try relaxing your risk level or review status criteria to see more records."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </ResponsiveContainer>
  );
};
