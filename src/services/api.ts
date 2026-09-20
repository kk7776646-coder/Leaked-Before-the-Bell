import {
  DetectedContentRecord,
  CandidateRecord,
  HistoricalPaperRecord,
  RealPaperRecord,
  ExamMetadataRecord,
  AlertRecord,
  ReviewItemRecord,
  SocialSourceRecord,
  SystemSettings,
  AuditLogEntry,
  QuestionForensicResult,
  ExtractedQuestion,
} from '../../server/types';

export type {
  DetectedContentRecord,
  CandidateRecord,
  HistoricalPaperRecord,
  RealPaperRecord,
  ExamMetadataRecord,
  AlertRecord,
  ReviewItemRecord,
  SocialSourceRecord,
  SystemSettings,
  AuditLogEntry,
  QuestionForensicResult,
  ExtractedQuestion,
};

const BASE_URL = '/api';

export const api = {
  // --- DETECTED CONTENT ---
  async getDetectedContents(params?: { status?: string; risk?: string; type?: string; search?: string }): Promise<DetectedContentRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.risk) query.append('risk', params.risk);
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/detected-content?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch detected content items');
    return res.json();
  },

  async getCandidates(params?: { status?: string; risk?: string; type?: string; search?: string }): Promise<DetectedContentRecord[]> {
    return this.getDetectedContents(params);
  },

  async getDetectedContentById(id: string): Promise<DetectedContentRecord> {
    const res = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Detected content item not found');
    return res.json();
  },

  async getCandidateById(id: string): Promise<DetectedContentRecord> {
    return this.getDetectedContentById(id);
  },

  async uploadDetectedContent(formData: FormData): Promise<{ id: string; candidate: DetectedContentRecord; detectedContent?: DetectedContentRecord }> {
    const res = await fetch(`${BASE_URL}/detected-content/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || err.message || 'Content upload and comparison failed');
    }
    return res.json();
  },

  async uploadCandidateDocument(formData: FormData): Promise<{ id: string; candidate: DetectedContentRecord; detectedContent?: DetectedContentRecord }> {
    return this.uploadDetectedContent(formData);
  },

  async reAnalyzeDetectedContent(id: string): Promise<{ success: boolean; candidate: DetectedContentRecord; detectedContent: DetectedContentRecord }> {
    const res = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}/re-analyze`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to re-analyze detected content');
    return res.json();
  },

  async deleteDetectedContent(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete detected content');
  },

  async deleteCandidate(id: string): Promise<void> {
    return this.deleteDetectedContent(id);
  },

  async archiveDetectedContent(id: string): Promise<DetectedContentRecord> {
    const res = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to archive detected content');
    const data = await res.json();
    return data.candidate || data.detectedContent;
  },

  async archiveCandidate(id: string): Promise<DetectedContentRecord> {
    return this.archiveDetectedContent(id);
  },

  async restoreDetectedContent(id: string): Promise<DetectedContentRecord> {
    const res = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to restore detected content');
    const data = await res.json();
    return data.candidate || data.detectedContent;
  },

  async restoreCandidate(id: string): Promise<DetectedContentRecord> {
    return this.restoreDetectedContent(id);
  },

  getDetectedDocumentUrl(id: string): string {
    return `${BASE_URL}/detected-content/${encodeURIComponent(id)}/document`;
  },

  getCandidateDocumentUrl(id: string): string {
    return this.getDetectedDocumentUrl(id);
  },

  getDetectedPageImageUrl(id: string, pageNum: number): string {
    return `${BASE_URL}/detected-content/${encodeURIComponent(id)}/pages/${pageNum}/image`;
  },

  async runTestExtractionPipeline(): Promise<{
    timestamp: string;
    allPassed: boolean;
    tests: Array<{ testId: string; title: string; expected: string; status: string; notes: string }>;
  }> {
    const res = await fetch(`${BASE_URL}/test-extraction-pipeline`);
    if (!res.ok) throw new Error('Failed to run extraction pipeline tests');
    return res.json();
  },

  // --- HISTORICAL PAPERS ---
  async getHistoricalPapers(search?: string): Promise<HistoricalPaperRecord[]> {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    const res = await fetch(`${BASE_URL}/historical?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch historical papers');
    return res.json();
  },

  async getHistoricalPaperById(id: string): Promise<HistoricalPaperRecord> {
    const res = await fetch(`${BASE_URL}/historical/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Historical paper not found');
    return res.json();
  },

  async uploadHistoricalPaper(formData: FormData): Promise<{ id: string; record: HistoricalPaperRecord }> {
    const res = await fetch(`${BASE_URL}/historical/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || err.message || 'Failed to upload historical paper');
    }
    return res.json();
  },

  async deleteHistoricalPaper(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/historical/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete historical paper');
  },

  getHistoricalDocumentUrl(id: string): string {
    return `${BASE_URL}/historical/${encodeURIComponent(id)}/document`;
  },

  // --- REAL PAPERS ---
  async getRealPapers(params?: { status?: string; search?: string }): Promise<RealPaperRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/real-papers?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch real papers');
    return res.json();
  },

  async getRealPaperById(id: string): Promise<RealPaperRecord> {
    const res = await fetch(`${BASE_URL}/real-papers/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Real paper not found');
    return res.json();
  },

  async uploadRealPaper(formData: FormData): Promise<{ id: string; record: RealPaperRecord }> {
    const res = await fetch(`${BASE_URL}/real-papers/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || err.message || 'Failed to upload real paper');
    }
    return res.json();
  },

  async verifyRealPaper(id: string, reviewer?: string): Promise<RealPaperRecord> {
    const res = await fetch(`${BASE_URL}/real-papers/${encodeURIComponent(id)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer }),
    });
    if (!res.ok) throw new Error('Failed to verify real paper');
    const data = await res.json();
    return data.paper;
  },

  async rejectRealPaper(id: string, reviewer?: string): Promise<RealPaperRecord> {
    const res = await fetch(`${BASE_URL}/real-papers/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer }),
    });
    if (!res.ok) throw new Error('Failed to reject real paper');
    const data = await res.json();
    return data.paper;
  },

  async deleteRealPaper(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/real-papers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete real paper');
  },

  getRealPaperDocumentUrl(id: string): string {
    return `${BASE_URL}/real-papers/${encodeURIComponent(id)}/document`;
  },

  // --- EXAM METADATA ---
  async getExamMetadata(params?: { status?: string; search?: string }): Promise<ExamMetadataRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/exam-metadata?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch exam metadata');
    return res.json();
  },

  async createExamMetadata(data: Partial<ExamMetadataRecord>): Promise<ExamMetadataRecord> {
    const res = await fetch(`${BASE_URL}/exam-metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create exam metadata');
    return res.json();
  },

  async updateExamMetadata(id: string, data: Partial<ExamMetadataRecord>): Promise<ExamMetadataRecord> {
    const res = await fetch(`${BASE_URL}/exam-metadata/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update exam metadata');
    return res.json();
  },

  async archiveExamMetadata(id: string): Promise<ExamMetadataRecord> {
    const res = await fetch(`${BASE_URL}/exam-metadata/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to archive metadata');
    const data = await res.json();
    return data.metadata;
  },

  async restoreExamMetadata(id: string): Promise<ExamMetadataRecord> {
    const res = await fetch(`${BASE_URL}/exam-metadata/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to restore metadata');
    const data = await res.json();
    return data.metadata;
  },

  async deleteExamMetadata(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/exam-metadata/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete exam metadata');
  },

  // --- ALERTS ---
  async getAlerts(params?: { status?: string; severity?: string; search?: string }): Promise<AlertRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async updateAlertStatus(id: string, status: AlertRecord['status']): Promise<AlertRecord> {
    const res = await fetch(`${BASE_URL}/alerts/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update alert status');
    return res.json();
  },

  // --- REVIEWS ---
  async getReviewQueue(params?: { status?: string; riskLevel?: string; search?: string }): Promise<ReviewItemRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.riskLevel) query.append('riskLevel', params.riskLevel);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/review-queue?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return res.json();
  },

  async submitReviewDecision(id: string, decision: string, notes?: string, reviewer?: string): Promise<ReviewItemRecord> {
    const res = await fetch(`${BASE_URL}/review-queue/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes, reviewer }),
    });
    if (!res.ok) throw new Error('Failed to submit review decision');
    const data = await res.json();
    return data.reviewItem;
  },

  // --- DASHBOARD STATS ---
  async getDashboardStats(): Promise<{
    scannedToday: number;
    scannedTotal: number;
    activeAlerts: number;
    highRiskAlerts: number;
    pendingReviews: number;
    reviewQueueCount: number;
    historicalPaperCount: number;
    realPaperCount: number;
    recentCandidates: CandidateRecord[];
    recentAlerts: AlertRecord[];
    monitoringSources: SocialSourceRecord[];
    systemStatus: string;
  }> {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
    return res.json();
  },

  // --- SOCIAL SOURCES ---
  async getSocialSources(): Promise<SocialSourceRecord[]> {
    const res = await fetch(`${BASE_URL}/social-sources`);
    if (!res.ok) throw new Error('Failed to fetch social sources');
    return res.json();
  },

  async toggleSocialSource(id: string, enabled?: boolean): Promise<SocialSourceRecord> {
    const res = await fetch(`${BASE_URL}/social-sources/${encodeURIComponent(id)}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle source');
    return res.json();
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
};
