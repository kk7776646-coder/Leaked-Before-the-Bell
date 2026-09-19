export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type QuestionType =
  | 'MCQ'
  | 'TRUE_FALSE'
  | 'FILL_IN_THE_BLANK'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'NUMERICAL'
  | 'DERIVATION'
  | 'PROOF'
  | 'CODING'
  | 'CASE_STUDY'
  | 'MATCHING'
  | 'OTHER'
  | 'UNKNOWN';

export type MatchResult = 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'NO_REFERENCE' | 'UNCERTAIN';

export interface Question {
  id: string;
  paperId: string;
  questionNumber: string;
  subQuestionNumber?: string;
  fullQuestionNumber: string; // e.g. "Q1(a)"
  questionText: string;
  normalizedText: string;
  questionType: QuestionType;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  options?: string[];
  required: boolean;
  section: string;
  position: number;
  pageNumber: number;
  extractionConfidence: number;
}

export interface RealPaper {
  id: string;
  documentId: string;
  filename: string;
  subject: string;
  subjectCode: string;
  exam: string;
  examType: string;
  year: number;
  semester: string;
  session: string;
  examDate: string;
  duration: string;
  maximumMarks: number;
  pageCount: number;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  extractedText: string;
  structuredData: {
    sections: number;
    questions: Question[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuestionForensicResult {
  candidateQuestionId: string;
  referenceType: 'VERIFIED_REAL_PAPER' | 'HISTORICAL_DATA' | 'NONE';
  referencePaperId?: string;
  referenceQuestionId?: string;
  textSimilarity: number; // 0-1
  semanticSimilarity: number; // 0-1
  typeMatch: MatchResult;
  marksMatch: MatchResult;
  sectionMatch: MatchResult;
  numberMatch: MatchResult;
  positionMatch: MatchResult;
  topicMatch: MatchResult;
  contextSimilarity: number;
  overallSimilarity: number;
  result: MatchResult;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: {
    field: string;
    candidateValue: unknown;
    referenceValue: unknown;
    result: MatchResult;
    confidence: number;
  }[];
}
