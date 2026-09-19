import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { Bell, Radio, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

export const DataSourcesOverviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const sources = [
    { name: 'Telegram Monitoring Bots', platform: 'Telegram', type: 'Instant Messaging', status: 'Connected', itemsScanned: '48,290 today', latency: '120ms', channel: '@leak_alert_bot' },
    { name: 'Instagram Study Groups Monitor', platform: 'Instagram', type: 'Social Media', status: 'Connected', itemsScanned: '8,400 today', latency: '180ms', channel: '@exam_secure_feed' },
    { name: 'WhatsApp Study Broadcasts', platform: 'WhatsApp', type: 'Encrypted Gateway', status: 'Connected', itemsScanned: '19,200 today', latency: '150ms', channel: 'Broadcast #402' },
    { name: 'Facebook Campus Feed Crawler', platform: 'Facebook', type: 'Social Media', status: 'Connected', itemsScanned: '5,120 today', latency: '210ms', channel: 'University Leak Watch' },
    { name: 'X (Twitter) Leak Alert Stream', platform: 'X', type: 'Microblogging', status: 'Connected', itemsScanned: '24,100 today', latency: '95ms', channel: '@exampaper_alert' },
    { name: 'Reddit r/HomeworkHelp & Leaks', platform: 'Reddit', type: 'Community Forum', status: 'Connected', itemsScanned: '11,400 today', latency: '240ms', channel: 'r/examprep_security' },
    { name: 'Darknet Pastebin & Dump Crawlers', platform: 'Other', type: 'Deep Web', status: 'Connected', itemsScanned: '1,420 today', latency: '450ms', channel: 'TOR Hidden Gateway' },
  ];

  const tabs = ['All', 'Telegram', 'Instagram', 'Facebook', 'WhatsApp', 'X', 'Reddit', 'Other'];

  const filtered = activeTab === 'All' ? sources : sources.filter(s => s.platform.toLowerCase() === activeTab.toLowerCase());

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Social Media (Auto)"
        description="Configure and monitor live crawling connectors, Telegram channels, Instagram feeds, WhatsApp broadcasts, and social media platforms."
        action={
          <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />}>
            Sync All Sources
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab !== 'All' && <SocialPlatformIcon platform={tab} size={14} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
        {filtered.map((src, i) => (
          <Card key={i} className="flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SocialPlatformIcon platform={src.platform} size={18} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {src.platform}
                  </span>
                </div>
                <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                  <StatusIcon status={src.status} size={14} className="mr-1" /> {src.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{src.name}</h3>
              <div className="text-xs font-mono text-slate-500 mb-2">{src.channel}</div>
              <p className="text-xs text-slate-500">Scanned: {src.itemsScanned} • Latency: {src.latency}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-sans">AES-256 Secured Stream</span>
              <Button variant="outline" size="sm">
                Configure Connector
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ResponsiveContainer>
  );
};
