import React from 'react';
import { User, Mail, ShieldCheck, Activity, X, CheckCircle2, KeyRound } from 'lucide-react';
import { mockCurrentUser } from '../../data/mockUser';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Background Accent */}
        <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-4 relative flex justify-between items-start">
          <span className="text-[11px] font-sans font-semibold tracking-wider uppercase text-blue-100 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
            System Account
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Profile Avatar Overlay */}
        <div className="px-6 pb-6 relative">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 rounded-full bg-blue-600 dark:bg-blue-500 text-white border-4 border-white dark:border-slate-900 font-sans font-bold text-2xl flex items-center justify-center shadow-md">
              {mockCurrentUser.initials}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.8} />
              {mockCurrentUser.status}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              {mockCurrentUser.name}
            </h2>
            <p className="text-sm font-sans text-slate-500 dark:text-slate-400">
              {mockCurrentUser.role}
            </p>
          </div>

          {/* Profile Details List */}
          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-3 text-sm font-sans">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Role</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{mockCurrentUser.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-sans">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Email</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{mockCurrentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-sans">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Status</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{mockCurrentUser.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-sans">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">User Identifier</p>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400">{mockCurrentUser.id}</p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-sans font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
