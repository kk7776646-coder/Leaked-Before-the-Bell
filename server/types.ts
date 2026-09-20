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

export interface ExtractedMetadataField<T = string> {
  value: T;
  confidence: number; // 0.0 to 1.0
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'DOCUMENT_HEADER' | 'OCR_TEXT' | 'FILENAME' | 'FOLDER_PATH' | 'EXAM_METADATA_MATCH' | 'HISTORICAL_MATCH' | 'USER_CORRECTED' | 'NOT_DETECTED';
  notes?: string;
}

export interface AutoExtractedMetadata {
  subject: ExtractedMetadataField<string>;
  subjectCode: ExtractedMetadataField<string>;
  examDate: ExtractedMetadataField<string>;
  semester: ExtractedMetadataField<string>;
  year: ExtractedMetadataField<number | string>;
  examType: ExtractedMetadataField<string>;
  paperType: ExtractedMetadataField<string>;
  courseOrProgram: ExtractedMetadataField<string>;
  maxMarks: ExtractedMetadataField<number>;
  duration: ExtractedMetadataField<string>;
  sectionCount: ExtractedMetadataField<number>;
  questionCount: ExtractedMetadataField<number>;
  academicSession: ExtractedMetadataField<string>;
  paperNumber: ExtractedMetadataField<string>;
  setVariant: ExtractedMetadataField<string>;
  chiefExaminer?: ExtractedMetadataField<string>;
  matchedExamId?: string;
}

export interface LogicalPaperUnit {
  paperId: string; // e.g. PAPER-01
  title: string;
  subject: string;
  subjectCode: string;
  pageRange: { startPage: number; endPage: number };
  pageCount: number;
  pages: PageExtractionResult[];
  questions: ExtractedQuestion[];
  extractedText: string;
  metadata: AutoExtractedMetadata;
  groupingConfidence: 'HIGH' | 'MEDIUM' | 'UNCERTAIN';
  groupingReason: string;
  sourceFiles: {
    filename: string;
    originalPath: string;
    sha256: string;
    storagePath: string;
    fileSize: number;
    mimeType: string;
  }[];
  overallExtractionMethod: 'NATIVE_TEXT' | 'OCR' | 'MIXED' | 'DIRECT_IMAGE';
  overallOcrConfidence: number;
  uncertaintyReason?: string;
}

export interface IngestionProcessingStatusStep {
  step: 'UPLOADED' | 'INSPECTING' | 'EXTRACTING' | 'DETECTING_DOCUMENTS' | 'EXTRACTING_TEXT' | 'OCR_PROCESSING' | 'GROUPING_PAPERS' | 'EXTRACTING_METADATA' | 'EXTRACTING_QUESTIONS' | 'COMPARING' | 'COMPLETED' | 'REVIEW_REQUIRED' | 'FAILED';
  label: string;
  timestamp: string;
  details?: string;
}

export interface IngestionHierarchyResult {
  uploadId: string; // UP-XXXX
  archiveId?: string; // ARC-XXXX
  originalFilename: string;
  fileType: 'PDF' | 'IMAGE' | 'ZIP' | 'BUNDLE';
  size: number;
  sha256: string;
  status: 'UPLOADED' | 'INSPECTING' | 'EXTRACTING' | 'DETECTING_DOCUMENTS' | 'EXTRACTING_TEXT' | 'OCR_PROCESSING' | 'GROUPING_PAPERS' | 'EXTRACTING_METADATA' | 'EXTRACTING_QUESTIONS' | 'COMPARING' | 'COMPLETED' | 'REVIEW_REQUIRED' | 'FAILED';
  steps: IngestionProcessingStatusStep[];
  papers: LogicalPaperUnit[];
  extractedFilesCount: number;
  detectedDocumentsCount: number;
  totalPagesCount: number;
  isArchive: boolean;
  archivePath?: string;
  errors?: string[];
  warnings?: string[];
}

