export interface PageExtractionResult {
  pageNumber: number;
  extractionMethod: 'NATIVE_TEXT' | 'OCR' | 'MIXED';
  text: string;
  ocrConfidence: number; // 0 to 100
  processingStatus: 'COMPLETED' | 'FAILED' | 'UNCERTAIN';
  nativeTextLength: number;
  imageCoverage?: number;
  renderedImagePath?: string;
  uncertainReason?: string;
  dimensions?: { width: number; height: number };
}

export interface DocumentExtractionSummary {
  documentType: 'TEXT_PDF' | 'IMAGE_SCANNED_PDF' | 'MIXED_PDF' | 'IMAGE_DIRECT' | 'UNKNOWN';
  totalPages: number;
  nativeTextPagesCount: number;
  ocrPagesCount: number;
  overallExtractionMethod: 'NATIVE_TEXT' | 'OCR' | 'MIXED' | 'DIRECT_IMAGE';
  overallOcrConfidence: number;
  hasLowConfidencePages: boolean;
  pages: PageExtractionResult[];
  rawTextLength: number;
  extractedAt: string;
}

export interface DetectedContentRecord {
  id: string; // DC-XXXX or DL-XXXX
  name: string; // original filename or title
  filename: string; // stored filename
  contentType: 'Question Image' | 'Multi-page Image' | 'PDF' | 'Screenshot' | 'Document' | 'Social Post' | 'Other';
  mimeType: string;
  size: number;
  sha256: string;
  subject: string;
  subjectCode: string;
  platform: 'Telegram' | 'Instagram' | 'Facebook' | 'WhatsApp' | 'X' | 'Reddit' | 'Upload' | 'Other';
  source: string; // channel name or source identifier
  externalId?: string; // post ID or message ref
  risk: 'HIGH' | 'REVIEW REQUIRED' | 'LOW';
  riskScore: number;
  confidence: number;
  processing: 'Completed' | 'Processing' | 'OCR Indexed' | 'Queued' | 'Failed';
  processingError?: string;
  review: 'Needs Verification' | 'Pending' | 'Reviewed' | 'Dismissed';
  detectedTime: string;
  uploadedAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
  storagePath: string;
  extractedText: string;
  extractionSummary?: DocumentExtractionSummary;
  extractionMethod?: 'NATIVE_TEXT' | 'OCR' | 'MIXED' | 'DIRECT_IMAGE';
  ocrConfidence?: number;
  uncertaintyReason?: string;
  pagesCount?: number;
  hasAssociatedAlert: boolean;
  hasAssociatedReview: boolean;
  alertId?: string;
  reviewId?: string;
  questions: ExtractedQuestion[];
  forensicResults: QuestionForensicResult[];
  metadataComparison?: {
    matchedExamId?: string;
    matchedExamName?: string;
    subjectMatch: boolean;
    codeMatch: boolean;
    subjectCodeMatch?: boolean;
    marksMatch: boolean;
    structureMatch: boolean | string;
    orderMatch: boolean | string;
    orderAlignment?: string;
    questionOverlapScore?: number;
    dateMatch?: boolean;
    summary: string;
  };
  matchedReferencePaper?: {
    id: string;
    title: string;
    subject?: string;
    subjectCode?: string;
    maximumMarks?: number;
    semester?: string;
    structuredData?: any;
    type: 'REAL_PAPER' | 'HISTORICAL_PAPER';
    overlapPercentage: number;
    matchedQuestionsCount: number;
    totalQuestionsCount: number;
    verificationStatus?: string;
  };
  groupFiles?: { filename: string; size: number; sha256: string; storagePath: string }[];
}

// Alias for backward compatibility
export type CandidateRecord = DetectedContentRecord;

export interface ExtractedQuestion {
  id: string;
  questionNumber: string; // "Q1", "2", "UNKNOWN"
  fullQuestionNumber: string;
  section: string;
  questionText: string; // Original verbatim OCR / Native text
  normalizedText?: string; // Noise-corrected comparison text
  marks?: number;
  topic?: string;
  confidence: number;
  pageNumber?: number;
  sourceMethod?: 'NATIVE_TEXT' | 'OCR' | 'BOTH';
}

