import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Key,
  Sun,
  Moon,
  Monitor,
  Check,
  Bot,
  Sliders,
  Sparkles,
  FlaskConical,
  Users,
  User,
} from 'lucide-react';
import { useTheme, ThemeMode } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { AiAssistantSettingsSection } from '../components/settings/AiAssistantSettingsSection';
import { TestDataSettingsSection } from '../components/settings/TestDataSettingsSection';
import { UserManagementSection } from '../components/settings/UserManagementSection';
import { ProfileSettingsSection } from '../components/settings/ProfileSettingsSection';

type SettingsTab = 'profile' | 'test-data' | 'ai-assistant' | 'appearance' | 'examination' | 'notifications' | 'user-management';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'profile');

  useEffect(() => {
    if (
      tabParam &&
      (tabParam === 'profile' ||
        tabParam === 'test-data' ||
        tabParam === 'ai-assistant' ||
        tabParam === 'appearance' ||
        tabParam === 'examination' ||
        tabParam === 'notifications' ||
        (tabParam === 'user-management' && isAdmin))
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam, isAdmin]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
        title={
          activeTab === 'profile'
            ? 'My Profile & Avatar'
            : activeTab === 'test-data'
            ? 'Test Data'
            : 'Settings'
        }
        description={
          activeTab === 'profile'
            ? 'Manage your authenticated account identity, contact details, and custom avatar photo.'
            : activeTab === 'test-data'
            ? 'Create controlled test documents to validate upload, document processing, comparison, alerts and review workflows.'
            : 'Configure system preferences, AI Assistant LLM providers, and security policies.'
        }
        breadcrumb={
          activeTab === 'profile'
            ? 'Settings → My Profile'
            : activeTab === 'test-data'
            ? 'Settings → Test Data'
            : activeTab === 'ai-assistant'
            ? 'Settings → AI Assistant'
            : activeTab === 'appearance'
            ? 'Settings → Appearance & Theme'
            : 'Settings → General'
        }
      />

      {/* Settings Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-6 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
            activeTab === 'profile'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>My Profile</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('test-data')}
          className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
            activeTab === 'test-data'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          <span>Test Data</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('ai-assistant')}
          className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
            activeTab === 'ai-assistant'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
          }`}
        >
          <Bot className="w-3.5 h-3.5 shrink-0" />
          <span>AI Assistant</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('appearance')}
          className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
            activeTab === 'appearance'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 shrink-0" />
          <span>Appearance & Theme</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('examination')}
          className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
            activeTab === 'examination'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span>Examination Policies</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('notifications')}
          className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
            activeTab === 'notifications'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
          }`}
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          <span>Notifications & Alerts</span>
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => handleTabChange('user-management')}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border flex items-center gap-2 cursor-pointer shrink-0 transition-all duration-300 ${
              activeTab === 'user-management'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 shadow-[0_4px_12px_rgba(148,163,184,0.12)] dark:shadow-[0_4px_12px_rgba(2,6,23,0.4)]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200/60 dark:hover:border-slate-800/60 hover:shadow-[0_4px_12px_rgba(148,163,184,0.08)] dark:hover:shadow-[0_4px_12px_rgba(2,6,23,0.2)]'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>User Management</span>
          </button>
        )}
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* TAB: Profile */}
        {activeTab === 'profile' && <ProfileSettingsSection />}

        {/* TAB 0: Test Data */}
        {activeTab === 'test-data' && <TestDataSettingsSection />}

        {/* TAB 1: AI Assistant */}
        {activeTab === 'ai-assistant' && <AiAssistantSettingsSection />}

        {/* TAB 2: Appearance & Theme */}
        {activeTab === 'appearance' && (
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
                      className={`text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 relative group ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_12px_30px_rgba(148,163,184,0.18)] dark:hover:shadow-[0_12px_30px_rgba(2,6,23,0.4)] hover:-translate-y-0.5'
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
        )}

        {/* TAB 3: Examination Policies */}
        {activeTab === 'examination' && (
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
        )}

        {/* TAB 4: Notifications */}
        {activeTab === 'notifications' && (
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
        )}

        {/* TAB 5: User Management (Admin Only) */}
        {activeTab === 'user-management' && isAdmin && (
          <UserManagementSection />
        )}
      </div>
    </ResponsiveContainer>
  );
};


