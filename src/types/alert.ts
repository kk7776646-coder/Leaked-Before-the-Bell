export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'New' | 'Under Review' | 'Acknowledged' | 'Resolved';

export interface Alert {
  id: string; // e.g. "ALT-2026-881"
  candidateId: string; // e.g. "LB-1042"
  subject: string;
  subjectCode: string;
  severity: AlertSeverity;
  detectedTime: string;
  reason: string;
  status: AlertStatus;
  riskScore: number;
  details: string;
  recommendedAction: string;
}
