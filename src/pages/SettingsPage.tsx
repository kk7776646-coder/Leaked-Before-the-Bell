import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings, Shield, Bell, Database, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <ResponsiveContainer>
      <PageHeader
        title="Settings"
        description="Configure system preferences, security policies, and examination parameters."
      />

      <div className="space-y-6 max-w-4xl">
        <Card title="General Examination Settings" subtitle="Configure default behavior for document intake and candidate matching.">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Automatic Social Media Scraping</p>
                <p className="text-xs text-slate-500">Continuously monitor registered candidate identifiers across public channels.</p>
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
