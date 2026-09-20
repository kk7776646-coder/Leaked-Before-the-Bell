import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { LeakLensLogo } from '../components/common/LeakLensLogo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password rules validation
  const rules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      passwordsMatch: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rules.minLength || !rules.hasUpper || !rules.hasLower || !rules.hasNumber) {
      setError('Please satisfy all password security requirements.');
      return;
    }

    if (!rules.passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        organization: organization.trim() || undefined,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB] dark:bg-[#020617] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <LeakLensLogo className="w-11 h-11" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#172033] dark:text-white">
              LeakLens
            </h1>
            <p className="text-[11px] font-semibold text-[#0B5CFF] tracking-wide">
              Examination Security Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#172033] dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A0B5] mt-1">
              Register an operator profile for verification and alert triage.
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-fullname"
                className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                <input
                  id="register-fullname"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Dr. Arthur Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
              >
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@exam-board.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                />
              </div>
            </div>

            {/* Organization (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-org"
                className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
              >
                Organization / Institution <span className="text-[#8190AD] font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                <input
                  id="register-org"
                  type="text"
                  placeholder="State Examination Regulatory Authority"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-[#172033] dark:text-[#E2E7F0]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8190AD] pointer-events-none" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F5F7FB] dark:bg-[#020617] border border-[#E1E6EF] dark:border-[#0B2455] rounded-xl text-[#172033] dark:text-white placeholder-[#94A0B5] focus:outline-none focus:ring-2 focus:ring-[#0B5CFF]/40 focus:border-[#0B5CFF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-2.5 p-1 text-[#8190AD] hover:text-[#172033] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Real-Time Password Requirements Checklist */}
            <div className="p-3 rounded-xl bg-[#F5F8FF] dark:bg-[#020617]/60 border border-[#E1E6EF] dark:border-[#0B2455] space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#172033] dark:text-[#E2E7F0]">
                <Shield className="w-3.5 h-3.5 text-[#0B5CFF]" />
                <span>Security Policy</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    rules.minLength
                      ? 'text-[#10B981] dark:text-[#10B981] font-medium'
                      : 'text-[#8190AD]'
                  }`}
                >
                  {rules.minLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    rules.hasUpper
                      ? 'text-[#10B981] dark:text-[#10B981] font-medium'
                      : 'text-[#8190AD]'
                  }`}
                >
                  {rules.hasUpper ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    rules.hasLower
                      ? 'text-[#10B981] dark:text-[#10B981] font-medium'
                      : 'text-[#8190AD]'
                  }`}
                >
                  {rules.hasLower ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    rules.hasNumber
                      ? 'text-[#10B981] dark:text-[#10B981] font-medium'
                      : 'text-[#8190AD]'
                  }`}
                >
                  {rules.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>At least one number (0-9)</span>
                </div>
              </div>

              {confirmPassword.length > 0 && (
                <div
                  className={`pt-1 border-t border-[#E1E6EF] dark:border-[#0B2455] text-[11px] flex items-center gap-1.5 ${
                    rules.passwordsMatch
                      ? 'text-[#10B981] font-medium'
                      : 'text-[#E11D48] font-medium'
                  }`}
                >
                  {rules.passwordsMatch ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{rules.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {/* Safe Default Role Disclaimer */}
            <div className="text-[11px] text-[#8190AD] leading-relaxed">
              New accounts are provisioned with standard <strong className="text-[#172033] dark:text-[#F1F4F9]">Operator</strong> role.
              Privileged security officer or administrative privileges require central backend approval.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full h-10 mt-2 rounded-xl bg-[#0B5CFF] hover:bg-[#2563EB] active:bg-[#071A3D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Sign In */}
          <div className="mt-5 text-center pt-4 border-t border-[#E1E6EF] dark:border-[#0B2455]/80">
            <p className="text-xs text-[#64748B] dark:text-[#94A0B5]">
              Already have an authorized account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#0B5CFF] hover:text-[#2563EB] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
