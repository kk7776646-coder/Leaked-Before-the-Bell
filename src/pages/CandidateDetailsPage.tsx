import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { CandidateOverview } from '../components/candidate-details/CandidateOverview';
import { DocumentViewer } from '../components/candidate-details/DocumentViewer';
import { OCRTextPanel } from '../components/candidate-details/OCRTextPanel';
import { ExtractedMetadata } from '../components/candidate-details/ExtractedMetadata';
import { StructuralAnalysis } from '../components/candidate-details/StructuralAnalysis';
import { RiskBreakdown } from '../components/candidate-details/RiskBreakdown';
import { EvidenceTimeline } from '../components/candidate-details/EvidenceTimeline';
import { mockCandidates } from '../data/mockCandidates';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ReviewStatus } from '../types/candidate';

export const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialCandidate = mockCandidates.find((c) => c.id === id) || mockCandidates[0];
  const [candidate, setCandidate] = useState(initialCandidate);

  if (!candidate) {
    return (
      <ResponsiveContainer>
        <ErrorState
          title="Candidate Document Not Found"
          message={`The candidate document ID "${id}" could not be located in the current surveillance repository.`}
          onRetry={() => navigate('/candidates')}
        />
      </ResponsiveContainer>
    );
  }

  const handleStatusChange = (newStatus: ReviewStatus) => {
    setCandidate((prev) => ({ ...prev, reviewStatus: newStatus }));
  };

  return (
    <ResponsiveContainer>
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/candidates')}
        >
          Back to Candidate Index
        </Button>
      </div>

      <PageHeader
        title={`Candidate Intelligence Investigation: ${candidate.id}`}
        description="Detailed multimodal forensic analysis, OCR question extraction, and structural alignment audit."
      />

      {/* Top Candidate Summary */}
      <CandidateOverview candidate={candidate} onStatusChange={handleStatusChange} />

      {/* Main Investigation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Interactive Viewer & Extracted Text */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentViewer candidate={candidate} />
          <OCRTextPanel candidate={candidate} />
          <StructuralAnalysis structure={candidate.structure} />
        </div>

        {/* Right Column: Metadata, Risk Breakdown & Evidence */}
        <div className="lg:col-span-1 space-y-6">
          <RiskBreakdown signals={candidate.riskBreakdown} />
          <ExtractedMetadata metadata={candidate.metadata} />
          <EvidenceTimeline evidence={candidate.evidence} />
        </div>
      </div>
    </ResponsiveContainer>
  );
};
