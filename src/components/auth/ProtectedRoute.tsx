import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7FB] dark:bg-[#020617] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#071A3D] via-[#0B2455] to-[#0B5CFF] flex items-center justify-center shadow-xl shadow-blue-500/10">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A0B5]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0B5CFF]" />
            <span>Verifying security credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
