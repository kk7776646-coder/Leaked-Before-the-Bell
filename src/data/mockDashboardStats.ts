export interface DashboardStats {
  scannedToday: number;
  candidatesDetected: number;
  activeAlerts: number;
  reviewQueueCount: number;
  avgScanTimeMs: number;
  scannedChange24h: string;
  candidatesChange24h: string;
  alertsChange24h: string;
  reviewQueueChange24h: string;
}

export const mockDashboardStats: DashboardStats = {
  scannedToday: 14280,
  candidatesDetected: 24,
  activeAlerts: 5,
  reviewQueueCount: 3,
  avgScanTimeMs: 420,
  scannedChange24h: '+18%',
  candidatesChange24h: '+4 in last 6h',
  alertsChange24h: '3 High Risk',
  reviewQueueChange24h: '2 Pending Action',
};

export const riskTrendData = [
  { time: '00:00', totalScanned: 1100, candidatesFound: 1, highRiskCount: 0 },
  { time: '02:00', totalScanned: 1850, candidatesFound: 2, highRiskCount: 1 },
  { time: '04:00', totalScanned: 3200, candidatesFound: 5, highRiskCount: 2 },
  { time: '06:00', totalScanned: 6400, candidatesFound: 12, highRiskCount: 3 },
  { time: '07:00', totalScanned: 9200, candidatesFound: 18, highRiskCount: 4 },
  { time: '08:00', totalScanned: 14280, candidatesFound: 24, highRiskCount: 4 },
];

export const riskCategoryBreakdown = [
  { name: 'OCR Question Overlap', count: 12, score: 92 },
  { name: 'Early Release Window', count: 8, score: 88 },
  { name: 'Header / Seal Anomaly', count: 5, score: 76 },
  { name: 'Font / Grid Deviation', count: 3, score: 54 },
];
