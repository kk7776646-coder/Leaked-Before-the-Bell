import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { Candidate } from '../../types/candidate';
import { Copy, Check, FileCode, AlignLeft } from 'lucide-react';

interface OCRTextPanelProps {
  candidate: Candidate;
}

export const OCRTextPanel: React.FC<OCRTextPanelProps> = ({ candidate }) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const handleCopy = () => {
    navigator.clipboard.writeText(candidate.ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = (text: string, term: string) => {
    if (!term.trim()) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-amber-400 text-slate-950 font-medium px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-indigo-500" />
          <span>Extracted OCR Question Text</span>
        </div>
      }
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy Text'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={<FileCode className="w-3.5 h-3.5" />}
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
          >
            {viewMode === 'formatted' ? 'Raw Code' : 'Formatted'}
          </Button>
        </div>
      }
    >
      <div className="mb-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Find keyword in extracted OCR text..."
        />
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs max-h-80 overflow-y-auto leading-relaxed">
        {viewMode === 'formatted' ? (
          <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
            {highlightMatches(candidate.ocrText, searchTerm)}
          </div>
        ) : (
          <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre-wrap">
            {JSON.stringify({ id: candidate.id, ocr_text: candidate.ocrText }, null, 2)}
          </pre>
        )}
      </div>
    </Card>
  );
};
