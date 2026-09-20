export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'Unresolved' | 'Acknowledged' | 'Resolved' | 'New' | 'Under Review';

export interface Alert {
  id: string;
  candidateId: string;
  candidateName: string;
  examCode: string;
  subject?: string;
  reason?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  detectedTime?: string;
  source: string;
  description: string;
  matchScore: number;
}
