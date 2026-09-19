import React from 'react';
import { LeakedWhisper } from '../types';
import { ShieldCheck, Zap, TrendingUp, AlertTriangle, Scale } from 'lucide-react';

interface PreMarketSummaryBarProps {
  whispers: LeakedWhisper[];
}

export const PreMarketSummaryBar: React.FC<PreMarketSummaryBarProps> = ({ whispers }) => {
  const bullishCount = whispers.filter((w) => w.sentiment === 'Bullish').length;
  const bearishCount = whispers.filter((w) => w.sentiment === 'Bearish').length;
  const neutralCount = whispers.filter((w) => w.sentiment === 'Neutral').length;
  const total = whispers.length || 1;

  const bullishPercent = Math.round((bullishCount / total) * 100);
  const bearishPercent = Math.round((bearishCount / total) * 100);

  const tier1Count = whispers.filter((w) => w.reliabilityGrade.startsWith('Tier 1')).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Pre-Market Sentiment Ratio Gauge */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Pre-Bell Intelligence Sentiment</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">{bullishPercent}% Bullish</span>
        </div>

        {/* Sentiment Bar */}
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex my-2">
          <div style={{ width: `${bullishPercent}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
          <div style={{ width: `${100 - bullishPercent - bearishPercent}%` }} className="bg-slate-500 h-full transition-all duration-500" />
          <div style={{ width: `${bearishPercent}%` }} className="bg-rose-500 h-full transition-all duration-500" />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1">
          <span className="text-emerald-400 font-medium">{bullishCount} Bullish Leaks</span>
          <span className="text-slate-400">{neutralCount} Neutral</span>
          <span className="text-rose-400 font-medium">{bearishCount} Bearish Leaks</span>
        </div>
      </div>

      {/* Verified Tier-1 Intelligence Metric */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Doc Audits</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline space-x-2">
            <span>{tier1Count}</span>
            <span className="text-xs text-emerald-400 font-sans font-normal">Tier-1 Documents Verified</span>
          </div>
          <p className="text-xs text-slate-400">
            SEC EDGAR staging drafts & TSMC substrate audit logs.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Highest Volatility Implied Catalyst */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pre-Market Volatility Alert</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline space-x-2">
            <span className="text-amber-400">PLTR +6.15%</span>
            <span className="text-xs text-slate-400 font-sans font-normal">Implied Vol 9.1%</span>
          </div>
          <p className="text-xs text-slate-400">
            Unannounced $480M Pentagon AIP addendum leak.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
      </div>
    </div>
  );
};
