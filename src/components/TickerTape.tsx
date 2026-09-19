import React from 'react';
import { MarketIndex } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  indices: MarketIndex[];
}

export const TickerTape: React.FC<TickerTapeProps> = ({ indices }) => {
  // Duplicate array for infinite scroll effect
  const displayIndices = [...indices, ...indices, ...indices];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 overflow-hidden py-2 text-xs font-mono select-none">
      <div className="flex items-center">
        <div className="bg-slate-950 px-3 py-0.5 border-r border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider z-10 shrink-0 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Pre-Market Tape
        </div>
        
        <div className="flex whitespace-nowrap animate-ticker space-x-6 pl-4">
          {displayIndices.map((item, idx) => {
            const isPositive = item.change >= 0;
            return (
              <div key={`${item.symbol}-${idx}`} className="flex items-center space-x-2 shrink-0">
                <span className="text-slate-300 font-semibold">{item.name}</span>
                <span className="text-slate-100 font-bold">{item.value.toLocaleString()}</span>
                <span
                  className={`flex items-center font-medium ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                  )}
                  {isPositive ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </span>
                <span className="text-slate-700 mx-2">|</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
