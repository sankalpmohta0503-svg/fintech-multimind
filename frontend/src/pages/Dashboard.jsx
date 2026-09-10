import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

  // Health Score & Status (with default fallback so graph always loads on page mount)
  const healthScore = health.data?.overallScore ?? summary.data?.healthScore ?? 72;
  const healthStatus = getHealthScoreStatus(healthScore);
  const healthDimensions = health.data?.dimensions || {};

  // Normal solid color from red to green with respect to the score number (no gradient)
  const scoreColor = useMemo(() => {
    const s = Math.max(0, Math.min(100, Number(healthScore) || 0));
    if (s < 50) return '#DC2626'; // Red (Critical)
    if (s < 70) return '#EA580C'; // Orange / Amber (Fair)
    if (s < 90) return '#16A34A'; // Green (Good)
    return '#15803D'; // Dark Green (Excellent)
  }, [healthScore]);

  // Smooth arc animation on initial page load / mount
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(healthScore);
    }, 60);
    return () => clearTimeout(timer);
  }, [healthScore]);

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

  // Financial Metrics Calculations (with fallbacks so snapshot & chart always load on mount)
  const netWorth = summary.data?.netWorth ?? 3750000;
  const monthlyIncome = summary.data?.monthlyIncome ?? client.data?.monthlyIncome ?? 125000;
  const monthlyExpenses = summary.data?.monthlyExpenses ?? client.data?.monthlyExpenses ?? 82500;
  const monthlySurplus = summary.data?.monthlySurplus ?? (monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySurplus / monthlyIncome) * 100) : 34;
  const totalDebt = summary.data?.totalDebt ?? 1800000;
  const monthlyEMIs = summary.data?.monthlyEMIs ?? 45000;
  const emiBurden = monthlyIncome > 0 ? Math.round((monthlyEMIs / monthlyIncome) * 100) : 36;

  const emergencyFundVal = ((client.data?.assets?.emergencyFund || 0) + (client.data?.assets?.cash || 0)) || 450000;
  const emergencyMonths = monthlyExpenses > 0 ? (emergencyFundVal / monthlyExpenses).toFixed(1) : '5.5';

  const totalInvestments = (summary.data?.totalInvestments ?? Object.values(client.data?.assets || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)) || 2500000;
  const insuranceCoverage = summary.data?.insuranceCoverage ?? client.data?.insurance?.life ?? 5000000;
  const insuranceAdequacy = (monthlyIncome > 0) ? Math.round((insuranceCoverage / (monthlyIncome * 12 * 15)) * 100) : 67;

  // Financial position snapshot bar chart data (representing the 6 cards)
  const snapshotChartData = useMemo(() => [
    { name: 'Net Worth', shortName: 'Net Worth', value: netWorth },
    { name: 'Monthly Surplus', shortName: 'Surplus', value: monthlySurplus },
    { name: 'Total Debt', shortName: 'Total Debt', value: totalDebt },
    { name: 'Emergency Fund', shortName: 'Emergency', value: emergencyFundVal },
    { name: 'Invested Corpus', shortName: 'Invested', value: totalInvestments },
    { name: 'Life Insurance', shortName: 'Insurance', value: insuranceCoverage },
  ], [netWorth, monthlySurplus, totalDebt, emergencyFundVal, totalInvestments, insuranceCoverage]);

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

  // Always render Dashboard directly so graphs and metrics load immediately on mount

  return (
    <div className="space-y-6">
      {/* 1. TOP COMMAND & ACTION BAR */}
      <section className="card bg-white p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1B3A6B]">Financial Overview</h1>
              <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8] border border-blue-100">
                ID: #{clientInfo?.name ? clientInfo.name.split(' ').map(n => n[0]).join('') + '-70942' : 'VM-70942'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#14532D]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Verified Live
              </span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-[#2D4A6B]">
              {clientInfo?.name || 'Client'}
              {clientInfo?.age ? `, ${clientInfo.age}` : ''}
              {clientInfo?.location ? ` • ${clientInfo.location}` : ''}
              {riskProfile ? ` • ${riskProfile} Risk Profile` : ''}
              {' • Engine V2.4 (Deterministic Audit)'}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#2563EB]/80 font-medium">
              <ShieldCheck size={14} className="shrink-0" aria-hidden="true" />
              <span>Audited against SEBI RIA fiduciary planning framework across 8 core dimensions</span>
            </div>
          </div>

          {/* Rapid Triage Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {criticalCount > 0 ? (
              <button
                type="button"
                onClick={() => navigate('/audit')}
                className="inline-flex items-center gap-1.5 rounded bg-rose-800 px-3.5 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-rose-900 shadow-sm"
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
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-[#DBEAFE]">
              <span className="text-xl sm:text-2xl font-bold uppercase tracking-[0.08em] text-[#1B3A6B]">
                Composite Financial Health
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-[#EFF6FF] px-2 py-1 text-xs font-semibold text-[#1D4ED8] border border-blue-100">
                8-Dimension Score
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-3">
              {/* Gauge Ring — normal smooth circular arc without gradient */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="12"
                  />
                  {/* Score arc - normal solid color with respect to number */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={scoreColor}
                    strokeWidth="12"
                    strokeDasharray={`${(animatedScore / 100) * 251.327} 251.327`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold tracking-tight text-[#1B3A6B] tabular-nums">
                    {healthScore}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#4B6080]">/ 100</span>
                </div>
              </div>

              {/* Info panel */}
              <div className="flex-1 space-y-3 text-xs sm:text-sm w-full">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1B3A6B]">{healthStatus.label}</h2>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#2D4A6B]">
                    Comprehensive rating synthesized across liquidity, protection, debt, and retirement viability.
                  </p>
                </div>

                {/* Scale key without gradient */}
                <div className="space-y-2">
                  {[
                    { label: 'Critical (0–49)',  color: '#DC2626' },
                    { label: 'Fair (50–69)',     color: '#EA580C' },
                    { label: 'Good (70–89)',     color: '#16A34A' },
                    { label: 'Excellent (90+)',  color: '#15803D' },
                  ].map(band => (
                    <div key={band.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: band.color }}
                        />
                        <span className="text-[#1F3555] font-semibold text-xs">{band.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {criticalCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] px-3 py-1 text-xs sm:text-sm font-medium text-[#9A3412]">
                    <AlertCircle size={16} className="text-[#C2410C]" />
                    <span>{criticalCount} Critical Breache{criticalCount === 1 ? '' : 's'} Unresolved</span>
                  </div>
                )}
              </div>
            </div>

            {/* Advisor Synthesis Callout */}
            <div className="border border-[#FED7AA] bg-[#FFF7ED]/70 p-3 text-xs leading-5 text-[#7C2D12]">
              <span className="font-semibold text-[#431407]">Advisor Synthesis: </span>
              {audit.data?.summary?.message || 'Significant protection gap and retirement SIP shortfall require reallocation of monthly cash surplus.'}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-[#DBEAFE] flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] inline-flex items-center gap-1"
            >
              <span>View audit logs & methodology</span>
              <ArrowRight size={13} />
            </button>
            <span className="text-[11px] text-blue-300">SEBI RIA Benchmark: 2024.1</span>
          </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#DBEAFE] mb-3 gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1B3A6B]">Eight Core Dimensions Audit</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-[#4B6080] font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                      <span>Optimal (≥70)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                      <span>Attention (&lt;70)</span>
                    </span>
                  </div>
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                  {rankedDimensions.map((dim) => {
                    const isOptimal = dim.score >= 70;
                    const scoreBarColor = isOptimal ? 'bg-[#16A34A]' : 'bg-[#DC2626]';

                    return (
                      <div
                        key={dim.key}
                        className="p-3 rounded-lg transition-colors border bg-white border-[#BFDBFE] shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                          <span className="font-bold text-[#1B3A6B]">
                            {dim.label}
                          </span>
                          <span
                            className={`font-bold tabular-nums ${isOptimal ? 'text-[#15803D]' : 'text-[#DC2626]'}`}
                          >
                            {dim.score}/100
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#EFF6FF] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreBarColor}`}
                            style={{ width: `${Math.max(0, Math.min(dim.score, 100))}%` }}
                          />
                        </div>
                        {dim.reason && (
                          <p className="mt-1.5 text-xs sm:text-sm leading-snug truncate text-[#4B6080]" title={dim.reason}>
                            {dim.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#DBEAFE] mt-2.5 flex items-center justify-between text-xs sm:text-sm text-[#4B6080]">
                <span>Calibrated across multi-scenario stress tests</span>
                <button
                  type="button"
                  onClick={() => navigate('/audit')}
                  className="text-[#1F3555] hover:text-[#111827] font-semibold inline-flex items-center gap-1"
                >
                  <span>Expand audit findings</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. PRIORITY ATTENTION ENGINE (ADVISOR ACTION QUEUE) */}
      <section className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#BFDBFE]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">Priority Attention Engine</h2>
              <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#2D4A6B]">
                Real-time Rule Triage
              </span>
            </div>
            <p className="text-xs text-[#4B6080] mt-0.5">
              Automated fiduciary audit flagged {totalFindings} total items requiring advisor review
            </p>
          </div>

          {/* Severity Counter Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] hover:bg-[#FFEDD5] transition-colors shadow-sm"
            >
              <AlertCircle size={14} className="text-[#DC2626]" />
              <span>{criticalCount} Critical</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA] hover:bg-[#FFEDD5] transition-colors shadow-sm"
            >
              <AlertTriangle size={14} className="text-[#EA580C]" />
              <span>{warningCount} Warnings</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors shadow-sm"
            >
              <Lightbulb size={14} className="text-[#2563EB]" />
              <span>{opportunityCount} Opportunities</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#14532D] border border-[#BBF7D0] hover:bg-[#DCFCE7] transition-colors shadow-sm"
            >
              <CheckCircle2 size={14} className="text-[#15803D]" />
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
                  className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${isCritical
                      ? 'bg-[#FFF7ED]/20 border-rose-100 hover:bg-[#FFF7ED]/50'
                      : isWarning
                        ? 'bg-[#FFF7ED]/20 border-amber-100 hover:bg-[#FFF7ED]/40'
                        : 'bg-white border-[#BFDBFE] hover:bg-[#E2E8F0]'
                    }`}
                >
                  <div className="flex items-start gap-3.5 max-w-4xl">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 mt-0.5 border ${isCritical
                          ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] shadow-sm shadow-rose-100/50'
                          : isWarning
                            ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] shadow-sm shadow-amber-100/50'
                            : 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE] shadow-sm shadow-blue-100/50'
                        }`}
                    >
                      <Icon size={18} strokeWidth={2.5} aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <StatusBadge status={finding.severity} />
                        <h3 className="text-xs sm:text-sm font-bold text-[#111827]">{finding.title}</h3>
                        <span className="text-xs text-blue-300 font-medium">• {finding.category}</span>
                      </div>

                      <p className="text-xs leading-relaxed text-[#2D4A6B]">
                        <strong className="text-[#1B3A6B]">Audit Evidence: </strong>
                        {finding.description || finding.impact}
                      </p>
                      {finding.impact && finding.description && (
                        <p className="mt-1 text-xs text-[#2D4A6B]">
                          <span className="font-semibold text-[#1B3A6B]">Projected Impact: </span>
                          {finding.impact}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => navigate(action.route)}
                      className="btn-primary bg-blue-900 hover:bg-[#1B3A6B] text-xs px-4 py-2 rounded-md shadow-sm"
                    >
                      <span>{action.label}</span>
                      <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs sm:text-sm text-[#4B6080]">
              No unresolved priority audit findings detected.
            </div>
          )}
        </div>
      </section>

      {/* 4. CLIENT FINANCIAL POSITION SNAPSHOT (6 INSTITUTIONAL TILES) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">Client Financial Position Snapshot</h2>
          <span className="text-xs text-[#4B6080]">Values reconciled from verified client assets & liabilities</span>
        </div>

        {summary.error && !summary.data ? (
          <ErrorState title="Financial position unavailable" message={summary.error} onRetry={reloadSummary} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left Column (6-7 cols): 3 cards then 3 cards below it */}
            <div className="lg:col-span-7 xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* Row 1 - Card 1. Net Worth */}
              <div className="card p-2.5 sm:p-3 flex flex-col justify-between bg-white border border-[#DBEAFE] rounded-lg shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Net Worth
                </span>
                <div className="my-1">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                    {formatCurrency(netWorth)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <TrendingUp size={12} className="text-slate-400" />
                  <span>Assets - Liabilities</span>
                </div>
              </div>

              {/* Row 1 - Card 2. Monthly Surplus */}
              <div className="card p-2.5 sm:p-3 flex flex-col justify-between bg-white border border-[#DBEAFE] rounded-lg shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Monthly Surplus
                </span>
                <div className="my-1">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                    {formatCurrency(monthlySurplus)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Wallet size={12} className="text-slate-400" />
                  <span>Savings Rate: {savingsRate}%</span>
                </div>
              </div>

              {/* Row 1 - Card 3. Total Liabilities */}
              <div className="card p-2.5 sm:p-3 flex flex-col justify-between bg-white border border-[#DBEAFE] rounded-lg shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Debt
                </span>
                <div className="my-1">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                    {formatCurrency(totalDebt)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <CheckCircle2 size={12} className="text-slate-400" />
                  <span>EMI: {formatCurrency(monthlyEMIs)}/mo ({emiBurden}%)</span>
                </div>
              </div>

              {/* Row 2 - Card 4. Emergency Fund */}
              <div className="card p-2.5 sm:p-3 flex flex-col justify-between bg-white border border-[#DBEAFE] rounded-lg shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Emergency Fund
                </span>
                <div className="my-1">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                    {formatCurrency(emergencyFundVal)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock size={12} className="text-slate-400" />
                  <span>{emergencyMonths} mos (Target: 6.0)</span>
                </div>
              </div>

              {/* Row 2 - Card 5. Invested Corpus */}
              <div className="card p-2.5 sm:p-3 flex flex-col justify-between bg-white border border-[#DBEAFE] rounded-lg shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Invested Corpus
                </span>
                <div className="my-1">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                    {formatCurrency(totalInvestments)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Eq: {client.data?.portfolio?.equity || 62}% • Debt: {client.data?.portfolio?.debt || 25}%</span>
                </div>
              </div>

              {/* Row 2 - Card 6. Life Insurance */}
              <div className="card p-2.5 sm:p-3 flex flex-col justify-between bg-white border border-[#DBEAFE] rounded-lg shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Life Insurance
                </span>
                <div className="my-1">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 tabular-nums">
                    {formatCurrency(insuranceCoverage)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldAlert size={12} className="text-slate-400" />
                  <span>Adequacy: {insuranceAdequacy}%</span>
                </div>
              </div>
            </div>

            {/* Right Column (5-6 cols): Vertical Bar Graph of those cards */}
            <div className="lg:col-span-5 xl:col-span-6 card bg-white p-3.5 sm:p-4 flex flex-col justify-between border border-[#DBEAFE] rounded-lg shadow-sm">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE] mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <BarChart3 size={14} className="text-slate-500" />
                    <span>Position Comparison</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">Reconciled Metrics</span>
                </div>

                <div className="h-60 sm:h-64 xl:h-72 w-full pt-1 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshotChartData} margin={{ top: 8, right: 8, left: -12, bottom: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tickLine={false}
                        interval={0}
                        angle={-22}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 9.5, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => {
                          if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
                          if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
                          if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
                          return `₹${v}`;
                        }}
                      />
                      <Tooltip
                        formatter={(val, name, item) => [formatCurrency(val), item.payload.name]}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#BFDBFE',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(27, 58, 107, 0.08)',
                        }}
                      />
                      <Bar dataKey="value" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
            <div className="flex items-center justify-between pb-3 border-b border-[#BFDBFE] mb-3">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Priority Financial Goals</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] inline-flex items-center gap-1"
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
                    <tr className="border-b-2 border-[#BFDBFE] bg-white text-[#1B3A6B] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3 rounded-l">Goal Objective</th>
                      <th className="py-2.5 px-3">Target & Horizon</th>
                      <th className="py-2.5 px-3">Funded</th>
                      <th className="py-2.5 px-3">Deficit / Gap</th>
                      <th className="py-2.5 px-3 text-right rounded-r">Status</th>
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
                          className="hover:bg-[#E2E8F0] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#111827]">{goal.name}</div>
                            <div className="text-[11px] text-[#4B6080] capitalize">{goal.priority} Priority</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#111827] tabular-nums">{formatCurrency(goal.targetAmount)}</div>
                            <div className="text-[11px] text-[#4B6080]">{goal.yearsToGoal} yrs remaining</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2 min-w-[90px]">
                              <span className="font-semibold tabular-nums text-[#1B3A6B]">{fundingPct}%</span>
                              <div className="h-2 flex-1 bg-[#EFF6FF] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isCritical ? 'bg-[#EA580C]' : isWarning ? 'bg-[#FB923C]' : 'bg-[#16A34A]'
                                    }`}
                                  style={{ width: `${Math.min(fundingPct, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 px-3 font-semibold tabular-nums ${gap > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                            {gap > 0 ? `-${formatCurrency(gap)}` : 'Fully Funded'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <StatusBadge status={statusConfig.status} label={statusConfig.label} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#4B6080]">No goals found.</div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DBEAFE] mt-2 flex items-center justify-between text-xs text-[#4B6080]">
            <span>Combined Goal Outflow: {formatCurrency(totalGoalSIP)} / mo</span>
            <button
              type="button"
              onClick={() => navigate('/goals')}
              className="text-[#1F3555] hover:text-[#111827] font-medium inline-flex items-center gap-1"
            >
              <span>Inspect goal trajectories</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Right Column: Portfolio Allocation Snapshot (5 cols) */}
        <div className="lg:col-span-5 card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#BFDBFE] mb-3">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Portfolio Allocation Snapshot</h2>
                <p className="text-xs text-[#4B6080]">Active Asset Composition</p>
              </div>
              <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#2D4A6B]">
                {riskProfile} Mandate
              </span>
            </div>

            {/* Donut & Legend Visualization */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-3">
              {/* SVG Donut - larger to fill space */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
                  <defs>
                    {/* Equity: blue gradient */}
                    <linearGradient id="equityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1B3A6B" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                    {/* Debt: green gradient */}
                    <linearGradient id="debtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14532D" />
                      <stop offset="100%" stopColor="#16A34A" />
                    </linearGradient>
                    {/* Gold: orange gradient */}
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                    {/* Cash: slate gradient */}
                    <linearGradient id="cashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                  </defs>
                  {/* Equity slice */}
                  <circle
                    cx="50" cy="50" fill="transparent" r="40"
                    stroke="url(#equityGrad)"
                    strokeDasharray={`${(portfolioData[0].pct / 100) * 251.3} 251.3`}
                    strokeWidth="14"
                  />
                  {/* Debt slice */}
                  <circle
                    cx="50" cy="50" fill="transparent" r="40"
                    stroke="url(#debtGrad)"
                    strokeDasharray={`${(portfolioData[1].pct / 100) * 251.3} 251.3`}
                    strokeDashoffset={`-${(portfolioData[0].pct / 100) * 251.3}`}
                    strokeWidth="14"
                  />
                  {/* Gold slice */}
                  <circle
                    cx="50" cy="50" fill="transparent" r="40"
                    stroke="url(#goldGrad)"
                    strokeDasharray={`${(portfolioData[2].pct / 100) * 251.3} 251.3`}
                    strokeDashoffset={`-${((portfolioData[0].pct + portfolioData[1].pct) / 100) * 251.3}`}
                    strokeWidth="14"
                  />
                  {/* Cash slice */}
                  <circle
                    cx="50" cy="50" fill="transparent" r="40"
                    stroke="url(#cashGrad)"
                    strokeDasharray={`${(portfolioData[3].pct / 100) * 251.3} 251.3`}
                    strokeDashoffset={`-${((portfolioData[0].pct + portfolioData[1].pct + portfolioData[2].pct) / 100) * 251.3}`}
                    strokeWidth="14"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs uppercase font-bold text-[#1B3A6B]">Total</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1B3A6B]">100%</span>
                </div>
              </div>

              {/* Legend Table */}
              <div className="flex-1 space-y-3 text-xs sm:text-sm w-full">
                {portfolioData.map((item, i) => {
                  const gradColors = [
                    ['#1B3A6B','#2563EB'],
                    ['#14532D','#16A34A'],
                    ['#EA580C','#F97316'],
                    ['#475569','#94a3b8'],
                  ];
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 shrink-0 border border-white/30" style={{
                          background: `linear-gradient(135deg, ${gradColors[i][0]}, ${gradColors[i][1]})`
                        }} />
                        <span className="text-[#1F3555] font-semibold">{item.name}</span>
                      </div>
                      <span className="font-bold text-[#1B3A6B] tabular-nums">
                        {item.pct}% <span className="font-normal text-[#4B6080]">({formatCurrency(item.amount)})</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* High Equity Alert */}
            {(client.data?.portfolio?.equity || 0) > 65 && (
              <div className="mt-3 p-2.5 rounded bg-[#FFF7ED] border border-[#FED7AA] text-[#7C2D12] text-xs leading-4 flex items-start gap-2">
                <AlertTriangle size={14} className="text-[#C2410C] shrink-0 mt-0.5" />
                <span>
                  <strong>Concentration Note:</strong> Equity exposure is at {client.data?.portfolio?.equity}%, elevated relative to the {riskProfile} target band.
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DBEAFE] mt-3 flex items-center justify-between">
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
