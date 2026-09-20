import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  X,
  Send,
  Trash2,
  Settings,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  LoaderCircle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import {
  api,
  AiChatMessage,
  AiAssistantContext,
  AiProviderConfig,
  AiSuggestedAction,
} from '../../services/api';
import { Button } from '../common/Button';
import { useAssistant } from './AssistantContext';

export const AiAssistantDrawer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isOpen,
    drawerWidth,
    isDragging,
    dragWidth,
    closeAssistant,
    setDrawerWidth,
    startResizeDrag,
    updateResizeDrag,
    endResizeDrag,
    pageContext,
  } = useAssistant();

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AiProviderConfig | null>(null);
  const [hasLoadedProvider, setHasLoadedProvider] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const isResizePointerDownRef = useRef(false);

  // Fetch active default provider on open
  useEffect(() => {
    if (isOpen) {
      loadActiveProvider();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll on new messages if not scrolled up
  useEffect(() => {
    if (isOpen && !isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending, isScrolledUp]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeAssistant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAssistant]);

  const loadActiveProvider = async () => {
    try {
      const providers = await api.getAiProviders();
      const defaultProv = Array.isArray(providers)
        ? providers.find((p) => p && p.isDefault && p.enabled) || null
        : null;
      setActiveProvider(defaultProv);
    } catch (err) {
      console.warn('Could not load active AI provider, operating in local mode:', err);
    } finally {
      setHasLoadedProvider(true);
    }
  };

  // Build context object based on current route and pageContext
  const getActiveContext = useCallback((): AiAssistantContext => {
    const pathname = location.pathname;
    const ctx: AiAssistantContext = {
      currentRoute: pathname,
      ...pageContext,
    };

    if (pathname.startsWith('/detected-content/')) {
      const id = pathname.split('/')[2];
      if (id) ctx.selectedDetectedContentId = id;
    } else if (pathname.startsWith('/candidates/')) {
      const id = pathname.split('/')[2];
      if (id) ctx.selectedDetectedContentId = id;
    }

    return ctx;
  }, [location.pathname, pageContext]);

  // Context Header Label
  const getContextLabel = useCallback(() => {
    const ctx = getActiveContext();
    if (ctx.selectedDetectedContentId) {
      const pageInfo = ctx.pageNumber ? ` · Page ${ctx.pageNumber}` : '';
      return `Detected Content · ${ctx.selectedDetectedContentId}${pageInfo}`;
    }
    if (ctx.selectedRealPaperId) {
      return `Real Paper · ${ctx.selectedRealPaperId}`;
    }
    if (ctx.selectedHistoricalPaperId) {
      return `Historical Paper · ${ctx.selectedHistoricalPaperId}`;
    }
    if (ctx.selectedAlertId) {
      return `Alert · ${ctx.selectedAlertId}`;
    }
    if (ctx.selectedReviewId) {
      return `Review Item · ${ctx.selectedReviewId}`;
    }
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      return 'Dashboard Overview';
    }
    if (location.pathname === '/detected-content') {
      return 'Detected Content Explorer';
    }
    if (location.pathname === '/alerts') {
      return 'Live Alerts Feed';
    }
    if (location.pathname === '/review') {
      return 'Human Review Queue';
    }
    if (location.pathname === '/historical') {
      return 'Historical Paper Vault';
    }
    if (location.pathname === '/real-papers') {
      return 'Verified Real Papers Vault';
    }
    if (location.pathname === '/metadata') {
      return 'Exam Metadata Matrix';
    }
    if (location.pathname === '/sources') {
      return 'Social Monitoring Sources';
    }
    if (location.pathname.startsWith('/settings')) {
      return 'System Settings';
    }
    return location.pathname;
  }, [getActiveContext, location.pathname]);

  // Contextual Suggested Questions for Empty State
  const getSuggestedQuestions = useCallback((): string[] => {
    const pathname = location.pathname;
    const ctx = getActiveContext();

    if (ctx.selectedDetectedContentId || pathname.startsWith('/detected-content/') || pathname.startsWith('/candidates/')) {
      return [
        'Why was this content flagged?',
        'Show the evidence behind this result.',
        'Compare the matched questions.',
        'What needs human verification?',
      ];
    }
    if (pathname === '/alerts') {
      return [
        "Show today's high-risk content",
        'Explain critical alert triggers',
        'Which sources generated the most alerts?',
      ];
    }
    if (pathname === '/review') {
      return [
        'Summarize pending reviews',
        'Which item has highest similarity?',
        'What needs human verification?',
      ];
    }
    if (pathname === '/historical') {
      return [
        'What historical papers are indexed?',
        'Show vector embedding status',
        'Explain historical question bank',
      ];
    }
    if (pathname === '/real-papers') {
      return [
        'Summarize verified real papers in vault',
        'How are real papers cross-matched?',
        'Check pending verification papers',
      ];
    }
    if (pathname === '/metadata') {
      return [
        'Summarize active exam metadata configurations',
        'Check scheduled examinations for this term',
        'Which subjects have active monitoring rules?',
      ];
    }
    if (pathname === '/sources') {
      return [
        'What is the current social monitoring status?',
        'Which platforms are generating leaks?',
      ];
    }
    return [
      'What is the current monitoring status?',
      "Show today's high-risk content",
      'Summarize pending review items',
      'Show recent leak detections',
    ];
  }, [getActiveContext, location.pathname]);

  // Contextual Quick Actions (Chips above input)
  const getQuickActions = useCallback((): { label: string; query: string }[] => {
    const pathname = location.pathname;
    const ctx = getActiveContext();

    if (ctx.selectedDetectedContentId || pathname.startsWith('/detected-content/')) {
      return [
        { label: 'Why flagged?', query: 'Why was this content flagged?' },
        { label: 'Evidence', query: 'Show the evidence behind this result.' },
        { label: 'Compare questions', query: 'Compare the matched questions.' },
        { label: 'Why review?', query: 'What needs human verification?' },
      ];
    }
    if (pathname === '/alerts') {
      return [
        { label: 'High-risk items', query: "Show today's high-risk content" },
        { label: 'Critical alerts', query: 'Explain critical alert triggers' },
        { label: 'Source breakdown', query: 'Which sources generated the most alerts?' },
      ];
    }
    if (pathname === '/review') {
      return [
        { label: 'Pending items', query: 'Summarize pending reviews' },
        { label: 'Highest similarity', query: 'Which item has highest similarity?' },
        { label: 'Review criteria', query: 'What needs human verification?' },
      ];
    }
    if (pathname === '/real-papers') {
      return [
        { label: 'Verified papers', query: 'Summarize verified real papers in vault' },
        { label: 'Cross-matching', query: 'How are real papers cross-matched?' },
      ];
    }
    if (pathname === '/historical') {
      return [
        { label: 'Indexed papers', query: 'What historical papers are indexed?' },
        { label: 'Embedding status', query: 'Show vector embedding status' },
      ];
    }
    return [
      { label: 'High-risk content', query: "Show today's high-risk content" },
      { label: 'System status', query: 'What is the current monitoring status?' },
      { label: 'Pending reviews', query: 'Summarize pending review items' },
    ];
  }, [getActiveContext, location.pathname]);

  // Scroll tracking to show "New response" pill when scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setIsScrolledUp(distanceFromBottom > 120 && messages.length > 2);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsScrolledUp(false);
  };

  // Resize handler pointer events
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizePointerDownRef.current = true;
    resizeHandleRef.current?.setPointerCapture(e.pointerId);
    startResizeDrag(e.clientX);
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizePointerDownRef.current) return;
    e.preventDefault();
    updateResizeDrag(e.clientX);
  };

  const handleResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizePointerDownRef.current) return;
    isResizePointerDownRef.current = false;
    try {
      resizeHandleRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {}
    endResizeDrag();
  };

  const handleResizePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizePointerDownRef.current) return;
    isResizePointerDownRef.current = false;
    try {
      resizeHandleRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {}
    endResizeDrag();
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    setErrorBanner(null);
    const userMsg: AiChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customText) {
      setInputText('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
    setIsSending(true);
    setIsScrolledUp(false);

    try {
      const context = getActiveContext();
      const response = await api.sendAiChatMessage({
        message: textToSend,
        history: newHistory,
        context,
      });

      setMessages((prev) => [...prev, response.message]);
    } catch (err: any) {
      setErrorBanner(err.message || 'The response could not be generated.');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: '### Assistant Unavailable\n\nThe response could not be generated at this time.',
          error: err.message,
          timestamp: new Date().toISOString(),
          status: 'ERROR',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Retry failed message
  const handleRetryMessage = (failedMsgId: string) => {
    const msgIdx = messages.findIndex((m) => m.id === failedMsgId);
    if (msgIdx > 0 && messages[msgIdx - 1]?.role === 'user') {
      const priorUserText = messages[msgIdx - 1].content;
      // remove both the user message and error message to re-send
      setMessages((prev) => prev.filter((_, idx) => idx !== msgIdx && idx !== msgIdx - 1));
      handleSendMessage(priorUserText);
    } else {
      handleSendMessage('Why was this content flagged?');
    }
  };

  // Copy message text to clipboard
  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Execute Confirmed Action
  const handleExecuteConfirmedAction = async (msgId: string, actionType: string, payload: any) => {
    setIsSending(true);
    try {
      const response = await api.sendAiChatMessage({
        confirmedAction: { actionType, payload },
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, pendingConfirmationAction: undefined } : m))
      );

      setMessages((prev) => [...prev, response.message]);
    } catch (err: any) {
      setErrorBanner(err.message || 'Action execution failed.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, pendingConfirmationAction: undefined } : m))
    );
  };

  const handleActionClick = (action: AiSuggestedAction) => {
    if (action.actionType === 'NAVIGATE' && action.payload?.path) {
      navigate(action.payload.path);
    } else if (action.actionType === 'EXECUTE_ACTION' && action.payload?.retryQuery) {
      handleSendMessage(action.payload.retryQuery);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorBanner(null);
  };

  // Handle textarea auto-height
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const suggestedQuestions = getSuggestedQuestions();
  const quickActions = getQuickActions();
  const effectiveWidth = isDragging && dragWidth !== null ? dragWidth : isOpen ? drawerWidth : 0;

  if (!isOpen && !isDragging) {
    return null;
  }

  return (
    <>
      {/* Mobile-only Backdrop (< 768px) */}
      <div
        onClick={closeAssistant}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Right Drawer */}
      <aside
        id="assistant-drawer"
        aria-label="Assistant Panel"
        style={{
          width: effectiveWidth > 0 ? `${effectiveWidth}px` : undefined,
          maxWidth: '100vw',
        }}
        className={`fixed md:relative top-0 right-0 h-full z-50 md:z-30 shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl md:shadow-none flex flex-col transition-all duration-200 ease-out overflow-hidden ${
          !isDragging && !isOpen ? 'translate-x-full md:w-0 md:translate-x-0' : 'translate-x-0'
        }`}
      >
        {/* Left Resize Handle */}
        <div
          ref={resizeHandleRef}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={drawerWidth}
          aria-label="Resize or close Assistant panel"
          title="Drag to resize; double-click to reset width"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerCancel={handleResizePointerCancel}
          onDoubleClick={() => setDrawerWidth(400)}
          className="absolute left-0 top-0 bottom-0 w-2 hover:w-3 cursor-ew-resize z-20 group -translate-x-1/2 flex items-center justify-center touch-none select-none transition-colors"
        >
          <div className="w-1 h-12 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
        </div>

        {/* 1. Header with Context */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Assistant
            </h2>
            <div
              className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5"
              title={`Context: ${getContextLabel()}`}
            >
              Context: <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{getContextLabel()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear chat messages"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeAssistant}
              title="Close Assistant (Esc)"
              aria-label="Close Assistant drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-rose-500 hover:text-rose-700 text-xs ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Scrollable Conversation Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 relative"
        >
          {messages.length === 0 ? (
            /* Empty State */
            <div className="py-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Assistant
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ask about the content you're reviewing.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Suggested questions:
                </div>
                <div className="flex flex-col gap-1.5">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(question)}
                      className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate pr-2">• {question}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Not Configured Notice (if applicable) */}
              {!activeProvider && hasLoadedProvider && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Assistant not configured
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                    Configure a provider in Settings → AI Assistant. Deterministic database forensic lookup is active.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/settings?tab=ai-assistant')}
                    className="text-[11px] h-7 bg-white dark:bg-slate-800"
                  >
                    Open Settings
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Message List */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' ? (
                  /* User Message */
                  <div className="max-w-[85%] px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs leading-relaxed shadow-xs">
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ) : (
                  /* Assistant Message */
                  <div className="max-w-[96%] w-full space-y-2">
                    <div
                      className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                        msg.status === 'ERROR'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                          : 'bg-slate-50/80 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {/* Markdown Body */}
                      <div className="prose-xs">
                        <Markdown
                          components={{
                            h1: ({ children }) => (
                              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-1.5 first:mt-0">
                                {children}
                              </h3>
                            ),
                            h2: ({ children }) => (
                              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-1.5 first:mt-0">
                                {children}
                              </h3>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-1.5 first:mt-0">
                                {children}
                              </h3>
                            ),
                            h4: ({ children }) => (
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-1">
                                {children}
                              </h4>
                            ),
                            p: ({ children }) => (
                              <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 last:mb-0 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="pl-3.5 space-y-1 my-2 text-xs text-slate-700 dark:text-slate-300 list-disc">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="pl-3.5 space-y-1 my-2 text-xs text-slate-700 dark:text-slate-300 list-decimal">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            code: ({ children }) => (
                              <code className="font-mono text-[11px] bg-slate-200/70 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded border border-slate-300/60 dark:border-slate-600/60">
                                {children}
                              </code>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>

                      {/* Evidence Bullets (if provided) */}
                      {msg.evidenceBullets && msg.evidenceBullets.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3 text-amber-500" />
                            <span>Recorded Evidence</span>
                          </div>
                          <ul className="space-y-1">
                            {msg.evidenceBullets.map((bullet, bIdx) => (
                              <li
                                key={bIdx}
                                className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5 font-mono"
                              >
                                <span className="text-slate-400 select-none">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Destructive Action Confirmation Dialog */}
                      {msg.pendingConfirmationAction && (
                        <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
                          <div className="flex items-center gap-1.5 font-semibold mb-1">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Confirmation Required</span>
                          </div>
                          <p className="text-[11px] text-rose-800 dark:text-rose-300 mb-3">
                            {msg.pendingConfirmationAction.prompt}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleExecuteConfirmedAction(
                                  msg.id,
                                  msg.pendingConfirmationAction!.actionType,
                                  msg.pendingConfirmationAction!.payload
                                )
                              }
                              className="text-[11px] h-7"
                            >
                              {msg.pendingConfirmationAction.confirmLabel || 'Confirm Action'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCancelAction(msg.id)}
                              className="text-[11px] h-7"
                            >
                              {msg.pendingConfirmationAction.cancelLabel || 'Cancel'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Chips & Toolbar below message */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 px-1">
                      {/* Suggested Action Chips */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((act) => (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div />
                      )}

                      {/* Tool Actions: Copy / Retry */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        {msg.status === 'ERROR' && (
                          <button
                            type="button"
                            onClick={() => handleRetryMessage(msg.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy response"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isSending && (
            <div className="flex items-start gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <LoaderCircle className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Assistant is responding…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating "New Response" Badge if user scrolled up */}
        {isScrolledUp && messages.length > 2 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={scrollToBottom}
              className="px-3 py-1.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium shadow-md flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>New response</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Quick Actions Row (Above Input) */}
        <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickActions.map((act, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isSending}
              onClick={() => handleSendMessage(act.query)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {act.label}
            </button>
          ))}
        </div>

        {/* 4. Fixed Input Area */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Assistant…"
              rows={1}
              disabled={isSending}
              className="flex-1 max-h-28 min-h-[38px] px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none leading-relaxed"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isSending}
              className="h-9 px-3 rounded-xl shrink-0"
              title="Send message (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
          <div className="mt-1 text-[10px] text-slate-400 text-center select-none">
            <span><strong>Enter</strong> to send · <strong>Shift+Enter</strong> for newline</span>
          </div>
        </div>
      </aside>
    </>
  );
};
