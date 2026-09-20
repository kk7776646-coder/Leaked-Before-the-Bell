import React from 'react';
import { Button } from './Button';
import { AlertTriangle, Trash2, Archive, RotateCcw, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary' | 'secondary' | 'outline';
  confirmIcon?: React.ReactNode;
  detailsNotice?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  confirmIcon,
  detailsNotice,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getHeaderIcon = () => {
    if (confirmIcon) return confirmIcon;
    if (confirmVariant === 'danger') {
      return <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
    if (confirmLabel.toLowerCase().includes('archive')) {
      return <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
    if (confirmLabel.toLowerCase().includes('restore')) {
      return <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
    return <AlertTriangle className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl font-sans relative transform scale-100 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            confirmVariant === 'danger' 
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-100 dark:border-rose-900/50' 
              : confirmLabel.toLowerCase().includes('archive')
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-100 dark:border-amber-900/50'
              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-100 dark:border-blue-900/50'
          }`}>
            {getHeaderIcon()}
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {detailsNotice && (
          <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {detailsNotice}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            icon={confirmIcon || (confirmVariant === 'danger' ? <Trash2 className="w-3.5 h-3.5" /> : undefined)}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
