import React from 'react';
import { ReviewStatus } from '../../types/candidate';
import { Badge } from '../common/Badge';
import { ShieldAlert, CircleAlert, CheckCircle2, Clock } from 'lucide-react';

interface CandidateStatusBadgeProps {
  status: ReviewStatus;
}

export const CandidateStatusBadge: React.FC<CandidateStatusBadgeProps> = ({ status }) => {
  const getBadgeProps = (status: ReviewStatus) => {
    switch (status) {
      case 'VERIFIED':
        return { variant: 'danger' as const, icon: <ShieldAlert className="w-3.5 h-3.5" /> };
      case 'ESCALATED':
        return { variant: 'warning' as const, icon: <CircleAlert className="w-3.5 h-3.5" /> };
      case 'UNDER_REVIEW':
        return { variant: 'info' as const, icon: <Clock className="w-3.5 h-3.5" /> };
      case 'DISMISSED':
        return { variant: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 'UNREVIEWED':
      default:
        return { variant: 'neutral' as const, icon: <Clock className="w-3.5 h-3.5" /> };
    }
  };

  const { variant, icon } = getBadgeProps(status);

  return (
    <Badge variant={variant} size="sm" icon={icon}>
      {status.replace('_', ' ')}
    </Badge>
  );
};
