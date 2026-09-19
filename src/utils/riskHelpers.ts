import { RiskLevel, ReviewStatus } from '../types/candidate';

export function getRiskLevelLabel(score: number): RiskLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'REVIEW REQUIRED';
  return 'LOW';
}

export function getReviewStatusBadgeClass(status: ReviewStatus): string {
  switch (status) {
    case 'UNREVIEWED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    case 'VERIFIED':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    case 'ESCALATED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800';
    case 'DISMISSED':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}
