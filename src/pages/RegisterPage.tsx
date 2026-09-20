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
              Examination Security Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#071A3D] border border-[#E1E6EF] dark:border-[#0B2455] rounded-2xl shadow-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-rose-500" />
          </div>

          <h2 className="text-lg font-bold text-[#172033] dark:text-white tracking-tight mb-2">
            Registration Restricted
          </h2>
          
          <p className="text-xs text-[#64748B] dark:text-[#94A0B5] leading-relaxed mb-6">
            Self-registration has been disabled on this instance of LeakLens. Only authorized system administrators can provision new accounts.
          </p>

          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-medium leading-normal mb-6">
            Access is restricted to authorized users. Please contact your administrator if you believe this is an error.
          </div>

          <Link
            to="/login"
            className="w-full h-10 rounded-xl bg-[#0B5CFF] hover:bg-[#2563EB] active:bg-[#071A3D] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
