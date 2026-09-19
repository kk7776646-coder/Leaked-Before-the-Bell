import { RiskLevel } from './candidate';

export type ReviewDecision = 'Mark as Reviewed' | 'Needs More Evidence' | 'Dismiss Candidate' | 'Escalate';

export interface ReviewItem {
  id: string; // e.g. "REV-901"
  candidateId: string;
  subject: string;
  subjectCode: string;
  riskScore: number;
  riskLevel: RiskLevel;
  evidenceCount: number;
  detectedTime: string;
  reviewerStatus: 'Needs Verification' | 'Assigned' | 'Completed';
  priority: 'High Priority' | 'Standard Priority';
  reviewerNotes?: string;
  assignedReviewer?: string;
  decision?: ReviewDecision;
}
