import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastNotification {
  id?: string;
  text: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

export interface ToastProps {
  toast: ToastNotification | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const getToastIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'error':
        return 'border-rose-200 dark:border-rose-900/60 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100';
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/60 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100';
      case 'info':
        return 'border-blue-200 dark:border-blue-900/60 bg-blue-50/95 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100';
      case 'success':
      default:
        return 'border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-xl';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md text-xs font-medium font-sans ${getBorderColor()}`}>
        {getToastIcon()}
        <span className="pr-2">{toast.text}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
