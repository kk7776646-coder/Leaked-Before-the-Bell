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
  IngestionHierarchyResult,
  LogicalPaperUnit,
  AutoExtractedMetadata,
  ExtractedMetadataField,
  AiProviderConfig,
  AiProviderPreset,
  AiConnectionStatus,
  AiConnectionTestResult,
  AiChatMessage,
  AiAssistantContext,
  AiSuggestedAction,
  UploadRecord,
  UploadResponseItem,
  BatchUploadResponse,
  UploadStatus,
  IngestionProcessingStatus,
  TestDataStatusResponse,
  ClearTestDataResponse,
  TestDatasetSummary,
  SafeUser,
  UserRole,
  AuthResponse,
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
  IngestionHierarchyResult,
  LogicalPaperUnit,
  AutoExtractedMetadata,
  ExtractedMetadataField,
  AiProviderConfig,
  AiProviderPreset,
  AiConnectionStatus,
  AiConnectionTestResult,
  AiChatMessage,
  AiAssistantContext,
  AiSuggestedAction,
  UploadRecord,
  UploadResponseItem,
  BatchUploadResponse,
  UploadStatus,
  IngestionProcessingStatus,
  TestDataStatusResponse,
  ClearTestDataResponse,
  TestDatasetSummary,
  SafeUser,
  UserRole,
  AuthResponse,
};

const BASE_URL = '/api';

// Intercept fetch locally within this module to automatically attach Authorization header if token exists in localStorage
const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('leaklens_token') : null;
  const headers = init?.headers
    ? (init.headers instanceof Headers
      ? new Headers(init.headers)
      : { ...(init.headers as Record<string, string>) })
    : {};

  if (token) {
    if (headers instanceof Headers) {
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } else {
      const rawHeaders = headers as Record<string, string>;
      if (!rawHeaders['Authorization']) {
        rawHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  return window.fetch(input, { ...init, headers });
};

// Shadow-bind global fetch to our custom implementation locally in this module
const fetch = customFetch;

export function getStoredAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('leaklens_token');
  }
  return null;
}

export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('leaklens_demo_mode') === 'true';
}

