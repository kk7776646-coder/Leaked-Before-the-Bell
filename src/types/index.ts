export * from './candidate';
export * from './alert';
export * from './exam';
export * from './review';

export type ReliabilityGrade = 'Tier 1 (Verified Doc)' | 'Tier 2 (High Probability)' | 'Tier 3 (Rumor/Whisper)';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type Sentiment = 'Bullish' | 'Bearish' | 'Neutral';


export interface LeakedWhisper {
  id: string;
  ticker: string;
  companyName: string;
  title: string;
  summary: string;
  category: 'Earnings Leak' | 'M&A / Buyout' | 'Regulatory / FDA' | 'Insider Cluster' | 'Supply Chain' | 'Executive Departure';
  timestamp: string;
  preMarketPrice: number;
  preMarketChangePercent: number;
  consensusEPS?: number;
  leakedEPSWhisper?: number;
  consensusRevenue?: string;
  leakedRevenueWhisper?: string;
  impliedVolPercent?: number;
  confidenceScore: number; // 0 - 100
  reliabilityGrade: ReliabilityGrade;
  sourceType: string;
  sentiment: Sentiment;
  impactLevel: ImpactLevel;
  verificationsCount: number;
  upvotesCount: number;
  isBookmarked?: boolean;
  priceHistory: { time: string; price: number; volume: number }[];
  detailsText: string;
  aiTakeaway?: string;
}

export interface InsiderTrade {
  id: string;
  ticker: string;
  companyName: string;
  insiderName: string;
  title: string;
  tradeType: 'Buy' | 'Sell' | 'Option Exercise';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  dateFiled: string;
  preBellSentiment: Sentiment;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  leakCount: number;
  alertOn: boolean;
}
