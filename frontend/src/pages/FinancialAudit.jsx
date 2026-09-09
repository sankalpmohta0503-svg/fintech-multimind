import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownUp,
  BookOpen,
  CheckCircle2,
  FileSearch,
  Filter,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import api from '../services/api';
import AuditFindingCard, { formatEvidenceLabel, formatEvidenceValue } from '../components/AuditFindingCard';
import Dialog from '../components/Dialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, getHealthScoreStatus } from '../utils/formatters';

const severityOrder = { critical: 0, warning: 1, opportunity: 2, healthy: 3 };

const severityTabs = [
  { id: 'all', label: 'All Findings' },
  { id: 'critical', label: 'Critical Breaches' },
  { id: 'warning', label: 'Warnings' },
  { id: 'opportunity', label: 'Opportunities' },
  { id: 'healthy', label: 'Resolved / Healthy' },
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

      if (auditRes.status === 'fulfilled') {
        setAudit(auditRes.value.data);
        // Expand the first critical finding by default
        const firstCritical = auditRes.value.data.categorized?.critical?.[0];
        setExpandedFindings(firstCritical ? new Set([firstCritical.id]) : new Set());
      } else {
        throw auditRes.reason;
      }

      if (healthRes.status === 'fulfilled') {
        setHealthScore(healthRes.value.data);
      }
      if (clientRes.status === 'fulfilled') {
        setClient(clientRes.value.data);
      }
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

  // Extract all unique categories present in findings
  const uniqueCategories = useMemo(() => {
    if (!audit?.findings) return [];
    const set = new Set(audit.findings.map((f) => f.category).filter(Boolean));
    return Array.from(set);
  }, [audit]);

  // Calculate Total Deficit Exposure across all findings
  const totalDeficitExposure = useMemo(() => {
    if (!audit?.findings) return 0;
    return audit.findings.reduce((sum, f) => {
      const gap = f.evidence?.gap || f.evidence?.shortfall || 0;
      return sum + (gap > 0 ? gap : 0);
    }, 0);
  }, [audit]);

  // Compute adherence rate
  const adherenceRate = useMemo(() => {
    if (!audit?.totalFindings) return 100;
    const compliant = (audit.categorized.healthy?.length || 0) + (audit.categorized.opportunity?.length || 0);
    return Math.round((compliant / audit.totalFindings) * 100);
  }, [audit]);

  // Filtered & Sorted Findings
  const filteredFindings = useMemo(() => {
    if (!audit?.findings) return [];

    const query = searchQuery.trim().toLowerCase();
    let list = selectedSeverity === 'all'
      ? audit.findings
      : (audit.categorized[selectedSeverity] || []);

    if (selectedCategory !== 'all') {
      list = list.filter((f) => f.category === selectedCategory);
    }

    if (query) {
      list = list.filter((f) => {
        return (
          f.title?.toLowerCase().includes(query) ||
          f.category?.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query) ||
          f.impact?.toLowerCase().includes(query) ||
          f.recommendation?.toLowerCase().includes(query)
        );
      });
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'gap') {
        const gapA = a.evidence?.gap || a.evidence?.shortfall || 0;
        const gapB = b.evidence?.gap || b.evidence?.shortfall || 0;
        return gapB - gapA;
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [audit, searchQuery, selectedSeverity, selectedCategory, sortBy]);

  const toggleFinding = (id) => {
    setExpandedFindings((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeverityCount = (tabId) => {
    if (!audit) return 0;
    if (tabId === 'all') return audit.totalFindings;
    return audit.categorized[tabId]?.length || 0;
  };

  const clientInfo = client?.personalInfo;
  const criticalCount = audit?.categorized?.critical?.length || 0;
  const warningCount = audit?.categorized?.warning?.length || 0;
  const opportunityCount = audit?.categorized?.opportunity?.length || 0;
  const overallScore = healthScore?.overallScore ?? (criticalCount > 0 ? 64 : 85);
  const healthStatus = getHealthScoreStatus(overallScore);

  if (loading && !audit) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error && !audit) {
    return (
      <ErrorState
        title="Financial audit unavailable"
        message={error}
        onRetry={loadAuditData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP OPERATIONAL CONTROL BANNER */}
      <section className="card bg-white p-5 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide uppercase mb-2">
              <ShieldCheck size={14} className="text-teal-700" />
              <span>Engine V2.4 (Deterministic RIA Protocol)</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Financial Audit Findings & Evidence Engine
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              {audit?.totalFindings || 0} Total Findings (
              <span className="font-semibold text-red-700">{criticalCount} Critical</span>
              {`, `}
              <span className="font-semibold text-amber-700">{warningCount} Warnings</span>
              {`, `}
              <span className="font-semibold text-blue-700">{opportunityCount} Opportunities</span>
              ) across 8 fiduciary dimensions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowMethodologyDialog(true)}
              className="btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5"
            >
              <BookOpen size={15} />
              <span>Audit Methodology</span>
            </button>
            <button
              type="button"
              onClick={loadAuditData}
              disabled={loading}
              className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Re-run Audit Engine</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. HEALTH AUDIT METRIC MATRIX (4 TILES) */}
      {audit && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Audit Health Index */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Audit Health Index
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                overallScore < 70 ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-teal-50 text-teal-800 border border-teal-200'
              }`}>
                {healthStatus.label}
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {overallScore}
                </span>
                <span className="text-xs font-medium text-slate-500">/ 100</span>
              </div>
              <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{criticalCount} Critical breaches flagged</span>
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${overallScore >= 70 ? 'bg-teal-600' : overallScore >= 50 ? 'bg-amber-500' : 'bg-red-600'}`}
                style={{ width: `${Math.min(overallScore, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Total Deficit Exposure */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Deficit Exposure
              </span>
              <TrendingDown size={16} className="text-red-600" />
            </div>

            <div className="my-2">
              <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
                {totalDeficitExposure > 0 ? formatCurrency(totalDeficitExposure) : '₹0.00'}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Cumulative capital shortfall across goals & life cover
              </p>
            </div>

            <div className="text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              Impacts Wealth Solvency Horizon
            </div>
          </div>

          {/* Card 3: Policy Rule Adherence */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Policy Rule Adherence
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                adherenceRate >= 70 ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'
              }`}>
                {adherenceRate >= 70 ? 'Satisfactory' : 'Action Needed'}
              </span>
            </div>

            <div className="my-2">
              <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
                {adherenceRate}%
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {(audit.categorized.healthy?.length || 0) + (audit.categorized.opportunity?.length || 0)} of {audit.totalFindings} criteria compliant
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${adherenceRate >= 70 ? 'bg-teal-600' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(adherenceRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 4: Remediation Mandate */}
          <div className="card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Remediation Mandate
              </span>
              <AlertTriangle size={16} className={criticalCount > 0 ? 'text-red-700' : 'text-teal-700'} />
            </div>

            <div className="my-2">
              <span className={`text-2xl font-bold tracking-tight ${criticalCount > 0 ? 'text-red-700' : 'text-teal-700'}`}>
                {criticalCount > 0 ? 'Immediate Action' : 'Standard Routine'}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {criticalCount > 0
                  ? 'Fiduciary plan adjustments recommended'
                  : 'All primary solvency thresholds satisfied'}
              </p>
            </div>

            <div className={`text-[11px] font-medium px-2 py-0.5 rounded ${
              criticalCount > 0 ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-teal-50 text-teal-800 border border-teal-100'
            }`}>
              {criticalCount > 0 ? 'Remediation Window Active' : 'Compliant Status'}
            </div>
          </div>
        </section>
      )}

      {/* 3. METHODOLOGY BANNER */}
      <section className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <FileSearch size={16} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-950 uppercase tracking-wider">
              Deterministic Fiduciary Audit Protocol
            </h2>
            <p className="text-xs text-slate-600">
              Mathematical diagnostics with deterministic triggers. Rules evaluated against client financial data.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMethodologyDialog(true)}
          className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded transition-colors shrink-0"
        >
          View Methodology Breakdown
        </button>
      </section>

      {/* 4. FILTER, SEARCH, AND SORTING TOOLBAR */}
      <section className="space-y-3">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
          {severityTabs.map((tab) => {
            const count = getSeverityCount(tab.id);
            const isActive = selectedSeverity === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSeverity(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.id === 'critical'
                      ? 'bg-red-50 text-red-700 font-semibold'
                      : tab.id === 'warning'
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Category & Sorting Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, evidence, impact, or recommendations..."
              className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">All Categories ({uniqueCategories.length})</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="severity">Sort by: Severity (Highest First)</option>
              <option value="gap">Sort by: Deficit Amount (Largest)</option>
              <option value="category">Sort by: Category Name</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. FINDINGS STACK */}
      <section aria-live="polite" className="space-y-3">
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding) => (
            <AuditFindingCard
              key={finding.id}
              finding={finding}
              expanded={expandedFindings.has(finding.id)}
              onToggle={() => toggleFinding(finding.id)}
              onExplain={() => setDialogFinding(finding)}
            />
          ))
        ) : (
          <EmptyState
            title="No audit findings match your filters"
            message="Try switching severity tabs, resetting the category filter, or clearing your search term."
            action={
              selectedSeverity !== 'all' || selectedCategory !== 'all' || searchQuery ? (
                <button
                  type="button"
                  className="btn-secondary text-xs"
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

      {/* 6. FINDING EXPLANATION DETAIL DIALOG */}
      <Dialog
        open={Boolean(dialogFinding)}
        onClose={() => setDialogFinding(null)}
        title={dialogFinding ? dialogFinding.title : 'Audit Finding Details'}
      >
        {dialogFinding && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
              <StatusBadge status={dialogFinding.severity} />
              <span className="font-semibold text-slate-900">{dialogFinding.category}</span>
            </div>

            {dialogFinding.description && (
              <div>
                <h3 className="font-semibold text-slate-950 mb-1">Finding Description</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {dialogFinding.description}
                </p>
              </div>
            )}

            {dialogFinding.evidence && Object.keys(dialogFinding.evidence).length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-950 mb-1">Audited Baseline Evidence</h3>
                <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white px-3 py-1">
                  {Object.entries(dialogFinding.evidence).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500">{formatEvidenceLabel(key)}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatEvidenceValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dialogFinding.impact && (
              <div>
                <h3 className="font-semibold text-slate-950 mb-1">Fiduciary Impact</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {dialogFinding.impact}
                </p>
              </div>
            )}

            {dialogFinding.recommendation && (
              <div>
                <h3 className="font-semibold text-slate-950 mb-1">Recommended Action</h3>
                <p className="text-teal-950 font-medium leading-relaxed bg-teal-50 p-2.5 rounded border border-teal-200">
                  {dialogFinding.recommendation}
                </p>
              </div>
            )}

            {dialogFinding.disclaimer && (
              <div className="pt-2 border-t border-slate-200 text-slate-400 text-[11px]">
                ℹ️ {dialogFinding.disclaimer}
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* 7. METHODOLOGY EXPLANATION DIALOG */}
      <Dialog
        open={showMethodologyDialog}
        onClose={() => setShowMethodologyDialog(false)}
        title="Deterministic Financial Audit Methodology"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <p className="leading-relaxed">
            The FinAuditX Audit Engine applies mathematical rules and fiduciary benchmarks to evaluate client financial health across 8 core dimensions.
          </p>

          <div className="space-y-2">
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <strong className="text-slate-950 block mb-0.5">1. Solvency & Debt Health</strong>
              <span>Evaluates EMI-to-income ratio (threshold ≤35%) and loan tenure exposure to prevent liquidity traps.</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <strong className="text-slate-950 block mb-0.5">2. Protection Adequacy (Human Life Value)</strong>
              <span>Compares pure term cover against 10-15x annual income plus outstanding liabilities to safeguard dependents.</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <strong className="text-slate-950 block mb-0.5">3. Goal Trajectory & Inflation Indexing</strong>
              <span>Simulates target accumulation with compound growth and inflation to isolate funding shortfalls early.</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <strong className="text-slate-950 block mb-0.5">4. Asset Allocation & Risk Alignment</strong>
              <span>Checks portfolio concentration against client risk profile mandate limits (e.g. Moderate vs Aggressive).</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            All calculations are deterministic and explainable without black-box machine learning models.
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default FinancialAudit;
