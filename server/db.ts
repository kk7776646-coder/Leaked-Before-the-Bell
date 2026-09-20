import fs from 'fs';
import path from 'path';
import {
  CandidateRecord,
  HistoricalPaperRecord,
  RealPaperRecord,
  ExamMetadataRecord,
  AlertRecord,
  ReviewItemRecord,
  SocialSourceRecord,
  SystemSettings,
  AuditLogEntry,
  AiProviderConfig,
  AiConnectionStatus,
  UploadRecord,
  UserRecord,
  SessionRecord,
} from './types';
import { STORAGE_ROOT } from './storage';
import {
  backupDatabaseToSupabase,
  restoreDatabaseFromSupabase,
  isSupabaseConfigured,
} from './supabase';

export interface DatabaseSchema {
  candidates: CandidateRecord[];
  historicalPapers: HistoricalPaperRecord[];
  realPapers: RealPaperRecord[];
  examMetadata: ExamMetadataRecord[];
  alerts: AlertRecord[];
  reviews: ReviewItemRecord[];
  socialSources: SocialSourceRecord[];
  settings: SystemSettings;
  auditLogs: AuditLogEntry[];
  aiProviders: AiProviderConfig[];
  uploads: UploadRecord[];
  users: UserRecord[];
  sessions: SessionRecord[];
}

const DB_FILE = path.join(STORAGE_ROOT, 'db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  monitoringActive: true,
  riskThreshold: 75,
  alertSensitivity: 'HIGH',
  autoIngestSocial: false,
  storageRetentionDays: 90,
  chiefExaminerEmail: 'examiner.security@edu-auth.gov',
};

const DEFAULT_SOCIAL_SOURCES: SocialSourceRecord[] = [
  {
    id: 'src-telegram',
    platform: 'Telegram',
    name: 'Telegram Exam Prep Channels',
    identifier: '@tg_exam_monitor',
    status: 'NOT_CONFIGURED',
    enabled: false,
    itemsDetected: 0,
  },
  {
    id: 'src-whatsapp',
    platform: 'WhatsApp',
    name: 'WhatsApp Study Broadcasts',
    identifier: '+1-800-EXAM-PREP',
    status: 'NOT_CONFIGURED',
    enabled: false,
    itemsDetected: 0,
  },
  {
    id: 'src-instagram',
    platform: 'Instagram',
    name: 'Instagram Study Reels & Stories',
    identifier: '@study_papers_official',
    status: 'NOT_CONFIGURED',
    enabled: false,
    itemsDetected: 0,
  },
  {
    id: 'src-reddit',
    platform: 'Reddit',
    name: 'r/examprep_security & r/students',
    identifier: 'r/examprep_security',
    status: 'NOT_CONFIGURED',
    enabled: false,
    itemsDetected: 0,
  },
  {
    id: 'src-facebook',
    platform: 'Facebook',
    name: 'Academic Groups & Discussion Pages',
    identifier: 'fb.com/groups/examprep',
    status: 'NOT_CONFIGURED',
    enabled: false,
    itemsDetected: 0,
  },
  {
    id: 'src-x',
    platform: 'X',
    name: 'X (Twitter) Leaks & Discussion Watch',
    identifier: '#examleak, #questionpaper',
    status: 'NOT_CONFIGURED',
    enabled: false,
    itemsDetected: 0,
  },
];

class Database {
  private data: DatabaseSchema = {
    candidates: [],
    historicalPapers: [],
    realPapers: [],
    examMetadata: [],
    alerts: [],
    reviews: [],
    socialSources: [...DEFAULT_SOCIAL_SOURCES],
    settings: { ...DEFAULT_SETTINGS },
    auditLogs: [],
    aiProviders: [],
    uploads: [],
    users: [],
    sessions: [],
  };

