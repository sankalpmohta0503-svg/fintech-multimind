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
  critical: { accent: '#DC2626', soft: '#FEF2F2', border: '#FECACA', icon: ShieldAlert, label: 'Critical' },
  warning: { accent: '#EA580C', soft: '#FFF7ED', border: '#FFEDD5', icon: AlertTriangle, label: 'Warning' },
  opportunity: { accent: '#1B3A6B', soft: '#EFF6FF', border: '#BFDBFE', icon: Lightbulb, label: 'Opportunity' },
  healthy: { accent: '#15803D', soft: '#F0FDF4', border: '#BBF7D0', icon: CheckCircle2, label: 'Healthy' },
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
  const category = (finding.category || '').toLowerCase();
  if (category.includes('retirement') || category.includes('goal')) {
    return { label: 'Open goals', route: '/goals' };
  }
  if (category.includes('asset') || category.includes('portfolio') || category.includes('concentration')) {
    return { label: 'Open simulator', route: '/simulator' };
  }
  return { label: 'View recommendations', route: '/recommendations' };
};

const EvidenceMetric = ({ label, value, index }) => (
  <div className={`min-w-0 rounded-lg border border-[#DBEAFE] bg-white px-3 py-2.5 ${index === 0 ? 'md:col-span-2' : ''}`}>
    <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">{label}</div>
    <div className="mt-1 truncate text-[15px] font-bold tracking-tight text-[#1B3A6B]">{value}</div>
  </div>
);

const AuditFindingCard = ({ finding, expanded, onToggle, onExplain }) => {
  const navigate = useNavigate();
  const style = severityStyles[finding.severity] || severityStyles.warning;
  const Icon = style.icon;
  const action = getDirectAction(finding);
  const evidence = finding.evidence && Object.entries(finding.evidence);
  const deficitValue = finding.evidence?.gap || finding.evidence?.shortfall || null;

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
        expanded
          ? 'shadow-md border-[#1B3A6B]/40 ring-1 ring-[#1B3A6B]/20'
          : 'shadow-sm border-[#1B3A6B22] hover:-translate-y-0.5 hover:shadow-md'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: style.accent,
      }}
    >
      <div className="p-5 pl-6 md:p-6 md:pl-7">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: style.soft, color: style.accent }}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={finding.severity} label={style.label} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                {finding.category}
              </span>
            </div>
            <button type="button" onClick={onToggle} aria-expanded={expanded} className="mt-2.5 block w-full text-left">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1B3A6B] transition-colors group-hover:text-[#2563EB]">
                {finding.title}
              </h3>
              {finding.description && (
                <p className="mt-1.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#374151]">{finding.description}</p>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Collapse finding details' : 'Expand finding details'}
            aria-expanded={expanded}
            className="rounded-full border border-[#DBEAFE] p-2 text-[#4B6080] transition hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-[#EFF6FF]"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#DBEAFE] pt-3 text-xs text-[#4B6080]">
          {deficitValue > 0 && (
            <div>
              <span className="mr-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Gap</span>
              <span className="font-bold text-[#DC2626]">{formatCurrency(deficitValue)}</span>
            </div>
          )}
          {finding.impact && (
            <div className="flex items-center gap-1.5 text-xs text-[#374151]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.accent }} />
              <span>Impact identified</span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#1B3A6B] hover:text-[#2563EB]"
          >
            {expanded ? 'Hide evidence' : 'Review evidence'} <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#DBEAFE] px-5 pb-6 pt-5 md:px-7" style={{ backgroundColor: style.soft }}>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <section>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
                <FileSearch size={15} style={{ color: style.accent }} /> Evidence returned by the audit
              </div>
              {evidence?.length ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {evidence.map(([key, value], index) => (
                    <EvidenceMetric
                      key={key}
                      label={formatEvidenceLabel(key)}
                      value={formatEvidenceValue(key, value)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-[#DBEAFE] bg-white p-3.5 text-xs text-[#4B6080]">
                  No numerical evidence was returned for this finding.
                </div>
              )}
            </section>
            <section className="space-y-4 lg:border-l lg:border-[#DBEAFE] lg:pl-5">
              <div>
                {finding.impact && (
                  <>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">Impact</div>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#1F2937]">{finding.impact}</p>
                  </>
                )}
                {finding.recommendation && (
                  <div className="mt-3 border-t border-[#DBEAFE] pt-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#14532D]">Recommendation</div>
                    <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-[#14532D]">{finding.recommendation}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(action.route)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm bg-[#1B3A6B] hover:bg-[#2563EB]"
                >
                  <span>{action.label}</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={onExplain}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#BFDBFE] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1B3A6B] transition hover:border-[#1B3A6B] hover:bg-[#EFF6FF]"
                >
                  <HelpCircle size={13} />
                  <span>Why am I seeing this?</span>
                </button>
              </div>
            </section>
          </div>
          {finding.disclaimer && (
            <div className="mt-4 border-t border-[#DBEAFE] pt-2.5 text-[11px] italic text-[#6B7280]">
              {finding.disclaimer}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export { formatEvidenceLabel, formatEvidenceValue };
export default AuditFindingCard;
