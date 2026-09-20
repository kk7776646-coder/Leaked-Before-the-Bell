import {
  AiProviderPreset,
  AiProviderConfig,
  AiConnectionTestResult,
  AiModelPreset,
} from './types';

// ==========================================================
// AI ASSISTANT PROVIDER REGISTRY & PRESETS
// Maintained registry of official endpoints and configurations
// ==========================================================

export const AI_PROVIDER_PRESETS: AiProviderPreset[] = [
  {
    id: 'openai',
    displayName: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    documentationUrl: 'https://platform.openai.com/docs/api-reference',
    apiStyle: 'OPENAI_COMPATIBLE',
    requiresApiKey: true,
    supportsModelId: true,
    supportsCustomBaseUrl: true,
    supportsModelDiscovery: true,
    defaultModels: [
      {
        id: 'gpt-4o',
        name: 'gpt-4o',
        displayName: 'GPT-4o (High Intelligence & Multimodal)',
        description: 'Flagship model for multi-step forensic reasoning and exam verification.',
      },
      {
        id: 'gpt-4o-mini',
        name: 'gpt-4o-mini',
        displayName: 'GPT-4o Mini (Fast & Cost-Efficient)',
        description: 'Lightweight model for instant status queries and evidence extraction.',
      },
      {
        id: 'o3-mini',
        name: 'o3-mini',
        displayName: 'o3-mini (Advanced Reasoning)',
        description: 'Deep reasoning model for subtle question match discrepancy analysis.',
      },
      {
        id: 'gpt-4-turbo',
        name: 'gpt-4-turbo',
        displayName: 'GPT-4 Turbo',
        description: 'Reliable high-throughput model with full context capability.',
      },
    ],
    description: 'Official OpenAI API platform for GPT-4o, GPT-4o-mini, and reasoning models.',
  },
  {
    id: 'gemini',
    displayName: 'Google Gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    documentationUrl: 'https://ai.google.dev/gemini-api/docs',
    apiStyle: 'GEMINI',
    requiresApiKey: true,
    supportsModelId: true,
    supportsCustomBaseUrl: true,
    supportsModelDiscovery: true,
    defaultModels: [
      {
        id: 'gemini-2.5-flash',
        name: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash (Recommended Default)',
        description: 'Next-gen multimodal reasoning with rapid inference and extended context.',
      },
      {
        id: 'gemini-2.5-pro',
        name: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro (Deep Examination Analysis)',
        description: 'Advanced reasoning model specialized for complex academic document analysis.',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        description: 'Production high-frequency assistant model.',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        description: 'Massive context window model for large bundle analysis.',
      },
    ],
    description: 'Google AI Gemini API providing multimodal reasoning and large-context document analysis.',
  },
  {
    id: 'anthropic',
    displayName: 'Anthropic Claude',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    documentationUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
    apiStyle: 'ANTHROPIC',
    requiresApiKey: true,
    supportsModelId: true,
    supportsCustomBaseUrl: true,
    supportsModelDiscovery: false,
    defaultModels: [
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'claude-3-7-sonnet-20250219',
        displayName: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
        description: 'Top-tier reasoning model for detailed forensic comparison and nuanced reporting.',
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet v2',
        description: 'Precise structured output and high document comprehension accuracy.',
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'claude-3-5-haiku-20241022',
        displayName: 'Claude 3.5 Haiku',
        description: 'Ultra-fast, responsive assistant for instant query resolution.',
      },
    ],
    description: 'Anthropic Claude Messages API for highly accurate, hallucination-resistant responses.',
  },
  {
    id: 'openrouter',
    displayName: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    documentationUrl: 'https://openrouter.ai/docs/quick-start',
    apiStyle: 'OPENAI_COMPATIBLE',
    requiresApiKey: true,
    supportsModelId: true,
    supportsCustomBaseUrl: true,
    supportsModelDiscovery: true,
    defaultModels: [
      {
        id: 'openai/gpt-4o',
        name: 'openai/gpt-4o',
        displayName: 'OpenAI: GPT-4o (via OpenRouter)',
        description: 'Routed OpenAI flagship model.',
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'anthropic/claude-3.5-sonnet',
        displayName: 'Anthropic: Claude 3.5 Sonnet (via OpenRouter)',
        description: 'Routed Claude model.',
      },
      {
        id: 'google/gemini-2.0-flash-001',
        name: 'google/gemini-2.0-flash-001',
        displayName: 'Google: Gemini 2.0 Flash (via OpenRouter)',
        description: 'Routed Gemini model.',
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'meta-llama/llama-3.3-70b-instruct',
        displayName: 'Meta: Llama 3.3 70B Instruct',
        description: 'High performance open-weights model.',
      },
    ],
    description: 'Unified gateway providing unified access to 200+ AI models through an OpenAI-compatible interface.',
  },
  {
    id: 'custom',
    displayName: 'Custom (OpenAI-compatible)',
    defaultBaseUrl: 'http://localhost:11434/v1',
    documentationUrl: 'https://github.com/ollama/ollama/blob/main/docs/openai.md',
    apiStyle: 'OPENAI_COMPATIBLE',
    requiresApiKey: false,
    supportsModelId: true,
    supportsCustomBaseUrl: true,
    supportsModelDiscovery: true,
    defaultModels: [
      {
        id: 'llama3.2',
        name: 'llama3.2',
        displayName: 'Local Llama 3.2 (Ollama)',
        description: 'Local on-premise model running on local port 11434.',
      },
      {
        id: 'mistral',
        name: 'mistral',
        displayName: 'Local Mistral (Ollama)',
        description: 'Self-hosted privacy-focused local model.',
      },
      {
        id: 'qwen2.5',
        name: 'qwen2.5',
        displayName: 'Local Qwen 2.5 (vLLM / LM Studio)',
        description: 'Local OpenAI-compatible inference server.',
      },
    ],
    description: 'Connect self-hosted instances (Ollama, vLLM, LM Studio, LocalAI) or enterprise proxy gateways.',
  },
];