export function setStoredAuthToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('leaklens_token', token);
    } else {
      localStorage.removeItem('leaklens_token');
    }
  }
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // --- INGESTION & AUTO METADATA EXTRACTION ---
  async inspectCandidateDocument(formData: FormData): Promise<{
    success: boolean;
    inspection: IngestionHierarchyResult;
    uploadId: string;
    archiveId?: string;
    papersCount: number;
    totalPagesCount: number;
    papers: LogicalPaperUnit[];
  }> {
    const res = await fetch(`${BASE_URL}/candidates/inspect`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Inspection failed' }));
      throw new Error(err.error || err.message || 'Inspection failed');
    }
    return res.json();
  },

  async confirmIngestion(payload: {
    hierarchyResult: IngestionHierarchyResult;
    platform?: string;
    source?: string;
    userPaperOverrides?: Record<string, any>;
  }): Promise<{
    success: boolean;
    message: string;
    candidates: DetectedContentRecord[];
    candidate: DetectedContentRecord;
    count: number;
  }> {
    const res = await fetch(`${BASE_URL}/candidates/confirm-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Confirmation failed' }));
      throw new Error(err.error || err.message || 'Failed to confirm document ingestion');
    }
    return res.json();
  },

  async runIngestionTestSuite(): Promise<any> {
    const res = await fetch(`${BASE_URL}/ingest/test-suite`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Test suite failed' }));
      throw new Error(err.error || err.message || 'Failed to execute test suite');
    }
    return res.json();
  },

  // --- DETECTED CONTENT ---
  async getDetectedContents(params?: { status?: string; risk?: string; type?: string; search?: string }): Promise<DetectedContentRecord[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.risk) query.append('risk', params.risk);
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);

    try {
      const res = await fetch(`${BASE_URL}/detected-content?${query.toString()}`);
      let list = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data : [];
      } else {
        // Retry once after 350ms in case of container/dev server restart
        await new Promise((r) => setTimeout(r, 350));
        const retryRes = await fetch(`${BASE_URL}/detected-content?${query.toString()}`);
        if (retryRes.ok) {
          const data = await retryRes.json();
          list = Array.isArray(data) ? data : [];
        }
      }

      if (!isDemoModeActive()) {
        list = list.filter((c: any) => c && !c.isTestData && !c.id?.startsWith('DC-TEST') && !c.id?.startsWith('CAND-TEST') && c.sourceType !== 'TEST_FIXTURE');
      }
      return list;
    } catch (err: any) {
      console.warn('[API] getDetectedContents warning:', err?.message || err);
      return [];
    }
  },

  async getCandidates(params?: { status?: string; risk?: string; type?: string; search?: string }): Promise<DetectedContentRecord[]> {
    return this.getDetectedContents(params);
  },

  async getDetectedContentById(id: string): Promise<DetectedContentRecord> {
    try {
      const res = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
      // Retry once
      await new Promise((r) => setTimeout(r, 350));
      const retryRes = await fetch(`${BASE_URL}/detected-content/${encodeURIComponent(id)}`);
      if (retryRes.ok) {
        return await retryRes.json();
      }
      throw new Error(`Detected content item not found (HTTP ${res.status})`);
    } catch (err: any) {
      console.warn(`[API] getDetectedContentById failed for ${id}:`, err?.message || err);
      throw err;
    }
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
    let list = await res.json();
    if (!isDemoModeActive()) {
      list = list.filter((p: any) => p && !p.isTestData && !p.id?.includes('TEST') && !p.id?.includes('TRIAL') && p.sourceType !== 'TEST_FIXTURE');
    }
    return list;
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

  async deleteAllHistoricalPapers(): Promise<{ success: boolean; message: string; count: number }> {
    const res = await fetch(`${BASE_URL}/historical/all`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete all historical papers' }));
      throw new Error(err.error || 'Failed to delete all historical papers');
    }
    return res.json();
  },

  async generateTrialHistoricalPaper(): Promise<{ success: boolean; paper: HistoricalPaperRecord }> {
    const res = await fetch(`${BASE_URL}/historical/generate-trial-paper`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate trial paper' }));
      throw new Error(err.error || 'Failed to generate physical trial examination paper');
    }
    return res.json();
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
    let list = await res.json();
    if (!isDemoModeActive()) {
      list = list.filter((p: any) => p && !p.isTestData && !p.id?.includes('TEST') && p.sourceType !== 'TEST_FIXTURE');
    }
    return list;
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

  async deleteAllRealPapers(): Promise<{ success: boolean; message: string; count: number }> {
    const res = await fetch(`${BASE_URL}/real-papers/all`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete all real papers' }));
      throw new Error(err.error || 'Failed to delete all verified real papers');
    }
    return res.json();
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

    try {
      const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
      let list = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data : [];
      } else {
        await new Promise((r) => setTimeout(r, 350));
        const retryRes = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
        if (retryRes.ok) {
          const data = await retryRes.json();
          list = Array.isArray(data) ? data : [];
        }
      }

      if (!isDemoModeActive()) {
        list = list.filter((a: any) => a && !a.isTestData && !a.id?.includes('TEST') && a.sourceType !== 'TEST_FIXTURE');
      }
      return list;
    } catch (err: any) {
      console.warn('[API] getAlerts warning:', err?.message || err);
      return [];
    }
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
    let list = await res.json();
    if (!isDemoModeActive()) {
      list = list.filter((r: any) => r && !r.isTestData && !r.id?.includes('TEST') && r.sourceType !== 'TEST_FIXTURE');
    }
    return list;
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
    try {
      const res = await fetch(`${BASE_URL}/dashboard/stats`);
      let stats = null;
      if (res.ok) {
        stats = await res.json();
      } else {
        // If temporary warm-up or 5xx, retry once after a short delay
        await new Promise((r) => setTimeout(r, 300));
        const retryRes = await fetch(`${BASE_URL}/dashboard/stats`);
        if (retryRes.ok) {
          stats = await retryRes.json();
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      }

      if (stats && !isDemoModeActive()) {
        // Exclude test data items from recent candidate feeds
        const filterCandidate = (c: any) => c && !c.isTestData && !c.id?.startsWith('DC-TEST') && !c.id?.startsWith('CAND-TEST') && c.sourceType !== 'TEST_FIXTURE';
        const filterAlert = (a: any) => a && !a.isTestData && !a.id?.includes('TEST') && a.sourceType !== 'TEST_FIXTURE';

        const filteredCandidates = stats.recentCandidates?.filter(filterCandidate) || [];
        const filteredAlerts = stats.recentAlerts?.filter(filterAlert) || [];

        // Adjust statistics counters dynamically
        try {
          const statusRes = await fetch(`${BASE_URL}/test-data/status`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            return {
              ...stats,
              scannedToday: statusData.realCandidatesCount,
              scannedTotal: statusData.realCandidatesCount,
              activeAlerts: statusData.realAlertsCount,
              highRiskAlerts: filteredAlerts.filter((a: any) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length,
              pendingReviews: statusData.realReviewsCount,
              reviewQueueCount: statusData.realReviewsCount,
              historicalPaperCount: statusData.realHistoricalCount,
              realPaperCount: statusData.realRealPapersCount,
              recentCandidates: filteredCandidates.slice(0, 5),
              recentAlerts: filteredAlerts.slice(0, 4),
            };
          }
        } catch (err) {
          console.warn('[API] Failed to fetch test-data status for adjusting stats, fallback to manual filtered metrics:', err);
        }

        // Safe client-side fallback if status API fails
        return {
          ...stats,
          recentCandidates: filteredCandidates.slice(0, 5),
          recentAlerts: filteredAlerts.slice(0, 4),
        };
      }

      return stats;
    } catch (err: any) {
      console.warn('[API] Failed to fetch dashboard statistics, using safe local fallback:', err?.message || err);
      return {
        scannedToday: 0,
        scannedTotal: 0,
        activeAlerts: 0,
        highRiskAlerts: 0,
        pendingReviews: 0,
        reviewQueueCount: 0,
        historicalPaperCount: 0,
        realPaperCount: 0,
        recentCandidates: [],
        recentAlerts: [],
        monitoringSources: [],
        systemStatus: 'OPERATIONAL',
      };
    }
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

  // --- AI ASSISTANT CONFIGURATION & CHAT ---
  async getAiPresets(): Promise<AiProviderPreset[]> {
    try {
      const res = await fetch(`${BASE_URL}/ai-assistant/presets`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
      await new Promise((r) => setTimeout(r, 350));
      const retryRes = await fetch(`${BASE_URL}/ai-assistant/presets`);
      if (retryRes.ok) {
        const data = await retryRes.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (err: any) {
      console.warn('[API] getAiPresets warning:', err?.message || err);
      return [];
    }
  },

  async getAiProviders(): Promise<AiProviderConfig[]> {
    try {
      const res = await fetch(`${BASE_URL}/ai-assistant/providers`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
      await new Promise((r) => setTimeout(r, 350));
      const retryRes = await fetch(`${BASE_URL}/ai-assistant/providers`);
      if (retryRes.ok) {
        const data = await retryRes.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (err: any) {
      console.warn('[API] getAiProviders warning:', err?.message || err);
      return [];
    }
  },

  async saveAiProvider(payload: {
    id?: string;
    providerId: string;
    modelDisplayName: string;
    modelName: string;
    modelId: string;
    baseUrl: string;
    useCustomBaseUrl: boolean;
    apiKey?: string;
    enabled?: boolean;
    isDefault?: boolean;
    status?: AiConnectionStatus;
  }): Promise<{ success: boolean; provider: AiProviderConfig }> {
    const res = await fetch(`${BASE_URL}/ai-assistant/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save provider' }));
      throw new Error(err.error || err.message || 'Failed to save provider');
    }
    return res.json();
  },

  async setDefaultAiProvider(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/ai-assistant/providers/${encodeURIComponent(id)}/default`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to set default provider');
    return res.json();
  },

  async toggleAiProvider(id: string, enabled: boolean): Promise<{ success: boolean; provider: AiProviderConfig }> {
    const res = await fetch(`${BASE_URL}/ai-assistant/providers/${encodeURIComponent(id)}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle provider status');
    return res.json();
  },

  async deleteAiProvider(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/ai-assistant/providers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete provider');
    return res.json();
  },

  async testAiConnection(payload: {
    providerId: string;
    modelId: string;
    baseUrl: string;
    apiKey?: string;
    useCustomBaseUrl?: boolean;
    savedProviderId?: string;
  }): Promise<AiConnectionTestResult> {
    const res = await fetch(`${BASE_URL}/ai-assistant/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Connection test failed' }));
      throw new Error(err.error || err.message || 'Connection test failed');
    }
    return res.json();
  },

  async discoverAiModels(payload: {
    providerId: string;
    baseUrl: string;
    apiKey?: string;
    useCustomBaseUrl?: boolean;
    savedProviderId?: string;
  }): Promise<{ success: boolean; models: Array<{ id: string; name: string; description?: string }> }> {
    const res = await fetch(`${BASE_URL}/ai-assistant/discover-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Model discovery failed' }));
      throw new Error(err.error || err.message || 'Failed to discover models');
    }
    return res.json();
  },

  async sendAiChatMessage(payload: {
    message?: string;
    history?: AiChatMessage[];
    context?: AiAssistantContext;
    confirmedAction?: {
      actionType: string;
      payload: any;
    };
  }): Promise<{
    message: AiChatMessage;
    provider: { id: string; providerId: string; modelDisplayName: string; modelId: string } | null;
  }> {
    const res = await fetch(`${BASE_URL}/ai-assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'AI Assistant query failed' }));
      throw new Error(err.error || err.message || 'Failed to query AI Assistant');
    }
    return res.json();
  },

  async runAiAssistantTestSuite(): Promise<any> {
    const res = await fetch(`${BASE_URL}/ai-assistant/test-suite`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'AI Assistant test suite failed' }));
      throw new Error(err.error || err.message || 'Failed to execute AI assistant test suite');
    }
    return res.json();
  },

  // ==========================================
  // RELIABLE UPLOAD API
  // ==========================================

  uploadFiles(
    files: File[],
    metadata?: { platform?: string; source?: string; notes?: string; relativePaths?: string[] },
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<BatchUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file, file.name);
      });

      if (metadata) {
        if (metadata.platform) formData.append('platform', metadata.platform);
        if (metadata.source) formData.append('source', metadata.source);
        if (metadata.notes) formData.append('notes', metadata.notes);
        if (metadata.relativePaths) formData.append('relative_paths', JSON.stringify(metadata.relativePaths));
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/uploads`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent, event.loaded, event.total);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: BatchUploadResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (err) {
            reject(new Error('Invalid JSON response from upload endpoint.'));
          }
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(errResponse.error || `Upload failed with HTTP status ${xhr.status}`));
          } catch (e) {
            reject(new Error(`Upload failed with HTTP status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading file(s).'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload request timed out.'));
      };

      xhr.send(formData);
    });
  },

  async getUploads(): Promise<UploadRecord[]> {
    const res = await fetch(`${BASE_URL}/uploads`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch uploads' }));
      throw new Error(err.error || err.message || 'Failed to fetch uploads');
    }
    return res.json();
  },

  async getUploadById(id: string): Promise<UploadRecord> {
    const res = await fetch(`${BASE_URL}/uploads/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload not found' }));
      throw new Error(err.error || err.message || 'Upload not found');
    }
    return res.json();
  },

  getUploadFileUrl(id: string): string {
    return `${BASE_URL}/uploads/${id}/file`;
  },

  async deleteUpload(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/uploads/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete upload' }));
      throw new Error(err.error || err.message || 'Failed to delete upload');
    }
    return res.json();
  },

  async runUploadTestSuite(): Promise<any> {
    const res = await fetch(`${BASE_URL}/uploads/test-suite`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to run upload test suite' }));
      throw new Error(err.error || err.message || 'Failed to run upload test suite');
    }
    return res.json();
  },

  // ==========================================
  // TEST DATA SYSTEM
  // ==========================================

  async getTestDataStatus(): Promise<TestDataStatusResponse> {
    const res = await fetch(`${BASE_URL}/test-data/status`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch test data status' }));
      throw new Error(err.error || err.message || 'Failed to fetch test data status');
    }
    return res.json();
  },

  async addTrialPaper(options?: {
    subject?: string;
    subjectCode?: string;
    year?: number;
  }): Promise<{ success: boolean; message: string; id: string; paper: HistoricalPaperRecord }> {
    const res = await fetch(`${BASE_URL}/test-data/trial-paper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add trial paper' }));
      throw new Error(err.error || err.message || 'Failed to add trial paper');
    }
    return res.json();
  },

  async addFakeSuspiciousPaper(options?: {
    subject?: string;
    subjectCode?: string;
    platform?: string;
    source?: string;
  }): Promise<{
    success: boolean;
    message: string;
    id: string;
    candidate: CandidateRecord;
    alert?: AlertRecord;
    review?: ReviewItemRecord;
  }> {
    const res = await fetch(`${BASE_URL}/test-data/fake-suspicious`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add suspicious test paper' }));
      throw new Error(err.error || err.message || 'Failed to add suspicious test paper');
    }
    return res.json();
  },

  async addFakeNormalPaper(options?: {
    subject?: string;
    subjectCode?: string;
    platform?: string;
    source?: string;
  }): Promise<{
    success: boolean;
    message: string;
    id: string;
    candidate: CandidateRecord;
  }> {
    const res = await fetch(`${BASE_URL}/test-data/fake-normal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add normal test paper' }));
      throw new Error(err.error || err.message || 'Failed to add normal test paper');
    }
    return res.json();
  },

  async generateTestDataset(): Promise<TestDatasetSummary> {
    const res = await fetch(`${BASE_URL}/test-data/dataset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate test dataset' }));
      throw new Error(err.error || err.message || 'Failed to generate test dataset');
    }
    return res.json();
  },

  async clearTestData(): Promise<ClearTestDataResponse> {
    const res = await fetch(`${BASE_URL}/test-data`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to clear test data' }));
      throw new Error(err.error || err.message || 'Failed to clear test data');
    }
    return res.json();
  },

  // ==========================================
  // AUTHENTICATION API METHODS
  // ==========================================

  async login(payload: { email: string; password: string; rememberMe?: boolean }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid email or password.');
    }
    if (data.token) {
      setStoredAuthToken(data.token);
    }
    return data;
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    organization?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create account.');
    }
    if (data.token) {
      setStoredAuthToken(data.token);
    }
    return data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      setStoredAuthToken(null);
      return await res.json();
    } catch {
      setStoredAuthToken(null);
      return { success: true, message: 'Logged out.' };
    }
  },

  async getSession(): Promise<{ authenticated: boolean; user: SafeUser | null }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/session`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        return { authenticated: false, user: null };
      }
      return await res.json();
    } catch {
      return { authenticated: false, user: null };
    }
  },

  async forgotPassword(payload: { email: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to process request.');
    }
    return data;
  },

  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl: string; user: SafeUser }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${BASE_URL}/auth/profile/avatar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload profile photo.');
    }
    return data;
  },

  // ==========================================
  // USER MANAGEMENT API METHODS (ADMIN ONLY)
  // ==========================================

  async getUsers(): Promise<SafeUser[]> {
    const res = await fetch(`${BASE_URL}/auth/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch users' }));
      throw new Error(err.message || 'Failed to fetch users');
    }
    const data = await res.json();
    return data.users || [];
  },

  async createUser(payload: {
    fullName: string;
    email: string;
    password?: string;
    organization?: string;
    role: UserRole;
  }): Promise<{ success: boolean; user: SafeUser }> {
    const res = await fetch(`${BASE_URL}/auth/users`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create user.');
    }
    return data;
  },

  async updateUser(
    id: string,
    payload: {
      fullName?: string;
      email?: string;
      password?: string;
      organization?: string;
      role?: UserRole;
      status?: 'ACTIVE' | 'DISABLED';
    }
  ): Promise<{ success: boolean; user: SafeUser }> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update user.');
    }
    return data;
  },

  async revokeUserSessions(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/users/${id}/revoke-sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to revoke user sessions.');
    }
    return data;
  },
};

