import React, { useState } from 'react';
import { X, Upload, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { LeakedWhisper, ReliabilityGrade, ImpactLevel, Sentiment } from '../types';

interface SubmitLeakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leak: LeakedWhisper) => void;
}

export const SubmitLeakModal: React.FC<SubmitLeakModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<LeakedWhisper['category']>('Earnings Leak');
  const [sourceType, setSourceType] = useState('');
  const [consensusEPS, setConsensusEPS] = useState('');
  const [leakedEPSWhisper, setLeakedEPSWhisper] = useState('');
  const [reliabilityGrade, setReliabilityGrade] = useState<ReliabilityGrade>('Tier 2 (High Probability)');
  const [sentiment, setSentiment] = useState<Sentiment>('Bullish');
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>('High');
  const [detailsText, setDetailsText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !title || !summary) return;

    const newLeak: LeakedWhisper = {
      id: `user-leak-${Date.now()}`,
      ticker: ticker.toUpperCase().trim(),
      companyName: companyName.trim() || `${ticker.toUpperCase()} Corp`,
      title: title.trim(),
      summary: summary.trim(),
      category,
      timestamp: 'Just now (Pre-Market)',
      preMarketPrice: 150.0,
      preMarketChangePercent: sentiment === 'Bullish' ? 4.5 : sentiment === 'Bearish' ? -3.8 : 0.2,
      consensusEPS: consensusEPS ? parseFloat(consensusEPS) : undefined,
      leakedEPSWhisper: leakedEPSWhisper ? parseFloat(leakedEPSWhisper) : undefined,
      confidenceScore: reliabilityGrade.startsWith('Tier 1') ? 92 : 78,
      reliabilityGrade,
      sourceType: sourceType.trim() || 'Anonymous Pre-Bell Submission',
      sentiment,
      impactLevel,
      verificationsCount: 1,
      upvotesCount: 12,
      priceHistory: [
        { time: '04:00 AM', price: 145.0, volume: 5000 },
        { time: '06:00 AM', price: 148.0, volume: 15000 },
        { time: '08:00 AM', price: 150.0, volume: 35000 },
      ],
      detailsText: detailsText.trim() || summary.trim(),
      aiTakeaway: `User-submitted pre-market intelligence for $${ticker.toUpperCase()}. Verified by algorithmic document audit engine.`,
    };

    onSubmit(newLeak);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Submit Anonymous Pre-Market Intelligence</h2>
              <p className="text-xs text-slate-400">
                Encrypted & anonymous submission channel for SEC drafts, transcripts & audits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        {submittedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white">Intelligence Submitted & Published!</h3>
            <p className="text-xs text-slate-400">
              Your leak has been verified by the automated pre-bell audit engine and appended to the feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Row 1: Ticker & Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                  Ticker Symbol *
                </label>
                <input
                  type="text"
                  required
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="e.g. NVDA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. NVIDIA Corporation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                Leak Title / Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pre-Bell Supply Chain Audit Indicates 20% Production Surplus"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Category & Sentiment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                  Leak Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LeakedWhisper['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Earnings Leak">Earnings Leak</option>
                  <option value="M&A / Buyout">M&A / Buyout</option>
                  <option value="Regulatory / FDA">Regulatory / FDA</option>
                  <option value="Insider Cluster">Insider Cluster</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="Executive Departure">Executive Departure</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                  Pre-Bell Sentiment
                </label>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value as Sentiment)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Bullish" className="text-emerald-400">Bullish (+)</option>
                  <option value="Bearish" className="text-rose-400">Bearish (-)</option>
                  <option value="Neutral" className="text-slate-400">Neutral (=)</option>
                </select>
              </div>
            </div>

            {/* Consensus vs Whisper EPS */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 border border-slate-800 rounded-lg">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Wall St Consensus EPS ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={consensusEPS}
                  onChange={(e) => setConsensusEPS(e.target.value)}
                  placeholder="e.g. 0.75"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-amber-400 font-mono mb-1">Leaked Whisper EPS ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={leakedEPSWhisper}
                  onChange={(e) => setLeakedEPSWhisper(e.target.value)}
                  placeholder="e.g. 0.92"
                  className="w-full bg-slate-900 border border-amber-500/40 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Source Type & Reliability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                  Document / Source Type
                </label>
                <input
                  type="text"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  placeholder="e.g. SEC Form 4 Staging / Supply Audit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                  Reliability Grade
                </label>
                <select
                  value={reliabilityGrade}
                  onChange={(e) => setReliabilityGrade(e.target.value as ReliabilityGrade)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Tier 1 (Verified Doc)">Tier 1 (Verified Doc)</option>
                  <option value="Tier 2 (High Probability)">Tier 2 (High Probability)</option>
                  <option value="Tier 3 (Rumor/Whisper)">Tier 3 (Rumor/Whisper)</option>
                </select>
              </div>
            </div>

            {/* Detailed Document Text */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase font-mono">
                Full Document Text / Detailed Findings *
              </label>
              <textarea
                required
                rows={3}
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder="Paste leaked text, SEC draft excerpts, or supply chain findings here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/10 mt-4"
            >
              <Send className="w-4 h-4" />
              <span>Publish Intelligence to Pre-Bell Feed</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
