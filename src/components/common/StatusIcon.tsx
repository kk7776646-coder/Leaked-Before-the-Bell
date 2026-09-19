import React from 'react';
import {
  CheckCircle2,
  CircleAlert,
  ShieldAlert,
  LoaderCircle,
  XCircle,
  Clock3,
  Eye,
  ClipboardCheck,
  CircleX,
  ArrowUpCircle,
  BadgeCheck,
  LucideIcon
} from 'lucide-react';

interface StatusIconProps {
  status?: string;
  size?: number;
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status = '', size = 16, className = '' }) => {
  const norm = (status || '').toUpperCase().trim();

  switch (norm) {
    case 'LOW':
    case 'COMPLETED':
    case 'RESOLVED':
      return <CheckCircle2 size={size} className={`text-emerald-500 ${className}`} />;
    case 'REVIEW REQUIRED':
    case 'MEDIUM':
    case 'UNVERIFIED':
      return <CircleAlert size={size} className={`text-amber-500 ${className}`} />;
    case 'HIGH':
    case 'CRITICAL':
    case 'REJECTED':
      return <ShieldAlert size={size} className={`text-rose-500 ${className}`} />;
    case 'PROCESSING':
    case 'RUNNING':
      return <LoaderCircle size={size} className={`text-blue-500 animate-spin ${className}`} />;
    case 'FAILED':
      return <XCircle size={size} className={`text-rose-600 ${className}`} />;
    case 'PENDING':
      return <Clock3 size={size} className={`text-slate-400 ${className}`} />;
    case 'IN REVIEW':
      return <Eye size={size} className={`text-blue-500 ${className}`} />;
    case 'VERIFIED':
      return <BadgeCheck size={size} className={`text-emerald-600 ${className}`} />;
    case 'DISMISSED':
      return <CircleX size={size} className={`text-slate-400 ${className}`} />;
    case 'ESCALATED':
      return <ArrowUpCircle size={size} className={`text-purple-600 ${className}`} />;
    default:
      return <CheckCircle2 size={size} className={`text-slate-400 ${className}`} />;
  }
};
