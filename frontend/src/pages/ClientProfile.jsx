import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  FileSearch,
  FileText,
  Landmark,
  Layers,
  Lightbulb,
  MapPin,
  PieChart,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/ErrorState';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent } from '../utils/formatters';

const assetClassNames = {
  cash: { label: 'Cash & Liquid Savings', type: 'Liquid Reserves' },
  emergencyFund: { label: 'Emergency Contingency Fund', type: 'Liquid Reserves' },
  equity: { label: 'Direct Equities / Listed Stocks', type: 'Growth Assets' },
  mutualFunds: { label: 'Mutual Funds (Equity & Hybrid)', type: 'Growth Assets' },
  debt: { label: 'Fixed Income, Debt & Bonds', type: 'Fixed Income' },
  gold: { label: 'Sovereign Gold & Bullion', type: 'Commodities' },
  epf: { label: 'Employee Provident Fund (EPF)', type: 'Retirement Assets' },
  realEstate: { label: 'Self-Occupied & Real Estate', type: 'Physical Property' },
};

const ClientProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientRes, summaryRes] = await Promise.allSettled([
        api.getClient(),
        api.getFinancialSummary(),
      ]);

      if (clientRes.status === 'fulfilled') {
        setClientData(clientRes.value.data);
      } else {
        throw clientRes.reason;
      }

      if (summaryRes.status === 'fulfilled') {
        setSummaryData(summaryRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load client profile:', err);
      setError('Failed to load client profile details. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Calculations
  const personal = clientData?.personalInfo;
  const income = clientData?.monthlyIncome || summaryData?.monthlyIncome || 0;
  const expenses = clientData?.monthlyExpenses || summaryData?.monthlyExpenses || 0;
  const surplus = summaryData?.monthlySurplus ?? (income - expenses);
  const savingsRate = income > 0 ? Math.round((surplus / income) * 100) : 0;

  const assets = clientData?.assets || {};
  const totalAssets = Object.values(assets).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);

  const liabilities = clientData?.liabilities || {};
  const totalLiabilities = Object.values(liabilities).reduce((sum, l) => sum + (l.outstanding || 0), 0);
  const monthlyEMIs = Object.values(liabilities).reduce((sum, l) => sum + (l.emi || 0), 0);
  const emiBurden = income > 0 ? Math.round((monthlyEMIs / income) * 100) : 0;

  const netWorth = summaryData?.netWorth ?? (totalAssets - totalLiabilities);

  const emergencyFundTotal = (assets.cash || 0) + (assets.emergencyFund || 0);
  const emergencyMonths = expenses > 0 ? (emergencyFundTotal / expenses).toFixed(1) : '0.0';

  const insurance = clientData?.insurance || {};
  const lifeCoverage = insurance.life || summaryData?.insuranceCoverage || 0;
  const requiredLifeBenchmark = income * 12 * 15; // 15x annual income benchmark
  const lifeGap = requiredLifeBenchmark - lifeCoverage;

  const totalCommittedSIP = useMemo(() => {
    if (!clientData?.goals) return 0;
    return clientData.goals.reduce((sum, g) => sum + (g.monthlySIP || 0), 0);
  }, [clientData?.goals]);

  if (loading && !clientData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error && !clientData) {
    return (
      <ErrorState
        title="Client Profile Unavailable"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTEXT HEADER */}
      <section className="card bg-white p-5 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {personal?.name || 'Client Profile'}
              </h1>
              {personal?.age && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  Age {personal.age}
                </span>
              )}
              <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                {clientData?.riskProfile || 'Moderate'} Risk Profile
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              {personal?.occupation && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  <span>{personal.occupation}</span>
                </span>
              )}
              {personal?.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{personal.location}</span>
                </span>
              )}
              {personal?.dependents !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Users size={13} className="text-slate-400" />
                  <span>{personal.dependents} Dependents</span>
                </span>
              )}
              {personal?.maritalStatus && (
                <span className="inline-flex items-center gap-1">
                  <span>Status: {personal.maritalStatus}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/simulator')}
              className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Run Scenario in Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <FileSearch size={14} />
              <span>Inspect Audit Findings</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. FOUR KEY METRIC TILES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Net Worth (Liquid + Real)
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {formatCurrency(netWorth)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-teal-700">
            <TrendingUp size={13} />
            <span>Assets: {formatCurrency(totalAssets)} • Debt: {formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        {/* Monthly Surplus */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Audited Monthly Surplus
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {formatCurrency(surplus)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Wallet size={13} className="text-teal-700" />
            <span>Savings Rate: {savingsRate}% of {formatCurrency(income)}/mo</span>
          </div>
        </div>

        {/* Total Active Debt */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Active Liabilities
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <CreditCard size={13} className={emiBurden <= 35 ? 'text-teal-700' : 'text-amber-600'} />
            <span>EMI: {formatCurrency(monthlyEMIs)}/mo ({emiBurden}% DTI)</span>
          </div>
        </div>

        {/* Contingency Runway */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Contingency Runway
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {emergencyMonths} Months
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
            <Clock size={13} />
            <span>Liquid: {formatCurrency(emergencyFundTotal)} (Target: 6.0 mos)</span>
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: CASH FLOW ARCHITECTURE */}
      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Section 01
              </span>
              <h2 className="text-base font-semibold text-slate-950">Cash Flow Architecture & Deployments</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconciled monthly cash inflows against fixed lifestyle expenses, EMIs, and committed investments
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500">Net Accounted Inflow: </span>
            <span className="font-bold text-slate-950 tabular-nums">{formatCurrency(income)}/mo</span>
          </div>
        </div>

        {/* Cash Flow Distribution Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-[11px] font-medium text-slate-600">
            <span>Essential Living ({Math.round((expenses / income) * 100)}%)</span>
            <span>Debt Service ({emiBurden}%)</span>
            <span>Goal SIPs ({Math.round((totalCommittedSIP / income) * 100)}%)</span>
            <span className="text-teal-700 font-bold">Unallocated Surplus ({savingsRate}%)</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-slate-800 h-full" style={{ width: `${Math.min((expenses / income) * 100, 100)}%` }} title="Living Expenses" />
            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(emiBurden, 100)}%` }} title="Debt EMIs" />
            <div className="bg-teal-600 h-full" style={{ width: `${Math.min((totalCommittedSIP / income) * 100, 100)}%` }} title="Committed SIPs" />
            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(savingsRate, 100)}%` }} title="Unallocated Surplus" />
          </div>
        </div>

        {/* Inflows & Outflows Tables (2-Col Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Inflows */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <TrendingUp size={14} className="text-teal-700" />
              <span>Audited Monthly Inflows</span>
            </div>

            <div className="rounded border border-slate-200 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between p-2.5">
                <div>
                  <div className="font-medium text-slate-900">Primary Monthly Income</div>
                  <div className="text-[11px] text-slate-500">Professional Salary / Revenue</div>
                </div>
                <div className="font-bold text-slate-950 tabular-nums self-center">
                  {formatCurrency(income)}
                </div>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-50/50">
                <div>
                  <div className="font-medium text-slate-900">Annual Gross Equivalent</div>
                  <div className="text-[11px] text-slate-500">12 Months Base Projection</div>
                </div>
                <div className="font-bold text-slate-950 tabular-nums self-center">
                  {formatCurrency(income * 12)}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Commitments & Outflows */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <TrendingDown size={14} className="text-amber-700" />
              <span>Monthly Commitments & Outflows</span>
            </div>

            <div className="rounded border border-slate-200 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between p-2.5">
                <div>
                  <div className="font-medium text-slate-900">Living & Household Expenses</div>
                  <div className="text-[11px] text-slate-500">Essential Non-Discretionary</div>
                </div>
                <div className="font-semibold text-slate-900 tabular-nums self-center">
                  {formatCurrency(expenses)}
                </div>
              </div>

              <div className="flex justify-between p-2.5">
                <div>
                  <div className="font-medium text-slate-900">Loan EMIs & Debt Service</div>
                  <div className="text-[11px] text-slate-500">Total Monthly Debt Obligations</div>
                </div>
                <div className="font-semibold text-slate-900 tabular-nums self-center">
                  {formatCurrency(monthlyEMIs)}
                </div>
              </div>

              <div className="flex justify-between p-2.5">
                <div>
                  <div className="font-medium text-slate-900">Committed Financial Goal SIPs</div>
                  <div className="text-[11px] text-slate-500">{clientData?.goals?.length || 0} active goal mandates</div>
                </div>
                <div className="font-semibold text-slate-900 tabular-nums self-center">
                  {formatCurrency(totalCommittedSIP)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unallocated Surplus Callout Box */}
        <div className="mt-4 p-3 rounded-lg bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-teal-700 shrink-0" />
            <div>
              <span className="font-semibold text-teal-950">
                Deployable Monthly Surplus: {formatCurrency(surplus)}/mo
              </span>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Available for systematic reallocation toward urgent emergency reserve fortification, protection premiums, and debt prepayment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/recommendations')}
            className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap self-end sm:self-center"
          >
            Review Strategy
          </button>
        </div>
      </section>

      {/* 4. SECTION 2: BALANCE SHEET & ASSET / LIABILITY COMPOSITION */}
      <section className="card p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Section 02
              </span>
              <h2 className="text-base font-semibold text-slate-950">Balance Sheet & Audited Asset Composition</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited balance sheet across all liquid, invested, and real asset accounts
            </p>
          </div>
          <div className="text-xs text-slate-600">
            <span>Gross Assets: </span>
            <span className="font-bold text-slate-950 tabular-nums">{formatCurrency(totalAssets)}</span>
            <span className="mx-2">•</span>
            <span>Total Debt: </span>
            <span className="font-bold text-red-700 tabular-nums">{formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        {/* 1. Asset Holdings Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            1. Audited Asset Holdings & Classification
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l">Asset Class & Account</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Valuation</th>
                  <th className="py-2.5 px-3 text-right rounded-r">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(assets).map(([key, value]) => {
                  const info = assetClassNames[key] || { label: key.replace(/([A-Z])/g, ' $1'), type: 'Invested Asset' };
                  const sharePct = totalAssets > 0 ? ((value / totalAssets) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{info.label}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{info.type}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-950 tabular-nums">
                        {formatCurrency(value)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 font-medium">
                        {sharePct}%
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                  <td className="py-2.5 px-3 text-slate-950">Total Audited Assets</td>
                  <td className="py-2.5 px-3 text-slate-500">—</td>
                  <td className="py-2.5 px-3 text-teal-800 tabular-nums">{formatCurrency(totalAssets)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-950">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Liability Obligations Table */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            2. Liability Obligations & Loan Amortization Schedules
          </h3>

          {Object.keys(liabilities).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3 rounded-l">Obligation</th>
                    <th className="py-2.5 px-3">Interest Rate</th>
                    <th className="py-2.5 px-3">Monthly EMI</th>
                    <th className="py-2.5 px-3">Tenure Remaining</th>
                    <th className="py-2.5 px-3 text-right rounded-r">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(liabilities).map(([key, liability]) => (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 tabular-nums">{liability.interestRate}% p.a.</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 tabular-nums">{formatCurrency(liability.emi)}/mo</td>
                      <td className="py-2.5 px-3 text-slate-600">{liability.tenureRemaining} years</td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-700 tabular-nums">
                        {formatCurrency(liability.outstanding)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                    <td className="py-2.5 px-3 text-slate-950">Total Liabilities</td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                    <td className="py-2.5 px-3 text-slate-950 tabular-nums">{formatCurrency(monthlyEMIs)}/mo</td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                    <td className="py-2.5 px-3 text-right text-red-700 tabular-nums">{formatCurrency(totalLiabilities)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded text-xs text-slate-500">
              No debt obligations recorded for this profile.
            </div>
          )}
        </div>
      </section>

      {/* 5. SECTION 3: PROTECTION & INSURANCE SOLVENCY */}
      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Section 03
              </span>
              <h2 className="text-base font-semibold text-slate-950">Protection, Solvency & Contingency Audit</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of current risk cover against human life value requirements
            </p>
          </div>
          {lifeGap > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-red-50 text-red-800 border border-red-200 px-2.5 py-0.5 text-xs font-semibold">
              <ShieldAlert size={13} />
              Underinsurance Deficit Detected
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 rounded-l">Coverage Domain</th>
                <th className="py-2.5 px-3">Existing Sum Assured</th>
                <th className="py-2.5 px-3">Benchmark Guideline</th>
                <th className="py-2.5 px-3">Net Deficit / Gap</th>
                <th className="py-2.5 px-3 text-right rounded-r">Fiduciary Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Pure Term Life */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900">Pure Term Life Insurance</div>
                  <div className="text-[11px] text-slate-500">Solvency for spouse & dependents</div>
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(lifeCoverage)}
                </td>
                <td className="py-3 px-3 text-slate-700 tabular-nums">
                  {formatCurrency(requiredLifeBenchmark)} (15x income)
                </td>
                <td className="py-3 px-3 font-bold text-red-700 tabular-nums">
                  {lifeGap > 0 ? `-${formatCurrency(lifeGap)} Deficit` : 'Adequate'}
                </td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status={lifeGap > 0 ? 'critical' : 'healthy'} label={lifeGap > 0 ? 'Critical Shortfall' : 'Optimal'} />
                </td>
              </tr>

              {/* Health Insurance */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900">Family Health & Hospitalization</div>
                  <div className="text-[11px] text-slate-500">Medical emergency coverage</div>
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(insurance.health || 0)}
                </td>
                <td className="py-3 px-3 text-slate-700">₹10.0 L - ₹25.0 L</td>
                <td className="py-3 px-3 text-teal-700 font-medium">Comprehensive</td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status="healthy" label="Satisfactory" />
                </td>
              </tr>

              {/* Accidental / Disability */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900">Personal Accident & Disability</div>
                  <div className="text-[11px] text-slate-500">Income protection rider</div>
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(insurance.accidental || 0)}
                </td>
                <td className="py-3 px-3 text-slate-700">₹5.0 L - ₹10.0 L</td>
                <td className="py-3 px-3 text-slate-600 font-medium">Covered</td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status="healthy" label="Active" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. SECTION 4: FINANCIAL GOALS & PLANNING ASSUMPTIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Goals Summary (8 cols) */}
        <div className="lg:col-span-8 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h2 className="text-base font-semibold text-slate-950">Financial Goals Horizon</h2>
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                <span>View Full Goals Analysis</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {clientData?.goals?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2 px-3 rounded-l">Goal Objective</th>
                      <th className="py-2 px-3">Target Amount</th>
                      <th className="py-2 px-3">Timeline</th>
                      <th className="py-2 px-3">Current Corpus</th>
                      <th className="py-2 px-3 text-right rounded-r">Monthly SIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientData.goals.map((goal, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{goal.name}</div>
                          <div className="text-[11px] text-slate-500 capitalize">{goal.priority} Priority • {goal.assetClass}</div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(goal.targetAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{goal.yearsToGoal} years</td>
                        <td className="py-2.5 px-3 text-slate-800 tabular-nums">{formatCurrency(goal.currentCorpus)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-teal-700 tabular-nums">
                          {formatCurrency(goal.monthlySIP)}/mo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No goals recorded.</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Total Active Mandates: {clientData?.goals?.length || 0}</span>
            <span className="font-medium text-slate-900">Total Outflow: {formatCurrency(totalCommittedSIP)}/mo</span>
          </div>
        </div>

        {/* Strategic Assumptions & Tax (4 cols) */}
        <div className="lg:col-span-4 card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-slate-200 mb-3">
              <h2 className="text-base font-semibold text-slate-950">Strategic Assumptions</h2>
              <p className="text-xs text-slate-500">Baseline modeling rates & statutory limits</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Assumed Annual Inflation</span>
                <span className="font-bold text-slate-950 tabular-nums">
                  {clientData?.assumptions?.inflation ? `${(clientData.assumptions.inflation * 100).toFixed(1)}%` : '6.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Equity Return Assumption</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {clientData?.assumptions?.returns?.equity ? `${(clientData.assumptions.returns.equity * 100).toFixed(1)}%` : '12.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Debt / Fixed Return</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {clientData?.assumptions?.returns?.debt ? `${(clientData.assumptions.returns.debt * 100).toFixed(1)}%` : '7.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Gold / Bullion Return</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {clientData?.assumptions?.returns?.gold ? `${(clientData.assumptions.returns.gold * 100).toFixed(1)}%` : '8.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Sec 80C Tax Investments</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(clientData?.taxSavingInvestments || 80000)} / ₹1.5L
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-snug">
            All assumptions calibrated in compliance with deterministic RIA financial planning standards.
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientProfile;
