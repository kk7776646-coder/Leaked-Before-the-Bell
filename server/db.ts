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
} from './types';
import { STORAGE_ROOT } from './storage';

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
  };

  constructor() {
    this.load();
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
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to load database file, initializing clean database:', err);
      this.save();
    }
  }

  public save(): void {
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
    let list = [...this.data.candidates];

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((c) => c.status === filters.status);
    } else if (!filters?.status) {
      list = list.filter((c) => c.status === 'ACTIVE');
    }

    if (filters?.risk && filters.risk !== 'ALL') {
      list = list.filter((c) => c.risk === filters.risk);
    }

    if (filters?.type && filters.type !== 'ALL') {
      list = list.filter((c) => c.contentType === filters.type);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.subjectCode.toLowerCase().includes(q) ||
          c.source.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q)
      );
    }

    return list;
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
    const totalCandidates = this.data.candidates.length;
    const activeAlerts = this.data.alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'INVESTIGATING').length;
    const highRiskAlerts = this.data.alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
    const pendingReviews = this.data.reviews.filter((r) => r.reviewerStatus === 'Needs Verification' || r.reviewerStatus === 'Assigned').length;
    const historicalCount = this.data.historicalPapers.length;
    const realPaperCount = this.data.realPapers.filter((p) => p.verificationStatus === 'VERIFIED').length;

    const recentCandidates = this.data.candidates.slice(0, 5);
    const recentAlerts = this.data.alerts.slice(0, 4);

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
      monitoringSources: this.data.socialSources,
      systemStatus: this.data.settings.monitoringActive ? 'OPERATIONAL' : 'PAUSED',
    };
  }
}

export const db = new Database();
