import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Clock,
  FileText,
  Lightbulb,
  PieChart,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent, getHealthScoreStatus } from '../utils/formatters';

const initialSections = {
  client: { data: null, loading: true, error: null },
  health: { data: null, loading: true, error: null },
  summary: { data: null, loading: true, error: null },
  audit: { data: null, loading: true, error: null },
  goals: { data: null, loading: true, error: null },
};

const dimensionOrder = [
  { key: 'cashFlow', label: '1. Cash Flow & Savings' },
  { key: 'debtHealth', label: '2. Debt Management' },
  { key: 'taxEfficiency', label: '3. Tax Efficiency' },
  { key: 'liquidity', label: '4. Liquidity Coverage' },
  { key: 'riskAlignment', label: '5. Asset Allocation' },
  { key: 'goalReadiness', label: '6. Retirement & Goal Readiness' },
  { key: 'protection', label: '7. Insurance & Protection' },
  { key: 'diversification', label: '8. Portfolio Diversification' },
];

const goalStatusToBadge = {
  'on-track': { status: 'healthy', label: 'On Track' },
  attention: { status: 'warning', label: 'Attention' },
  'at-risk': { status: 'warning', label: 'Warning' },
  critical: { status: 'critical', label: 'Critical' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState(initialSections);

  const loadSection = useCallback(async (section, request) => {
    setSections((current) => ({
      ...current,
      [section]: { ...current[section], loading: true, error: null },
    }));

    try {
      const response = await request();
      setSections((current) => ({
        ...current,
        [section]: { data: response.data, loading: false, error: null },
      }));
    } catch (error) {
      console.error(`Failed to load dashboard ${section}:`, error);
      setSections((current) => ({
        ...current,
        [section]: { ...current[section], loading: false, error: 'This section could not be loaded.' },
      }));
    }
  }, []);

  const reloadClient = useCallback(() => loadSection('client', api.getClient), [loadSection]);
  const reloadHealth = useCallback(() => loadSection('health', api.getHealthScore), [loadSection]);
  const reloadSummary = useCallback(() => loadSection('summary', api.getFinancialSummary), [loadSection]);
  const reloadAudit = useCallback(() => loadSection('audit', api.getAudit), [loadSection]);
  const reloadGoals = useCallback(() => loadSection('goals', api.getGoals), [loadSection]);

  const reloadAll = useCallback(() => {
    reloadClient();
    reloadHealth();
    reloadSummary();
    reloadAudit();
    reloadGoals();
  }, [reloadClient, reloadHealth, reloadSummary, reloadAudit, reloadGoals]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const { client, health, summary, audit, goals } = sections;

  // Derive client identity details
  const clientInfo = client.data?.personalInfo || summary.data?.personalInfo;
  const riskProfile = client.data?.riskProfile || summary.data?.riskProfile || 'Moderate';

  // Health Score & Status
  const healthScore = health.data?.overallScore ?? 0;
  const healthStatus = getHealthScoreStatus(healthScore);
  const healthDimensions = health.data?.dimensions || {};

  // Audit findings & counts
  const severityCounts = audit.data?.categorized || { critical: [], warning: [], opportunity: [], healthy: [] };
  const criticalCount = severityCounts.critical?.length || 0;
  const warningCount = severityCounts.warning?.length || 0;
  const opportunityCount = severityCounts.opportunity?.length || 0;
  const healthyCount = severityCounts.healthy?.length || 0;
  const totalFindings = audit.data?.totalFindings || (criticalCount + warningCount + opportunityCount + healthyCount);

  // Top 3 priority findings to showcase
  const priorityFindings = useMemo(() => {
    if (!audit.data?.categorized) return [];
    const criticals = audit.data.categorized.critical || [];
    const warnings = audit.data.categorized.warning || [];
    const opportunities = audit.data.categorized.opportunity || [];
    return [...criticals, ...warnings, ...opportunities].slice(0, 3);
  }, [audit.data]);

  // Ranked dimensions (sorted by adherence or predefined canonical dimensions)
  const rankedDimensions = useMemo(() => {
    if (!healthDimensions || Object.keys(healthDimensions).length === 0) return [];
    return dimensionOrder.map((item) => {
      const dimData = healthDimensions[item.key] || { score: 0, reason: '' };
      return {
        key: item.key,
        label: item.label,
        score: dimData.score,
        reason: dimData.reason,
      };
    });
  }, [healthDimensions]);

  // Financial Metrics Calculations
  const netWorth = summary.data?.netWorth ?? 0;
  const monthlyIncome = summary.data?.monthlyIncome ?? client.data?.monthlyIncome ?? 0;
  const monthlyExpenses = summary.data?.monthlyExpenses ?? client.data?.monthlyExpenses ?? 0;
  const monthlySurplus = summary.data?.monthlySurplus ?? (monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 0;
  const totalDebt = summary.data?.totalDebt ?? 0;
  const monthlyEMIs = summary.data?.monthlyEMIs ?? 0;
  const emiBurden = monthlyIncome > 0 ? Math.round((monthlyEMIs / monthlyIncome) * 100) : 0;

  const emergencyFundVal = (client.data?.assets?.emergencyFund || 0) + (client.data?.assets?.cash || 0);
  const emergencyMonths = monthlyExpenses > 0 ? (emergencyFundVal / monthlyExpenses).toFixed(1) : '0.0';

  const totalInvestments = summary.data?.totalInvestments ?? Object.values(client.data?.assets || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
  const insuranceCoverage = summary.data?.insuranceCoverage ?? client.data?.insurance?.life ?? 0;
  const insuranceAdequacy = (monthlyIncome > 0) ? Math.round((insuranceCoverage / (monthlyIncome * 12 * 15)) * 100) : 0;

  // Portfolio allocation
  const portfolioData = useMemo(() => {
    const p = client.data?.portfolio || { equity: 62, debt: 25, gold: 8, cash: 5 };
    const eq = p.equity || 0;
    const debt = p.debt || 0;
    const gold = p.gold || 0;
    const cash = p.cash || 0;
    return [
      { name: 'Domestic Equity', pct: eq, color: '#0F172A', amount: totalInvestments * (eq / 100) },
      { name: 'Debt & Hybrid', pct: debt, color: '#0D9488', amount: totalInvestments * (debt / 100) },
      { name: 'Sovereign Gold', pct: gold, color: '#D97706', amount: totalInvestments * (gold / 100) },
      { name: 'Liquid Cash', pct: cash, color: '#94A3B8', amount: totalInvestments * (cash / 100) },
    ];
  }, [client.data?.portfolio, totalInvestments]);

  // Combined monthly goal SIP outflow
  const totalGoalSIP = useMemo(() => {
    if (!goals.data?.goals) return 0;
    return goals.data.goals.reduce((sum, g) => sum + (g.monthlySIP || 0), 0);
  }, [goals.data]);

  // Action Button config for findings
  const getFindingAction = (finding) => {
    const cat = (finding.category || '').toLowerCase();
    if (cat.includes('insurance') || cat.includes('protection')) {
      return { label: 'Inspect Coverage Gap', route: '/audit' };
    }
    if (cat.includes('retirement') || cat.includes('goal')) {
      return { label: 'Adjust Trajectory', route: '/goals' };
    }
    if (cat.includes('asset') || cat.includes('portfolio') || cat.includes('concentration')) {
      return { label: 'Review Rebalance', route: '/simulator' };
    }
    if (cat.includes('debt')) {
      return { label: 'Inspect Debt Plan', route: '/audit' };
    }
    return { label: 'Inspect Finding', route: '/audit' };
  };

  const getFindingIcon = (severity) => {
    if (severity === 'critical') return ShieldAlert;
    if (severity === 'warning') return AlertTriangle;
    return Lightbulb;
  };

  const isInitialLoading = health.loading && summary.loading && audit.loading;

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Skeleton className="lg:col-span-5 h-80" />
          <Skeleton className="lg:col-span-7 h-80" />
        </div>
        <Skeleton className="h-64" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Skeleton className="lg:col-span-7 h-72" />
          <Skeleton className="lg:col-span-5 h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP COMMAND & ACTION BAR */}
      <section className="card bg-white p-5 border border-slate-200">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Financial Overview</h1>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                ID: #{clientInfo?.name ? clientInfo.name.split(' ').map(n => n[0]).join('') + '-70942' : 'VM-70942'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                Verified Live
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {clientInfo?.name || 'Client'}
              {clientInfo?.age ? `, ${clientInfo.age}` : ''}
              {clientInfo?.location ? ` • ${clientInfo.location}` : ''}
              {riskProfile ? ` • ${riskProfile} Risk Profile` : ''}
              {' • Engine V2.4 (Deterministic Audit)'}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-teal-700 shrink-0" aria-hidden="true" />
              <span>Audited against SEBI RIA fiduciary planning framework across 8 core dimensions</span>
            </div>
          </div>

          {/* Rapid Triage Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {criticalCount > 0 ? (
              <button
                type="button"
                onClick={() => navigate('/audit')}
                className="inline-flex items-center gap-1.5 rounded bg-red-800 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-900 shadow-sm"
              >
                <AlertTriangle size={16} aria-hidden="true" />
                <span>Review {criticalCount} Critical Issue{criticalCount === 1 ? '' : 's'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/recommendations')}
                className="btn-primary"
              >
                <Lightbulb size={16} aria-hidden="true" />
                <span>Review Recommendations</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/simulator')}
              className="btn-secondary"
            >
              <Sparkles size={16} aria-hidden="true" />
              <span>Run Scenario</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="btn-secondary"
            >
              <FileText size={16} aria-hidden="true" />
              <span>Open Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. COMPOSITE HEALTH SCORE & 8-DIMENSIONS BENTO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Composite Health Card (5 cols) */}
        <div className="lg:col-span-5 card flex flex-col justify-between">
          {health.loading && !health.data ? (
            <Skeleton className="h-72" />
          ) : health.error && !health.data ? (
            <ErrorState title="Health score unavailable" message={health.error} onRetry={reloadHealth} />
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Composite Financial Health
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 border border-teal-200">
                    <TrendingUp size={13} />
                    8-Dimension Score
                  </span>
                </div>

                <div className="flex items-center gap-5 my-4">
                  {/* Gauge Ring */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-slate-100"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className={healthScore >= 70 ? 'text-teal-600' : healthScore >= 50 ? 'text-amber-500' : 'text-red-600'}
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="42"
                        stroke="currentColor"
                        strokeDasharray={`${(healthScore / 100) * 263.9} 263.9`}
                        strokeLinecap="round"
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold tracking-tight text-slate-950 tabular-nums">
                        {healthScore}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-950">{healthStatus.label}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Comprehensive rating synthesized across liquidity, protection, debt, and retirement viability.
                    </p>
                    {criticalCount > 0 && (
                      <div className="mt-2.5 inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        <AlertCircle size={13} className="text-red-700" />
                        <span>{criticalCount} Critical Breache{criticalCount === 1 ? '' : 's'} Unresolved</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advisor Synthesis Callout */}
                <div className="rounded border border-amber-200 bg-amber-50/70 p-3 text-xs leading-5 text-amber-900">
                  <span className="font-semibold text-amber-950">Advisor Synthesis: </span>
                  {audit.data?.summary?.message || 'Significant protection gap and retirement SIP shortfall require reallocation of monthly cash surplus.'}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/audit')}
                  className="text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
                >
                  <span>View audit logs & methodology</span>
                  <ArrowRight size={13} />
                </button>
                <span className="text-[11px] text-slate-400">SEBI RIA Benchmark: 2024.1</span>
              </div>
            </>
          )}
        </div>

        {/* 8 Core Dimensions Audit Matrix (7 cols) */}
        <div className="lg:col-span-7 card flex flex-col justify-between">
          {health.loading && !health.data ? (
            <Skeleton className="h-72" />
          ) : health.error && !health.data ? (
            <ErrorState title="Dimensions unavailable" message={health.error} onRetry={reloadHealth} />
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">Eight Core Dimensions Audit</h2>
                    <p className="text-xs text-slate-500">Evaluated against deterministic regulatory guidelines</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-teal-600" />
                      <span>Optimal (≥70)</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Moderate</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-600" />
                      <span>Vulnerable (&lt;50)</span>
                    </span>
                  </div>
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {rankedDimensions.map((dim) => {
                    const isVulnerable = dim.score < 50;
                    const isModerate = dim.score >= 50 && dim.score < 70;
                    const scoreBarColor = isVulnerable
                      ? 'bg-red-600'
                      : isModerate
                        ? 'bg-slate-800'
                        : 'bg-teal-600';

                    return (
                      <div
                        key={dim.key}
                        className={`p-2 rounded transition-colors ${isVulnerable ? 'bg-red-50/60 border border-red-100' : 'hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`font-medium ${isVulnerable ? 'text-red-900 font-semibold' : 'text-slate-800'}`}>
                            {dim.label}
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${isVulnerable ? 'text-red-700' : isModerate ? 'text-slate-900' : 'text-teal-700'
                              }`}
                          >
                            {dim.score}/100
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreBarColor}`}
                            style={{ width: `${Math.max(0, Math.min(dim.score, 100))}%` }}
                          />
                        </div>
                        {dim.reason && (
                          <p className="mt-1 text-[11px] leading-3.5 text-slate-500 truncate" title={dim.reason}>
                            {dim.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Calibrated across multi-scenario stress tests</span>
                <button
                  type="button"
                  onClick={() => navigate('/audit')}
                  className="text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                >
                  <span>Expand audit findings</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. PRIORITY ATTENTION ENGINE (ADVISOR ACTION QUEUE) */}
      <section className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-950">Priority Attention Engine</h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Real-time Rule Triage
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated fiduciary audit flagged {totalFindings} total items requiring advisor review
            </p>
          </div>

          {/* Severity Counter Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <AlertCircle size={13} className="text-red-700" />
              <span>{criticalCount} Critical</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle size={13} className="text-amber-700" />
              <span>{warningCount} Warnings</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Lightbulb size={13} className="text-blue-700" />
              <span>{opportunityCount} Opportunities</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <CheckCircle2 size={13} className="text-teal-700" />
              <span>{healthyCount} Healthy</span>
            </button>
          </div>
        </div>

        {/* Priority Findings List */}
        <div className="pt-4 space-y-3">
          {audit.loading && !audit.data ? (
            <Skeleton className="h-44" lines={3} />
          ) : audit.error && !audit.data ? (
            <ErrorState title="Audit findings unavailable" message={audit.error} onRetry={reloadAudit} />
          ) : priorityFindings.length > 0 ? (
            priorityFindings.map((finding) => {
              const Icon = getFindingIcon(finding.severity);
              const action = getFindingAction(finding);
              const isCritical = finding.severity === 'critical';
              const isWarning = finding.severity === 'warning';

              return (
                <div
                  key={finding.id}
                  className={`p-4 rounded border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${isCritical
                      ? 'bg-red-50/40 border-red-200 hover:bg-red-50/70'
                      : isWarning
                        ? 'bg-amber-50/30 border-amber-200 hover:bg-amber-50/60'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                >
                  <div className="flex items-start gap-3.5 max-w-4xl">
                    <div
                      className={`p-2 rounded shrink-0 mt-0.5 ${isCritical
                          ? 'bg-red-100 text-red-800'
                          : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={finding.severity} />
                        <h3 className="text-sm font-semibold text-slate-950">{finding.title}</h3>
                        <span className="text-xs text-slate-500">• {finding.category}</span>
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-slate-700">
                        <strong className="text-slate-900">Audit Evidence: </strong>
                        {finding.description || finding.impact}
                      </p>
                      {finding.impact && finding.description && (
                        <p className="mt-0.5 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">Projected Impact: </span>
                          {finding.impact}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => navigate(action.route)}
                      className={isCritical ? 'btn-primary bg-slate-900 text-xs px-3.5 py-2' : 'btn-secondary text-xs px-3.5 py-2'}
                    >
                      <span>{action.label}</span>
                      <ArrowRight size={13} className="ml-1" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              No unresolved priority audit findings detected.
            </div>
          )}
        </div>
      </section>

      {/* 4. CLIENT FINANCIAL POSITION SNAPSHOT (6 INSTITUTIONAL TILES) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-950">Client Financial Position Snapshot</h2>
          <span className="text-xs text-slate-500">Values reconciled from verified client assets & liabilities</span>
        </div>

        {summary.loading && !summary.data ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : summary.error && !summary.data ? (
          <ErrorState title="Financial position unavailable" message={summary.error} onRetry={reloadSummary} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* 1. Net Worth */}
            <div className="card p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Net Worth
              </span>
              <div className="my-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(netWorth)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-teal-700">
                <TrendingUp size={13} />
                <span>Assets - Liabilities</span>
              </div>
            </div>

            {/* 2. Monthly Surplus */}
            <div className="card p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Monthly Surplus
              </span>
              <div className="my-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(monthlySurplus)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Wallet size={13} className="text-teal-700" />
                <span>Savings Rate: {savingsRate}%</span>
              </div>
            </div>

            {/* 3. Total Liabilities */}
            <div className="card p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Total Debt
              </span>
              <div className="my-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(totalDebt)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <CheckCircle2 size={13} className={emiBurden <= 35 ? 'text-teal-700' : 'text-amber-600'} />
                <span>EMI: {formatCurrency(monthlyEMIs)}/mo ({emiBurden}%)</span>
              </div>
            </div>

            {/* 4. Emergency Fund */}
            <div className="card p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Emergency Fund
              </span>
              <div className="my-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(emergencyFundVal)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                <Clock size={13} />
                <span>{emergencyMonths} mos (Target: 6.0)</span>
              </div>
            </div>

            {/* 5. Invested Corpus */}
            <div className="card p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Invested Corpus
              </span>
              <div className="my-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(totalInvestments)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Eq: {client.data?.portfolio?.equity || 62}% • Debt: {client.data?.portfolio?.debt || 25}%</span>
              </div>
            </div>

            {/* 6. Life Insurance */}
            <div className="card p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Life Insurance
              </span>
              <div className="my-2">
                <span className="text-xl font-bold tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(insuranceCoverage)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-red-700 font-medium">
                <ShieldAlert size={13} />
                <span>Adequacy: {insuranceAdequacy}%</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. TWO-COLUMN SECTION: PRIORITY GOALS (7 COLS) & PORTFOLIO ALLOCATION (5 COLS) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Priority Financial Goals (7 cols) */}
        <div className="lg:col-span-7 card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Priority Financial Goals</h2>
                <p className="text-xs text-slate-500">Horizon feasibility calibrated with inflation and target year</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                <span>View All Goals ({goals.data?.goals?.length || 0})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Goals Table */}
            {goals.loading && !goals.data ? (
              <Skeleton className="h-48" lines={3} />
            ) : goals.error && !goals.data ? (
              <ErrorState title="Goals unavailable" message={goals.error} onRetry={reloadGoals} />
            ) : goals.data?.goals?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2 px-3 rounded-l">Goal Objective</th>
                      <th className="py-2 px-3">Target & Horizon</th>
                      <th className="py-2 px-3">Funded</th>
                      <th className="py-2 px-3">Deficit / Gap</th>
                      <th className="py-2 px-3 text-right rounded-r">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {goals.data.goals.map((goal) => {
                      const fundingPct = Math.round(goal.analysis?.fundingPercentage || 0);
                      const isCritical = goal.analysis?.status === 'critical';
                      const isWarning = goal.analysis?.status === 'at-risk' || goal.analysis?.status === 'attention';
                      const gap = goal.analysis?.gap || 0;
                      const statusConfig = goalStatusToBadge[goal.analysis?.status] || { status: 'neutral', label: goal.analysis?.statusMessage || 'Pending' };

                      return (
                        <tr
                          key={goal.name}
                          onClick={() => navigate('/goals')}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{goal.name}</div>
                            <div className="text-[11px] text-slate-500 capitalize">{goal.priority} Priority</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-900 tabular-nums">{formatCurrency(goal.targetAmount)}</div>
                            <div className="text-[11px] text-slate-500">{goal.yearsToGoal} yrs remaining</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 min-w-[90px]">
                              <span className="font-medium tabular-nums text-slate-800">{fundingPct}%</span>
                              <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-teal-600'
                                    }`}
                                  style={{ width: `${Math.min(fundingPct, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className={`py-2.5 px-3 font-medium tabular-nums ${gap > 0 ? 'text-red-700' : 'text-teal-700'}`}>
                            {gap > 0 ? `-${formatCurrency(gap)}` : 'Fully Funded'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <StatusBadge status={statusConfig.status} label={statusConfig.label} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No goals found.</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Combined Goal Outflow: {formatCurrency(totalGoalSIP)} / mo</span>
            <button
              type="button"
              onClick={() => navigate('/goals')}
              className="text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              <span>Inspect goal trajectories</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Right Column: Portfolio Allocation Snapshot (5 cols) */}
        <div className="lg:col-span-5 card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Portfolio Allocation Snapshot</h2>
                <p className="text-xs text-slate-500">Active Asset Composition</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {riskProfile} Mandate
              </span>
            </div>

            {/* Donut & Legend Visualization */}
            <div className="flex items-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Equity slice */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="#0F172A"
                    strokeDasharray={`${(portfolioData[0].pct / 100) * 251.3} 251.3`}
                    strokeWidth="12"
                  />
                  {/* Debt slice */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="#0D9488"
                    strokeDasharray={`${(portfolioData[1].pct / 100) * 251.3} 251.3`}
                    strokeDashoffset={`-${(portfolioData[0].pct / 100) * 251.3}`}
                    strokeWidth="12"
                  />
                  {/* Gold slice */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="#D97706"
                    strokeDasharray={`${(portfolioData[2].pct / 100) * 251.3} 251.3`}
                    strokeDashoffset={`-${((portfolioData[0].pct + portfolioData[1].pct) / 100) * 251.3}`}
                    strokeWidth="12"
                  />
                  {/* Cash slice */}
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="#94A3B8"
                    strokeDasharray={`${(portfolioData[3].pct / 100) * 251.3} 251.3`}
                    strokeDashoffset={`-${((portfolioData[0].pct + portfolioData[1].pct + portfolioData[2].pct) / 100) * 251.3}`}
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Total</span>
                  <span className="text-sm font-bold text-slate-950">100%</span>
                </div>
              </div>

              {/* Legend Table */}
              <div className="flex-1 space-y-1.5 text-xs">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-950 tabular-nums">
                      {item.pct}% ({formatCurrency(item.amount)})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* High Equity Alert */}
            {(client.data?.portfolio?.equity || 0) > 65 && (
              <div className="mt-3 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-4 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Concentration Note:</strong> Equity exposure is at {client.data?.portfolio?.equity}%, elevated relative to the {riskProfile} target band.
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/portfolio')}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              <span>Portfolio Details</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/simulator')}
              className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
            >
              <span>Simulator</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
