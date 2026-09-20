import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  FileCheck2,
  Fingerprint,
} from 'lucide-react';
import { LeakLensLogo } from '../components/common/LeakLensLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, from]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role: 'officer' | 'admin') => {
    if (role === 'officer') {
      setEmail('security.officer@leaklens.local');
      setPassword('Password123!');
    } else {
      setEmail('admin@leaklens.local');
      setPassword('Password123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB] dark:bg-[#020617] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Story & Security Overview (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-6">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3">
              <LeakLensLogo className="w-12 h-12" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#172033] dark:text-[#F1F4F9]">
                  LeakLens
                </h1>
                <p className="text-xs font-semibold text-[#0B5CFF] dark:text-[#06B6D4] tracking-wide">
                  Exam Security & Forensics
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-[#172033] dark:text-[#FFFFFF] leading-tight tracking-tight">
                Authentic Verification for High-Stakes Examinations
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#94A0B5] leading-relaxed">
                Automated paper forensics, native PDF visual comparison, real-time alert triage,
                and end-to-end question matching across public and private channels.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] flex items-center justify-center shrink-0 shadow-2xs">
                  <Fingerprint className="w-4 h-4 text-[#0B5CFF]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172033] dark:text-[#F1F4F9]">
                    Strict Forensic Integrity
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#8190AD]">
                    SHA-256 byte-level immutability and multi-page visual extraction evidence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] flex items-center justify-center shrink-0 shadow-2xs">
                  <FileCheck2 className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172033] dark:text-[#F1F4F9]">
                    Granular Question Forensics
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#8190AD]">
                    Multi-level similarity scores comparing candidates against official repositories.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E1E6EF] dark:border-[#071A3D] flex items-center justify-between text-xs text-[#8190AD]">
            <span>LeakLens Security Platform v2.5</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Ingestion Nodes Operational
            </span>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <LeakLensLogo className="w-9 h-9" />
              <div>
                <h2 className="text-base font-bold text-[#172033] dark:text-white">LeakLens</h2>
                <p className="text-[11px] font-semibold text-[#0B5CFF]">Security Portal</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#172033] dark:text-white tracking-tight">
                Sign In
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A0B5] mt-1">
                Enter your credentials to access the examination security console.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-[#E11D48] animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="officer@exam-authority.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-[#0B5CFF] hover:text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 p-1 text-[#8190AD] hover:text-[#172033] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E1E6EF] dark:border-[#0B2455] text-[#0B5CFF] focus:ring-[#0B5CFF]"
                  />
                  <span className="text-xs text-[#64748B] dark:text-[#94A0B5]">
                    Keep session active (30 days)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-2 rounded-xl bg-[#0B5CFF] hover:bg-[#2563EB] active:bg-[#071A3D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-[#E1E6EF] dark:border-[#0B2455]/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A0B5] uppercase tracking-wider">
                  Test Credentials
                </span>
                <span className="text-[10px] text-[#8190AD] font-mono">Default Accounts</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('officer')}
                  className="p-2 text-left rounded-lg bg-[#F5F8FF] dark:bg-[#020617]/70 border border-[#B7C2D9]/60 dark:border-[#0B2455] hover:border-[#0B5CFF] transition-all cursor-pointer text-xs"
                >
                  <p className="font-semibold text-[#0B5CFF] text-[11px]">Security Officer</p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#8190AD] truncate">
                    security.officer@leaklens.local
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="p-2 text-left rounded-lg bg-[#F5F8FF] dark:bg-[#020617]/70 border border-[#B7C2D9]/60 dark:border-[#0B2455] hover:border-[#0B5CFF] transition-all cursor-pointer text-xs"
                >
                  <p className="font-semibold text-[#0B5CFF] text-[11px]">Administrator</p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#8190AD] truncate">
                    admin@leaklens.local
                  </p>
                </button>
              </div>
            </div>

            {/* Link to Register */}
            <div className="mt-5 text-center">
              <p className="text-xs text-[#64748B] dark:text-[#94A0B5]">
                Need a new examination operator account?{' '}
                <Link
                  to="/create-account"
                  className="font-bold text-[#0B5CFF] hover:text-[#2563EB] hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
