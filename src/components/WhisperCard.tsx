import React from 'react';
import { LeakedWhisper } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  Bookmark,
  ChevronRight,
  Clock,
  Sparkles,
  BarChart2,
  FileText,
} from 'lucide-react';

interface WhisperCardProps {
  whisper: LeakedWhisper;
  onSelect: (whisper: LeakedWhisper) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
}

export const WhisperCard: React.FC<WhisperCardProps> = ({
  whisper,
  onSelect,
  onUpvote,
  onToggleBookmark,
}) => {
  const isPositive = whisper.preMarketChangePercent >= 0;

  const getReliabilityBadge = (grade: string) => {
    if (grade.startsWith('Tier 1')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3" />
          Tier 1 (Verified Doc)
        </span>
      );
    }
    if (grade.startsWith('Tier 2')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          <ShieldCheck className="w-3 h-3" />
          Tier 2 (High Prob)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <FileText className="w-3 h-3" />
        Tier 3 (Whisper)
      </span>
    );
  };

  const getImpactBadge = (impact: string) => {
    if (impact === 'High') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">HIGH IMPACT</span>;
    }
    if (impact === 'Medium') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">MEDIUM IMPACT</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">LOW IMPACT</span>;
  };

  return (
    <div
      onClick={() => onSelect(whisper)}
      className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/100 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl relative overflow-hidden"
    >
      {/* Top row: Ticker, Price %, Time, Reliability Grade */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black font-mono tracking-tight text-white group-hover:text-amber-400 transition">
              ${whisper.ticker}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">{whisper.companyName}</span>
          </div>

          <div
            className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            <span>${whisper.preMarketPrice.toFixed(2)}</span>
            <span className="ml-1">
              ({isPositive ? '+' : ''}
              {whisper.preMarketChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getImpactBadge(whisper.impactLevel)}
          {getReliabilityBadge(whisper.reliabilityGrade)}
        </div>
      </div>

      {/* Leak Title & Summary */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition line-clamp-2 leading-snug">
          {whisper.title}
        </h3>
        <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
          {whisper.summary}
        </p>
      </div>

      {/* Consensus vs Whisper Comparison Box (if available) */}
      {(whisper.leakedEPSWhisper !== undefined || whisper.leakedRevenueWhisper !== undefined) && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 mb-4 grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">Bloomberg Consensus</span>
            <div className="text-slate-300 font-semibold">
              EPS: ${whisper.consensusEPS ?? 'N/A'} | Rev: {whisper.consensusRevenue ?? 'N/A'}
            </div>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-amber-400 text-[10px] uppercase tracking-wider font-bold block mb-0.5">Leaked Pre-Bell Whisper</span>
            <div className="text-emerald-400 font-bold">
              EPS: ${whisper.leakedEPSWhisper ?? 'N/A'} | Rev: {whisper.leakedRevenueWhisper ?? 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Source, Upvotes, Confidence Score & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-slate-400">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            {whisper.timestamp}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium truncate max-w-[200px]">
            {whisper.sourceType}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Confidence bar */}
          <div className="hidden sm:flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400">Confidence:</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${whisper.confidenceScore}%` }}
                className={`h-full ${
                  whisper.confidenceScore > 85 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-200">
              {whisper.confidenceScore}%
            </span>
          </div>

          {/* Upvote */}
          <button
            onClick={(e) => onUpvote(whisper.id, e)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-400 transition"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-semibold">{whisper.upvotesCount}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={(e) => onToggleBookmark(whisper.id, e)}
            className={`p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition ${
              whisper.isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={whisper.isBookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* Chevron inspect */}
          <div className="flex items-center text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span className="text-xs mr-0.5 hidden sm:inline">Inspect</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
