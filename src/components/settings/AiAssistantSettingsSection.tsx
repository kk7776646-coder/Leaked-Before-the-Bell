import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Trash2,
  Edit2,
  RefreshCw,
  Power,
  Shield,
  Key,
  Globe,
  Bot,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  Zap,
  Play,
} from 'lucide-react';
import { api, AiProviderConfig, AiProviderPreset, AiConnectionTestResult } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const AiAssistantSettingsSection: React.FC = () => {
  const [providers, setProviders] = useState<AiProviderConfig[]>([]);
  const [presets, setPresets] = useState<AiProviderPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AiProviderConfig | null>(null);

  // Form State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('openai');
  const [modelDisplayName, setModelDisplayName] = useState<string>('GPT-4o (Production)');
  const [modelName, setModelName] = useState<string>('gpt-4o');
  const [modelId, setModelId] = useState<string>('gpt-4o');
  const [baseUrl, setBaseUrl] = useState<string>('https://api.openai.com/v1');
  const [useCustomBaseUrl, setUseCustomBaseUrl] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  // Testing & Discovery State
  const [isTestingInModal, setIsTestingInModal] = useState<boolean>(false);
  const [modalTestResult, setModalTestResult] = useState<AiConnectionTestResult | null>(null);
  const [isTestingCardId, setIsTestingCardId] = useState<string | null>(null);
  const [isDiscoveringModels, setIsDiscoveringModels] = useState<boolean>(false);
  const [discoveredModels, setDiscoveredModels] = useState<Array<{ id: string; name: string }>>([]);

  // Automated Test Suite State
  const [isRunningTestSuite, setIsRunningTestSuite] = useState(false);
  const [testSuiteReport, setTestSuiteReport] = useState<any | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [fetchedPresets, fetchedProviders] = await Promise.all([
        api.getAiPresets(),
        api.getAiProviders(),
      ]);
      setPresets(fetchedPresets);
      setProviders(fetchedProviders);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load AI provider configurations.');
    } finally {
      setIsLoading(false);
    }
  };

  const showFeedback = (success: string | null, error: string | null = null) => {
    if (success) {
      setSuccessMessage(success);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = (presetIdToUse = 'openai') => {
    setEditingProvider(null);
    const preset = presets.find((p) => p.id === presetIdToUse) || presets[0];
    
    setSelectedPresetId(preset?.id || 'openai');
    const firstModel = preset?.defaultModels?.[0];
    setModelDisplayName(firstModel ? `${preset.name} - ${firstModel.name}` : 'GPT-4o');
    setModelName(firstModel?.name || 'gpt-4o');
    setModelId(firstModel?.id || 'gpt-4o');
    setBaseUrl(preset?.defaultBaseUrl || 'https://api.openai.com/v1');
    setUseCustomBaseUrl(false);
    setApiKey('');
    setShowApiKey(false);
    setIsDefault(providers.length === 0);
    setIsEnabled(true);
    setModalTestResult(null);
    setDiscoveredModels([]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (provider: AiProviderConfig) => {
    setEditingProvider(provider);
    setSelectedPresetId(provider.providerId);
    setModelDisplayName(provider.modelDisplayName);
    setModelName(provider.modelName);
    setModelId(provider.modelId);
    setBaseUrl(provider.baseUrl);
    setUseCustomBaseUrl(provider.useCustomBaseUrl);
    setApiKey(''); // Blank indicates "keep existing stored key"
    setShowApiKey(false);
    setIsDefault(provider.isDefault);
    setIsEnabled(provider.enabled);
    setModalTestResult(null);
    setDiscoveredModels([]);
    setIsModalOpen(true);
  };

  // Handle Preset Change in Modal
  const handlePresetSelect = (newPresetId: string) => {
    setSelectedPresetId(newPresetId);
    const preset = presets.find((p) => p.id === newPresetId);
    if (!preset) return;

    if (!useCustomBaseUrl) {
      setBaseUrl(preset.defaultBaseUrl);
    }
    const firstModel = preset.defaultModels?.[0];
    if (firstModel) {
      setModelDisplayName(`${preset.name} - ${firstModel.name}`);
      setModelName(firstModel.name);
      setModelId(firstModel.id);
    }
    setModalTestResult(null);
    setDiscoveredModels([]);
  };

  // Handle Model Preset Select
  const handleModelPresetSelect = (selectedModelId: string) => {
    const preset = presets.find((p) => p.id === selectedPresetId);
    const m = preset?.defaultModels.find((mod) => mod.id === selectedModelId) ||
              discoveredModels.find((mod) => mod.id === selectedModelId);
    if (m) {
      setModelDisplayName(`${preset?.name || ''} - ${m.name}`);
      setModelName(m.name);
      setModelId(m.id);
    } else {
      setModelId(selectedModelId);
      setModelName(selectedModelId);
      setModelDisplayName(`${preset?.name || 'Custom'} - ${selectedModelId}`);
    }
  };

  // In-modal connection test
  const handleTestConnectionInModal = async () => {
    setIsTestingInModal(true);
    setModalTestResult(null);
    try {
      const result = await api.testAiConnection({
        providerId: selectedPresetId,
        modelId,
        baseUrl,
        apiKey: apiKey.trim() || undefined,
        useCustomBaseUrl,
        savedProviderId: editingProvider?.id,
      });
      setModalTestResult(result);
    } catch (err: any) {
      setModalTestResult({
        success: false,
        status: 'ERROR',
        error: err.message || 'Connection test failed',
      });
    } finally {
      setIsTestingInModal(false);
    }
  };

  // In-card connection test
  const handleTestConnectionCard = async (provider: AiProviderConfig) => {
    setIsTestingCardId(provider.id);
    try {
      const result = await api.testAiConnection({
        providerId: provider.providerId,
        modelId: provider.modelId,
        baseUrl: provider.baseUrl,
        useCustomBaseUrl: provider.useCustomBaseUrl,
        savedProviderId: provider.id,
      });

      if (result.success) {
        showFeedback(`Connection successful (${result.responseTimeMs}ms)`, null);
      } else {
        showFeedback(null, result.error || 'Connection failed');
      }
      await loadData();
    } catch (err: any) {
      showFeedback(null, err.message || 'Connection test failed');
      await loadData();
    } finally {
      setIsTestingCardId(null);
    }
  };

  // Discover Models
  const handleDiscoverModels = async () => {
    setIsDiscoveringModels(true);
    try {
      const res = await api.discoverAiModels({
        providerId: selectedPresetId,
        baseUrl,
        apiKey: apiKey.trim() || undefined,
        useCustomBaseUrl,
        savedProviderId: editingProvider?.id,
      });
      if (res.models && res.models.length > 0) {
        setDiscoveredModels(res.models);
        showFeedback(`Discovered ${res.models.length} models from provider endpoint.`, null);
      } else {
        showFeedback(null, 'No model identifiers discovered from endpoint.');
      }
    } catch (err: any) {
      showFeedback(null, err.message || 'Failed to query models from provider.');
    } finally {
      setIsDiscoveringModels(false);
    }
  };

  // Save Provider
  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelDisplayName.trim() || !modelId.trim()) {
      showFeedback(null, 'Display name and Model Identifier are required.');
      return;
    }

    try {
      await api.saveAiProvider({
        id: editingProvider?.id,
        providerId: selectedPresetId,
        modelDisplayName: modelDisplayName.trim(),
        modelName: modelName.trim() || modelId.trim(),
        modelId: modelId.trim(),
        baseUrl: baseUrl.trim(),
        useCustomBaseUrl,
        apiKey: apiKey.trim() || undefined,
        isDefault,
        enabled: isEnabled,
        status: modalTestResult?.success ? 'CONNECTED' : undefined,
      });

      setIsModalOpen(false);
      showFeedback(`Successfully saved AI Assistant provider "${modelDisplayName}".`, null);
      await loadData();
    } catch (err: any) {
      showFeedback(null, err.message || 'Failed to save configuration.');
    }
  };

  // Set as Default
  const handleSetDefault = async (id: string, name: string) => {
    try {
      await api.setDefaultAiProvider(id);
      showFeedback(`Set "${name}" as the default active AI provider.`, null);
      await loadData();
    } catch (err: any) {
      showFeedback(null, err.message || 'Failed to set default provider.');
    }
  };

  // Toggle Provider
  const handleToggle = async (id: string, currentEnabled: boolean, name: string) => {
    try {
      await api.toggleAiProvider(id, !currentEnabled);
      showFeedback(`${!currentEnabled ? 'Enabled' : 'Disabled'} "${name}".`, null);
      await loadData();
    } catch (err: any) {
      showFeedback(null, err.message || 'Failed to toggle provider.');
    }
  };

  // Delete Provider
  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  // Run Automated 27-Scenario Test Suite
  const handleRunTestSuite = async () => {
    setIsRunningTestSuite(true);
    try {
      const report = await api.runAiAssistantTestSuite();
      setTestSuiteReport(report);
      showFeedback(`Test Suite completed: ${report.passedCount}/${report.totalTests} tests passed.`, null);
    } catch (err: any) {
      showFeedback(null, err.message || 'Failed to execute test suite.');
    } finally {
      setIsRunningTestSuite(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Connection Error
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Power className="w-3.5 h-3.5" />
            Disabled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Not Tested
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/60">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  AI Assistant Provider Configuration
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRunTestSuite}
                disabled={isRunningTestSuite}
                className="text-xs"
              >
                <Play className={`w-3.5 h-3.5 mr-1.5 ${isRunningTestSuite ? 'animate-spin' : ''}`} />
                {isRunningTestSuite ? 'Running Tests...' : 'Run Test Suite (27 Checks)'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenAddModal('openai')}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Provider
              </Button>
            </div>
          </div>
        }
        subtitle="Manage LLM inference endpoints, API credentials, and multi-vector reasoning models for the LeakLens AI Assistant."
      >
        {/* Security Notice */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 mb-5">
          <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Security Architecture:</strong> API credentials are encrypted and retained strictly server-side in memory/vault. Keys are never transmitted to browser local storage or exposed in client responses.
          </div>
        </div>

        {/* Provider List */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Loading AI provider configurations...</span>
          </div>
        ) : providers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              No AI Assistant Provider Configured
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              Connect an official provider (OpenAI, Google Gemini, Anthropic, OpenRouter, or Custom) to enable contextual queries, forensic comparisons, and intelligent leak explanations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleOpenAddModal(preset.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  Add {preset.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((p) => {
              const preset = presets.find((pre) => pre.id === p.providerId);
              const isCardTesting = isTestingCardId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all ${
                    p.isDefault
                      ? 'border-blue-300 dark:border-blue-700/80 bg-blue-50/20 dark:bg-blue-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs uppercase">
                        {p.providerId.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {p.modelDisplayName}
                          </h4>
                          {p.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              DEFAULT
                            </span>
                          )}
                          {getStatusBadge(p.status)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            Provider: <strong className="text-slate-700 dark:text-slate-300">{preset?.name || p.providerId}</strong>
                          </span>
                          <span>
                            Model ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-slate-800 dark:text-slate-200">{p.modelId}</code>
                          </span>
                          {p.maskedApiKey && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Key className="w-3 h-3" />
                              <code>{p.maskedApiKey}</code>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTestConnectionCard(p)}
                        disabled={isCardTesting}
                        className="text-xs h-8"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isCardTesting ? 'animate-spin' : ''}`} />
                        {isCardTesting ? 'Testing...' : 'Test'}
                      </Button>
                      {!p.isDefault && p.enabled && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetDefault(p.id, p.modelDisplayName)}
                          className="text-xs h-8 text-blue-600 dark:text-blue-400"
                        >
                          Set Default
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggle(p.id, p.enabled, p.modelDisplayName)}
                        title={p.enabled ? 'Disable provider' : 'Enable provider'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          p.enabled
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        title="Edit Configuration"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.modelDisplayName)}
                        title="Delete Configuration"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Endpoint info */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-md font-mono">{p.baseUrl || preset?.defaultBaseUrl}</span>
                      {p.useCustomBaseUrl && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Custom URL
                        </span>
                      )}
                    </div>
                    <div>
                      {p.lastTestedAt ? (
                        <span>
                          Last verified: {new Date(p.lastTestedAt).toLocaleTimeString()}{' '}
                          {p.lastResponseTimeMs ? `(${p.lastResponseTimeMs}ms)` : ''}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">Not verified yet</span>
                      )}
                    </div>
                  </div>

                  {/* Error Alert Box if any */}
                  {p.status === 'ERROR' && p.lastError && (
                    <div className="mt-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong>Connection failure:</strong> {p.lastError}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Automated Test Suite Report */}
      {testSuiteReport && (
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold">AI Assistant Test Suite Report (27 Scenarios)</span>
              </div>
              <Badge variant={testSuiteReport.failedCount === 0 ? 'success' : 'danger'}>
                {testSuiteReport.passedCount} / {testSuiteReport.totalTests} PASSED
              </Badge>
            </div>
          }
          subtitle={`Executed on ${new Date(testSuiteReport.timestamp).toLocaleString()}`}
        >
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {testSuiteReport.results?.map((res: any) => (
              <div
                key={res.id}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                  res.status === 'PASSED'
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                    {res.id}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {res.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {res.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">{res.details}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{res.durationMs}ms</span>
                  {res.status === 'PASSED' ? (
                    <Badge variant="success" size="sm">PASS</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">FAIL</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Provider Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {editingProvider ? 'Edit AI Provider' : 'Add AI Assistant Provider'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure connection endpoint, model identifiers, and API keys.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="p-5 space-y-4">
              {/* Preset Provider Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Provider Ecosystem
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 font-medium'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-semibold">{preset.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{preset.defaultBaseUrl}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Model Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={modelDisplayName}
                  onChange={(e) => setModelDisplayName(e.target.value)}
                  placeholder="e.g. OpenAI GPT-4o (Primary Examiner)"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {/* Quick-Fill Preset Option */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quick-Fill from Presets (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={handleDiscoverModels}
                    disabled={isDiscoveringModels}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isDiscoveringModels ? 'animate-spin' : ''}`} />
                    Discover API
                  </button>
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      handleModelPresetSelect(val);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="">-- Select a preset to auto-fill fields --</option>
                  {discoveredModels.length > 0 ? (
                    discoveredModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.id}
                      </option>
                    ))
                  ) : (
                    presets
                      .find((p) => p.id === selectedPresetId)
                      ?.defaultModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      ))
                  )}
                </select>
              </div>

              {/* Model Registry ID & Model ID manual inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model Registry ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. OpenAI GPT-4o"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="e.g. gpt-4o or gemini-2.5-flash"
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              {/* Base URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Endpoint Base URL
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomBaseUrl}
                      onChange={(e) => setUseCustomBaseUrl(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Custom Base URL</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  disabled={!useCustomBaseUrl && selectedPresetId !== 'custom'}
                  placeholder="https://api.openai.com/v1"
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    !useCustomBaseUrl && selectedPresetId !== 'custom'
                      ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Key / Secret Token
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      editingProvider?.hasApiKey
                        ? '•••••••••••••••• (Leave blank to keep existing key)'
                        : 'Enter provider API key (sk-...)'
                    }
                    className="w-full pl-3 pr-10 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Keys are stored exclusively in the secure server backend and never exposed in browser storage or network logs.
                </p>
              </div>

              {/* Flags */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Set as default active Assistant provider</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Enable immediately</span>
                </label>
              </div>

              {/* Modal Connection Test Feedback */}
              {modalTestResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    modalTestResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {modalTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">
                    {modalTestResult.success ? (
                      <span>
                        <strong>Connection verified:</strong> Endpoint responded in {modalTestResult.responseTimeMs}ms using model <code>{modelId}</code>.
                      </span>
                    ) : (
                      <span>
                        <strong>Connection failed:</strong> {modalTestResult.error}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleTestConnectionInModal}
                  disabled={isTestingInModal}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isTestingInModal ? 'animate-spin' : ''}`} />
                  {isTestingInModal ? 'Testing...' : 'Test Connection'}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Configuration
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete the configuration for <strong className="text-slate-800 dark:text-slate-200">"{deleteConfirmation.name}"</strong>? This action is permanent.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="w-24 text-xs cursor-pointer"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-24 bg-rose-600 hover:bg-rose-700 text-white border-rose-600 hover:border-rose-700 text-xs shadow-sm hover:shadow-md cursor-pointer"
                onClick={async () => {
                  const { id, name } = deleteConfirmation;
                  setDeleteConfirmation(null);
                  try {
                    await api.deleteAiProvider(id);
                    showFeedback(`Deleted provider "${name}".`, null);
                    await loadData();
                  } catch (err: any) {
                    showFeedback(null, err.message || 'Failed to delete provider.');
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