export interface DetectedContentRecord {
  id: string; // DC-XXXX or DL-XXXX
  uploadId?: string; // UP-XXXX
  archiveId?: string; // ARC-XXXX
  sourceDocumentId?: string; // DOC-XXXX
  paperId?: string; // PAPER-01
  pageRange?: { startPage: number; endPage: number };
  archivePath?: string;
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
  supabaseBucket?: string;
  supabasePath?: string;
  extractedText: string;
  extractedMetadata?: AutoExtractedMetadata;
  metadataSource?: 'AUTO_DETECTED' | 'USER_CORRECTED';
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
  isTestData?: boolean;
  sourceType?: 'USER_UPLOAD' | 'TEST_FIXTURE' | 'SYSTEM';
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
  supabaseBucket?: string;
  supabasePath?: string;
  fileSize: number;
  sha256: string;
  vectorEmbeddingsCount: number;
  ocrSnippet: string;
  extractedText: string;
  createdAt: string;
  questions: ExtractedQuestion[];
  isTestData?: boolean;
  sourceType?: 'USER_UPLOAD' | 'TEST_FIXTURE' | 'SYSTEM';
}

export interface RealPaperRecord {
  id: string; // RP-YYYY-XXXX
  documentId: string;
  filename: string;
  originalFilename: string;
  storagePath: string;
  supabaseBucket?: string;
  supabasePath?: string;
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
  isTestData?: boolean;
  sourceType?: 'USER_UPLOAD' | 'TEST_FIXTURE' | 'SYSTEM';
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
  isTestData?: boolean;
  sourceType?: 'USER_UPLOAD' | 'TEST_FIXTURE' | 'SYSTEM';
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
  isTestData?: boolean;
  sourceType?: 'USER_UPLOAD' | 'TEST_FIXTURE' | 'SYSTEM';
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
  isTestData?: boolean;
  sourceType?: 'USER_UPLOAD' | 'TEST_FIXTURE' | 'SYSTEM';
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
  entityType: 'DETECTED_CONTENT' | 'CANDIDATE' | 'HISTORICAL_PAPER' | 'REAL_PAPER' | 'EXAM_METADATA' | 'ALERT' | 'REVIEW' | 'AI_ASSISTANT' | 'USER_ACCOUNT' | 'USER_SESSION';
  entityId: string;
  timestamp: string;
  user: string;
  result: 'SUCCESS' | 'FAILED';
  details: string;
}

// ==========================================
// AI ASSISTANT TYPES
// ==========================================

export type AiProviderId = 'openai' | 'gemini' | 'anthropic' | 'openrouter' | 'custom' | string;
export type AiApiStyle = 'OPENAI_COMPATIBLE' | 'GEMINI' | 'ANTHROPIC';
export type AiConnectionStatus = 'NOT_CONFIGURED' | 'NOT_TESTED' | 'TESTING' | 'CONNECTED' | 'ERROR' | 'DISABLED';

export interface AiModelPreset {
  id: string;
  name: string;
  displayName: string;
  contextWindow?: number;
  description?: string;
}

export interface AiProviderPreset {
  id: AiProviderId;
  name?: string;
  displayName: string;
  defaultBaseUrl: string;
  documentationUrl: string;
  apiStyle: AiApiStyle;
  requiresApiKey: boolean;
  supportsModelId: boolean;
  supportsCustomBaseUrl: boolean;
  supportsModelDiscovery: boolean;
  defaultModels: AiModelPreset[];
  description: string;
}

