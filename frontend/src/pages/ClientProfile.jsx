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
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';

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
      {/* 1. TOP CONTEXT HEADER - EXPANDED CLIENT HERO CARD */}
      <section className="card bg-white p-6 sm:p-8 border border-[#BFDBFE] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Client Avatar / Monogram */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#2563EB] flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-md shrink-0">
              {personal?.name
                ? personal.name.split(' ').map(n => n[0]).slice(0, 2).join('')
                : 'CP'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1B3A6B]">
                  {personal?.name || 'Client Profile'}
                </h1>
                {personal?.age && (
                  <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs sm:text-sm font-bold text-[#1B3A6B] border border-[#BFDBFE]">
                    Age {personal.age}
                  </span>
                )}
                <span className="rounded-full bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1 text-xs sm:text-sm font-bold text-[#14532D] inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
                  {clientData?.riskProfile || 'Moderate'} Risk Profile
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-[#4B6080]">
                {personal?.occupation && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Briefcase size={15} className="text-[#1D4ED8]" />
                    <span>{personal.occupation}</span>
                  </span>
                )}
                {personal?.location && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <MapPin size={15} className="text-[#1D4ED8]" />
                    <span>{personal.location}</span>
                  </span>
                )}
                {personal?.dependents !== undefined && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Users size={15} className="text-[#1D4ED8]" />
                    <span>{personal.dependents} Dependents</span>
                  </span>
                )}
                {personal?.maritalStatus && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>Status: {personal.maritalStatus}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DBEAFE]">
            <button
              type="button"
              onClick={() => navigate('/simulator')}
              className="btn-secondary text-xs sm:text-sm px-4 py-2.5 inline-flex items-center gap-2 rounded-md font-semibold"
            >
              <Sparkles size={16} />
              <span>Run Scenario in Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="btn-primary text-xs sm:text-sm px-4 py-2.5 inline-flex items-center gap-2 rounded-md font-semibold"
            >
              <FileSearch size={16} />
              <span>Inspect Audit Findings</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. FOUR KEY METRIC TILES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="card p-5 flex flex-col justify-between">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#1B3A6B]">
            Net Worth (Liquid + Real)
          </span>
          <div className="my-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1B3A6B] tabular-nums">
              {formatCurrency(netWorth)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#14532D]">
            <TrendingUp size={15} />
            <span>Assets: {formatCurrency(totalAssets)} • Debt: {formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        {/* Monthly Surplus */}
        <div className="card p-5 flex flex-col justify-between">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#1B3A6B]">
            Audited Monthly Surplus
          </span>
          <div className="my-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#15803D] tabular-nums">
              {formatCurrency(surplus)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2D4A6B]">
            <Wallet size={15} className="text-[#14532D]" />
            <span>Savings Rate: {savingsRate}% of {formatCurrency(income)}/mo</span>
          </div>
        </div>

        {/* Total Active Debt */}
        <div className="card p-5 flex flex-col justify-between">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#1B3A6B]">
            Total Active Liabilities
          </span>
          <div className="my-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1B3A6B] tabular-nums">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2D4A6B]">
            <CreditCard size={15} className={emiBurden <= 35 ? 'text-[#14532D]' : 'text-[#EA580C]'} />
            <span>EMI: {formatCurrency(monthlyEMIs)}/mo ({emiBurden}% DTI)</span>
          </div>
        </div>

        {/* Contingency Runway */}
        <div className="card p-5 flex flex-col justify-between">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#1B3A6B]">
            Contingency Runway
          </span>
          <div className="my-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1B3A6B] tabular-nums">
              {emergencyMonths} Months
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C2410C]">
            <Clock size={15} />
            <span>Liquid: {formatCurrency(emergencyFundTotal)} (Target: 6.0 mos)</span>
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: CASH FLOW ARCHITECTURE */}
      <section className="card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BFDBFE] mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] bg-[#F0FDF4] px-2.5 py-0.5 rounded border border-[#BBF7D0]">
                Section 01
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#1B3A6B]">Cash Flow Architecture & Deployments</h2>
            </div>
            <p className="text-sm text-[#4B6080] mt-1.5">
              Reconciled monthly cash inflows against fixed lifestyle expenses, EMIs, and committed investments
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-[#4B6080]">Net Accounted Inflow: </span>
            <span className="font-bold text-[#1B3A6B] tabular-nums">{formatCurrency(income)}/mo</span>
          </div>
        </div>

        {/* Cash Flow Distribution Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-[11px] font-medium text-[#2D4A6B]">
            <span>Essential Living ({Math.round((expenses / income) * 100)}%)</span>
            <span>Debt Service ({emiBurden}%)</span>
            <span>Goal SIPs ({Math.round((totalCommittedSIP / income) * 100)}%)</span>
            <span className="text-[#14532D] font-bold">Unallocated Surplus ({savingsRate}%)</span>
          </div>
          <div className="h-2 w-full bg-[#EFF6FF] rounded-full overflow-hidden flex">
            <div className="bg-[#1B3A6B] h-full" style={{ width: `${Math.min((expenses / income) * 100, 100)}%` }} title="Living Expenses" />
            <div className="bg-[#F97316] h-full" style={{ width: `${Math.min(emiBurden, 100)}%` }} title="Debt EMIs" />
            <div className="bg-[#15803D] h-full" style={{ width: `${Math.min((totalCommittedSIP / income) * 100, 100)}%` }} title="Committed SIPs" />
            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(savingsRate, 100)}%` }} title="Unallocated Surplus" />
          </div>
        </div>

        {/* Inflows & Outflows Tables (2-Col Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Inflows */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#1B3A6B]">
              <TrendingUp size={16} className="text-[#14532D]" />
              <span>Audited Monthly Inflows</span>
            </div>

            <div className="rounded border border-[#BFDBFE] divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between p-3">
                <div>
                  <div className="font-semibold text-[#111827]">Primary Monthly Income</div>
                  <div className="text-xs text-[#4B6080]">Professional Salary / Revenue</div>
                </div>
                <div className="font-bold text-[#1B3A6B] tabular-nums self-center">
                  {formatCurrency(income)}
                </div>
              </div>

              <div className="flex justify-between p-3 bg-[#E2E8F0]/50">
                <div>
                  <div className="font-semibold text-[#111827]">Annual Gross Equivalent</div>
                  <div className="text-xs text-[#4B6080]">12 Months Base Projection</div>
                </div>
                <div className="font-bold text-[#1B3A6B] tabular-nums self-center">
                  {formatCurrency(income * 12)}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Commitments & Outflows */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#1B3A6B]">
              <TrendingDown size={16} className="text-[#C2410C]" />
              <span>Monthly Commitments & Outflows</span>
            </div>

            <div className="rounded border border-[#BFDBFE] divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between p-3">
                <div>
                  <div className="font-semibold text-[#111827]">Living & Household Expenses</div>
                  <div className="text-xs text-[#4B6080]">Essential Non-Discretionary</div>
                </div>
                <div className="font-semibold text-[#111827] tabular-nums self-center">
                  {formatCurrency(expenses)}
                </div>
              </div>

              <div className="flex justify-between p-3">
                <div>
                  <div className="font-semibold text-[#111827]">Loan EMIs & Debt Service</div>
                  <div className="text-xs text-[#4B6080]">Total Monthly Debt Obligations</div>
                </div>
                <div className="font-semibold text-[#111827] tabular-nums self-center">
                  {formatCurrency(monthlyEMIs)}
                </div>
              </div>

              <div className="flex justify-between p-3">
                <div>
                  <div className="font-semibold text-[#111827]">Committed Financial Goal SIPs</div>
                  <div className="text-xs text-[#4B6080]">{clientData?.goals?.length || 0} active goal mandates</div>
                </div>
                <div className="font-semibold text-[#111827] tabular-nums self-center">
                  {formatCurrency(totalCommittedSIP)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unallocated Surplus Callout Box */}
        <div className="mt-4 p-4 rounded-lg bg-[#F0FDF4]/70 border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-[#14532D] shrink-0" />
            <div>
              <span className="font-bold text-sm sm:text-base text-[#052E16]">
                Deployable Monthly Surplus: {formatCurrency(surplus)}/mo
              </span>
              <p className="text-[#2D4A6B] text-xs sm:text-sm mt-0.5">
                Available for systematic reallocation toward urgent emergency reserve fortification, protection premiums, and debt prepayment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/recommendations')}
            className="btn-primary text-xs sm:text-sm px-3.5 py-2 font-bold whitespace-nowrap self-end sm:self-center"
          >
            Review Strategy
          </button>
        </div>
      </section>

      {/* 4. SECTION 2: BALANCE SHEET & ASSET / LIABILITY COMPOSITION */}
      <section className="card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BFDBFE]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] bg-[#F0FDF4] px-2.5 py-0.5 rounded border border-[#BBF7D0]">
                Section 02
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#1B3A6B]">Balance Sheet & Audited Asset Composition</h2>
            </div>
            <p className="text-sm text-[#4B6080] mt-1.5">
              Audited balance sheet across all liquid, invested, and real asset accounts
            </p>
          </div>
          <div className="text-xs sm:text-sm text-[#2D4A6B]">
            <span>Gross Assets: </span>
            <span className="font-bold text-[#1B3A6B] tabular-nums">{formatCurrency(totalAssets)}</span>
            <span className="mx-2">•</span>
            <span>Total Debt: </span>
            <span className="font-bold text-[#C2410C] tabular-nums">{formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        {/* 1. Asset Holdings Table + Pie Chart */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-extrabold text-[#1B3A6B]">
            1. Audited Asset Holdings & Classification
          </h3>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-6 items-start">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#4B6080] uppercase tracking-wider font-semibold text-xs">
                    <th className="py-2.5 px-3 rounded-l">Asset Class & Account</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Valuation</th>
                    <th className="py-2.5 px-3 rounded-r">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(assets).map(([key, value]) => {
                    const info = assetClassNames[key] || { label: key.replace(/([A-Z])/g, ' $1'), type: 'Invested Asset' };
                    const sharePct = totalAssets > 0 ? ((value / totalAssets) * 100).toFixed(1) : '0.0';
                    const color =
                      key === 'equity' || key === 'mutualFunds' ? '#1B3A6B'
                      : key === 'cash' || key === 'emergencyFund' ? '#0D9488'
                      : key === 'debt' || key === 'epf' ? '#15803D'
                      : key === 'gold' ? '#D97706'
                      : '#6366F1';

                    return (
                      <tr key={key} className="hover:bg-[#E2E8F0] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="font-semibold text-[#111827]">{info.label}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#2D4A6B]">{info.type}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1B3A6B] tabular-nums">
                          {formatCurrency(value)}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums text-[#1F3555] font-medium">
                          {sharePct}%
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="bg-[#E2E8F0]/80 font-bold border-t border-[#BFDBFE]">
                    <td className="py-2.5 px-3 text-[#1B3A6B]">Total Audited Assets</td>
                    <td className="py-2.5 px-3 text-[#4B6080]">—</td>
                    <td className="py-2.5 px-3 text-[#14532D] tabular-nums">{formatCurrency(totalAssets)}</td>
                    <td className="py-2.5 px-3 text-[#1B3A6B]">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Full Pie Chart + Legend */}
            <div className="flex flex-col items-center justify-start gap-3 pt-1">
              <div className="h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={Object.entries(assets).map(([key, value]) => ({
                        name: (assetClassNames[key] || { label: key }).label,
                        key,
                        value,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={105}
                      paddingAngle={1.5}
                    >
                      {Object.entries(assets).map(([key]) => (
                        <Cell
                          key={key}
                          fill={
                            key === 'equity' || key === 'mutualFunds' ? '#1B3A6B'
                            : key === 'cash' || key === 'emergencyFund' ? '#0D9488'
                            : key === 'debt' || key === 'epf' ? '#15803D'
                            : key === 'gold' ? '#D97706'
                            : '#6366F1'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatCurrency(value), name]}
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #DBEAFE' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Color Legend */}
              <div className="w-full space-y-1.5">
                {Object.entries(assets).map(([key, value]) => {
                  const info = assetClassNames[key] || { label: key.replace(/([A-Z])/g, ' $1') };
                  const sharePct = totalAssets > 0 ? ((value / totalAssets) * 100).toFixed(1) : '0.0';
                  const color =
                    key === 'equity' || key === 'mutualFunds' ? '#1B3A6B'
                    : key === 'cash' || key === 'emergencyFund' ? '#0D9488'
                    : key === 'debt' || key === 'epf' ? '#15803D'
                    : key === 'gold' ? '#D97706'
                    : '#6366F1';
                  return (
                    <div key={key} className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[#2D4A6B] font-medium truncate">{info.label}</span>
                      </div>
                      <span className="font-bold text-[#1B3A6B] tabular-nums shrink-0">{sharePct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Liability Obligations Table */}
        <div className="space-y-3 pt-4 border-t border-[#DBEAFE]">
          <h3 className="text-base sm:text-lg font-extrabold text-[#1B3A6B]">
            2. Liability Obligations & Loan Amortization Schedules
          </h3>

          {Object.keys(liabilities).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#4B6080] uppercase tracking-wider font-semibold text-xs">
                    <th className="py-2.5 px-3 rounded-l">Obligation</th>
                    <th className="py-2.5 px-3">Interest Rate</th>
                    <th className="py-2.5 px-3">Monthly EMI</th>
                    <th className="py-2.5 px-3">Tenure Remaining</th>
                    <th className="py-2.5 px-3 text-right rounded-r">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(liabilities).map(([key, liability]) => (
                    <tr key={key} className="hover:bg-[#E2E8F0] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#111827] capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="py-2.5 px-3 text-[#1F3555] tabular-nums">{liability.interestRate}% p.a.</td>
                      <td className="py-2.5 px-3 font-semibold text-[#111827] tabular-nums">{formatCurrency(liability.emi)}/mo</td>
                      <td className="py-2.5 px-3 text-[#2D4A6B]">{liability.tenureRemaining} years</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#C2410C] tabular-nums">
                        {formatCurrency(liability.outstanding)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#E2E8F0]/80 font-bold border-t border-[#BFDBFE]">
                    <td className="py-2.5 px-3 text-[#1B3A6B]">Total Liabilities</td>
                    <td className="py-2.5 px-3 text-[#4B6080]">—</td>
                    <td className="py-2.5 px-3 text-[#1B3A6B] tabular-nums">{formatCurrency(monthlyEMIs)}/mo</td>
                    <td className="py-2.5 px-3 text-[#4B6080]">—</td>
                    <td className="py-2.5 px-3 text-right text-[#C2410C] tabular-nums">{formatCurrency(totalLiabilities)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-[#E2E8F0] rounded text-xs text-[#4B6080]">
              No debt obligations recorded for this profile.
            </div>
          )}
        </div>
      </section>

      {/* 5. SECTION 3: PROTECTION & INSURANCE SOLVENCY */}
      <section className="card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BFDBFE] mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] bg-[#F0FDF4] px-2.5 py-0.5 rounded border border-[#BBF7D0]">
                Section 03
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#1B3A6B]">Protection, Solvency & Contingency Audit</h2>
            </div>
            <p className="text-sm text-[#4B6080] mt-1.5">
              Comparison of current risk cover against human life value requirements
            </p>
          </div>
          {lifeGap > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA] px-2.5 py-0.5 text-xs font-semibold">
              <ShieldAlert size={13} />
              Underinsurance Deficit Detected
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#4B6080] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 rounded-l">Coverage Domain</th>
                <th className="py-2.5 px-3">Existing Sum Assured</th>
                <th className="py-2.5 px-3">Benchmark Guideline</th>
                <th className="py-2.5 px-3">Net Deficit / Gap</th>
                <th className="py-2.5 px-3 text-right rounded-r">Fiduciary Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Pure Term Life */}
              <tr className="hover:bg-[#E2E8F0] transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#111827]">Pure Term Life Insurance</div>
                  <div className="text-[11px] text-[#4B6080]">Solvency for spouse & dependents</div>
                </td>
                <td className="py-3 px-3 font-semibold text-[#111827] tabular-nums">
                  {formatCurrency(lifeCoverage)}
                </td>
                <td className="py-3 px-3 text-[#1F3555] tabular-nums">
                  {formatCurrency(requiredLifeBenchmark)} (15x income)
                </td>
                <td className="py-3 px-3 font-bold text-[#C2410C] tabular-nums">
                  {lifeGap > 0 ? `-${formatCurrency(lifeGap)} Deficit` : 'Adequate'}
                </td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status={lifeGap > 0 ? 'critical' : 'healthy'} label={lifeGap > 0 ? 'Critical Shortfall' : 'Optimal'} />
                </td>
              </tr>

              {/* Health Insurance */}
              <tr className="hover:bg-[#E2E8F0] transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#111827]">Family Health & Hospitalization</div>
                  <div className="text-[11px] text-[#4B6080]">Medical emergency coverage</div>
                </td>
                <td className="py-3 px-3 font-semibold text-[#111827] tabular-nums">
                  {formatCurrency(insurance.health || 0)}
                </td>
                <td className="py-3 px-3 text-[#1F3555]">₹10.0 L - ₹25.0 L</td>
                <td className="py-3 px-3 text-[#14532D] font-medium">Comprehensive</td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status="healthy" label="Satisfactory" />
                </td>
              </tr>

              {/* Accidental / Disability */}
              <tr className="hover:bg-[#E2E8F0] transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#111827]">Personal Accident & Disability</div>
                  <div className="text-[11px] text-[#4B6080]">Income protection rider</div>
                </td>
                <td className="py-3 px-3 font-semibold text-[#111827] tabular-nums">
                  {formatCurrency(insurance.accidental || 0)}
                </td>
                <td className="py-3 px-3 text-[#1F3555]">₹5.0 L - ₹10.0 L</td>
                <td className="py-3 px-3 text-[#2D4A6B] font-medium">Covered</td>
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
        <div className="lg:col-span-8 card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#BFDBFE] mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1B3A6B]">Financial Goals Horizon</h2>
                <p className="text-sm text-[#4B6080] mt-1">Active life objectives, timelines, and automated SIP coverage</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="text-xs sm:text-sm font-bold text-[#14532D] hover:text-[#166534] inline-flex items-center gap-1.5 transition"
              >
                <span>Full Goals Analysis</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {clientData?.goals?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#4B6080] uppercase tracking-wider font-semibold text-xs">
                      <th className="py-2.5 px-3 rounded-l">Goal Objective</th>
                      <th className="py-2.5 px-3">Target Amount</th>
                      <th className="py-2.5 px-3">Timeline</th>
                      <th className="py-2.5 px-3">Current Corpus</th>
                      <th className="py-2.5 px-3 text-right rounded-r">Monthly SIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientData.goals.map((goal, idx) => (
                      <tr key={idx} className="hover:bg-[#E2E8F0] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#111827]">{goal.name}</div>
                          <div className="text-[11px] text-[#4B6080] capitalize">{goal.priority} Priority • {goal.assetClass}</div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#111827] tabular-nums">
                          {formatCurrency(goal.targetAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-[#2D4A6B]">{goal.yearsToGoal} years</td>
                        <td className="py-2.5 px-3 text-[#1B3A6B] tabular-nums">{formatCurrency(goal.currentCorpus)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-[#14532D] tabular-nums">
                          {formatCurrency(goal.monthlySIP)}/mo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#4B6080]">No goals recorded.</div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DBEAFE] mt-3 text-xs sm:text-sm text-[#4B6080] flex items-center justify-between">
            <span>Total Active Mandates: {clientData?.goals?.length || 0}</span>
            <span className="font-semibold text-[#111827]">Total Outflow: {formatCurrency(totalCommittedSIP)}/mo</span>
          </div>
        </div>

        {/* Strategic Assumptions & Tax (4 cols) */}
        <div className="lg:col-span-4 card p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-4 border-b border-[#BFDBFE] mb-4">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1B3A6B]">Strategic Assumptions</h2>
              <p className="text-sm text-[#4B6080] mt-1">Baseline modeling rates & statutory limits</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#DBEAFE]">
                <span className="text-[#2D4A6B]">Assumed Annual Inflation</span>
                <span className="font-bold text-[#1B3A6B] tabular-nums">
                  {clientData?.assumptions?.inflation ? `${(clientData.assumptions.inflation * 100).toFixed(1)}%` : '6.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#DBEAFE]">
                <span className="text-[#2D4A6B]">Equity Return Assumption</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {clientData?.assumptions?.returns?.equity ? `${(clientData.assumptions.returns.equity * 100).toFixed(1)}%` : '12.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#DBEAFE]">
                <span className="text-[#2D4A6B]">Debt / Fixed Return</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {clientData?.assumptions?.returns?.debt ? `${(clientData.assumptions.returns.debt * 100).toFixed(1)}%` : '7.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#DBEAFE]">
                <span className="text-[#2D4A6B]">Gold / Bullion Return</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {clientData?.assumptions?.returns?.gold ? `${(clientData.assumptions.returns.gold * 100).toFixed(1)}%` : '8.0%'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#DBEAFE]">
                <span className="text-[#2D4A6B]">Sec 80C Tax Investments</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {formatCurrency(clientData?.taxSavingInvestments || 80000)} / ₹1.5L
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#E2E8F0] border border-[#BFDBFE] text-[11px] text-[#4B6080] leading-snug">
            All assumptions calibrated in compliance with deterministic RIA financial planning standards.
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientProfile;
