import React from 'react';
import { WatchlistItem } from '../types';
import { Bell, BellOff, TrendingUp, TrendingDown, Eye, Plus, Trash2 } from 'lucide-react';

interface WatchlistSidebarProps {
  watchlist: WatchlistItem[];
  onToggleAlert: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
  onAddTicker: (ticker: string) => void;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  watchlist,
  onToggleAlert,
  onRemoveTicker,
  onAddTicker,
}) => {
  const [newTickerInput, setNewTickerInput] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerInput.trim()) return;
    onAddTicker(newTickerInput.trim().toUpperCase());
    setNewTickerInput('');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Pre-Market Watchlist
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{watchlist.length} Tickers</span>
      </div>

      {/* Add ticker form */}
      <form onSubmit={handleAdd} className="flex space-x-2">
        <input
          type="text"
          value={newTickerInput}
          onChange={(e) => setNewTickerInput(e.target.value)}
          placeholder="Add Ticker (e.g. MSFT)"
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 flex-1"
        />
        <button
          type="submit"
          className="p-1.5 rounded bg-amber-500 text-slate-950 hover:bg-amber-600 font-medium text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Ticker list */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {watchlist.map((item) => {
          const isPos = item.changePercent >= 0;
          return (
            <div
              key={item.ticker}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-mono font-medium text-white">${item.ticker}</span>
                  {item.leakCount > 0 && (
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] font-mono px-1.5 py-0.2 rounded">
                      {item.leakCount} leaks
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-sans">{item.name}</div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right font-mono text-xs">
                  <div className="text-white font-medium">${item.price.toFixed(2)}</div>
                  <div className={`text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </div>
                </div>

                <button
                  onClick={() => onToggleAlert(item.ticker)}
                  title={item.alertOn ? 'Alerts On' : 'Alerts Off'}
                  className={`p-1 rounded transition ${
                    item.alertOn ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {item.alertOn ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => onRemoveTicker(item.ticker)}
                  title="Remove from Watchlist"
                  className="p-1 rounded text-slate-600 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