  private syncTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.load();
    this.initSupabaseSync();
  }

  private async initSupabaseSync(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const cloudData = await restoreDatabaseFromSupabase();
      if (cloudData && typeof cloudData === 'object') {
        let hasNewer = false;
        // Merge cloud records if local is empty or older
        if (Array.isArray(cloudData.candidates) && cloudData.candidates.length >= this.data.candidates.length) {
          this.data.candidates = cloudData.candidates;
          hasNewer = true;
        }
        if (Array.isArray(cloudData.historicalPapers) && cloudData.historicalPapers.length >= this.data.historicalPapers.length) {
          this.data.historicalPapers = cloudData.historicalPapers;
          hasNewer = true;
        }
        if (Array.isArray(cloudData.realPapers) && cloudData.realPapers.length >= this.data.realPapers.length) {
          this.data.realPapers = cloudData.realPapers;
          hasNewer = true;
        }
        if (Array.isArray(cloudData.examMetadata) && cloudData.examMetadata.length >= this.data.examMetadata.length) {
          this.data.examMetadata = cloudData.examMetadata;
          hasNewer = true;
        }
        if (Array.isArray(cloudData.users) && cloudData.users.length > 0) {
          this.data.users = cloudData.users;
          hasNewer = true;
        }
        if (cloudData.settings) {
          this.data.settings = { ...this.data.settings, ...cloudData.settings };
        }
        if (hasNewer) {
          this.saveLocalOnly();
          console.log('[Database] Restored and synced state from Supabase Cloud Storage.');
        }
      } else {
        // Initial cloud upload
        this.queueSupabaseSync();
      }
    } catch (err: any) {
      console.warn('[Database] Cloud sync init warning:', err.message);
    }
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          candidates: parsed.candidates || [],
          historicalPapers: parsed.historicalPapers || [],
          realPapers: parsed.realPapers || [],
          examMetadata: parsed.examMetadata || [],
          alerts: parsed.alerts || [],
          reviews: parsed.reviews || [],
          socialSources: parsed.socialSources || [...DEFAULT_SOCIAL_SOURCES],
          settings: parsed.settings || { ...DEFAULT_SETTINGS },
          auditLogs: parsed.auditLogs || [],
          aiProviders: parsed.aiProviders || [],
          uploads: parsed.uploads || [],
          users: parsed.users || [],
          sessions: parsed.sessions || [],
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to load database file, initializing clean database:', err);
      this.save();
    }
  }

  public saveLocalOnly(): void {
    try {
      if (!fs.existsSync(STORAGE_ROOT)) {
        fs.mkdirSync(STORAGE_ROOT, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database file atomically:', err);
    }
  }

  public queueSupabaseSync(): void {
    if (!isSupabaseConfigured()) return;
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      backupDatabaseToSupabase(this.data).catch((err) => {
        console.warn('[Database] Async Supabase cloud backup failed:', err);
      });
      this.syncTimeout = null;
    }, 1000);
  }

  public save(): void {
    this.saveLocalOnly();
    this.queueSupabaseSync();
  }

  // --- AUDIT LOGS ---
  public logAudit(
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    result: 'SUCCESS' | 'FAILED',
    details: string
  ): void {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      user: 'Chief Examiner (Admin)',
      result,
      details,
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.data.auditLogs];
  }

  // --- CANDIDATES / DETECTED CONTENT ---
  public getCandidates(filters?: {
    status?: 'ALL' | 'ACTIVE' | 'ARCHIVED';
    risk?: string;
    type?: string;
    search?: string;
  }): CandidateRecord[] {
    try {
      let list = Array.isArray(this.data.candidates) ? [...this.data.candidates] : [];

      if (filters?.status && filters.status !== 'ALL') {
        list = list.filter((c) => c && c.status === filters.status);
      } else if (!filters?.status) {
        list = list.filter((c) => c && c.status === 'ACTIVE');
      }

      if (filters?.risk && filters.risk !== 'ALL') {
        list = list.filter((c) => c && c.risk === filters.risk);
      }

      if (filters?.type && filters.type !== 'ALL') {
        list = list.filter((c) => c && c.contentType === filters.type);
      }

      if (filters?.search) {
        const q = String(filters.search).toLowerCase().trim();
        if (q) {
          list = list.filter(
            (c) =>
              c &&
              ((c.id && String(c.id).toLowerCase().includes(q)) ||
                (c.name && String(c.name).toLowerCase().includes(q)) ||
                (c.subject && String(c.subject).toLowerCase().includes(q)) ||
                (c.subjectCode && String(c.subjectCode).toLowerCase().includes(q)) ||
                (c.source && String(c.source).toLowerCase().includes(q)) ||
                (c.platform && String(c.platform).toLowerCase().includes(q)))
          );
        }
      }

      return list;
    } catch (err) {
      console.error('[Database] Error in getCandidates:', err);
      return [];
    }
  }

  public getDetectedContents(filters?: {
    status?: 'ALL' | 'ACTIVE' | 'ARCHIVED';
    risk?: string;
    type?: string;
    search?: string;
  }): CandidateRecord[] {
    return this.getCandidates(filters);
  }

  public getCandidateById(id: string): CandidateRecord | undefined {
    return this.data.candidates.find((c) => c.id === id);
  }

  public getDetectedContentById(id: string): CandidateRecord | undefined {
    return this.getCandidateById(id);
  }

  public findCandidateBySha256(sha256: string): CandidateRecord | undefined {
    return this.data.candidates.find((c) => c.sha256 === sha256);
  }

  public findDetectedContentBySha256(sha256: string): CandidateRecord | undefined {
    return this.findCandidateBySha256(sha256);
  }

  public addCandidate(candidate: CandidateRecord): void {
    this.data.candidates.unshift(candidate);
    this.logAudit('CONTENT_DETECTED', 'DETECTED_CONTENT', candidate.id, 'SUCCESS', `Discovered and indexed source content ${candidate.name} (${candidate.id})`);
    this.save();
  }

  public addDetectedContent(candidate: CandidateRecord): void {
    this.addCandidate(candidate);
  }

  public updateCandidate(id: string, updates: Partial<CandidateRecord>): CandidateRecord | null {
    const candidate = this.data.candidates.find((c) => c.id === id);
    if (!candidate) return null;
    Object.assign(candidate, updates);
    this.save();
    return candidate;
  }

  public updateDetectedContent(id: string, updates: Partial<CandidateRecord>): CandidateRecord | null {
    return this.updateCandidate(id, updates);
  }

  public deleteCandidate(id: string): boolean {
    const index = this.data.candidates.findIndex((c) => c.id === id);
    if (index === -1) return false;
    const item = this.data.candidates[index];
    this.data.candidates.splice(index, 1);
    this.data.alerts = this.data.alerts.filter((a) => a.candidateId !== id);
    this.data.reviews = this.data.reviews.filter((r) => r.candidateId !== id);
    this.logAudit('DETECTED_CONTENT_DELETED', 'DETECTED_CONTENT', id, 'SUCCESS', `Deleted detected content ${item.name} (${id})`);
    this.save();
    return true;
  }

  public deleteDetectedContent(id: string): boolean {
    return this.deleteCandidate(id);
  }

  // --- HISTORICAL PAPERS ---
  public getHistoricalPapers(search?: string): HistoricalPaperRecord[] {
    let list = [...this.data.historicalPapers];
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.subjectCode.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.filename.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getHistoricalPaperById(id: string): HistoricalPaperRecord | undefined {
    return this.data.historicalPapers.find((p) => p.id === id);
  }

  public findHistoricalBySha256(sha256: string): HistoricalPaperRecord | undefined {
    return this.data.historicalPapers.find((p) => p.sha256 === sha256);
  }

  public addHistoricalPaper(paper: HistoricalPaperRecord): void {
    this.data.historicalPapers.unshift(paper);
    this.logAudit('HISTORICAL_PAPER_ADDED', 'HISTORICAL_PAPER', paper.id, 'SUCCESS', `Added historical paper ${paper.title} (${paper.id})`);
    this.save();
  }

  public deleteHistoricalPaper(id: string): boolean {
    const index = this.data.historicalPapers.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const paper = this.data.historicalPapers[index];
    this.data.historicalPapers.splice(index, 1);
    this.logAudit('HISTORICAL_PAPER_DELETED', 'HISTORICAL_PAPER', id, 'SUCCESS', `Deleted historical paper ${paper.title} (${id})`);
    this.save();
    return true;
  }

  public deleteAllHistoricalPapers(): { count: number; deletedPaths: string[] } {
    const count = this.data.historicalPapers.length;
    const deletedPaths: string[] = [];

    for (const paper of this.data.historicalPapers) {
      if (paper.storagePath && fs.existsSync(paper.storagePath)) {
        try {
          fs.unlinkSync(paper.storagePath);
          deletedPaths.push(paper.storagePath);
        } catch (e) {
          console.warn(`Failed to unlink storage path for historical paper ${paper.id}:`, e);
        }
      }
    }

    this.data.historicalPapers = [];
    this.logAudit('ALL_HISTORICAL_PAPERS_DELETED', 'HISTORICAL_PAPER', 'ALL', 'SUCCESS', `Permanently deleted all ${count} historical papers and associated storage/vector files.`);
    this.save();
    return { count, deletedPaths };
  }

  // --- REAL PAPERS ---
  public getRealPapers(filters?: { status?: string; search?: string }): RealPaperRecord[] {
    let list = [...this.data.realPapers];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.verificationStatus === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.subject.toLowerCase().includes(q) ||
          p.subjectCode.toLowerCase().includes(q) ||
          p.filename.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getRealPaperById(id: string): RealPaperRecord | undefined {
    return this.data.realPapers.find((p) => p.id === id);
  }

  public findRealPaperBySha256(sha256: string): RealPaperRecord | undefined {
    return this.data.realPapers.find((p) => p.sha256 === sha256);
  }

  public addRealPaper(paper: RealPaperRecord): void {
    this.data.realPapers.unshift(paper);
    this.logAudit('REAL_PAPER_UPLOADED', 'REAL_PAPER', paper.id, 'SUCCESS', `Uploaded real paper ${paper.filename} (${paper.id})`);
    this.save();
  }

  public updateRealPaper(id: string, updates: Partial<RealPaperRecord>): RealPaperRecord | null {
    const paper = this.data.realPapers.find((p) => p.id === id);
    if (!paper) return null;
    Object.assign(paper, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return paper;
  }

  public deleteRealPaper(id: string): boolean {
    const index = this.data.realPapers.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const paper = this.data.realPapers[index];
    this.data.realPapers.splice(index, 1);
    this.logAudit('REAL_PAPER_DELETED', 'REAL_PAPER', id, 'SUCCESS', `Deleted real paper reference ${paper.filename} (${id})`);
    this.save();
    return true;
  }

  public deleteAllRealPapers(): { count: number; deletedPaths: string[] } {
    const count = this.data.realPapers.length;
    const deletedPaths: string[] = [];

    for (const paper of this.data.realPapers) {
      if (paper.storagePath && fs.existsSync(paper.storagePath)) {
        try {
          fs.unlinkSync(paper.storagePath);
          deletedPaths.push(paper.storagePath);
        } catch (e) {
          console.warn(`Failed to unlink storage path for real paper ${paper.id}:`, e);
        }
      }
    }

    this.data.realPapers = [];
    this.logAudit('ALL_REAL_PAPERS_DELETED', 'REAL_PAPER', 'ALL', 'SUCCESS', `Permanently deleted all ${count} verified baseline papers and associated files.`);
    this.save();
    return { count, deletedPaths };
  }

  // --- EXAM METADATA ---
  public getExamMetadata(filters?: { status?: 'ALL' | 'ACTIVE' | 'ARCHIVED'; search?: string }): ExamMetadataRecord[] {
    let list = [...this.data.examMetadata];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((m) => m.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.subjectCode.toLowerCase().includes(q) ||
          m.examName.toLowerCase().includes(q) ||
          m.chiefExaminer.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getExamMetadataById(id: string): ExamMetadataRecord | undefined {
    return this.data.examMetadata.find((m) => m.id === id);
  }

  public addExamMetadata(record: ExamMetadataRecord): void {
    this.data.examMetadata.unshift(record);
    this.logAudit('EXAM_METADATA_CREATED', 'EXAM_METADATA', record.id, 'SUCCESS', `Created metadata for ${record.subject} (${record.subjectCode})`);
    this.save();
  }

  public updateExamMetadata(id: string, updates: Partial<ExamMetadataRecord>): ExamMetadataRecord | null {
    const record = this.data.examMetadata.find((m) => m.id === id);
    if (!record) return null;
    Object.assign(record, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return record;
  }

  public deleteExamMetadata(id: string): boolean {
    const index = this.data.examMetadata.findIndex((m) => m.id === id);
    if (index === -1) return false;
    const record = this.data.examMetadata[index];
    this.data.examMetadata.splice(index, 1);
    this.logAudit('EXAM_METADATA_DELETED', 'EXAM_METADATA', id, 'SUCCESS', `Deleted exam metadata for ${record.subject}`);
    this.save();
    return true;
  }

  // --- ALERTS ---
  public getAlerts(filters?: { status?: string; severity?: string; search?: string }): AlertRecord[] {
    let list = [...this.data.alerts];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.severity && filters.severity !== 'ALL') {
      list = list.filter((a) => a.severity === filters.severity);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          a.subjectCode.toLowerCase().includes(q) ||
          a.candidateId.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public addAlert(alert: AlertRecord): void {
    // Idempotent: don't duplicate identical alert for same candidate
    const existing = this.data.alerts.find((a) => a.candidateId === alert.candidateId);
    if (existing) {
      Object.assign(existing, alert);
    } else {
      this.data.alerts.unshift(alert);
    }
    this.save();
  }

  public updateAlertStatus(id: string, status: AlertRecord['status']): AlertRecord | null {
    const alert = this.data.alerts.find((a) => a.id === id);
    if (!alert) return null;
    alert.status = status;
    this.save();
    return alert;
  }

  // --- REVIEWS ---
  public getReviews(filters?: { status?: string; riskLevel?: string; search?: string }): ReviewItemRecord[] {
    let list = [...this.data.reviews];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((r) => r.reviewerStatus === filters.status);
    }
    if (filters?.riskLevel && filters.riskLevel !== 'ALL') {
      list = list.filter((r) => r.riskLevel === filters.riskLevel);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.candidateId.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public addReview(review: ReviewItemRecord): void {
    const existing = this.data.reviews.find((r) => r.candidateId === review.candidateId);
    if (existing) {
      Object.assign(existing, review);
    } else {
      this.data.reviews.unshift(review);
    }
    this.save();
  }

  public submitReviewDecision(
    id: string,
    decision: string,
    notes?: string,
    reviewer: string = 'Senior Security Analyst'
  ): ReviewItemRecord | null {
    const item = this.data.reviews.find((r) => r.id === id || r.candidateId === id);
    if (!item) return null;

    let newStatus: ReviewItemRecord['reviewerStatus'] = 'Needs Verification';
    if (decision === 'Mark as Reviewed' || decision === 'Verify Genuine' || decision === 'Verify Leak') {
      newStatus = 'Completed';
    } else if (decision === 'Dismiss Candidate' || decision === 'Dismiss Item') {
      newStatus = 'Dismissed';
    } else if (decision === 'Assign' || decision === 'In Review') {
      newStatus = 'In Review';
    }

    item.reviewerStatus = newStatus;
    item.assignedReviewer = reviewer;
    item.reviewedAt = new Date().toISOString();
    item.decisionNotes = notes;

    // Also update associated candidate review status
    const candidate = this.data.candidates.find((c) => c.id === item.candidateId);
    if (candidate) {
      candidate.review = newStatus === 'Completed' ? 'Reviewed' : newStatus === 'Dismissed' ? 'Dismissed' : 'Pending';
    }

    this.save();
    return item;
  }

  // --- SOCIAL SOURCES ---
  public getSocialSources(): SocialSourceRecord[] {
    return [...this.data.socialSources];
  }

  public toggleSocialSource(id: string, enabled?: boolean): SocialSourceRecord | null {
    const source = this.data.socialSources.find((s) => s.id === id);
    if (!source) return null;
    source.enabled = enabled !== undefined ? enabled : !source.enabled;
    source.status = source.enabled ? 'CONNECTED' : 'PAUSED';
    if (source.enabled) {
      source.lastSync = new Date().toISOString();
    }
    this.save();
    return source;
  }

  // --- SETTINGS ---
  public getSettings(): SystemSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    Object.assign(this.data.settings, updates);
    this.save();
    return { ...this.data.settings };
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats() {
    const candidates = Array.isArray(this.data.candidates) ? this.data.candidates : [];
    const alerts = Array.isArray(this.data.alerts) ? this.data.alerts : [];
    const reviews = Array.isArray(this.data.reviews) ? this.data.reviews : [];
    const historicalPapers = Array.isArray(this.data.historicalPapers) ? this.data.historicalPapers : [];
    const realPapers = Array.isArray(this.data.realPapers) ? this.data.realPapers : [];
    const socialSources = Array.isArray(this.data.socialSources) ? this.data.socialSources : DEFAULT_SOCIAL_SOURCES;
    const settings = this.data.settings || DEFAULT_SETTINGS;

    const totalCandidates = candidates.length;
    const activeAlerts = alerts.filter((a) => a && (a.status === 'ACTIVE' || a.status === 'INVESTIGATING')).length;
    const highRiskAlerts = alerts.filter((a) => a && (a.severity === 'CRITICAL' || a.severity === 'HIGH')).length;
    const pendingReviews = reviews.filter((r) => r && (r.reviewerStatus === 'Needs Verification' || r.reviewerStatus === 'Assigned')).length;
    const historicalCount = historicalPapers.length;
    const realPaperCount = realPapers.filter((p) => p && p.verificationStatus === 'VERIFIED').length;

    const recentCandidates = candidates.slice(0, 5);
    const recentAlerts = alerts.slice(0, 4);

    return {
      scannedToday: totalCandidates,
      scannedTotal: totalCandidates,
      activeAlerts,
      highRiskAlerts,
      pendingReviews,
      reviewQueueCount: pendingReviews,
      historicalPaperCount: historicalCount,
      realPaperCount: realPaperCount,
      recentCandidates,
      recentAlerts,
      monitoringSources: socialSources,
      systemStatus: settings.monitoringActive ? 'OPERATIONAL' : 'PAUSED',
    };
  }

  // --- AI ASSISTANT PROVIDER SETTINGS & CREDENTIALS ---

  /**
   * Helper to mask stored API keys for secure frontend transmission.
   * Never exposes raw secret keys in responses.
   */
  public static maskApiKey(key?: string): string {
    if (!key || key.trim().length === 0) return '';
    const trimmed = key.trim();
    if (trimmed.length <= 8) return '••••••••';
    return `${trimmed.slice(0, 3)}••••••••${trimmed.slice(-4)}`;
  }

  /**
   * Returns list of configured providers with masked API keys.
   */
  public getAiProviders(): AiProviderConfig[] {
    try {
      const list = Array.isArray(this.data.aiProviders) ? this.data.aiProviders : [];
      return list
        .filter((p) => p && typeof p === 'object')
        .map((p) => ({
          ...p,
          hasApiKey: !!(p.apiKey && typeof p.apiKey === 'string' && p.apiKey.trim().length > 0),
          maskedApiKey: Database.maskApiKey(p.apiKey),
          apiKey: undefined, // Strip raw key
        }));
    } catch (err) {
      console.error('[Database] Error in getAiProviders:', err);
      return [];
    }
  }

  /**
   * Gets a single provider config.
   * If includeSecret is false (default), strips the raw API key.
   */
  public getAiProviderById(id: string, includeSecret = false): AiProviderConfig | undefined {
    const provider = this.data.aiProviders.find((p) => p.id === id);
    if (!provider) return undefined;
    if (includeSecret) {
      return { ...provider };
    }
    return {
      ...provider,
      hasApiKey: !!(provider.apiKey && provider.apiKey.trim().length > 0),
      maskedApiKey: Database.maskApiKey(provider.apiKey),
      apiKey: undefined,
    };
  }

  /**
   * Returns the current active default AI provider (for Assistant operations).
   */
  public getDefaultAiProvider(includeSecret = false): AiProviderConfig | undefined {
    const provider = this.data.aiProviders.find((p) => p.isDefault && p.enabled);
    if (!provider) return undefined;
    if (includeSecret) {
      return { ...provider };
    }
    return {
      ...provider,
      hasApiKey: !!(provider.apiKey && provider.apiKey.trim().length > 0),
      maskedApiKey: Database.maskApiKey(provider.apiKey),
      apiKey: undefined,
    };
  }

  /**
   * Saves or updates an AI Assistant provider configuration.
   * Handles secret retention, credential changes, and connection state invalidation.
   */
  public saveAiProvider(input: {
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
    lastTestedAt?: string;
    lastResponseTimeMs?: number;
    lastError?: string;
  }): AiProviderConfig {
    const now = new Date().toISOString();
    const existingIndex = input.id ? this.data.aiProviders.findIndex((p) => p.id === input.id) : -1;

    let targetId = input.id || `PROV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let finalApiKey = input.apiKey?.trim();

    // If updating and new apiKey was not provided or is masked placeholder, keep existing key
    if (existingIndex >= 0) {
      const existing = this.data.aiProviders[existingIndex];
      targetId = existing.id;
      if (!finalApiKey || finalApiKey.includes('••••')) {
        finalApiKey = existing.apiKey;
      }

      // Check if critical configuration parameters changed
      const configChanged =
        existing.providerId !== input.providerId ||
        existing.baseUrl !== input.baseUrl ||
        existing.modelId !== input.modelId ||
        (input.apiKey && input.apiKey !== existing.apiKey && !input.apiKey.includes('••••'));

      // If configuration was altered after being connected, reset state to NOT_TESTED per spec
      let newStatus: AiConnectionStatus = input.status || existing.status;
      if (configChanged && !input.status) {
        newStatus = 'NOT_TESTED';
      }

      const isDefault = input.isDefault !== undefined ? input.isDefault : existing.isDefault;
      if (isDefault) {
        this.data.aiProviders.forEach((p) => {
          p.isDefault = false;
        });
      }

      const updated: AiProviderConfig = {
        ...existing,
        providerId: input.providerId,
        modelDisplayName: input.modelDisplayName,
        modelName: input.modelName,
        modelId: input.modelId,
        baseUrl: input.baseUrl,
        useCustomBaseUrl: input.useCustomBaseUrl ?? existing.useCustomBaseUrl,
        apiKey: finalApiKey,
        status: newStatus,
        lastTestedAt: input.lastTestedAt !== undefined ? input.lastTestedAt : (configChanged ? undefined : existing.lastTestedAt),
        lastResponseTimeMs: input.lastResponseTimeMs !== undefined ? input.lastResponseTimeMs : (configChanged ? undefined : existing.lastResponseTimeMs),
        lastError: input.lastError !== undefined ? input.lastError : (configChanged ? undefined : existing.lastError),
        enabled: input.enabled !== undefined ? input.enabled : existing.enabled,
        isDefault,
        updatedAt: now,
      };

      this.data.aiProviders[existingIndex] = updated;
      this.logAudit(
        'AI_PROVIDER_UPDATED',
        'AI_ASSISTANT',
        updated.id,
        'SUCCESS',
        `Updated AI provider configuration for ${updated.modelDisplayName} (${updated.providerId})`
      );
      this.save();

      return {
        ...updated,
        hasApiKey: !!(updated.apiKey && updated.apiKey.length > 0),
        maskedApiKey: Database.maskApiKey(updated.apiKey),
        apiKey: undefined,
      };
    } else {
      // Create new provider
      const isFirst = this.data.aiProviders.length === 0;
      const isDefault = input.isDefault ?? isFirst;

      if (isDefault) {
        this.data.aiProviders.forEach((p) => {
          p.isDefault = false;
        });
      }

      const newProvider: AiProviderConfig = {
        id: targetId,
        providerId: input.providerId,
        modelDisplayName: input.modelDisplayName,
        modelName: input.modelName,
        modelId: input.modelId,
        baseUrl: input.baseUrl,
        useCustomBaseUrl: input.useCustomBaseUrl || false,
        apiKey: finalApiKey || '',
        status: input.status || 'NOT_TESTED',
        lastTestedAt: input.lastTestedAt,
        lastResponseTimeMs: input.lastResponseTimeMs,
        lastError: input.lastError,
        enabled: input.enabled !== undefined ? input.enabled : true,
        isDefault,
        createdAt: now,
        updatedAt: now,
      };

      this.data.aiProviders.push(newProvider);
      this.logAudit(
        'AI_PROVIDER_CREATED',
        'AI_ASSISTANT',
        newProvider.id,
        'SUCCESS',
        `Configured new AI assistant provider ${newProvider.modelDisplayName} (${newProvider.providerId})`
      );
      this.save();

      return {
        ...newProvider,
        hasApiKey: !!(newProvider.apiKey && newProvider.apiKey.length > 0),
        maskedApiKey: Database.maskApiKey(newProvider.apiKey),
        apiKey: undefined,
      };
    }
  }

  /**
   * Sets a specific provider as the default active AI Assistant provider.
   */
  public setDefaultAiProvider(id: string): boolean {
    const target = this.data.aiProviders.find((p) => p.id === id);
    if (!target) return false;

    this.data.aiProviders.forEach((p) => {
      p.isDefault = p.id === id;
    });

    this.logAudit(
      'AI_PROVIDER_DEFAULT_CHANGED',
      'AI_ASSISTANT',
      id,
      'SUCCESS',
      `Set ${target.modelDisplayName} (${target.providerId}) as the default Assistant provider`
    );
    this.save();
    return true;
  }

  /**
   * Toggles enabled / disabled state for a provider.
   */
  public toggleAiProvider(id: string, enabled: boolean): AiProviderConfig | undefined {
    const target = this.data.aiProviders.find((p) => p.id === id);
    if (!target) return undefined;

    target.enabled = enabled;
    if (!enabled && target.status === 'CONNECTED') {
      target.status = 'DISABLED';
    } else if (enabled && target.status === 'DISABLED') {
      target.status = target.lastTestedAt ? 'CONNECTED' : 'NOT_TESTED';
    }
    target.updatedAt = new Date().toISOString();

    this.logAudit(
      'AI_PROVIDER_TOGGLED',
      'AI_ASSISTANT',
      id,
      'SUCCESS',
      `${enabled ? 'Enabled' : 'Disabled'} provider ${target.modelDisplayName}`
    );
    this.save();

    return {
      ...target,
      hasApiKey: !!(target.apiKey && target.apiKey.length > 0),
      maskedApiKey: Database.maskApiKey(target.apiKey),
      apiKey: undefined,
    };
  }

  /**
   * Deletes a provider configuration.
   */
  public deleteAiProvider(id: string): boolean {
    const index = this.data.aiProviders.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const deleted = this.data.aiProviders.splice(index, 1)[0];

    // If deleted was default, make the next enabled provider default
    if (deleted.isDefault && this.data.aiProviders.length > 0) {
      const nextActive = this.data.aiProviders.find((p) => p.enabled) || this.data.aiProviders[0];
      nextActive.isDefault = true;
    }

    this.logAudit(
      'AI_PROVIDER_DELETED',
      'AI_ASSISTANT',
      id,
      'SUCCESS',
      `Deleted provider configuration ${deleted.modelDisplayName} (${deleted.providerId})`
    );
    this.save();
    return true;
  }

  /**
   * Updates test status result for a provider.
   */
  public updateAiProviderStatus(
    id: string,
    status: AiConnectionStatus,
    responseTimeMs?: number,
    error?: string
  ): AiProviderConfig | undefined {
    const target = this.data.aiProviders.find((p) => p.id === id);
    if (!target) return undefined;

    target.status = status;
    if (status === 'CONNECTED') {
      target.lastTestedAt = new Date().toISOString();
      target.lastResponseTimeMs = responseTimeMs;
      target.lastError = undefined;
    } else if (status === 'ERROR') {
      target.lastError = error;
    }
    target.updatedAt = new Date().toISOString();
    this.save();

    return {
      ...target,
      hasApiKey: !!(target.apiKey && target.apiKey.length > 0),
      maskedApiKey: Database.maskApiKey(target.apiKey),
      apiKey: undefined,
    };
  }

  // ==========================================
  // UPLOADS REPOSITORY
  // ==========================================

  public getUploads(): UploadRecord[] {
    return [...(this.data.uploads || [])];
  }

  public getUploadById(id: string): UploadRecord | undefined {
    return (this.data.uploads || []).find((u) => u.upload_id === id);
  }

  public findUploadBySha256(sha256: string): UploadRecord | undefined {
    return (this.data.uploads || []).find((u) => u.sha256 === sha256);
  }

  public getNextUploadId(): string {
    const existing = this.data.uploads || [];
    const maxNumber = existing.reduce((max, item) => {
      const match = item.upload_id.match(/UP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);
    return `UP-${maxNumber + 1}`;
  }

  public addUpload(record: UploadRecord): UploadRecord {
    if (!this.data.uploads) {
      this.data.uploads = [];
    }
    this.data.uploads.unshift(record);
    this.save();

    this.logAudit(
      'FILE_UPLOADED',
      'DOCUMENT_UPLOAD',
      record.upload_id,
      record.status === 'UPLOAD_FAILED' ? 'FAILURE' : 'SUCCESS',
      `Uploaded file: ${record.original_filename} (${(record.size / 1024).toFixed(1)} KB, SHA: ${record.sha256.slice(0, 8)})`
    );

    return record;
  }

  public updateUpload(id: string, updates: Partial<UploadRecord>): UploadRecord | undefined {
    const target = (this.data.uploads || []).find((u) => u.upload_id === id);
    if (!target) return undefined;

    Object.assign(target, updates);
    this.save();
    return target;
  }

  public deleteUpload(id: string): boolean {
    const idx = (this.data.uploads || []).findIndex((u) => u.upload_id === id);
    if (idx === -1) return false;

    const [deleted] = this.data.uploads.splice(idx, 1);
    this.save();

    this.logAudit(
      'UPLOAD_DELETED',
      'DOCUMENT_UPLOAD',
      id,
      'SUCCESS',
      `Deleted uploaded record: ${deleted.original_filename}`
    );

    return true;
  }

  // ==========================================
  // TEST DATA SYSTEM & SURGICAL PURGE
  // ==========================================

  public getTestDataStatus() {
    const isCandidateTest = (c: CandidateRecord) =>
      c.isTestData === true || c.sourceType === 'TEST_FIXTURE' || c.id.startsWith('DC-TEST') || c.id.startsWith('CAND-TEST');
    const isHistoricalTest = (p: HistoricalPaperRecord) =>
      p.isTestData === true || p.sourceType === 'TEST_FIXTURE' || p.id.includes('TRIAL') || p.id.includes('TEST');
    const isRealPaperTest = (p: RealPaperRecord) =>
      p.isTestData === true || p.sourceType === 'TEST_FIXTURE' || p.id.includes('TEST');
    
    const testCandidateIds = new Set(this.data.candidates.filter(isCandidateTest).map((c) => c.id));
    const isAlertTest = (a: AlertRecord) =>
      a.isTestData === true || a.sourceType === 'TEST_FIXTURE' || a.id.includes('TEST') || testCandidateIds.has(a.candidateId);
    const isReviewTest = (r: ReviewItemRecord) =>
      r.isTestData === true || r.sourceType === 'TEST_FIXTURE' || r.id.includes('TEST') || testCandidateIds.has(r.candidateId);

    const testCandidates = this.data.candidates.filter(isCandidateTest);
    const realCandidates = this.data.candidates.filter((c) => !isCandidateTest(c));

    const testHistorical = this.data.historicalPapers.filter(isHistoricalTest);
    const realHistorical = this.data.historicalPapers.filter((p) => !isHistoricalTest(p));

    const testRealPapers = this.data.realPapers.filter(isRealPaperTest);
    const realRealPapers = this.data.realPapers.filter((p) => !isRealPaperTest(p));

    const testAlerts = this.data.alerts.filter(isAlertTest);
    const realAlerts = this.data.alerts.filter((a) => !isAlertTest(a));

    const testReviews = this.data.reviews.filter(isReviewTest);
    const realReviews = this.data.reviews.filter((r) => !isReviewTest(r));

    return {
      enabled: process.env.APP_ENV !== 'production' || process.env.ENABLE_TEST_DATA === 'true',
      testCandidatesCount: testCandidates.length,
      realCandidatesCount: realCandidates.length,
      testHistoricalCount: testHistorical.length,
      realHistoricalCount: realHistorical.length,
      testRealPapersCount: testRealPapers.length,
      realRealPapersCount: realRealPapers.length,
      testAlertsCount: testAlerts.length,
      realAlertsCount: realAlerts.length,
      testReviewsCount: testReviews.length,
      realReviewsCount: realReviews.length,
      totalTestItems: testCandidates.length + testHistorical.length + testRealPapers.length + testAlerts.length + testReviews.length,
    };
  }

  public clearTestData(): {
    success: boolean;
    message: string;
    clearedCandidates: number;
    clearedHistorical: number;
    clearedRealPapers: number;
    clearedAlerts: number;
    clearedReviews: number;
    deletedFilesCount: number;
  } {
    const isCandidateTest = (c: CandidateRecord) =>
      c.isTestData === true || c.sourceType === 'TEST_FIXTURE' || c.id.startsWith('DC-TEST') || c.id.startsWith('CAND-TEST');
    const isHistoricalTest = (p: HistoricalPaperRecord) =>
      p.isTestData === true || p.sourceType === 'TEST_FIXTURE' || p.id.includes('TRIAL') || p.id.includes('TEST');
    const isRealPaperTest = (p: RealPaperRecord) =>
      p.isTestData === true || p.sourceType === 'TEST_FIXTURE' || p.id.includes('TEST');

    const testCandidateRecords = this.data.candidates.filter(isCandidateTest);
    const testCandidateIds = new Set(testCandidateRecords.map((c) => c.id));

    const testHistoricalRecords = this.data.historicalPapers.filter(isHistoricalTest);
    const testRealPaperRecords = this.data.realPapers.filter(isRealPaperTest);

    const isAlertTest = (a: AlertRecord) =>
      a.isTestData === true || a.sourceType === 'TEST_FIXTURE' || a.id.includes('TEST') || testCandidateIds.has(a.candidateId);
    const isReviewTest = (r: ReviewItemRecord) =>
      r.isTestData === true || r.sourceType === 'TEST_FIXTURE' || r.id.includes('TEST') || testCandidateIds.has(r.candidateId);

    const testAlertRecords = this.data.alerts.filter(isAlertTest);
    const testReviewRecords = this.data.reviews.filter(isReviewTest);

    let deletedFilesCount = 0;

    // Delete candidate storage files
    for (const c of testCandidateRecords) {
      if (c.storagePath && fs.existsSync(c.storagePath)) {
        try {
          fs.unlinkSync(c.storagePath);
          deletedFilesCount++;
        } catch (e) {
          console.warn(`Failed to unlink test candidate file ${c.storagePath}:`, e);
        }
      }
    }

    // Delete historical storage files
    for (const h of testHistoricalRecords) {
      if (h.storagePath && fs.existsSync(h.storagePath)) {
        try {
          fs.unlinkSync(h.storagePath);
          deletedFilesCount++;
        } catch (e) {
          console.warn(`Failed to unlink test historical file ${h.storagePath}:`, e);
        }
      }
    }

    // Delete real paper storage files
    for (const r of testRealPaperRecords) {
      if (r.storagePath && fs.existsSync(r.storagePath)) {
        try {
          fs.unlinkSync(r.storagePath);
          deletedFilesCount++;
        } catch (e) {
          console.warn(`Failed to unlink test real paper file ${r.storagePath}:`, e);
        }
      }
    }

    // Purge only test items from arrays
    this.data.candidates = this.data.candidates.filter((c) => !isCandidateTest(c));
    this.data.historicalPapers = this.data.historicalPapers.filter((p) => !isHistoricalTest(p));
    this.data.realPapers = this.data.realPapers.filter((p) => !isRealPaperTest(p));
    this.data.alerts = this.data.alerts.filter((a) => !isAlertTest(a));
    this.data.reviews = this.data.reviews.filter((r) => !isReviewTest(r));

    this.logAudit(
      'TEST_DATA_PURGED',
      'DETECTED_CONTENT',
      'ALL_TEST_DATA',
      'SUCCESS',
      `Surgically cleared ${testCandidateRecords.length} candidate(s), ${testHistoricalRecords.length} historical paper(s), ${testRealPaperRecords.length} verified paper(s), ${testAlertRecords.length} alert(s), ${testReviewRecords.length} review(s), and deleted ${deletedFilesCount} physical test file(s). Real user records remain intact.`
    );

    this.save();

    return {
      success: true,
      message: `Cleared ${testCandidateRecords.length} test detected content, ${testHistoricalRecords.length} trial historical papers, ${testRealPaperRecords.length} test verified papers, ${testAlertRecords.length} test alerts, and ${testReviewRecords.length} test review items.`,
      clearedCandidates: testCandidateRecords.length,
      clearedHistorical: testHistoricalRecords.length,
      clearedRealPapers: testRealPaperRecords.length,
      clearedAlerts: testAlertRecords.length,
      clearedReviews: testReviewRecords.length,
      deletedFilesCount,
    };
  }

  // ==========================================
  // USERS & SESSIONS DATA ACCESS
  // ==========================================

  getUsers(): UserRecord[] {
    return [...(this.data.users || [])];
  }

  getUserById(id: string): UserRecord | undefined {
    return (this.data.users || []).find((u) => u.id === id);
  }

  getUserByEmail(email: string): UserRecord | undefined {
    if (!email) return undefined;
    const lower = email.trim().toLowerCase();
    return (this.data.users || []).find((u) => u.email.toLowerCase() === lower);
  }

  createUser(user: UserRecord): UserRecord {
    if (!this.data.users) this.data.users = [];
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | null {
    const idx = (this.data.users || []).findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  createSession(session: SessionRecord): SessionRecord {
    if (!this.data.sessions) this.data.sessions = [];
    // Clean up expired sessions first
    const now = Date.now();
    this.data.sessions = this.data.sessions.filter(
      (s) => new Date(s.expiresAt).getTime() > now
    );
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  getSession(token: string): SessionRecord | undefined {
    if (!token) return undefined;
    return (this.data.sessions || []).find((s) => s.token === token);
  }

  deleteSession(token: string): boolean {
    if (!token || !this.data.sessions) return false;
    const prevLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    const deleted = this.data.sessions.length < prevLen;
    if (deleted) this.save();
    return deleted;
  }

  deleteUserSessions(userId: string): void {
    if (!userId || !this.data.sessions) return;
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    this.save();
  }
}

export const db = new Database();
