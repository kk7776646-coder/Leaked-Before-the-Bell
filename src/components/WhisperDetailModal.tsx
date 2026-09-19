import React, { useState } from 'react';
import { LeakedWhisper } from '../types';
import {
  X,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  Share2,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Bot
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WhisperDetailModalProps {
  whisper: LeakedWhisper | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onVerify: (id: string) => void;
}

export const WhisperDetailModal: React.FC<WhisperDetailModalProps> = ({
  whisper,
  onClose,
  onUpvote,
  onVerify,
}) => {
  if (!whisper) return null;

  const [hasVerified, setHasVerified] = useState<boolean>(false);
  const isPositive = whisper.preMarketChangePercent >= 0;

  const handleVerifyClick = () => {
    if (!hasVerified) {
      setHasVerified(true);
      onVerify(whisper.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60 sticky top-0 z-10 backdrop-blur">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black font-mono text-white">${whisper.ticker}</span>
              <span className="text-sm text-slate-400">{whisper.companyName}</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-1 ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                ${whisper.preMarketPrice.toFixed(2)} ({isPositive ? '+' : ''}
                {whisper.preMarketChangePercent.toFixed(2)}%)
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{whisper.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Pre-Market Price Chart */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase text-slate-300 font-semibold">
                  Pre-Market Session Price & Volume (04:00 - 08:00 EST)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Source: Direct Exchange Pre-Bell Feed
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={whisper.priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? '#10b981' : '#f43f5e'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Financial Comparison Table */}
          {(whisper.leakedEPSWhisper || whisper.leakedRevenueWhisper) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 font-mono text-xs">
                <div className="text-slate-400 text-[11px] font-sans font-bold uppercase tracking-wider">
                  Wall Street Consensus Guidance
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">EPS Consensus:</span>
                  <span className="text-white font-bold">${whisper.consensusEPS ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Revenue Consensus:</span>
                  <span className="text-white font-bold">{whisper.consensusRevenue ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Implied Volatility:</span>
                  <span className="text-amber-400 font-bold">±{whisper.impliedVolPercent}%</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-2 font-mono text-xs">
                <div className="text-emerald-400 text-[11px] font-sans font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Leaked Pre-Bell Whisper Audit</span>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">CONFIRMED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Leaked EPS Whisper:</span>
                  <span className="text-emerald-400 font-bold">${whisper.leakedEPSWhisper ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Leaked Revenue Whisper:</span>
                  <span className="text-emerald-400 font-bold">{whisper.leakedRevenueWhisper ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Source Reliability Grade:</span>
                  <span className="text-indigo-400 font-bold">{whisper.reliabilityGrade}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaked Details Text */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Document Leak & Source Analysis
            </h3>
            <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed font-sans">
              {whisper.detailsText}
            </div>
          </div>

          {/* AI Takeaway */}
          {whisper.aiTakeaway && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 flex items-start space-x-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-indigo-300 uppercase tracking-wider block font-mono">
                  Gemini Pre-Bell Synthesis & Key Takeaway
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {whisper.aiTakeaway}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {whisper.timestamp}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-300">{whisper.verificationsCount} Community Verifications</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleVerifyClick}
              disabled={hasVerified}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                hasVerified
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{hasVerified ? 'Intelligence Verified' : 'Verify Intelligence'}</span>
            </button>

            <button
              onClick={() => onUpvote(whisper.id)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/10"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Upvote ({whisper.upvotesCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
