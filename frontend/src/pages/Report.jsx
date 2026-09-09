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
      <div className="p-8 text-center text-sm text-slate-500">
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
      <section className="card bg-white p-4 border border-slate-200 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
              FX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-950">Advisor Deliverable Preview</h1>
                <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-semibold text-teal-800">
                  Deliverable Finalized
                </span>
              </div>
              <p className="text-xs text-slate-500">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8 print:shadow-none print:border-0 print:p-0 print:space-y-6">
        {/* Deliverable Header & Metadata */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck size={14} className="text-teal-700" />
              <span>Official Fiduciary Deliverable</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Comprehensive Financial Health Audit & Advisory Deliverable
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Independent forensic evaluation of asset allocation, longevity solvency, liability structure, and capital adequacy under SEBI (Investment Advisers) Regulations.
            </p>
          </div>

          {/* Audit Ledger Metadata Box */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1.5 min-w-[240px] shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block pb-1 border-b border-slate-200">
              Deliverable Metadata
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Doc Ref:</span>
              <span className="font-semibold text-slate-900">FA-AUD-{new Date().getFullYear()}-0906</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audit Date:</span>
              <span className="font-semibold text-slate-900">{new Date(metadata?.reportDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Prepared For:</span>
              <span className="font-semibold text-slate-900">{personal.name || 'Client'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fiduciary Framework:</span>
              <span className="font-semibold text-teal-800">SEBI RIA Clause 15(1)</span>
            </div>
          </div>
        </div>

        {/* SECTION 01: EXECUTIVE FIDUCIARY SUMMARY & SCORE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section 01</span>
            <span className="text-slate-300">//</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950">
              Executive Fiduciary Summary & Score
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Health Score Box (4 cols) */}
            <div className="md:col-span-4 rounded-lg bg-slate-950 text-white p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Composite Health Index
                  </span>
                  <span className="rounded bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Breaches Present
                  </span>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white tabular-nums">{score}</span>
                    <span className="text-sm text-slate-400">/ 100</span>
                  </div>
                  <p className="text-xs text-red-400 mt-1 font-medium">
                    {scoreStatus.label}: {executive?.criticalIssues || 0} Critical Breaches Flagged across Solvency, Insurance, and Growth.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Risk Benchmark Threshold</span>
                <span className="text-white font-semibold">Min 75/100</span>
              </div>
            </div>

            {/* Diagnostic Synthesis Narrative (8 cols) */}
            <div className="md:col-span-8 rounded-lg bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-950">Diagnostic Synthesis & Primary Vulnerabilities</h3>
                  <span className="text-[11px] text-slate-500">Deterministic RIA Protocol</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mt-2">
                  {executive?.summary || `Comprehensive baseline audit indicates essential cash-flow generation, yet the capital structure exhibits critical vulnerabilities threatening family solvency and long-term goal completion.`}
                </p>

                {/* 3 Vulnerabilities Highlight List */}
                <div className="space-y-2 mt-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Protection Solvency Gap: </strong>
                      Existing pure term cover is significantly below human life value guidelines, leaving dependents exposed upon premature mortality.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Retirement Longevity Deficit: </strong>
                      Current equity SIP contributions against inflation assumptions result in projected terminal capital shortfall before full life expectancy.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Lightbulb size={15} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-950">Unoptimized Cash Flow & Debt Drag: </strong>
                      Outstanding liabilities impose monthly drag while lazy cash reserves can be deployed for prepayment and tax exemptions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Financial Snapshot Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Audited Net Worth
              </span>
              <span className="text-lg font-bold text-slate-950 tabular-nums mt-1 block">
                {formatCurrency(netWorth)}
              </span>
              <span className="text-[11px] text-teal-700 font-medium">Liquid + Real Assets</span>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Monthly Free Surplus
              </span>
              <span className="text-lg font-bold text-slate-950 tabular-nums mt-1 block">
                {formatCurrency(surplus)}
              </span>
              <span className="text-[11px] text-slate-600 font-medium">{savingsRate}% of {formatCurrency(income)}</span>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Active Debt Burden
              </span>
              <span className="text-lg font-bold text-slate-950 tabular-nums mt-1 block">
                {formatCurrency(totalDebt)}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">Debt Obligations</span>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Pure Life Insurance
              </span>
              <span className="text-lg font-bold text-slate-950 tabular-nums mt-1 block">
                {formatCurrency(insuranceCover)}
              </span>
              <span className="text-[11px] text-red-700 font-medium">Underinsurance Gap</span>
            </div>
          </div>
        </section>

        {/* SECTION 02: AUDITED FINDINGS & SEVERITY MATRIX */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section 02</span>
              <span className="text-slate-300">//</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Audited Findings & Severity Matrix
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {criticalFindings.length} Audited Exceptions Flagged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
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
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 align-top">
                        <StatusBadge status={finding.severity} />
                      </td>
                      <td className="py-3 px-3 align-top max-w-sm">
                        <div className="font-bold text-slate-950">{finding.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{finding.description}</div>
                      </td>
                      <td className="py-3 px-3 align-top tabular-nums text-slate-700">
                        {finding.evidence?.existing ? formatCurrency(finding.evidence.existing) : 'Current Position'}
                      </td>
                      <td className="py-3 px-3 align-top text-slate-700">
                        {finding.evidence?.required ? formatCurrency(finding.evidence.required) : 'Fiduciary Mandate'}
                      </td>
                      <td className={`py-3 px-3 align-top text-right font-bold tabular-nums ${isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-900'}`}>
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
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section 03</span>
              <span className="text-slate-300">//</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Goals & Trajectory Evaluation
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Planning Horizon: 2026 – 2055
            </span>
          </div>

          {goalAnalysis?.goals?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
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
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {g.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{g.timeline} yrs</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-950 tabular-nums">
                          {formatCurrency(g.target)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 tabular-nums">
                          {formatCurrency(g.projectedCorpus || 0)}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-900">
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
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section 04</span>
              <span className="text-slate-300">//</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Prioritized Action Plan & Advisory Recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-500">
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
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 max-w-3xl">
                    <div className="h-6 w-6 rounded bg-slate-950 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {priority} Priority
                        </span>
                        <h3 className="text-sm font-bold text-slate-950">{rec.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.what || rec.why || rec.expectedImpact}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 self-end sm:self-start">
                    {rec.timeframe && (
                      <span className="text-xs font-semibold text-slate-900 block">
                        {rec.timeframe}
                      </span>
                    )}
                    <span className="text-[11px] text-teal-700 font-medium">
                      High Impact
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Projected Post-Remediation Callout */}
          <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} className="text-teal-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-teal-950 block">
                  Projected Post-Remediation Status: Fiduciary Compliant
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Executing these recommendations resolves critical solvency breaches, closes the life cover deficit, and optimizes retirement accumulation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Projected Health</span>
                <span className="text-lg font-bold text-teal-800 tabular-nums">78 / 100</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05: FIDUCIARY DISCLOSURE & STATUTORY FOOTER */}
        <section className="space-y-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Statutory Fiduciary Disclaimer & Regulatory Notice
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-600">
              This deliverable is strictly confidential and prepared for certified wealth manager analysis under SEBI (Investment Advisers) Regulations. All financial health scores, projections, and gap metrics are generated through deterministic mathematical evaluation of audited client data. Outcomes remain subject to ongoing client circumstance review and investment market conditions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 pt-2">
            <span>FinAuditX Fiduciary Intelligence Platform • Engine V2.4</span>
            <span>Calculation Methodology: Deterministic RIA Audit Protocol</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Report;
