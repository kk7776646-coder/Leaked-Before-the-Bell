export * from './candidate';
export * from './alert';
export * from './exam';
export * from './review';

export type ReliabilityGrade = 'A+' | 'A' | 'B' | 'C' | 'Unverified';
export type ImpactLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type Sentiment = 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';

export interface InsiderTrade {
  id: string;
  name: string;
  role: string;
  company: string;
  transactionType: string;
  shares: string;
  value: string;
  date: string;
  reliability: ReliabilityGrade;
}

export interface LeakedWhisper {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  reliability: ReliabilityGrade;
  impact: ImpactLevel;
  sentiment: Sentiment;
  content: string;
  tags: string[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}
