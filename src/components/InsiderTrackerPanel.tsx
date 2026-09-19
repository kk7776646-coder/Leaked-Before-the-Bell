import React from 'react';
import { InsiderTrade } from '../types';
import { UserCheck, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface InsiderTrackerPanelProps {
  insiderTrades: InsiderTrade[];
}

export const InsiderTrackerPanel: React.FC<InsiderTrackerPanelProps> = ({ insiderTrades }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Pre-Bell SEC Form 4 Insider Cluster Monitor
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          EDGAR Staging Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insiderTrades.map((trade) => {
          const isBuy = trade.tradeType === 'Buy';
          return (
            <div
              key={trade.id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-black font-mono text-white">${trade.ticker}</span>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {trade.tradeType.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-200 font-bold truncate">{trade.insiderName}</p>
                <p className="text-[10px] text-slate-400 truncate">{trade.title}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-900">
                <span className="text-slate-400">{trade.shares.toLocaleString()} shares</span>
                <span className="text-amber-400 font-bold">
                  ${(trade.totalValue / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
