import React from 'react';
import { Badge } from '../common/Badge';
import { CircleAlert, UserCheck, CheckCircle2 } from 'lucide-react';

interface ReviewStatusBadgeProps {
  status: 'Needs Verification' | 'Assigned' | 'Completed';
}

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({ status }) => {
  const badgeProps = {
    'Needs Verification': { variant: 'warning' as const, icon: <CircleAlert className="w-3.5 h-3.5" /> },
    'Assigned': { variant: 'info' as const, icon: <UserCheck className="w-3.5 h-3.5" /> },
    'Completed': { variant: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  };

  const { variant, icon } = badgeProps[status];

  return (
    <Badge variant={variant} size="sm" icon={icon}>
      {status}
    </Badge>
  );
};
