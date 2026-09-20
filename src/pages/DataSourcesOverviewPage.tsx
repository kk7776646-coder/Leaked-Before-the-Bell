import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ResponsiveContainer } from '../components/common/ResponsiveContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SocialPlatformIcon } from '../components/common/SocialPlatformIcon';
import { StatusIcon } from '../components/common/StatusIcon';
import { 
  Bell, 
  Radio, 
  CheckCircle2, 
  Shield, 
  RefreshCw, 
  Unplug, 
  Wrench, 
  Play, 
  Square, 
  AlertTriangle, 
  FileText, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface SourceConnection {
  id: string;
  name: string;
  platform: string;
  type: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'NOT_CONFIGURED' | 'DISABLED';
  sourceCount: number;
  lastCollection: string;
  channel: string;
  itemsScanned: string;
  latency: string;
}

interface CollectedItem {
  id: string;
  source: string;
  content: string;
  contentType: string;
  status: string;
  detectedTime: string;
  risk: string;
}

export const DataSourcesOverviewPage: React.FC = () => {
  const [globalMonitoring, setGlobalMonitoring] = useState<boolean>(true);
  const [sources, setSources] = useState<SourceConnection[]>([
    { id: 'src-1', name: 'Telegram Monitoring Bots', platform: 'Telegram', type: 'Instant Messaging', status: 'CONNECTED', sourceCount: 4, lastCollection: '4 min ago', channel: '@leak_alert_bot', itemsScanned: '48,290 today', latency: '120ms' },
    { id: 'src-2', name: 'Instagram Study Groups Monitor', platform: 'Instagram', type: 'Social Media', status: 'CONNECTED', sourceCount: 2, lastCollection: '12 min ago', channel: '@exam_secure_feed', itemsScanned: '8,400 today', latency: '180ms' },
    { id: 'src-3', name: 'WhatsApp Study Broadcasts', platform: 'WhatsApp', type: 'Encrypted Gateway', status: 'CONNECTED', sourceCount: 3, lastCollection: '8 min ago', channel: 'Broadcast #402', itemsScanned: '19,200 today', latency: '150ms' },
    { id: 'src-4', name: 'Facebook Campus Feed Crawler', platform: 'Facebook', type: 'Social Media', status: 'DISCONNECTED', sourceCount: 0, lastCollection: '2 days ago', channel: 'University Leak Watch', itemsScanned: '0 today', latency: 'N/A' },
    { id: 'src-5', name: 'X (Twitter) Leak Alert Stream', platform: 'X', type: 'Microblogging', status: 'CONNECTED', sourceCount: 5, lastCollection: '1 min ago', channel: '@exampaper_alert', itemsScanned: '24,100 today', latency: '95ms' },
    { id: 'src-6', name: 'Reddit r/HomeworkHelp & Leaks', platform: 'Reddit', type: 'Community Forum', status: 'CONNECTED', sourceCount: 1, lastCollection: '15 min ago', channel: 'r/examprep_security', itemsScanned: '11,400 today', latency: '240ms' },
  ]);

  const [disconnectTarget, setDisconnectTarget] = useState<SourceConnection | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const recentCollected: CollectedItem[] = [
    { id: 'COL-901', source: 'Telegram', content: 'CS501 Study Forum Questions.pdf', contentType: 'PDF', status: 'Processed & Indexed', detectedTime: '4 min ago', risk: 'High' },
    { id: 'COL-902', source: 'Instagram', content: 'Question Set #4 Screenshot', contentType: 'Single Question', status: 'Pending Review', detectedTime: '12 min ago', risk: 'Medium' },
    { id: 'COL-903', source: 'X', content: 'Midterm Exam Leak Post', contentType: 'Social Post', status: 'Flagged for Forensics', detectedTime: '25 min ago', risk: 'High' },
    { id: 'COL-904', source: 'WhatsApp', content: 'Physics 202 Final Formula Sheet', contentType: 'Document Image', status: 'Verified Clean', detectedTime: '42 min ago', risk: 'Low' },
  ];

  const handleTestConnection = (name: string) => {
    setToast(`Test connection successful for ${name} (Latency: 95ms).`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleReconnect = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, status: 'CONNECTED', lastCollection: 'Just now' } : s));
    setToast(`Successfully reconnected source.`);
    setTimeout(() => setToast(null), 4000);
  };

  const confirmDisconnect = () => {
    if (!disconnectTarget) return;
    setSources(prev => prev.map(s => s.id === disconnectTarget.id ? { ...s, status: 'DISCONNECTED', sourceCount: 0 } : s));
    setToast(`Disconnected ${disconnectTarget.name}. Previously collected items and reviews remain intact.`);
    setDisconnectTarget(null);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <ResponsiveContainer>
      {toast && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-600 hover:text-emerald-800 font-bold px-2">×</button>
        </div>
      )}

      <PageHeader
        title="Social Media (Auto)"
        description="Monitor authorized public sources, Telegram channels, Instagram feeds, WhatsApp broadcasts, and social media platforms for exam-question content."
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Global Monitoring:</span>
              <button
                onClick={() => setGlobalMonitoring(!globalMonitoring)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  globalMonitoring ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    globalMonitoring ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-bold ${globalMonitoring ? 'text-emerald-600' : 'text-slate-400'}`}>
                {globalMonitoring ? 'ON' : 'OFF'}
              </span>
            </div>
            <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />}>
              Sync All Sources
            </Button>
          </div>
        }
      />

      {/* Connections & Sources Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" /> Authorized Source Connections
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {sources.filter(s => s.status === 'CONNECTED').length} of {sources.length} sources active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          {sources.map((src) => {
            const isConnected = src.status === 'CONNECTED';
            return (
              <Card key={src.id} className="flex flex-col justify-between font-sans relative overflow-hidden">
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

                <div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <div className="flex items-center gap-2">
                      <SocialPlatformIcon platform={src.platform} size={18} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {src.platform}
                      </span>
                    </div>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isConnected ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <StatusIcon status={src.status} size={12} className="mr-1" /> {src.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">{src.name}</h3>
                  <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">{src.channel}</div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span>Configured Sources:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{src.sourceCount} channels/feeds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Collection:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{src.lastCollection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{src.itemsScanned}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTestConnection(src.name)}>
                        Test
                      </Button>
                      <Button variant="outline" size="sm" icon={<Wrench className="w-3.5 h-3.5" />}>
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                        icon={<Unplug className="w-3.5 h-3.5" />}
                        onClick={() => setDisconnectTarget(src)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleReconnect(src.id)}
                    >
                      Connect Source
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Collected Items Section */}
      <Card title="Recent Collected Items" subtitle="Real-time raw inbound capture from authorized public channels prior to forensic analysis.">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Content Name</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Collection Status</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 font-semibold text-right">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentCollected.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <SocialPlatformIcon platform={item.source} size={14} />
                    <span>{item.source}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{item.content}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                      {item.contentType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.status}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                      item.risk === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50' :
                      item.risk === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                    }`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">{item.detectedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Disconnect Confirmation Modal */}
      {disconnectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <Unplug className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                Disconnect this source?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                New content will no longer be collected from <strong className="text-slate-700 dark:text-slate-300">{disconnectTarget.name}</strong>. Previously collected items, alerts, analyses, and reviews will remain completely intact.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setDisconnectTarget(null)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={confirmDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};