export interface AiProviderConfig {
  id: string;
  providerId: AiProviderId;
  modelDisplayName: string;
  modelName: string;
  modelId: string;
  baseUrl: string;
  useCustomBaseUrl: boolean;
  apiKey?: string; // Stored securely on server
  hasApiKey?: boolean; // Returned to client
  maskedApiKey?: string; // e.g. "sk-••••••••••••3a8f"
  status: AiConnectionStatus;
  lastTestedAt?: string;
  lastResponseTimeMs?: number;
  lastError?: string;
  enabled: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiAssistantContext {
  currentRoute?: string;
  selectedDetectedContentId?: string;
  selectedDocumentId?: string;
  selectedAlertId?: string;
  selectedReviewId?: string;
  selectedRealPaperId?: string;
  selectedHistoricalPaperId?: string;
  selectedMetadataId?: string;
  currentFilters?: Record<string, any>;
  currentSearch?: string;
  page?: number;
  pageNumber?: number;
}

export interface AiSuggestedAction {
  id: string;
  label: string;
  actionType: 'NAVIGATE' | 'OPEN_RECORD' | 'FILTER' | 'RETRY_PROCESSING' | 'CONFIRM_DESTRUCTIVE' | 'EXECUTE_ACTION' | 'SHOW_EVIDENCE';
  payload?: any;
  isDestructive?: boolean;
  confirmationPrompt?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  evidenceBullets?: string[];
  suggestedActions?: AiSuggestedAction[];
  structuredContextSummary?: string;
  pendingConfirmationAction?: {
    actionType: string;
    payload: any;
    prompt: string;
    confirmLabel: string;
    cancelLabel: string;
  };
  status?: 'SENT' | 'RECEIVING' | 'ERROR';
  error?: string;
}

export interface AiConnectionTestResult {
  success: boolean;
  provider?: string;
  model?: string;
  responseTimeMs?: number;
  message?: string;
  testedAt?: string;
  status?: string;
  error?: string;
  details?: any;
}

// ==========================================
// UPLOAD LIFECYCLE TYPES
// ==========================================

export type UploadStatus = 'UPLOADING' | 'UPLOADED' | 'UPLOAD_FAILED' | 'DUPLICATE';

export type IngestionProcessingStatus =
  | 'PENDING'
  | 'INSPECTING'
  | 'EXTRACTING'
  | 'OCR_PROCESSING'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'REVIEW_REQUIRED'
  | 'FAILED';

export interface UploadRecord {
  upload_id: string; // e.g. "UP-1001"
  filename: string;
  original_filename: string;
  content_type: string;
  size: number;
  sha256: string;
  storage_path: string;
  supabase_bucket?: string;
  supabase_path?: string;
  uploaded_at: string;
  status: UploadStatus;
  error?: string;
  is_duplicate?: boolean;
  duplicate_of?: string;
  processing_status?: IngestionProcessingStatus;
  processing_error?: string;
  associated_candidate_ids?: string[];
  metadata?: {
    platform?: string;
    source?: string;
    notes?: string;
    detectedType?: string;
    [key: string]: any;
  };
}

export interface UploadResponseItem {
  upload_id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  size: number;
  sha256: string;
  uploaded_at: string;
  status: UploadStatus;
  error?: string;
  is_duplicate?: boolean;
  duplicate_of?: string;
  processing_status?: IngestionProcessingStatus;
}

export interface BatchUploadResponse {
  success: boolean;
  uploads: UploadResponseItem[];
  total: number;
  successful: number;
  failed: number;
}

// ==========================================
// TEST DATA SYSTEM TYPES
// ==========================================

export interface TestDataStatusResponse {
  enabled: boolean;
  testCandidatesCount: number;
  realCandidatesCount: number;
  testHistoricalCount: number;
  realHistoricalCount: number;
  testRealPapersCount: number;
  realRealPapersCount: number;
  testAlertsCount: number;
  realAlertsCount: number;
  testReviewsCount: number;
  realReviewsCount: number;
  totalTestItems: number;
}

export interface ClearTestDataResponse {
  success: boolean;
  message: string;
  clearedCandidates: number;
  clearedHistorical: number;
  clearedRealPapers: number;
  clearedAlerts: number;
  clearedReviews: number;
  deletedFilesCount: number;
}

export interface TestDatasetSummary {
  success: boolean;
  message: string;
  historicalPapers: HistoricalPaperRecord[];
  verifiedPapers: RealPaperRecord[];
  suspiciousCandidates: DetectedContentRecord[];
  normalCandidates: DetectedContentRecord[];
  alertsGenerated: AlertRecord[];
  reviewsGenerated: ReviewItemRecord[];
}

// ==========================================
// AUTHENTICATION & USER MANAGEMENT TYPES
// ==========================================

export type UserRole = 'OPERATOR' | 'SECURITY_OFFICER' | 'ADMIN' | 'REVIEWER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface UserRecord {
  id: string; // e.g. "USR-001"
  email: string;
  fullName: string;
  passwordHash: string; // scrypt$16384$8$1$salt$hash
  role: UserRole;
  organization?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  userAgent?: string;
  ip?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: SafeUser;
  token?: string;
}



