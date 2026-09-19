import React from 'react';
import { LogOut, X } from 'lucide-react';
import { mockCurrentUser } from '../../data/mockUser';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign out modal"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={1.8} />
        </button>

        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6" strokeWidth={1.8} />
        </div>

        <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">
          Sign out of session?
        </h3>
        <p className="text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          You are signed in as <span className="font-semibold text-slate-700 dark:text-slate-300">{mockCurrentUser.name}</span> ({mockCurrentUser.email}). Are you sure you want to log out of the Exam Security Platform?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-sans font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-sans font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
