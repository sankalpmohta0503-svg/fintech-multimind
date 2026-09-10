import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  PieChart as PieChartIcon,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';

const DEMO_PORTFOLIO = {
  totalValue: 5500000,
  investedValue: 4900000,
  profitLoss: 600000,
  profitLossPercent: 12.24,
  riskProfile: 'Moderate',
  allocation: { equity: 72, debt: 15, gold: 8, cash: 5 },
  targetAllocation: { equity: 55, debt: 25, gold: 10, cash: 10 },
  holdings: [
    { name: 'Equity / Mutual Funds', type: 'Equity', value: 3960000, allocation: 72, return: 14.8, risk: 'High' },
    { name: 'Debt / Fixed Income', type: 'Debt', value: 825000, allocation: 15, return: 7.1, risk: 'Low' },
    { name: 'Gold', type: 'Gold', value: 440000, allocation: 8, return: 9.3, risk: 'Medium' },
    { name: 'Cash & Liquid', type: 'Cash', value: 275000, allocation: 5, return: 5.8, risk: 'Low' },
  ],
};

const COLORS = {
  Equity: '#1B3A6B',  // Navy Blue
  Debt: '#15803D',    // Dark Green
  Gold: '#D97706',    // Amber Gold
  Cash: '#0D9488',    // Deep Teal
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [targetAllocation, setTargetAllocation] = useState(DEMO_PORTFOLIO.targetAllocation);
  const [editingTargets, setEditingTargets] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => { loadPortfolio(); }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const response = await api.getPortfolio();
      setPortfolio(normalizePortfolio(response?.data || {}));
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setPortfolio(DEMO_PORTFOLIO);
    } finally {
      setLoading(false);
    }
  };

  const normalizePortfolio = (data) => {
    const allocation = data.allocation || data.assetAllocation || DEMO_PORTFOLIO.allocation;
    const totalValue =
      data.totalValue ?? data.totalPortfolioValue ?? data.totalInvestments ?? DEMO_PORTFOLIO.totalValue;

    return {
      ...DEMO_PORTFOLIO,
      ...data,
      totalValue,
      allocation: {
        equity: Number(allocation.equity ?? allocation.Equity ?? DEMO_PORTFOLIO.allocation.equity),
        debt: Number(allocation.debt ?? allocation.Debt ?? DEMO_PORTFOLIO.allocation.debt),
        gold: Number(allocation.gold ?? allocation.Gold ?? DEMO_PORTFOLIO.allocation.gold),
        cash: Number(allocation.cash ?? allocation.Cash ?? DEMO_PORTFOLIO.allocation.cash),
      },
      holdings: data.holdings || data.assets || DEMO_PORTFOLIO.holdings,
    };
  };

  const allocationEntries = useMemo(() => {
    if (!portfolio) return [];
    return [
      { name: 'Equity', key: 'equity', value: portfolio.allocation.equity },
      { name: 'Debt', key: 'debt', value: portfolio.allocation.debt },
      { name: 'Gold', key: 'gold', value: portfolio.allocation.gold },
      { name: 'Cash', key: 'cash', value: portfolio.allocation.cash },
    ];
  }, [portfolio]);

  const targetTotal = Object.values(targetAllocation).reduce((sum, value) => sum + Number(value || 0), 0);

  const differences = useMemo(() => {
    if (!portfolio) return [];
    return allocationEntries.map(item => ({
      ...item,
      target: Number(targetAllocation[item.key]),
      difference: Number(targetAllocation[item.key]) - item.value,
    }));
  }, [portfolio, allocationEntries, targetAllocation]);

  const allocationChart = allocationEntries.map(item => ({
    name: item.name,
    value: item.value,
  }));

  const insight = portfolio?.allocation.equity > 65
    ? {
        title: 'Portfolio is equity-heavy',
        text: `Equity currently makes up ${portfolio.allocation.equity}% of the portfolio. For the demo moderate-risk profile, the reference range is 45–65%.`,
        tone: 'warning',
      }
    : {
        title: 'Allocation looks broadly balanced',
        text: 'The current mix is within the displayed moderate-risk equity range. Review it again when goals, horizon or risk capacity change.',
        tone: 'positive',
      };

  const updateTarget = (key, value) => {
    setTargetAllocation(prev => ({ ...prev, [key]: Number(value) }));
  };

  const resetTargets = () => {
    setTargetAllocation({ ...portfolio.allocation });
  };

  const loadSampleTarget = () => {
    setTargetAllocation({ equity: 55, debt: 25, gold: 10, cash: 10 });
    setEditingTargets(true);
    setShowSuggestion(false);
  };

  const tradeAmount = difference =>
    Math.round((Math.abs(difference) / 100) * portfolio.totalValue);

  if (loading && !portfolio) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#1B3A6B]" />
          <p className="mt-4 text-xs font-medium text-[#4B6080]">Loading portfolio assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Eyebrow and Actions */}
      <header className="card bg-white p-5 border border-[#BFDBFE]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
              <PieChartIcon size={15} /> Wealth · Asset Allocation & Holdings
            </div>
            <h1 className="mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-[#1B3A6B]">
              Investment Portfolio
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#4B6080]">
              Explore client asset allocation, active holdings, risk balance, and fiduciary rebalancing opportunities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadPortfolio}
              disabled={loading}
              className="btn-secondary rounded-lg text-xs px-3.5 py-2 inline-flex items-center gap-2"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Portfolio</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Key Metrics Bento */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Portfolio */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#1B3A6B]">
            Total Portfolio
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-[#1B3A6B] tabular-nums">
              {formatCurrency(portfolio.totalValue)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#4B6080]">
            <span>Current investment value</span>
            <div className="rounded-md bg-[#EFF6FF] p-1.5 text-[#1B3A6B]">
              <Wallet size={16} />
            </div>
          </div>
        </div>

        {/* Profit / Loss */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#1B3A6B]">
            Profit / Loss
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-[#15803D] tabular-nums">
              +{formatCurrency(portfolio.profitLoss)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#15803D] font-semibold">
            <span>+{formatPercent(portfolio.profitLossPercent)} return</span>
            <div className="rounded-md bg-[#F0FDF4] p-1.5 text-[#15803D]">
              <TrendingUp size={16} />
            </div>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#1B3A6B]">
            Risk Profile
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-[#1B3A6B]">
              {portfolio.riskProfile}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#4B6080]">
            <span>Current profile on file</span>
            <div className="rounded-md bg-[#EFF6FF] p-1.5 text-[#1D4ED8]">
              <ShieldCheck size={16} />
            </div>
          </div>
        </div>

        {/* Largest Allocation */}
        <div className="card p-4 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#1B3A6B]">
            Largest Allocation
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold tracking-tight text-[#1B3A6B] tabular-nums">
              {Math.max(...allocationEntries.map(i => i.value))}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#4B6080]">
            <span>Equity concentration</span>
            <div className="rounded-md bg-[#EFF6FF] p-1.5 text-[#D97706]">
              <PieChartIcon size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. View Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          ['overview', 'Allocation Overview'],
          ['holdings', 'Holdings Breakdown'],
          ['rebalance', 'Rebalance Tool'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveView(key)}
            className={`rounded-md px-4 py-2 text-xs sm:text-sm font-bold transition shadow-xs ${
              activeView === key
                ? 'bg-[#1B3A6B] text-white'
                : 'border border-[#DBEAFE] bg-white text-[#1F3555] hover:bg-[#EFF6FF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="card p-5">
              <div className="mb-5 flex items-center justify-between border-b border-[#EFF6FF] pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1B3A6B]">Asset Allocation</h2>
                  <p className="text-xs text-[#4B6080]">How the current portfolio is distributed</p>
                </div>
                <div className="rounded-md bg-[#EFF6FF] p-2 text-[#1B3A6B]">
                  <BarChart3 size={20} />
                </div>
              </div>

              <div className="grid items-center gap-6 md:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocationChart} dataKey="value" nameKey="name" innerRadius={62} outerRadius={94} paddingAngle={3}>
                        {allocationChart.map(entry => (
                          <Cell key={entry.name} fill={COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={value => [`${value}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {allocationEntries.map(item => (
                    <div key={item.key} className="rounded-lg border border-[#DBEAFE] bg-[#F8FAFC] p-3 transition hover:bg-[#EFF6FF]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                          <span className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">{item.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#1B3A6B] tabular-nums">{item.value}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: COLORS[item.name] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`card p-5 flex flex-col justify-between ${
              insight.tone === 'warning'
                ? 'border-l-4 border-l-[#D97706] bg-[#FFFBEB]/50'
                : 'border-l-4 border-l-[#15803D] bg-[#F0FDF4]/50'
            }`}>
              <div>
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2.5 ${
                    insight.tone === 'warning' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#DCFCE7] text-[#15803D]'
                  }`}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B6080]">Portfolio Insight</span>
                    <h2 className="mt-0.5 text-base sm:text-lg font-bold text-[#1B3A6B]">{insight.title}</h2>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#2D4A6B]">{insight.text}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-[#DBEAFE] bg-white p-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#4B6080]">Moderate-risk reference</span>
                    <span className="text-[#1B3A6B]">45–65% equity</span>
                  </div>
                  <div className="mt-2.5 h-2.5 rounded-full bg-[#E2E8F0]">
                    <div className="relative h-2.5 rounded-full bg-[#93C5FD]" style={{ width: `${Math.min(portfolio.allocation.equity, 100)}%` }}>
                      <span className="absolute -right-1.5 -top-1 h-4 w-4 rounded-full border-2 border-white bg-[#1B3A6B] shadow-sm" />
                    </div>
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] font-medium text-[#4B6080]">
                    <span>0%</span><span>45%</span><span>65%</span><span>100%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DBEAFE]">
                <button
                  onClick={() => setShowSuggestion(v => !v)}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1B3A6B] hover:text-[#1D4ED8] transition"
                >
                  <Target size={16} className="text-[#15803D]" />
                  {showSuggestion ? 'Hide suggestion' : 'View rebalancing suggestion'}
                </button>

                {showSuggestion && (
                  <div className="mt-3 rounded-lg border border-[#BFDBFE] bg-white p-3.5 shadow-xs">
                    <p className="text-xs sm:text-sm leading-relaxed text-[#2D4A6B]">
                      Compare current portfolio with target benchmark of <span className="font-semibold text-[#1B3A6B]">55% equity</span>, <span className="font-semibold text-[#1B3A6B]">25% debt</span>, <span className="font-semibold text-[#1B3A6B]">10% gold</span>, and <span className="font-semibold text-[#1B3A6B]">10% cash</span>.
                    </p>
                    <button
                      onClick={loadSampleTarget}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#1B3A6B] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#152e55] transition shadow-xs"
                    >
                      <Sparkles size={14} />
                      Load benchmark target
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-5 border-b border-[#EFF6FF] pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#1B3A6B]">Allocation Check</h2>
              <p className="text-xs text-[#4B6080]">Compare current mix against the demo target benchmark.</p>
            </div>

            <div className="space-y-4">
              {differences.map(item => (
                <div key={item.key} className="rounded-lg border border-[#EFF6FF] bg-[#F8FAFC] p-3.5">
                  <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#1B3A6B]">{item.name}</span>
                    <span className={`font-semibold tabular-nums ${item.difference > 0 ? 'text-[#15803D]' : item.difference < 0 ? 'text-[#DC2626]' : 'text-[#4B6080]'}`}>
                      Current {item.value}% → Target {item.target}%
                    </span>
                  </div>
                  <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className="rounded-full bg-[#94A3B8]" style={{ width: `${item.value}%` }} title={`Current: ${item.value}%`} />
                    <div className="rounded-full bg-[#1B3A6B]" style={{ width: `${item.target}%` }} title={`Target: ${item.target}%`} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                    {item.difference > 0 ? (
                      <ArrowUpRight size={14} className="text-[#15803D]" />
                    ) : item.difference < 0 ? (
                      <ArrowDownRight size={14} className="text-[#DC2626]" />
                    ) : (
                      <Check size={14} className="text-[#15803D]" />
                    )}
                    <span className={item.difference > 0 ? 'text-[#15803D]' : item.difference < 0 ? 'text-[#DC2626]' : 'text-[#4B6080]'}>
                      {item.difference > 0 ? `Increase by ${item.difference}%` : item.difference < 0 ? `Reduce by ${Math.abs(item.difference)}%` : 'Target matched perfectly'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeView === 'holdings' && (
        <div className="card p-5">
          <div className="mb-5 border-b border-[#EFF6FF] pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#1B3A6B]">Holdings & Performance</h2>
            <p className="text-xs text-[#4B6080]">Detailed breakdown of individual securities and performance contribution.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DBEAFE] bg-[#EFF6FF] text-[11px] font-bold uppercase tracking-wider text-[#1B3A6B]">
                  <th className="px-4 py-3 rounded-tl-md">Holding</th>
                  <th className="px-4 py-3">Asset Class</th>
                  <th className="px-4 py-3">Current Value</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Return</th>
                  <th className="px-4 py-3 rounded-tr-md">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFF6FF] text-xs sm:text-sm">
                {portfolio.holdings.map((holding, index) => {
                  const returnValue = Number(holding.return ?? holding.returns ?? 0);
                  return (
                    <tr key={`${holding.name}-${index}`} className="hover:bg-[#F8FAFC] transition">
                      <td className="px-4 py-3.5 font-bold text-[#1B3A6B]">{holding.name}</td>
                      <td className="px-4 py-3.5 text-[#2D4A6B]">
                        <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold bg-[#EFF6FF] text-[#1B3A6B] border border-[#BFDBFE]">
                          {holding.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#1B3A6B] tabular-nums">{formatCurrency(holding.value)}</td>
                      <td className="px-4 py-3.5 font-medium text-[#2D4A6B] tabular-nums">{holding.allocation}%</td>
                      <td className={`px-4 py-3.5 font-bold tabular-nums ${returnValue >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                        {returnValue >= 0 ? '+' : ''}{returnValue}%
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#F1F5F9] text-[#334155]">
                          {holding.risk || 'Moderate'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'rebalance' && (
        <>
          <div className="card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#EFF6FF] pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1B3A6B]">Interactive Rebalancing</h2>
                <p className="text-xs text-[#4B6080]">Fine-tune target weights with sliders; suggested trades update dynamically.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetTargets}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#DBEAFE] bg-white px-3 py-1.5 text-xs font-bold text-[#1B3A6B] hover:bg-[#EFF6FF] transition shadow-xs"
                >
                  <RefreshCcw size={14} /> Reset
                </button>
                <button
                  onClick={() => setEditingTargets(v => !v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                    editingTargets
                      ? 'bg-[#15803D] text-white hover:bg-[#166534]'
                      : 'border border-[#BFDBFE] bg-[#1B3A6B] text-white hover:bg-[#152e55]'
                  }`}
                >
                  {editingTargets ? 'Save Targets' : 'Adjust Targets'}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {allocationEntries.map(item => (
                <div key={item.key} className="rounded-lg border border-[#DBEAFE] bg-[#F8FAFC] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-[#1B3A6B]">{item.name}</span>
                    <span className="text-base font-extrabold text-[#1B3A6B] tabular-nums">{targetAllocation[item.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={targetAllocation[item.key]}
                    disabled={!editingTargets}
                    onChange={e => updateTarget(item.key, e.target.value)}
                    className="mt-3 w-full accent-[#1B3A6B] disabled:opacity-50 cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-[#4B6080]">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-5 flex items-start gap-3 rounded-lg border p-4 ${
              targetTotal === 100 ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-[#FED7AA] bg-[#FFF7ED]'
            }`}>
              {targetTotal === 100 ? (
                <CheckCircle2 className="mt-0.5 text-[#15803D] shrink-0" size={18} />
              ) : (
                <X className="mt-0.5 text-[#D97706] shrink-0" size={18} />
              )}
              <div>
                <p className={`text-xs sm:text-sm font-bold ${targetTotal === 100 ? 'text-[#15803D]' : 'text-[#D97706]'}`}>
                  Target Allocation Sum: {targetTotal}%
                </p>
                <p className="mt-0.5 text-xs text-[#4B6080]">
                  {targetTotal === 100
                    ? 'Target weights are balanced to 100% and ready for portfolio simulation.'
                    : 'Adjust the sliders until the combined sum equals exactly 100%.'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 border-b border-[#EFF6FF] pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#1B3A6B]">Suggested Transactions</h2>
              <p className="text-xs text-[#4B6080]">Calculated cash values required to reach the target allocation.</p>
            </div>

            {targetTotal !== 100 ? (
              <div className="rounded-lg border border-dashed border-[#BFDBFE] bg-[#F8FAFC] p-8 text-center">
                <p className="text-xs sm:text-sm font-semibold text-[#4B6080]">Complete target allocation balance (100%) to generate transactions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {differences.filter(item => item.difference !== 0).map(item => (
                  <div key={item.key} className="flex flex-col gap-3 rounded-lg border border-[#DBEAFE] bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#F8FAFC] transition">
                    <div>
                      <div className="flex items-center gap-2">
                        {item.difference > 0 ? (
                          <div className="rounded-md bg-[#F0FDF4] p-1 text-[#15803D]"><ArrowUpRight size={16} /></div>
                        ) : (
                          <div className="rounded-md bg-[#FEF2F2] p-1 text-[#DC2626]"><ArrowDownRight size={16} /></div>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-[#1B3A6B]">
                          {item.difference > 0 ? 'Increase' : 'Reduce'} {item.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#4B6080] font-medium">
                        {item.value}% current → {item.target}% target ({item.difference > 0 ? `+${item.difference}%` : `${item.difference}%`})
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`text-base font-extrabold tabular-nums ${item.difference > 0 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                        {item.difference > 0 ? '+' : '-'}{formatCurrency(tradeAmount(item.difference))}
                      </p>
                      <p className="text-[11px] text-[#4B6080] font-semibold">Estimated trade value</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Disclaimer */}
      <div className="card p-4 border border-[#BFDBFE] bg-[#EFF6FF]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-[#1B3A6B] shrink-0" size={18} />
          <p className="text-xs leading-relaxed text-[#2D4A6B]">
            Portfolio figures and allocation matrices are for demonstration purposes. Market prices and allocations should be re-verified against live clearing records prior to order placement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
