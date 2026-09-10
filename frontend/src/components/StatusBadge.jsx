import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, CircleDot, Info } from 'lucide-react';

const statusConfig = {
  critical: { label: 'Critical', className: 'status-critical', Icon: AlertCircle },
  warning: { label: 'Warning', className: 'status-warning', Icon: AlertTriangle },
  opportunity: { label: 'Opportunity', className: 'status-opportunity', Icon: CircleDot },
  healthy: { label: 'Healthy', className: 'status-healthy', Icon: CheckCircle2 },
  neutral: { label: 'Neutral', className: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1F3555]', Icon: Info },
};

const StatusBadge = ({ status = 'neutral', label, className = '' }) => {
  const config = statusConfig[status] || statusConfig.neutral;
  const Icon = config.Icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className} ${className}`}><Icon size={13} aria-hidden="true" />{label || config.label}</span>;
};

export default StatusBadge;
