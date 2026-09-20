import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ShieldCheck,
  Mail,
  LoaderCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { LeakLensLogo } from '../components/common/LeakLensLogo';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB] dark:bg-[#020617] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <LeakLensLogo className="w-11 h-11" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#172033] dark:text-white">
              LeakLens
            </h1>
            <p className="text-[11px] font-semibold text-[#0B5CFF] tracking-wide">
              Credential Recovery
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] rounded-2xl shadow-xl p-6 sm:p-8">
          {isSubmitted ? (
            <div className="space-y-4 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[#10B981] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172033] dark:text-white">
                  Recovery Instructions Dispatched
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A0B5] mt-2 leading-relaxed">
                  If an account exists with <strong className="text-[#172033] dark:text-[#F1F4F9]">{email}</strong>, a secure password reset link has been dispatched to your inbox.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E1E6EF] dark:border-[#0B2455]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B5CFF] hover:text-[#2563EB]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#172033] dark:text-white tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A0B5] mt-1">
                  Enter your registered work email to receive password reset instructions.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-[#E11D48] animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@exam-board.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 mt-2 rounded-xl bg-[#0B5CFF] hover:bg-[#2563EB] active:bg-[#071A3D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center pt-4 border-t border-[#E1E6EF] dark:border-[#0B2455]/80">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] dark:text-[#94A0B5] dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