export class AiAssistantRegistry {
  /**
   * Returns list of all supported provider presets with maintained official default URLs.
   */
  public static getPresets(): AiProviderPreset[] {
    return AI_PROVIDER_PRESETS;
  }

  /**
   * Retrieves a specific preset by provider ID.
   */
  public static getPresetById(providerId: string): AiProviderPreset | undefined {
    return AI_PROVIDER_PRESETS.find((p) => p.id === providerId);
  }

  /**
   * Sanitizes an error message so that no API keys or private tokens are leaked in logs or responses.
   */
  public static sanitizeErrorMessage(errMessage: string, apiKey?: string): string {
    if (!errMessage) return 'Unknown connection failure';
    let safe = errMessage;
    if (apiKey && apiKey.length > 4) {
      safe = safe.split(apiKey).join('[REDACTED_API_KEY]');
    }
    // Mask potential bearer tokens or keys matching patterns
    safe = safe.replace(/Bearer\s+[A-Za-z0-9_\-\.]{8,}/gi, 'Bearer [REDACTED]');
    safe = safe.replace(/key=[A-Za-z0-9_\-\.]{8,}/gi, 'key=[REDACTED]');
    safe = safe.replace(/sk-[A-Za-z0-9_\-]{8,}/gi, 'sk-[REDACTED]');
    return safe;
  }

  /**
   * Performs a REAL, authentic backend connection test against the AI provider.
   * Never mocks or simulates success. Measures true latency.
   */
  public static async testConnection(params: {
    providerId: string;
    modelId: string;
    baseUrl?: string;
    apiKey?: string;
    useCustomBaseUrl?: boolean;
  }): Promise<AiConnectionTestResult> {
    const preset = this.getPresetById(params.providerId);
    const providerName = preset?.displayName || params.providerId;
    const effectiveBaseUrl = (params.useCustomBaseUrl && params.baseUrl ? params.baseUrl : (preset?.defaultBaseUrl || params.baseUrl || '')).replace(/\/+$/, '');

    if (!effectiveBaseUrl) {
      throw new Error(`Base URL is missing for provider ${providerName}.`);
    }

    if (preset?.requiresApiKey && !params.apiKey && !(params.providerId === 'gemini' && process.env.GEMINI_API_KEY)) {
      throw new Error(`API key is required for ${providerName}.`);
    }

    const effectiveApiKey = params.apiKey || (params.providerId === 'gemini' ? process.env.GEMINI_API_KEY : '');

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    try {
      if (preset?.apiStyle === 'GEMINI' || params.providerId === 'gemini') {
        // Real Gemini API Connection Ping
        const testEndpoint = `${effectiveBaseUrl}/models?key=${encodeURIComponent(effectiveApiKey || '')}`;
        const response = await fetch(testEndpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const duration = Date.now() - startTime;
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData: any = await response.json().catch(() => ({}));
          const errDetail = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          throw new Error(`Google Gemini connection rejected: ${this.sanitizeErrorMessage(errDetail, params.apiKey)}`);
        }

        const data: any = await response.json().catch(() => ({}));
        const modelsList = Array.isArray(data?.models) ? data.models : [];
        const modelFound = modelsList.some((m: any) => m.name?.includes(params.modelId) || m.displayName?.includes(params.modelId));

        return {
          success: true,
          provider: providerName,
          model: params.modelId,
          responseTimeMs: duration,
          message: `Connection successful. Gemini API validated in ${duration}ms${modelFound ? ' (Model verified)' : ''}.`,
          testedAt: new Date().toISOString(),
          details: {
            availableModelsCount: modelsList.length,
          },
        };
      } else if (preset?.apiStyle === 'ANTHROPIC' || params.providerId === 'anthropic') {
        // Real Anthropic Messages API Ping
        const testEndpoint = `${effectiveBaseUrl}/messages`;
        const response = await fetch(testEndpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': params.apiKey || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: params.modelId || 'claude-3-5-haiku-20241022',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'ping' }],
          }),
        });

