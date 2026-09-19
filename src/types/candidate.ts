export type RiskLevel = 'LOW' | 'REVIEW REQUIRED' | 'HIGH';

export type ReviewStatus = 'UNREVIEWED' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED' | 'ESCALATED';

export type DocumentType = 'Scanned Image' | 'PDF Document' | 'Multi-page Scan' | 'Mobile Photo';

export interface RiskBreakdownSignal {
  category: string;
  name: string;
  score: number; // 0-100%
  level: 'Low' | 'Moderate' | 'High';
  description: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: 'OCR Match' | 'Metadata Anomaly' | 'Structural Variance' | 'Historical Similarity';
  timestamp: string;
  detail: string;
  confidence: number;
}

export interface Candidate {
  id: string; // e.g. "LB-1042"
  subject: string;
  subjectCode: string;
  documentType: DocumentType;
  detectedTime: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  reviewStatus: ReviewStatus;
  source: string; // e.g. "Public Staging Mirror", "Encrypted Channel Mon-12"
  ocrText: string;
  metadata: {
    semester: string;
    examDate: string;
    session: string;
    maxMarks: number;
    duration: string;
    pages: number;
  };
  structure: {
    sections: number;
    questionCount: number;
    marksDistribution: string;
    instructionPattern: string;
  };
  riskBreakdown: RiskBreakdownSignal[];
  evidence: EvidenceItem[];
  sampleImage?: string;
  reviewerNotes?: string;
  assignedReviewer?: string;
}
