export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getRiskColorClass(score: number): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
} {
  if (score >= 70) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-300 dark:border-rose-800',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
      badgeText: 'text-rose-700 dark:text-rose-300',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-800',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
      badgeText: 'text-amber-700 dark:text-amber-300',
    };
  }
  return {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-800',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  };
}
