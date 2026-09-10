import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, BookOpen, FileSearch, Filter, RefreshCw, Search, Shield, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import AuditFindingCard, { formatEvidenceLabel, formatEvidenceValue } from '../components/AuditFindingCard';
import Dialog from '../components/Dialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

const severityOrder = { critical: 0, warning: 1, opportunity: 2, healthy: 3 };
const severityTabs = [
  { id: 'all', label: 'All findings' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
  { id: 'opportunity', label: 'Opportunities' },
  { id: 'healthy', label: 'Healthy' },
];

const FinancialAudit = () => {
  const [audit, setAudit] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFindings, setExpandedFindings] = useState(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('severity');
  const [dialogFinding, setDialogFinding] = useState(null);
  const [showMethodologyDialog, setShowMethodologyDialog] = useState(false);

  const loadAuditData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [auditRes, healthRes, clientRes] = await Promise.allSettled([
        api.getAudit(),
        api.getHealthScore(),
        api.getClient(),
      ]);
      if (auditRes.status !== 'fulfilled') throw auditRes.reason;
      setAudit(auditRes.value.data);
      const firstCritical = auditRes.value.data.categorized?.critical?.[0];
      setExpandedFindings(firstCritical ? new Set([firstCritical.id]) : new Set());
      if (healthRes.status === 'fulfilled') setHealthScore(healthRes.value.data);
      if (clientRes.status === 'fulfilled') setClient(clientRes.value.data);
    } catch (requestError) {
      console.error('Failed to load audit data:', requestError);
      setError('The financial audit findings could not be loaded. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  const uniqueCategories = useMemo(() => {
    if (!audit?.findings) return [];
    return Array.from(new Set(audit.findings.map((finding) => finding.category).filter(Boolean))).sort();
  }, [audit]);

  const filteredFindings = useMemo(() => {
    if (!audit?.findings) return [];
    const query = searchQuery.trim().toLowerCase();
    let list = selectedSeverity === 'all' ? audit.findings : audit.categorized[selectedSeverity] || [];
    if (selectedCategory !== 'all') list = list.filter((finding) => finding.category === selectedCategory);
    if (query) {
      list = list.filter((finding) =>
        [finding.title, finding.category, finding.description, finding.impact, finding.recommendation].some((value) =>
          value?.toLowerCase().includes(query)
        )
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      if (sortBy === 'gap') {
        return (b.evidence?.gap || b.evidence?.shortfall || 0) - (a.evidence?.gap || a.evidence?.shortfall || 0);
      }
      return (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
    });
  }, [audit, searchQuery, selectedSeverity, selectedCategory, sortBy]);

  const toggleFinding = (id) =>
    setExpandedFindings((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const getCount = (tab) => (!audit ? 0 : tab === 'all' ? audit.totalFindings : audit.categorized[tab]?.length || 0);
  const criticalCount = audit?.categorized?.critical?.length || 0;
  const warningCount = audit?.categorized?.warning?.length || 0;
  const opportunityCount = audit?.categorized?.opportunity?.length || 0;
  const healthyCount = audit?.categorized?.healthy?.length || 0;
  const score = healthScore?.overallScore;

  if (loading && !audit) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-28" />
        <Skeleton className="h-20" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error && !audit) {
    return (
      <div>
        <ErrorState title="Financial audit unavailable" message={error} onRetry={loadAuditData} />
      </div>
    );
  }

  return (
    <div className="animate-enter space-y-6">
      {/* 1. Header with Eyebrow and Actions */}
      <header className="card bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
              <FileSearch size={15} /> Diagnose · Fiduciary Evidence Audit
            </div>
            <h1 className="mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-[#1B3A6B]">
              Financial Audit & Findings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#374151]">
              A deterministic rule-based evaluation of {client?.personalInfo?.name || 'the client'}’s balance sheet, insurance, tax status, and cash flows against SEBI RIA fiduciary benchmarks.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#4B6080]">
              <span className="font-semibold text-[#1B3A6B]">{client?.personalInfo?.name || 'Client Profile'}</span>
              <span className="text-[#DBEAFE]">/</span>
              <span>{audit?.totalFindings || 0} Total Findings Detected</span>
              <span className="text-[#DBEAFE]">/</span>
              <span className="text-[#14532D] font-semibold">Engine V2.4 Deterministic Rule Base</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setShowMethodologyDialog(true)}
              className="btn-secondary rounded-lg text-xs"
            >
              <BookOpen size={15} /> Methodology
            </button>
            <button
              type="button"
              onClick={loadAuditData}
              disabled={loading}
              className="btn-primary rounded-lg text-xs"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Audit
            </button>
          </div>
        </div>
      </header>

      {/* 2. Overall State & Severity Breakdown */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 card bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Overall Audit Health</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-[#1B3A6B] leading-none">
                {score ?? '—'}
              </span>
              {score !== undefined && <span className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">/ 100 Health Score</span>}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#374151]">
              {audit?.summary?.message || 'Review categorized findings below to resolve coverage gaps and solvency risks.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DBEAFE] flex items-center gap-2 text-xs text-[#2563EB]">
            <Shield size={14} className="text-[#1B3A6B]" />
            <span>Audited against SEBI RIA fiduciary planning framework</span>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card bg-[#FEF2F2] border border-[#FECACA] p-4 flex flex-col justify-between rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">Critical</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#DC2626]">{criticalCount}</div>
            <div className="text-[11px] font-medium text-[#DC2626]">Severe Deficit</div>
          </div>
          <div className="card bg-[#FFF7ED] border border-[#FFEDD5] p-4 flex flex-col justify-between rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">Warnings</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#EA580C]">{warningCount}</div>
            <div className="text-[11px] font-medium text-[#EA580C]">Elevated Risk</div>
          </div>
          <div className="card bg-[#EFF6FF] border border-[#BFDBFE] p-4 flex flex-col justify-between rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B3A6B]">Opportunities</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B3A6B]">{opportunityCount}</div>
            <div className="text-[11px] font-medium text-[#2563EB]">Optimization</div>
          </div>
          <div className="card bg-[#F0FDF4] border border-[#BBF7D0] p-4 flex flex-col justify-between rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#14532D]">Healthy</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#14532D]">{healthyCount}</div>
            <div className="text-[11px] font-medium text-[#15803D]">Fully Compliant</div>
          </div>
        </div>
      </section>

      {/* 3. Review Controls & Filters */}
      <section className="card bg-white p-5 rounded-xl border border-[#DBEAFE]">
        <div className="flex items-center gap-2 border-b border-[#DBEAFE] pb-3">
          <SlidersHorizontal size={16} className="text-[#1B3A6B]" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">Filter & Sort Findings</div>
            <p className="text-xs text-[#4B6080]">Narrow audit findings by severity level, planning dimension, or financial gap.</p>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {severityTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSeverity(tab.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-bold transition ${
                selectedSeverity === tab.id
                  ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white shadow-sm'
                  : 'border-[#DBEAFE] bg-white text-[#4B6080] hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-[#EFF6FF]'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-80">({getCount(tab.id)})</span>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
          <label className="relative md:col-span-6">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <span className="sr-only">Search findings</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search findings, evidence metrics, or recommendations..."
              className="w-full rounded-md border border-[#DBEAFE] bg-[#F8FAFC] py-2 pl-9 pr-3 text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
            />
          </label>
          <label className="relative md:col-span-3">
            <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <span className="sr-only">Filter by category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-md border border-[#DBEAFE] bg-[#F8FAFC] py-2 pl-8 pr-3 text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
            >
              <option value="all">All categories ({uniqueCategories.length})</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="relative md:col-span-3">
            <ArrowDownUp size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <span className="sr-only">Sort findings</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-md border border-[#DBEAFE] bg-[#F8FAFC] py-2 pl-8 pr-3 text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
            >
              <option value="severity">Sort by severity</option>
              <option value="gap">Sort by evidence gap</option>
              <option value="category">Sort by category</option>
            </select>
          </label>
        </div>
      </section>

      {/* 4. Findings List */}
      <section aria-live="polite" className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">
            Audited Findings & Evidence
          </h2>
          <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-bold text-[#1B3A6B] border border-[#BFDBFE]">
            {filteredFindings.length} Shown
          </span>
        </div>
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding, index) => (
            <div
              key={finding.id}
              className={index === 0 ? 'animate-enter' : ''}
              style={{ animationDelay: `${Math.min(index, 4) * 45}ms` }}
            >
              <AuditFindingCard
                finding={finding}
                expanded={expandedFindings.has(finding.id)}
                onToggle={() => toggleFinding(finding.id)}
                onExplain={() => setDialogFinding(finding)}
              />
            </div>
          ))
        ) : (
          <EmptyState
            title="No audit findings match your filters"
            message="Try switching severity tabs, resetting the category filter, or clearing your search term."
            action={
              selectedSeverity !== 'all' || selectedCategory !== 'all' || searchQuery ? (
                <button
                  type="button"
                  className="btn-secondary text-xs rounded-md"
                  onClick={() => {
                    setSelectedSeverity('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Reset all filters
                </button>
              ) : null
            }
          />
        )}
      </section>

      {/* 5. Bottom Context Bar */}
      <section className="card bg-white p-4 rounded-xl border border-[#DBEAFE] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Shield size={18} className="mt-0.5 text-[#1B3A6B] shrink-0" />
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Deterministic Evidence Architecture</div>
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-[#4B6080]">
              Every audit item is generated through strict mathematical rules and ratios defined under the SEBI RIA framework.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowMethodologyDialog(true)}
          className="btn-secondary text-xs rounded-md shrink-0"
        >
          <BookOpen size={14} /> About the Analysis
        </button>
      </section>

      {/* 6. Finding Detail Dialog */}
      <Dialog
        open={Boolean(dialogFinding)}
        onClose={() => setDialogFinding(null)}
        title={dialogFinding ? dialogFinding.title : 'Audit finding details'}
        className="manus-dialog"
      >
        {dialogFinding && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#DBEAFE] pb-3">
              <StatusBadge status={dialogFinding.severity} />
              <span className="text-[#4B6080] font-semibold">{dialogFinding.category}</span>
            </div>
            {dialogFinding.description && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Description</h3>
                <p className="mt-1 leading-relaxed text-[#374151]">{dialogFinding.description}</p>
              </div>
            )}
            {dialogFinding.evidence && Object.keys(dialogFinding.evidence).length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">Numerical Evidence</h3>
                <div className="mt-1.5 divide-y divide-[#DBEAFE] rounded-lg border border-[#DBEAFE] bg-[#F8FAFC] px-3.5">
                  {Object.entries(dialogFinding.evidence).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4 py-2">
                      <span className="text-xs text-[#4B6080]">{formatEvidenceLabel(key)}</span>
                      <span className="font-bold tabular-nums text-[#1B3A6B]">
                        {formatEvidenceValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {dialogFinding.impact && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Impact</h3>
                <p className="mt-1 leading-relaxed text-[#374151]">{dialogFinding.impact}</p>
              </div>
            )}
            {dialogFinding.recommendation && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14532D]">Recommendation</h3>
                <p className="mt-1 leading-relaxed font-semibold text-[#14532D]">{dialogFinding.recommendation}</p>
              </div>
            )}
            {dialogFinding.disclaimer && (
              <p className="border-t border-[#DBEAFE] pt-3 text-[11px] italic text-[#6B7280]">
                {dialogFinding.disclaimer}
              </p>
            )}
          </div>
        )}
      </Dialog>

      {/* 7. Methodology Dialog */}
      <Dialog
        open={showMethodologyDialog}
        onClose={() => setShowMethodologyDialog(false)}
        title="SEBI RIA Audit Methodology"
        className="manus-dialog"
      >
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#374151]">
          <p>
            The FinAuditX audit engine performs deterministic calculations across 8 financial dimensions against standard Indian regulatory and fiduciary rules:
          </p>
          <div className="space-y-2">
            {[
              'Liquidity: Minimum 6 months of living expenses held in liquid instruments.',
              'Protection: Term insurance coverage minimum 10–15x gross annual income.',
              'Retirement: Corpus accumulation rate mapped to retirement age and inflation.',
              'Asset Allocation: Equity/Debt/Gold ratio aligned with age and assessed risk tolerance.',
            ].map((item) => (
              <div key={item} className="border-l-2 border-[#1B3A6B] pl-3 text-xs text-[#4B6080]">
                {item}
              </div>
            ))}
          </div>
          <p className="border-t border-[#DBEAFE] pt-3 text-[11px] text-[#6B7280]">
            Deterministic audit decision-support surface. Always review primary financial statements with the client.
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default FinancialAudit;
