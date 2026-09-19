import React from 'react';
import { AlertSeverity } from '../../types/alert';
import { Badge } from '../../components/common/Badge';
import { ShieldAlert, CircleAlert, CheckCircle2 } from 'lucide-react';

interface AlertSeverityBadgeProps {
  severity: AlertSeverity;
}

export const AlertSeverityBadge: React.FC<AlertSeverityBadgeProps> = ({ severity }) => {
  const variants = {
    HIGH: 'danger' as const,
    MEDIUM: 'warning' as const,
    LOW: 'info' as const,
  };

  const icons = {
    HIGH: <ShieldAlert className="w-3.5 h-3.5" />,
    MEDIUM: <CircleAlert className="w-3.5 h-3.5" />,
    LOW: <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  return (
    <Badge variant={variants[severity]} size="sm" icon={icons[severity]}>
      {severity} SEVERITY
    </Badge>
  );
};