export interface QuestionForensicResult {
  candidateQuestionId: string; // Question ID from detected content (e.g. Q1)
  referenceType: 'VERIFIED_REAL_PAPER' | 'HISTORICAL_VAULT' | 'NONE';
  referencePaperId?: string;
  referencePaperTitle?: string;
  referenceQuestionId?: string; // Reference Question ID (e.g. Q1)
  textSimilarity: number;
  semanticSimilarity: number;
  typeMatch: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNCERTAIN';
  marksMatch: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNCERTAIN';
  sectionMatch: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNCERTAIN';
  numberMatch: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNCERTAIN';
  positionMatch: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNCERTAIN';
  topicMatch: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNCERTAIN';
  contextSimilarity: number;
  overallSimilarity: number;
  result: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'NO_REFERENCE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: {
    field: string;
    candidateValue: any;
    referenceValue: any;
    result: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'NO_REFERENCE';
    confidence: number;
  }[];
}

export interface HistoricalPaperRecord {
  id: string; // HP-YYYY-XXXX
  title: string;
  paperTitle?: string;
  subject: string;
  subjectCode: string;
  year: number;
  dateIndexed: string;
  totalQuestions: number;
  status: 'Vectorized & Active' | 'Indexed & Active' | 'Pending Vectorization';
  fileFormat: 'PDF' | 'DOCX' | 'SCAN_ZIP' | 'IMAGE';
  filename: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  sha256: string;
  vectorEmbeddingsCount: number;
  ocrSnippet: string;
  extractedText: string;
  createdAt: string;
  questions: ExtractedQuestion[];
}

export interface RealPaperRecord {
  id: string; // RP-YYYY-XXXX
  documentId: string;
  filename: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  sha256: string;
  subject: string;
  subjectCode: string;
  exam: string;
  examType: string;
  year: number;
  semester: string;
  session: 'Morning' | 'Afternoon' | 'Evening';
  examDate: string;
  duration: string;
  maximumMarks: number;
  pageCount: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  extractedText: string;
  structuredData: {
    sections: number;
    questions: {
      id: string;
      paperId: string;
      questionNumber: string;
      fullQuestionNumber: string;
      questionText: string;
      normalizedText: string;
      questionType: string;
      topic: string;
      difficulty: string;
      marks: number;
      required: boolean;
      section: string;
      position: number;
      pageNumber: number;
      extractionConfidence: number;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExamMetadataRecord {
  id: string; // EX-XX
  subjectCode: string;
  subject: string;
  examName: string;
  examDate: string;
  session: 'Morning' | 'Afternoon' | 'Evening';
  semester: string;
  maxMarks: number;
  duration: string;
  examType: string;
  chiefExaminer: string;
  status: 'ACTIVE' | 'ARCHIVED';
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRecord {
  id: string; // AL-XXXX
  candidateId: string; // Detected Content ID
  candidateName: string; // Detected Content Title / Filename
  subject: string;
  subjectCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  similarityScore: number;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  detectedTime: string;
  timestamp: string;
  platform: string;
  matchedReferenceId?: string;
  matchedReferenceTitle?: string;
  evidenceSummary: string;
}

export interface ReviewItemRecord {
  id: string; // REV-XXXX
  candidateId: string; // Detected Content ID
  subject: string;
  subjectCode: string;
  riskScore: number;
  riskLevel: 'HIGH' | 'REVIEW REQUIRED' | 'LOW';
  evidenceCount: number;
  detectedTime: string;
  reviewerStatus: 'Needs Verification' | 'Assigned' | 'In Review' | 'Completed' | 'Dismissed';
  priority: 'High Priority' | 'Standard Priority' | 'Low Priority';
  assignedReviewer?: string;
  reviewedAt?: string;
  decisionNotes?: string;
}

export interface SocialSourceRecord {
  id: string;
  platform: 'Telegram' | 'Instagram' | 'Facebook' | 'WhatsApp' | 'X' | 'Reddit';
  name: string;
  identifier: string;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR' | 'PAUSED';
  enabled: boolean;
  lastSync?: string;
  itemsDetected: number;
}

export interface SystemSettings {
  monitoringActive: boolean;
  riskThreshold: number;
  alertSensitivity: 'HIGH' | 'BALANCED' | 'CONSERVATIVE';
  autoIngestSocial: boolean;
  storageRetentionDays: number;
  chiefExaminerEmail: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: 'DETECTED_CONTENT' | 'CANDIDATE' | 'HISTORICAL_PAPER' | 'REAL_PAPER' | 'EXAM_METADATA' | 'ALERT' | 'REVIEW';
  entityId: string;
  timestamp: string;
  user: string;
  result: 'SUCCESS' | 'FAILED';
  details: string;
}
