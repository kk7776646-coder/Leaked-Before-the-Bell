import { api, CandidateRecord, HistoricalPaperRecord, RealPaperRecord, ExamMetadataRecord } from './api';

export type { HistoricalPaperRecord, ExamMetadataRecord, RealPaperRecord, CandidateRecord };

export interface SocialDetectedContentRecord {
  id: string;
  name: string;
  contentType: 'Question Image' | 'Multi-page Image' | 'PDF' | 'Screenshot' | 'Document' | 'Social Post' | 'Other';
  subject: string;
  subjectCode?: string;
  platform: 'Telegram' | 'Instagram' | 'Facebook' | 'WhatsApp' | 'X' | 'Reddit' | 'Upload' | 'Other';
  source: string;
  risk: 'HIGH' | 'REVIEW REQUIRED' | 'LOW';
  processing: 'Completed' | 'Processing' | 'OCR Indexed' | 'Queued' | 'Failed';
  review: 'Needs Verification' | 'Pending' | 'Reviewed' | 'Dismissed';
  detectedTime: string;
  confidence: number;
  status: 'ACTIVE' | 'ARCHIVED';
  storagePath: string;
  ocrExtractedText: string;
  hasAssociatedAlert: boolean;
  hasAssociatedReview: boolean;
}

export interface VerificationHistoryLog {
  id: string;
  paperId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  verifiedBy: string;
  reason?: string;
}

class DataLifecycleService {
  // --- HISTORICAL PAPERS ---
  async getHistoricalPapers(search?: string): Promise<HistoricalPaperRecord[]> {
    return api.getHistoricalPapers(search);
  }

  async getHistoricalPaperById(id: string): Promise<HistoricalPaperRecord | undefined> {
    try {
      return await api.getHistoricalPaperById(id);
    } catch {
      return undefined;
    }
  }

  async addHistoricalPaper(formData: FormData): Promise<{ id: string; record: HistoricalPaperRecord }> {
    return api.uploadHistoricalPaper(formData);
  }

  async deleteHistoricalPaper(id: string): Promise<{ success: boolean; message: string }> {
    await api.deleteHistoricalPaper(id);
    return { success: true, message: 'Historical paper deleted from repository.' };
  }

  // --- REAL REFERENCE PAPERS ---
  async getRealPapers(params?: { status?: string; search?: string }): Promise<RealPaperRecord[]> {
    return api.getRealPapers(params);
  }

  async getRealPaperById(id: string): Promise<RealPaperRecord | undefined> {
    try {
      return await api.getRealPaperById(id);
    } catch {
      return undefined;
    }
  }

  async addRealPaper(formData: FormData): Promise<{ id: string; record: RealPaperRecord }> {
    return api.uploadRealPaper(formData);
  }

  async verifyRealPaper(id: string, reviewer?: string): Promise<RealPaperRecord> {
    return api.verifyRealPaper(id, reviewer);
  }

  async rejectRealPaper(id: string, reviewer?: string): Promise<RealPaperRecord> {
    return api.rejectRealPaper(id, reviewer);
  }

  async deleteRealPaper(id: string): Promise<{ success: boolean; message: string }> {
    await api.deleteRealPaper(id);
    return { success: true, message: 'Real reference paper deleted.' };
  }

  // --- EXAM METADATA ---
  async getExamMetadata(params?: { status?: string; search?: string }): Promise<ExamMetadataRecord[]> {
    return api.getExamMetadata(params);
  }

  async getExamMetadataById(id: string): Promise<ExamMetadataRecord | undefined> {
    try {
      const all = await api.getExamMetadata();
      return all.find((m) => m.id === id);
    } catch {
      return undefined;
    }
  }

  async addExamMetadata(record: Partial<ExamMetadataRecord>): Promise<ExamMetadataRecord> {
    return api.createExamMetadata(record);
  }

  async updateExamMetadata(id: string, updates: Partial<ExamMetadataRecord>): Promise<ExamMetadataRecord> {
    return api.updateExamMetadata(id, updates);
  }

  async archiveExamMetadata(id: string): Promise<ExamMetadataRecord> {
    return api.archiveExamMetadata(id);
  }

  async restoreExamMetadata(id: string): Promise<ExamMetadataRecord> {
    return api.restoreExamMetadata(id);
  }

  async deleteExamMetadata(id: string): Promise<{ success: boolean; message: string }> {
    await api.deleteExamMetadata(id);
    return { success: true, message: 'Exam metadata deleted.' };
  }

  // --- DETECTED CONTENT / CANDIDATES ---
  async getDetectedContent(params?: { status?: string; risk?: string; type?: string; search?: string }): Promise<SocialDetectedContentRecord[]> {
    const list = await api.getCandidates(params);
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      contentType: c.contentType,
      subject: c.subject,
      subjectCode: c.subjectCode,
      platform: c.platform,
      source: c.source,
      risk: c.risk,
      processing: c.processing,
      review: c.review,
      detectedTime: c.detectedTime,
      confidence: c.confidence,
      status: c.status,
      storagePath: c.storagePath,
      ocrExtractedText: c.extractedText,
      hasAssociatedAlert: c.hasAssociatedAlert,
      hasAssociatedReview: c.hasAssociatedReview,
    }));
  }

  async getDetectedContentById(id: string): Promise<CandidateRecord | undefined> {
    try {
      return await api.getCandidateById(id);
    } catch {
      return undefined;
    }
  }

  async uploadCandidateDocument(formData: FormData): Promise<{ id: string; candidate: CandidateRecord }> {
    return api.uploadCandidateDocument(formData);
  }

  async archiveDetectedContent(id: string): Promise<CandidateRecord> {
    return api.archiveCandidate(id);
  }

  async restoreDetectedContent(id: string): Promise<CandidateRecord> {
    return api.restoreCandidate(id);
  }

  async deleteDetectedContent(id: string): Promise<{ success: boolean; message: string }> {
    await api.deleteCandidate(id);
    return { success: true, message: 'Detected candidate document deleted.' };
  }
}

export const dataLifecycleService = new DataLifecycleService();
