import React from 'react';
import { Search, Filter, ShieldCheck, Flame, Layers } from 'lucide-react';
import { ReliabilityGrade, ImpactLevel } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  selectedImpact: string;
  onImpactChange: (impact: string) => void;
  totalResults: number;
}

const CATEGORIES = [
  'All',
  'Earnings Leak',
  'M&A / Buyout',
  'Regulatory / FDA',
  'Insider Cluster',
  'Supply Chain',
  'Executive Departure',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedGrade,
  onGradeChange,
  selectedImpact,
  onImpactChange,
  totalResults,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticker (NVDA, PLTR), keyword, or leak title..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition"
          />
        </div>

        {/* Dropdowns for Reliability & Impact */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Reliability:</span>
            <select
              value={selectedGrade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Tiers</option>
              <option value="Tier 1 (Verified Doc)" className="bg-slate-900 text-slate-200">Tier 1 (Verified Doc)</option>
              <option value="Tier 2 (High Probability)" className="bg-slate-900 text-slate-200">Tier 2 (High Prob)</option>
              <option value="Tier 3 (Rumor/Whisper)" className="bg-slate-900 text-slate-200">Tier 3 (Rumor)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Impact:</span>
            <select
              value={selectedImpact}
              onChange={(e) => onImpactChange(e.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Impact</option>
              <option value="High" className="bg-slate-900 text-slate-200">High Impact</option>
              <option value="Medium" className="bg-slate-900 text-slate-200">Medium Impact</option>
              <option value="Low" className="bg-slate-900 text-slate-200">Low Impact</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden lg:inline">
            Showing <strong className="text-amber-400">{totalResults}</strong> leaks
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Sector/Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
