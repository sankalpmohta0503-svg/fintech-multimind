import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSearch,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/formatters';

const severityStyles = {
  critical: {
    borderLeft: 'border-l-red-600',
    badge: 'bg-red-50 text-red-800 border-red-200',
    badgeLabel: 'CRITICAL BREACH',
    icon: ShieldAlert,
    iconBg: 'bg-red-100 text-red-800',
    highlightText: 'text-red-700',
  },
  warning: {
    borderLeft: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeLabel: 'POLICY WARNING',
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 text-amber-800',
    highlightText: 'text-amber-700',
  },
  opportunity: {
    borderLeft: 'border-l-blue-600',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    badgeLabel: 'TAX OPTIMIZATION',
    icon: Lightbulb,
    iconBg: 'bg-blue-100 text-blue-800',
    highlightText: 'text-blue-700',
  },
  healthy: {
    borderLeft: 'border-l-teal-600',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    badgeLabel: 'BENCHMARK COMPLIANT',
    icon: CheckCircle2,
    iconBg: 'bg-teal-100 text-teal-800',
    highlightText: 'text-teal-700',
  },
};

const formatEvidenceLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

const formatEvidenceValue = (key, value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'number') return String(value);
  const normalizedKey = key.toLowerCase();
  if (normalizedKey.includes('percentage') || normalizedKey.includes('ratio') || normalizedKey.includes('rate')) {
    return `${value}%`;
  }
  if (
    normalizedKey.includes('amount') ||
    normalizedKey.includes('corpus') ||
    normalizedKey.includes('gap') ||
    normalizedKey.includes('sip') ||
    normalizedKey.includes('coverage') ||
    normalizedKey.includes('income') ||
    normalizedKey.includes('shortfall') ||
    Math.abs(value) >= 1000
  ) {
    return formatCurrency(value);
  }
  return value.toLocaleString('en-IN');
};

const getDirectAction = (finding) => {
  const cat = (finding.category || '').toLowerCase();
  if (cat.includes('insurance') || cat.includes('protection')) {
    return { label: 'Initiate Coverage Proposal', route: '/recommendations' };
  }
  if (cat.includes('retirement') || cat.includes('goal')) {
    return { label: 'Adjust Trajectory in Goals', route: '/goals' };
  }
  if (cat.includes('asset') || cat.includes('portfolio') || cat.includes('concentration')) {
    return { label: 'Review in Simulator', route: '/simulator' };
  }
  if (cat.includes('tax')) {
    return { label: 'Explore Tax Strategy', route: '/recommendations' };
  }
  return { label: 'View Recommendations', route: '/recommendations' };
};

const AuditFindingCard = ({ finding, expanded, onToggle, onExplain }) => {
  const navigate = useNavigate();
  const severity = severityStyles[finding.severity] || severityStyles.warning;
  const Icon = severity.icon;
  const action = getDirectAction(finding);

  // Check if there's a deficit / gap metric in evidence
  const deficitValue =
    finding.evidence?.gap ||
    finding.evidence?.shortfall ||
    (finding.evidence?.required && finding.evidence?.existing
      ? finding.evidence.required - finding.evidence.existing
      : null);

  return (
    <article
      className={`rounded-lg border border-slate-200 border-l-4 bg-white shadow-none transition-all ${
        severity.borderLeft
      } ${expanded ? 'ring-1 ring-slate-200' : 'hover:border-slate-300'}`}
    >
      {/* Card Header clickable button */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severity.badge}`}>
              <Icon size={13} />
              {severity.badgeLabel}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {finding.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {deficitValue && deficitValue > 0 && (
              <span className={`text-xs font-semibold tabular-nums ${severity.highlightText}`}>
                Deficit: {formatCurrency(deficitValue)}
              </span>
            )}
            <button
              type="button"
              onClick={onToggle}
              className="text-slate-500 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors"
              aria-label={expanded ? 'Collapse finding details' : 'Expand finding details'}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Title & Core Narrative */}
        <div className="cursor-pointer" onClick={onToggle}>
          <h3 className="text-base font-semibold text-slate-950 hover:text-teal-900 transition-colors">
            {finding.title}
          </h3>
          {finding.description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {finding.description}
            </p>
          )}
        </div>
      </div>

      {/* Two-Column Audited Evidence Drawer (Expanded) */}
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50/80 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Audited Numbers */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <FileSearch size={14} className="text-teal-700" />
                <span>Audited Evidence & Baseline Metrics</span>
              </div>

              {finding.evidence && Object.keys(finding.evidence).length > 0 ? (
                <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white px-3 py-1">
                  {Object.entries(finding.evidence).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-1.5 text-xs">
                      <span className="text-slate-500">{formatEvidenceLabel(key)}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatEvidenceValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white rounded border border-slate-200 text-xs text-slate-500">
                  No numerical evidence metrics recorded for this audit item.
                </div>
              )}
            </div>

            {/* Right: Impact & Action */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  <ShieldAlert size={14} className="text-amber-700" />
                  <span>Fiduciary Impact & Prescribed Action</span>
                </div>

                {finding.impact && (
                  <p className="text-xs leading-relaxed text-slate-700 bg-white p-2.5 rounded border border-slate-200 mb-2">
                    <strong className="text-slate-900">Why it matters: </strong>
                    {finding.impact}
                  </p>
                )}

                {finding.recommendation && (
                  <div className="bg-teal-50/70 border border-teal-200 p-2.5 rounded">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                      Direct Advisory Action
                    </span>
                    <p className="text-xs font-medium text-teal-950 mt-0.5">
                      {finding.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {finding.severity !== 'healthy' && (
                  <button
                    type="button"
                    onClick={() => navigate(action.route)}
                    className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                  >
                    <span>{action.label}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onExplain}
                  className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                >
                  <HelpCircle size={13} />
                  <span>Why am I seeing this?</span>
                </button>
              </div>
            </div>
          </div>

          {finding.disclaimer && (
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
              ℹ️ {finding.disclaimer}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export { formatEvidenceLabel, formatEvidenceValue };
export default AuditFindingCard;
