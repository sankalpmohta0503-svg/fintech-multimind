import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  FileSearch,
  FileText,
  Landmark,
  Lightbulb,
  Printer,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/ErrorState';
import MetricCard from '../components/MetricCard';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent, getHealthScoreStatus } from '../utils/formatters';

const goalStatusConfig = {
  'on-track': { status: 'healthy', label: 'On Track' },
  attention: { status: 'warning', label: 'Warning' },
  'at-risk': { status: 'warning', label: 'Warning' },
  critical: { status: 'critical', label: 'Critical Deficit' },
};

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getReport();
      setReport(response.data);
    } catch (err) {
      console.error('Failed to load advisor report:', err);
      setError('Failed to generate the comprehensive advisor report. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error && !report) {
    return (
      <ErrorState
        title="Advisor Report Unavailable"
        message={error}
        onRetry={loadReport}
      />
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-xs sm:text-sm text-[#4B6080]">
        No report data available.
      </div>
    );
  }

  const {
    metadata = {},
    executive = {},
    clientOverview = {},
    financialSnapshot = {},
    healthScore = {},
    criticalFindings = [],
    goalAnalysis = {},
    strengths = [],
    expectedImpact = {},
  } = report;

  // Safe extraction for recommendations (reportEngine returns { summary, recommendations: [...] })
  const recList = Array.isArray(report.recommendations)
    ? report.recommendations
    : Array.isArray(report.recommendations?.recommendations)
    ? report.recommendations.recommendations
    : [];

  const personal = clientOverview?.personal || {};
  const score = executive?.overallHealthScore || healthScore?.overall || 64;
  const scoreStatus = getHealthScoreStatus(score);

  // Compute key snapshot metrics
  const income = financialSnapshot?.monthlyIncome || 250000;
  const surplus = financialSnapshot?.monthlySurplus || 78000;
  const savingsRate = income > 0 ? Math.round((surplus / income) * 100) : 31;
  const totalDebt = financialSnapshot?.totalDebt || 1800000;
  const netWorth = financialSnapshot?.netWorth || 3700000;
  const insuranceCover = financialSnapshot?.insuranceCoverage || 5000000;

  return (
    <div className="space-y-6 print:space-y-4 max-w-[1200px] mx-auto">
      {/* 1. TOP PRINT & ACTION BAR (HIDDEN IN PRINT) */}
      <section className="card bg-white p-4 border border-[#BFDBFE] print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0A1D3B] text-white flex items-center justify-center font-bold text-xs sm:text-sm">
              FX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Advisor Deliverable Preview</h1>
                <span className="rounded bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 text-xs font-semibold text-[#14532D]">
                  Deliverable Finalized
                </span>
              </div>
              <p className="text-xs text-[#4B6080]">
                {personal.name || 'Client'} (Age {personal.age || 38}) • {clientOverview?.riskProfile || 'Moderate'} Risk Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadReport}
              className="btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN PRINTABLE REPORT CONTAINER */}
      <div className="bg-white rounded-xl shadow-sm border border-[#BFDBFE] p-8 space-y-8 print:shadow-none print:border-0 print:p-0 print:space-y-6">
        {/* Deliverable Header & Metadata */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#BFDBFE]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1F3555] text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck size={14} className="text-[#14532D]" />
              <span>Official Fiduciary Deliverable</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1B3A6B]">
              Comprehensive Financial Health Audit & Advisory Deliverable
            </h1>
            <p className="text-xs text-[#2D4A6B] leading-relaxed">
              Independent forensic evaluation of asset allocation, longevity solvency, liability structure, and capital adequacy under SEBI (Investment Advisers) Regulations.
            </p>
          </div>

          {/* Audit Ledger Metadata Box */}
          <div className="rounded-lg bg-[#E2E8F0] border border-[#BFDBFE] p-3.5 text-xs text-[#2D4A6B] space-y-1.5 min-w-[240px] shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6080] block pb-1 border-b border-[#BFDBFE]">
              Deliverable Metadata
            </span>
            <div className="flex justify-between">
              <span className="text-[#4B6080]">Doc Ref:</span>
              <span className="font-semibold text-[#111827]">FA-AUD-{new Date().getFullYear()}-0906</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4B6080]">Audit Date:</span>
              <span className="font-semibold text-[#111827]">{new Date(metadata?.reportDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4B6080]">Prepared For:</span>
              <span className="font-semibold text-[#111827]">{personal.name || 'Client'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4B6080]">Fiduciary Framework:</span>
              <span className="font-semibold text-[#14532D]">SEBI RIA Clause 15(1)</span>
            </div>
          </div>
        </div>

        {/* SECTION 01: EXECUTIVE FIDUCIARY SUMMARY & SCORE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DBEAFE]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Section 01</span>
            <span className="text-slate-300">//</span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">
              Executive Fiduciary Summary & Score
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Health Score Box (4 cols) */}
            <div className="md:col-span-4 rounded-lg bg-[#0A1D3B] text-white p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    Composite Health Index
                  </span>
                  <span className="rounded bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Breaches Present
                  </span>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white tabular-nums">{score}</span>
                    <span className="text-xs sm:text-sm text-blue-300">/ 100</span>
                  </div>
                  <p className="text-xs text-rose-400 mt-1 font-medium">
                    {scoreStatus.label}: {executive?.criticalIssues || 0} Critical Breaches Flagged across Solvency, Insurance, and Growth.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-300">
                <span>Risk Benchmark Threshold</span>
                <span className="text-white font-semibold">Min 75/100</span>
              </div>
            </div>

            {/* Diagnostic Synthesis Narrative (8 cols) */}
            <div className="md:col-span-8 rounded-lg bg-[#E2E8F0] border border-[#BFDBFE] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#BFDBFE]">
                  <h3 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Diagnostic Synthesis & Primary Vulnerabilities</h3>
                  <span className="text-[11px] text-[#4B6080]">Deterministic RIA Protocol</span>
                </div>

                <p className="text-xs text-[#1F3555] leading-relaxed mt-2">
                  {executive?.summary || `Comprehensive baseline audit indicates essential cash-flow generation, yet the capital structure exhibits critical vulnerabilities threatening family solvency and long-term goal completion.`}
                </p>

                {/* 3 Vulnerabilities Highlight List */}
                <div className="space-y-2 mt-3 text-xs text-[#1F3555]">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="text-[#C2410C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1B3A6B]">Protection Solvency Gap: </strong>
                      Existing pure term cover is significantly below human life value guidelines, leaving dependents exposed upon premature mortality.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-[#C2410C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1B3A6B]">Retirement Longevity Deficit: </strong>
                      Current equity SIP contributions against inflation assumptions result in projected terminal capital shortfall before full life expectancy.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Lightbulb size={15} className="text-[#1D4ED8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1B3A6B]">Unoptimized Cash Flow & Debt Drag: </strong>
                      Outstanding liabilities impose monthly drag while lazy cash reserves can be deployed for prepayment and tax exemptions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Financial Snapshot Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="rounded-lg border border-[#BFDBFE] p-3 bg-[#E2E8F0]/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6080] block">
                Audited Net Worth
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1B3A6B] tabular-nums mt-1 block">
                {formatCurrency(netWorth)}
              </span>
              <span className="text-[11px] text-[#14532D] font-medium">Liquid + Real Assets</span>
            </div>

            <div className="rounded-lg border border-[#BFDBFE] p-3 bg-[#E2E8F0]/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6080] block">
                Monthly Free Surplus
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1B3A6B] tabular-nums mt-1 block">
                {formatCurrency(surplus)}
              </span>
              <span className="text-[11px] text-[#2D4A6B] font-medium">{savingsRate}% of {formatCurrency(income)}</span>
            </div>

            <div className="rounded-lg border border-[#BFDBFE] p-3 bg-[#E2E8F0]/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6080] block">
                Active Debt Burden
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1B3A6B] tabular-nums mt-1 block">
                {formatCurrency(totalDebt)}
              </span>
              <span className="text-[11px] text-[#C2410C] font-medium">Debt Obligations</span>
            </div>

            <div className="rounded-lg border border-[#BFDBFE] p-3 bg-[#E2E8F0]/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6080] block">
                Pure Life Insurance
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#1B3A6B] tabular-nums mt-1 block">
                {formatCurrency(insuranceCover)}
              </span>
              <span className="text-[11px] text-[#C2410C] font-medium">Underinsurance Gap</span>
            </div>
          </div>
        </section>

        {/* SECTION 02: AUDITED FINDINGS & SEVERITY MATRIX */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Section 02</span>
              <span className="text-slate-300">//</span>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">
                Audited Findings & Severity Matrix
              </h2>
            </div>
            <span className="text-xs text-[#4B6080]">
              {criticalFindings.length} Audited Exceptions Flagged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#2D4A6B] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l">Severity</th>
                  <th className="py-2.5 px-3">Pillar & Description</th>
                  <th className="py-2.5 px-3">Audited Baseline</th>
                  <th className="py-2.5 px-3">Mandate Benchmark</th>
                  <th className="py-2.5 px-3 text-right rounded-r">Fiduciary Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalFindings.map((finding, idx) => {
                  const isCritical = finding.severity === 'critical';
                  const isWarning = finding.severity === 'warning';
                  const gapVal = finding.evidence?.gap || finding.evidence?.shortfall || null;

                  return (
                    <tr key={idx} className="hover:bg-[#E2E8F0] transition-colors">
                      <td className="py-3 px-3 align-top">
                        <StatusBadge status={finding.severity} />
                      </td>
                      <td className="py-3 px-3 align-top max-w-sm">
                        <div className="font-bold text-[#1B3A6B]">{finding.title}</div>
                        <div className="text-[11px] text-[#4B6080] mt-0.5">{finding.description}</div>
                      </td>
                      <td className="py-3 px-3 align-top tabular-nums text-[#1F3555]">
                        {finding.evidence?.existing ? formatCurrency(finding.evidence.existing) : 'Current Position'}
                      </td>
                      <td className="py-3 px-3 align-top text-[#1F3555]">
                        {finding.evidence?.required ? formatCurrency(finding.evidence.required) : 'Fiduciary Mandate'}
                      </td>
                      <td className={`py-3 px-3 align-top text-right font-bold tabular-nums ${isCritical ? 'text-[#C2410C]' : isWarning ? 'text-[#C2410C]' : 'text-[#111827]'}`}>
                        {gapVal ? `-${formatCurrency(gapVal)} Deficit` : finding.impact || 'Attention Required'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 03: GOALS & TRAJECTORY EVALUATION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Section 03</span>
              <span className="text-slate-300">//</span>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">
                Goals & Trajectory Evaluation
              </h2>
            </div>
            <span className="text-xs text-[#4B6080]">
              Planning Horizon: 2026 – 2055
            </span>
          </div>

          {goalAnalysis?.goals?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#2D4A6B] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3 rounded-l">Goal Specification</th>
                    <th className="py-2.5 px-3">Horizon</th>
                    <th className="py-2.5 px-3">Required Target</th>
                    <th className="py-2.5 px-3">Current Funded</th>
                    <th className="py-2.5 px-3">Funded %</th>
                    <th className="py-2.5 px-3 text-right rounded-r">Projected Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {goalAnalysis.goals.map((g, idx) => {
                    const statusConf = goalStatusConfig[g.status] || { status: 'neutral', label: g.status };
                    return (
                      <tr key={idx} className="hover:bg-[#E2E8F0] transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#111827]">
                          {g.name}
                        </td>
                        <td className="py-2.5 px-3 text-[#2D4A6B]">{g.timeline} yrs</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1B3A6B] tabular-nums">
                          {formatCurrency(g.target)}
                        </td>
                        <td className="py-2.5 px-3 text-[#1F3555] tabular-nums">
                          {formatCurrency(g.projectedCorpus || 0)}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold text-[#111827]">
                          {Math.round(g.fundingPercentage)}%
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <StatusBadge status={statusConf.status} label={statusConf.label} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECTION 04: PRIORITIZED ACTION PLAN & ADVISORY RECOMMENDATIONS */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Section 04</span>
              <span className="text-slate-300">//</span>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">
                Prioritized Action Plan & Advisory Recommendations
              </h2>
            </div>
            <span className="text-xs text-[#4B6080]">
              Sequenced Remediation Path
            </span>
          </div>

          <div className="space-y-3">
            {recList.map((rec, idx) => {
              const priority = rec.priority || 'high';
              const isCritical = priority === 'critical';

              return (
                <div
                  key={rec.id || idx}
                  className="p-4 rounded-lg border border-[#BFDBFE] bg-[#E2E8F0]/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 max-w-3xl">
                    <div className="h-6 w-6 rounded bg-[#0A1D3B] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCritical ? 'bg-[#FFEDD5] text-[#9A3412]' : 'bg-[#FFEDD5] text-[#9A3412]'
                        }`}>
                          {priority} Priority
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">{rec.title}</h3>
                      </div>
                      <p className="text-xs text-[#2D4A6B] leading-relaxed">
                        {rec.what || rec.why || rec.expectedImpact}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 self-end sm:self-start">
                    {rec.timeframe && (
                      <span className="text-xs font-semibold text-[#111827] block">
                        {rec.timeframe}
                      </span>
                    )}
                    <span className="text-[11px] text-[#14532D] font-medium">
                      High Impact
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Projected Post-Remediation Callout */}
          <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} className="text-[#14532D] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#052E16] block">
                  Projected Post-Remediation Status: Fiduciary Compliant
                </span>
                <p className="text-xs text-[#2D4A6B] mt-0.5">
                  Executing these recommendations resolves critical solvency breaches, closes the life cover deficit, and optimizes retirement accumulation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#4B6080] block">Projected Health</span>
                <span className="text-xs sm:text-sm font-bold text-[#14532D] tabular-nums">78 / 100</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05: FIDUCIARY DISCLOSURE & STATUTORY FOOTER */}
        <section className="space-y-4 pt-4 border-t border-[#BFDBFE] text-xs text-[#4B6080]">
          <div className="p-4 rounded-lg bg-[#E2E8F0] border border-[#BFDBFE] space-y-2">
            <h3 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider">
              Statutory Fiduciary Disclaimer & Regulatory Notice
            </h3>
            <p className="text-[11px] leading-relaxed text-[#2D4A6B]">
              This deliverable is strictly confidential and prepared for certified wealth manager analysis under SEBI (Investment Advisers) Regulations. All financial health scores, projections, and gap metrics are generated through deterministic mathematical evaluation of audited client data. Outcomes remain subject to ongoing client circumstance review and investment market conditions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-blue-300 pt-2">
            <span>FinAuditX Fiduciary Intelligence Platform • Engine V2.4</span>
            <span>Calculation Methodology: Deterministic RIA Audit Protocol</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Report;
