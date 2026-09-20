import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings, Shield, Bell, Database, Key, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../hooks/useTheme';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions: { mode: ThemeMode; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
    {
      mode: 'light',
      label: 'Light',
      description: 'Clean high-contrast light theme with white cards and subtle borders',
      icon: Sun,
    },
    {
      mode: 'dark',
      label: 'Dark',
      description: 'Eye-safe dark theme preserving identical layout, typography, and hierarchy',
      icon: Moon,
    },
    {
      mode: 'system',
      label: 'System',
      description: 'Automatically synchronizes with your operating system appearance preference',
      icon: Monitor,
    },
  ];

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Settings"
        description="Configure system preferences, security policies, and examination parameters."
      />

      <div className="space-y-6 max-w-4xl">
        {/* Appearance & Theme Card */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Appearance & Theme</span>
            </div>
          }
          subtitle="Choose between Light, Dark, or System theme preference (Default is Light)."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.mode;

                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => setTheme(opt.mode)}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 relative group ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mb-1">
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {opt.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
              <span>
                Active theme: <strong className="text-slate-800 dark:text-slate-200 capitalize font-medium">{theme}</strong>
                {theme === 'system' && (
                  <span className="text-slate-400 ml-1">
                    (resolving to {resolvedTheme} mode)
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-400">
                Default: Light
              </span>
            </div>
          </div>
        </Card>

        <Card title="General Examination Settings" subtitle="Configure default behavior for document intake and pattern matching.">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Automatic Social Media Scraping</p>
                <p className="text-xs text-slate-500">Continuously monitor registered examination identifiers across public channels.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Strict Forensic Comparison</p>
                <p className="text-xs text-slate-500">Require multi-vector verification before flagging high-risk alerts.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>
          </div>
        </Card>

        <Card title="Notification Preferences" subtitle="Manage alert thresholds and dispatcher notifications.">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">High Risk Instant Alerts</p>
                <p className="text-xs text-slate-500">Send immediate notification when high-risk document leaks are detected.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