        const duration = Date.now() - startTime;
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData: any = await response.json().catch(() => ({}));
          const errDetail = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          throw new Error(`Anthropic connection rejected: ${this.sanitizeErrorMessage(errDetail, params.apiKey)}`);
        }

        return {
          success: true,
          provider: providerName,
          model: params.modelId,
          responseTimeMs: duration,
          message: `Connection successful. Anthropic Claude API validated in ${duration}ms.`,
          testedAt: new Date().toISOString(),
        };
      } else {
        // OpenAI / OpenRouter / Custom OpenAI-compatible Ping
        // Try /models first for discovery, fallback to minimal completion if /models is restricted
        const modelsEndpoint = `${effectiveBaseUrl}/models`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (params.apiKey) {
          headers['Authorization'] = `Bearer ${params.apiKey}`;
        }
        if (params.providerId === 'openrouter') {
          headers['HTTP-Referer'] = 'https://leaklens.internal';
          headers['X-Title'] = 'LeakLens Exam Security';
        }

        let response = await fetch(modelsEndpoint, {
          method: 'GET',
          headers,
          signal: controller.signal,
        }).catch(() => null);

        // If /models returned 404 or 405 (some local servers only have /chat/completions), test /chat/completions
        if (!response || (!response.ok && response.status !== 401 && response.status !== 403)) {
          const chatEndpoint = `${effectiveBaseUrl}/chat/completions`;
          response = await fetch(chatEndpoint, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify({
              model: params.modelId || 'gpt-4o-mini',
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1,
            }),
          });
        }

        const duration = Date.now() - startTime;
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData: any = await response.json().catch(() => ({}));
          const errDetail = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
          throw new Error(`${providerName} connection rejected: ${this.sanitizeErrorMessage(errDetail, params.apiKey)}`);
        }

        return {
          success: true,
          provider: providerName,
          model: params.modelId,
          responseTimeMs: duration,
          message: `Connection successful. ${providerName} endpoint validated in ${duration}ms.`,
          testedAt: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const safeMessage = this.sanitizeErrorMessage(
        err.name === 'AbortError' ? 'Connection timed out after 12 seconds.' : (err.message || 'Connection failed.'),
        params.apiKey
      );
      throw new Error(safeMessage);
    }
  }

  /**
   * Discovers available models directly from the provider API if supported.
   */
  public static async discoverModels(params: {
    providerId: string;
    baseUrl?: string;
    apiKey?: string;
    useCustomBaseUrl?: boolean;
  }): Promise<AiModelPreset[]> {
    const preset = this.getPresetById(params.providerId);
    const effectiveBaseUrl = (params.useCustomBaseUrl && params.baseUrl ? params.baseUrl : (preset?.defaultBaseUrl || params.baseUrl || '')).replace(/\/+$/, '');

    if (!effectiveBaseUrl) {
      throw new Error(`Base URL is missing.`);
    }

    if (preset?.apiStyle === 'GEMINI') {
      if (!params.apiKey) throw new Error('API key is required to discover Gemini models.');
      const response = await fetch(`${effectiveBaseUrl}/models?key=${encodeURIComponent(params.apiKey)}`);
      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new Error(this.sanitizeErrorMessage(err?.error?.message || 'Failed to fetch models from Gemini', params.apiKey));
      }
      const data: any = await response.json();
      const list = Array.isArray(data?.models) ? data.models : [];
      return list
        .filter((m: any) => m.name && (m.supportedGenerationMethods?.includes('generateContent') || !m.supportedGenerationMethods))
        .map((m: any) => {
          const rawId = m.name.replace(/^models\//, '');
          return {
            id: rawId,
            name: rawId,
            displayName: m.displayName || rawId,
            description: m.description?.slice(0, 100) || 'Gemini model',
          };
        });
    } else if (preset?.apiStyle === 'OPENAI_COMPATIBLE' || params.providerId === 'openrouter' || params.providerId === 'custom' || params.providerId === 'openai') {
      const headers: Record<string, string> = {};
      if (params.apiKey) headers['Authorization'] = `Bearer ${params.apiKey}`;
      if (params.providerId === 'openrouter') {
        headers['HTTP-Referer'] = 'https://leaklens.internal';
        headers['X-Title'] = 'LeakLens';
      }

      const response = await fetch(`${effectiveBaseUrl}/models`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const err: any = await response.json().catch(() => ({}));
        throw new Error(this.sanitizeErrorMessage(err?.error?.message || 'Failed to query /models endpoint', params.apiKey));
      }

      const data: any = await response.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
      return list.map((m: any) => ({
        id: m.id || m.name,
        name: m.id || m.name,
        displayName: m.name || m.id,
        description: m.description || `Context: ${m.context_length || 'standard'} tokens`,
      }));
    } else {
      // Anthropic does not have a public /models discovery endpoint; return default presets
      return preset?.defaultModels || [];
    }
  }
}
