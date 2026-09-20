export type ReviewRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'REVIEW REQUIRED';
export type ReviewerStatus = 'Needs Verification' | 'In Review' | 'Completed' | 'Assigned';
export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'Mark as Reviewed' | 'Needs More Evidence' | 'Escalate' | 'Dismiss Candidate';

export interface ReviewItem {
  id: string;
  candidateId: string;
  candidateName?: string;
  subject: string;
  subjectCode?: string;
  riskLevel: ReviewRiskLevel;
  reviewerStatus: ReviewerStatus;
  timestamp?: string;
  detectedTime?: string;
  assignedTo?: string;
  assignedReviewer?: string;
  reviewerNotes?: string;
  riskScore?: number;
  evidenceCount?: number;
  priority?: string;
}
