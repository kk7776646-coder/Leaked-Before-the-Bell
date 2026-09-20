export type CandidateStatus = 'CLEAN' | 'UNDER_REVIEW' | 'FLAGGED';
export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | 'ESCALATED' | 'UNDER_REVIEW' | 'DISMISSED' | 'UNREVIEWED';

export interface Candidate {
  id: string;
  name: string;
  examCode: string;
  riskScore: number;
  status: CandidateStatus;
  lastScanned: string;
  matchedSourcesCount: number;
}
