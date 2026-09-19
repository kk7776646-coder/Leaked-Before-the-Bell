export interface HistoricalPaper {
  id: string;
  paperTitle: string;
  subject: string;
  subjectCode: string;
  year: number;
  semester: string;
  maxMarks: number;
  duration: string;
  fileType: string;
  totalQuestions: number;
  paperRefCode: string;
  filename?: string;
  source?: string;
  documentType?: 'PDF' | 'Image' | 'Multi-page' | 'Unknown';
  pageCount?: number;
  extractedText?: string;
  extractedMetadata?: Record<string, unknown>;
  processingStatus?: 'Pending' | 'Processed' | 'Failed';
  confidence?: number;
  embeddingsRef?: string;
}

export interface ExamMetadata {
  id: string;
  subject: string;
  subjectCode: string;
  examDate: string;
  semester: string;
  session: 'Morning' | 'Afternoon' | 'Evening';
  maxMarks: number;
  duration: string;
  examType: 'Regular End-Term' | 'Supplementary' | 'Mid-Term';
  status: 'Scheduled' | 'Printed' | 'In Progress' | 'Concluded';
  chiefExaminer: string;
}
