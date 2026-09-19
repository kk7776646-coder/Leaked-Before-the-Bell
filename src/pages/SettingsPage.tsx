import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Sliders, Shield, Cpu, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [ocrThreshold, setOcrThreshold] = useState('85');
  const [leadTimeMinutes, setLeadTimeMinutes] = useState('180');
  const [autoFlagLevel, setAutoFlagLevel] = useState('70');
  const [telegramIndexing, setTelegramIndexing] = useState(true);
  const [darknetGateways, setDarknetGateways] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Surveillance & System Settings"
        description="Configure early-warning sensitivity thresholds, application theme appearance, OCR match tolerances, and gateway crawling parameters."
      />

      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-sans font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Configuration saved successfully. Surveillance algorithms and appearance settings updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-sans">
        {/* Appearance & Theme Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>Appearance & Theme</span>
            </div>
          }
          subtitle="Application theme options persist automatically in browser storage"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-sans font-medium text-slate-800 dark:text-slate-200">
                Theme Selection
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Select your preferred theme mode. System mode automatically mirrors your device operating system setting.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Intelligence Sensitivity Thresholds */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-500" />
              <span>Surveillance Detection Thresholds</span>
            </div>
          }
          subtitle="Tweak matching sensitivity to balance early detection vs false positives"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="font-sans font-medium text-slate-800 dark:text-slate-200">
                Minimum OCR Text Match % ({ocrThreshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="98"
                value={ocrThreshold}
                onChange={(e) => setOcrThreshold(e.target.value)}
                className="w-full cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-slate-500 leading-relaxed">Triggers alert when question phrasing match exceeds {ocrThreshold}%</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-medium text-slate-800 dark:text-slate-200">
                Early Lead Time Window ({leadTimeMinutes} Mins)
              </label>
              <input
                type="number"
                value={leadTimeMinutes}
                onChange={(e) => setLeadTimeMinutes(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-sans"
              />
              <p className="text-xs text-slate-500 leading-relaxed">Flag documents detected up to {leadTimeMinutes} mins prior to exam</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-medium text-slate-800 dark:text-slate-200">
                High Risk Threshold Cutoff ({autoFlagLevel} Points)
              </label>
              <input
                type="range"
                min="50"
                max="90"
                value={autoFlagLevel}
                onChange={(e) => setAutoFlagLevel(e.target.value)}
                className="w-full cursor-pointer accent-rose-600"
              />
              <p className="text-xs text-slate-500 leading-relaxed">Scores above {autoFlagLevel} trigger high severity priority alerts</p>
            </div>
          </div>
        </Card>

        {/* Gateway Indexing Preferences */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Active Gateway Crawlers</span>
            </div>
          }
          subtitle="Toggle external web crawler adapters"
        >
          <div className="space-y-3 text-xs font-sans">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer">
              <div>
                <p className="font-sans font-medium text-slate-800 dark:text-slate-200">Public Telegram Channel Indexer</p>
                <p className="text-xs text-slate-500 leading-relaxed">Monitor known educational exam leak discussion groups</p>
              </div>
              <input
                type="checkbox"
                checked={telegramIndexing}
                onChange={(e) => setTelegramIndexing(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer">
              <div>
                <p className="font-sans font-medium text-slate-800 dark:text-slate-200">Darknet / Encrypted Storage Bucket Scanner</p>
                <p className="text-xs text-slate-500 leading-relaxed">Parse automated mirrors and temporary pastebins</p>
              </div>
              <input
                type="checkbox"
                checked={darknetGateways}
                onChange={(e) => setDarknetGateways(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </label>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg" icon={<Save className="w-4 h-4" />}>
            Save All Configuration Settings
          </Button>
        </div>
      </form>
    </ResponsiveContainer>
  );
};
