import React, { useState, useEffect } from 'react';
import { Bell, Plus, Sparkles, RefreshCw, Volume2, VolumeX, Flame } from 'lucide-react';
import { AppLogo } from './common/AppLogo';

interface HeaderProps {
  onOpenSubmitModal: () => void;
  onOpenAIModal: () => void;
  totalLeaks: number;
  highImpactCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmitModal,
  onOpenAIModal,
  totalLeaks,
  highImpactCount,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Countdown to 9:30 AM EST Market Open
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target today 9:30 AM EST
      const openTime = new Date();
      openTime.setHours(9, 30, 0, 0);

      let diff = openTime.getTime() - now.getTime();
      if (diff < 0) {
        // If past 9:30 AM, point to tomorrow 9:30 AM
        openTime.setDate(openTime.getDate() + 1);
        diff = openTime.getTime() - now.getTime();
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <AppLogo className="w-10 h-10 shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  BEFORE THE BELL
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono border border-amber-500/30 font-medium">
                    PRE-MARKET LEAKS
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Pre-Market Earnings Whispers • SEC EDGAR Drafts • Supply Chain Signals
              </p>
            </div>
          </div>

          {/* Countdown & Live Badge */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-lg flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-400 font-mono tracking-wider uppercase">
                  PRE-MARKET LIVE
                </span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="text-xs text-slate-300 font-mono">
                Opening Bell in <span className="text-amber-400 font-bold">{timeLeft || '01:15:20'}</span>
              </div>
            </div>

            {/* High Impact Counter */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>
                <strong className="text-rose-400">{highImpactCount}</strong> High Impact Leaks
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Audio alert toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Mute Audio Alerts' : 'Enable Audio Alerts'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              title="Refresh Feed"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* AI Briefing Button */}
            <button
              onClick={onOpenAIModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Pre-Bell Analyst</span>
            </button>

            {/* Submit Leak Button */}
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Submit Intelligence</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
