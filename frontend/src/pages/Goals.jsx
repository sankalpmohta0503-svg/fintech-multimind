import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  PieChart,
  Layers,
  Info
} from 'lucide-react';
import api from '../services/api';
import GoalTrajectoryChart from '../charts/GoalTrajectoryChart';
import StatusBadge from '../components/StatusBadge';
import Disclosure from '../components/Disclosure';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import {
  formatCurrency,
  formatPercent,
  getGoalStatusColor,
  formatTimeframe
} from '../utils/formatters';

const Goals = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalsData, setGoalsData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalsRes, clientRes] = await Promise.all([
        api.getGoals(),
        api.getClient().catch(() => ({ data: null }))
      ]);

      setGoalsData(goalsRes.data);
      setClientData(clientRes.data);

      if (goalsRes.data?.goals?.length > 0) {
        setSelectedGoal(goalsRes.data.goals[0]);
      }
    } catch (err) {
      console.error('Failed to load goals data:', err);
      setError('Unable to load client goals and projection trajectory. Please check the connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" height="56px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="280px" height="32px" />
          <Skeleton variant="text" width="500px" height="18px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" height="130px" />
          <Skeleton variant="card" height="130px" />
          <Skeleton variant="card" height="130px" />
          <Skeleton variant="card" height="130px" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" height="160px" />
          <Skeleton variant="card" height="160px" />
          <Skeleton variant="card" height="160px" />
        </div>
        <Skeleton variant="card" height="420px" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!goalsData || !goalsData.goals || goalsData.goals.length === 0) {
    return (
      <EmptyState
        title="No Financial Goals Found"
        description="There are currently no active financial goals configured for this client profile."
      />
    );
  }

  const { summary, goals } = goalsData;
  const clientName = clientData?.personalInfo?.name || 'Client';
  const assumptions = clientData?.assumptions || {};

  // Aggregate calculations from real data
  const totalPresentTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalCurrentCorpus = goals.reduce((sum, g) => sum + (g.currentCorpus || 0), 0);
  const totalMonthlySIP = goals.reduce((sum, g) => sum + (g.monthlySIP || 0), 0);
  const totalRequiredSIP = goals.reduce((sum, g) => sum + (g.analysis?.requiredMonthlySIP || 0), 0);
  const totalAdditionalSIP = goals.reduce((sum, g) => sum + (g.analysis?.additionalSIP || 0), 0);
  
  const horizons = goals.map(g => g.yearsToGoal || 0);
  const minHorizon = horizons.length > 0 ? Math.min(...horizons) : 0;
  const maxHorizon = horizons.length > 0 ? Math.max(...horizons) : 0;

  const hasCritical = (summary?.atRisk || 0) > 0;

  const getStatusBadgeType = (status) => {
    switch (status) {
      case 'on-track':
        return { status: 'healthy', label: 'On Track' };
      case 'attention':
        return { status: 'opportunity', label: 'Minor Gap' };
      case 'at-risk':
        return { status: 'warning', label: 'At Risk' };
      case 'critical':
        return { status: 'critical', label: 'Critical Deficit' };
      default:
        return { status: 'neutral', label: status || 'Neutral' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Context & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Accounts</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-medium text-slate-700">Advisory Portfolio</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-medium text-slate-900">{clientName}</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-950">Goals & Horizon Planning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified Live Mandate
          </span>
        </div>
      </div>

      {/* 2. Executive Title & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {hasCritical ? (
              <span className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-xs font-semibold text-rose-800 uppercase tracking-wide">
                <AlertCircle size={13} className="text-rose-600" />
                Action Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Goals On Track
              </span>
            )}
            <span className="text-xs text-slate-500">Audited Financial Mandates</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Financial Goals & Trajectory Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            {summary?.total || goals.length} Active Client Mandates ({summary?.onTrack || 0} On-Track, {summary?.atRisk || 0} At Risk / Critical) calibrated against inflation, time horizons, and audited monthly SIP contributions.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FileText size={15} className="text-slate-500" />
            <span>Export Goals Summary</span>
          </Link>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Sliders size={15} />
            <span>Run Scenario in Simulator</span>
          </Link>
        </div>
      </div>

      {/* 3. Executive Metric Banner (4 Key Institutional Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Aggregate Goal Target</span>
            <Target size={16} className="text-slate-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {formatCurrency(summary?.totalRequired || totalPresentTarget)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Present: {formatCurrency(totalPresentTarget)} ({summary?.total || goals.length} goals)
            </p>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-slate-50 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100">
            <span>Horizon Span</span>
            <span className="font-semibold text-slate-900">{minHorizon} – {maxHorizon} Years</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Projected Total Corpus</span>
            <TrendingUp size={16} className="text-teal-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {formatCurrency(summary?.totalProjected || 0)}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, summary?.avgFunding || 0)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-teal-700 tabular-nums">
                {summary?.avgFunding || 0}%
              </span>
            </div>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-slate-50 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100">
            <span>Current Corpus</span>
            <span className="font-semibold text-slate-900">{formatCurrency(totalCurrentCorpus)}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Aggregate Capital Deficit</span>
            <TrendingDown size={16} className={hasCritical ? 'text-rose-600' : 'text-slate-400'} />
          </div>
          <div className="my-3">
            <div className={`text-2xl font-bold tracking-tight tabular-nums ${hasCritical ? 'text-rose-600' : 'text-slate-950'}`}>
              {(summary?.totalGap || 0) > 0 ? `-${formatCurrency(summary.totalGap)}` : '₹0 (Funded)'}
            </div>
            <p className={`mt-1 text-xs ${hasCritical ? 'text-rose-700' : 'text-slate-500'}`}>
              {summary?.atRisk || 0} mandates with funding shortfall
            </p>
          </div>
          <div className={`-mx-4 -mb-4 rounded-b-xl px-4 py-2 text-xs flex items-center justify-between border-t ${hasCritical ? 'bg-rose-50/80 text-rose-800 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            <span>Funding Status</span>
            <span className="font-bold">{hasCritical ? 'Capital Deficit' : 'Surplus Buffer'}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Monthly Goal SIP</span>
            <Layers size={16} className="text-amber-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {formatCurrency(totalMonthlySIP)} <span className="text-xs font-normal text-slate-500">/ mo</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Required: <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(totalRequiredSIP)}/mo</span>
            </p>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-amber-50/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between border-t border-amber-100">
            <span>Surplus Gap</span>
            <span className="font-bold tabular-nums">
              {totalAdditionalSIP > 0 ? `+${formatCurrency(totalAdditionalSIP)} / mo` : '₹0 / mo'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Goal Selector & Horizon Status Matrix (Goal Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Target size={15} className="text-slate-400" />
            Client Mandate Inventory ({goals.length} Targets)
          </h2>
          <span className="text-xs text-slate-500">Click a mandate card to inspect trajectory vectors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal, idx) => {
            const isSelected = selectedGoal && selectedGoal.name === goal.name;
            const badgeInfo = getStatusBadgeType(goal.analysis?.status);
            const fundingPct = goal.analysis?.fundingPercentage || 0;
            const gap = goal.analysis?.gap || 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedGoal(goal)}
                className={`text-left rounded-xl p-4 transition-all duration-150 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-slate-950 bg-white shadow-md ring-1 ring-slate-950'
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          {goal.priority || 'Medium'} Priority
                        </span>
                        <span>•</span>
                        <span>{formatTimeframe(goal.yearsToGoal)}</span>
                      </div>
                      <h3 className="font-bold text-slate-950 text-base truncate">
                        {goal.name}
                      </h3>
                    </div>
                    <StatusBadge status={badgeInfo.status} label={badgeInfo.label} />
                  </div>

                  {/* 2-Column Key Figures */}
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Target Amount</span>
                      <span className="font-bold text-slate-950 tabular-nums block text-sm">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Funded: {fundingPct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Monthly SIP</span>
                      <span className="font-bold text-slate-950 tabular-nums block text-sm">
                        {formatCurrency(goal.monthlySIP)}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Req: {formatCurrency(goal.analysis?.requiredMonthlySIP || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Bar */}
                <div className={`mt-3 -mx-4 -mb-4 rounded-b-xl px-4 py-2 text-xs flex items-center justify-between border-t ${
                  gap > 0
                    ? 'bg-rose-50/70 text-rose-800 border-rose-100'
                    : 'bg-emerald-50/70 text-emerald-800 border-emerald-100'
                }`}>
                  <span className="font-medium">{gap > 0 ? 'Capital Deficit' : 'Surplus Buffer'}</span>
                  <span className="font-bold tabular-nums">
                    {gap > 0 ? `-${formatCurrency(gap)}` : `+${formatCurrency(Math.abs(gap))}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Selected Goal Deep-Dive (Trajectory & Projection Analysis) */}
      {selectedGoal && (
        <div className="space-y-6">
          {/* Analytical Takeaway Callout Banner */}
          <div
            className={`rounded-xl border p-4 sm:p-5 flex items-start gap-3.5 shadow-sm ${
              selectedGoal.analysis?.gap > 0
                ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            }`}
          >
            {selectedGoal.analysis?.gap > 0 ? (
              <AlertCircle size={22} className="text-rose-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Mandate Trajectory Diagnosis • {selectedGoal.name}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                At current monthly SIP of{' '}
                <span className="font-bold text-slate-950 tabular-nums">
                  {formatCurrency(selectedGoal.monthlySIP)}
                </span>{' '}
                with{' '}
                <span className="font-bold text-slate-950 tabular-nums">
                  {selectedGoal.analysis?.expectedReturn}%
                </span>{' '}
                expected annual return ({selectedGoal.assetClass} asset class), the corpus accumulates to{' '}
                <span className="font-bold text-slate-950 tabular-nums">
                  {formatCurrency(selectedGoal.analysis?.projectedCorpus)}
                </span>{' '}
                over {formatTimeframe(selectedGoal.yearsToGoal)}, against the inflation-adjusted target of{' '}
                <span className="font-bold text-slate-950 tabular-nums">
                  {formatCurrency(selectedGoal.analysis?.inflationAdjustedTarget)}
                </span>
                .{' '}
                {selectedGoal.analysis?.gap > 0 ? (
                  <>
                    This creates a net terminal capital deficit of{' '}
                    <span className="font-bold text-rose-700 tabular-nums">
                      {formatCurrency(selectedGoal.analysis.gap)}
                    </span>
                    . Increasing monthly SIP by{' '}
                    <span className="font-bold text-rose-700 tabular-nums">
                      {formatCurrency(selectedGoal.analysis.additionalSIP)}
                    </span>{' '}
                    is required to achieve 100% solvency.
                  </>
                ) : (
                  <>
                    The goal is fully funded with a surplus buffer of{' '}
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(Math.abs(selectedGoal.analysis?.gap || 0))}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Trajectory Chart & Tabular Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {selectedGoal.name} Capital Trajectory ({formatTimeframe(selectedGoal.yearsToGoal)} Horizon)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deterministic projection factoring inflation adjustment and {selectedGoal.analysis?.expectedReturn}% compounding rate.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                  Current Path
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                  Required Path
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Target Milestone
                </span>
              </div>
            </div>

            {/* Recharts Trajectory Visualization */}
            <GoalTrajectoryChart
              data={selectedGoal.analysis?.trajectory}
              goalName={selectedGoal.name}
            />

            {/* Precision Tabular Trajectory Breakdown */}
            {selectedGoal.analysis?.trajectory && selectedGoal.analysis.trajectory.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trajectory Milestone Breakdown (Deterministic Values)
                  </span>
                  <span className="text-xs text-slate-400">Audited Projection Matrix</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Horizon Milestone</th>
                        <th className="py-2.5 px-3 text-right">Current Path Corpus</th>
                        <th className="py-2.5 px-3 text-right">Required Path Corpus</th>
                        <th className="py-2.5 px-3 text-right">Net Milestone Variance</th>
                        <th className="py-2.5 px-3 text-center">Status / Readiness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {selectedGoal.analysis.trajectory.map((step, sIdx) => {
                        const isStart = step.year === 0;
                        const isEnd = step.year === selectedGoal.yearsToGoal;
                        const variance = (step.required || 0) - (step.current || 0);

                        return (
                          <tr
                            key={sIdx}
                            className={`hover:bg-slate-50 transition-colors ${
                              isEnd ? 'bg-slate-50/70 font-semibold' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {isStart
                                ? 'Year 0 (Baseline / Today)'
                                : isEnd
                                ? `Year ${step.year} (Target Horizon)`
                                : `Year ${step.year}`}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                              {formatCurrency(step.current)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              {formatCurrency(step.required)}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-medium ${
                                variance > 0 ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            >
                              {variance > 0
                                ? `-${formatCurrency(variance)}`
                                : variance === 0
                                ? '₹0 (Aligned)'
                                : `+${formatCurrency(Math.abs(variance))}`}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isStart ? (
                                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                  Active Baseline
                                </span>
                              ) : isEnd ? (
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                                    variance > 0
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {variance > 0 ? `${selectedGoal.analysis.fundingPercentage}% Funded` : 'Fully Funded'}
                                </span>
                              ) : (
                                <span className="inline-block rounded bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                                  Compounding
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 6. Analytical Summary & Gap Breakdown Cards (3-Column Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card A: Capital Accumulation Gap */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Capital Accumulation Gap</span>
                  <Target size={16} className="text-slate-400" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Projected Corpus:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(selectedGoal.analysis?.projectedCorpus)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Inflation-Adjusted Target:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(selectedGoal.analysis?.inflationAdjustedTarget)}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center rounded-lg p-2.5 border ${
                    selectedGoal.analysis?.gap > 0
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="font-bold">Net Capital Shortfall:</span>
                    <span className="text-sm font-bold tabular-nums">
                      {selectedGoal.analysis?.gap > 0
                        ? `-${formatCurrency(selectedGoal.analysis.gap)}`
                        : `+${formatCurrency(Math.abs(selectedGoal.analysis?.gap || 0))}`}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Reflects a {selectedGoal.analysis?.fundingPercentage}% readiness score against inflation-adjusted maturity.
              </p>
            </div>

            {/* Card B: Cashflow & SIP Calibration */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Cashflow & SIP Calibration</span>
                  <Layers size={16} className="text-slate-400" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Current Monthly SIP:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(selectedGoal.monthlySIP)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Required Monthly SIP:</span>
                    <span className="font-semibold text-teal-700 tabular-nums">
                      {formatCurrency(selectedGoal.analysis?.requiredMonthlySIP)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between items-center rounded-lg p-2.5 bg-amber-50/80 border border-amber-200 text-amber-950">
                    <span className="font-bold">Additional SIP Needed:</span>
                    <span className="text-sm font-bold tabular-nums">
                      {selectedGoal.analysis?.additionalSIP > 0
                        ? `+${formatCurrency(selectedGoal.analysis.additionalSIP)} / mo`
                        : '₹0 / mo (Funded)'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                {selectedGoal.analysis?.additionalSIP > 0
                  ? `Required increment to reach 100% target corpus within ${formatTimeframe(selectedGoal.yearsToGoal)}.`
                  : 'Current SIP contributions are sufficient to fulfill this financial mandate.'}
              </p>
            </div>

            {/* Card C: Horizon & Allocation Profile */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Horizon & Strategy Profile</span>
                  <PieChart size={16} className="text-slate-400" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Time Remaining:</span>
                    <span className="font-semibold text-slate-900">
                      {formatTimeframe(selectedGoal.yearsToGoal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Asset Class Category:</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {selectedGoal.assetClass || 'Balanced'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Expected Return:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {selectedGoal.analysis?.expectedReturn}% p.a.
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Priority Tier:</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {selectedGoal.priority || 'Medium'} Priority
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Parameters calibrated under client risk profile and baseline inflation.
              </p>
            </div>
          </div>

          {/* 7. Advisory Decision Support Actions Row */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                <Sparkles size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-950">
                  Advisory Decision Support & Next Steps
                </h4>
                <p className="text-xs text-slate-500">
                  Direct pathways to audit, simulate, or deliver financial recommendations for {selectedGoal.name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Link
                to="/audit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors"
              >
                <ShieldCheck size={14} className="text-slate-600" />
                <span>Inspect Audit Findings</span>
              </Link>
              <Link
                to="/simulator"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
              >
                <Sliders size={14} />
                <span>Simulate in What-If</span>
              </Link>
            </div>
          </div>

          {/* 8. Expandable 'Planning Assumptions & Parameters' Disclosure */}
          <Disclosure
            title={
              <div className="flex items-center gap-2">
                <Info size={16} className="text-slate-500" />
                <span className="font-semibold text-slate-900">
                  Planning Assumptions & Return Parameters
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Verified Engine Constants
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-500 block">Baseline Inflation</span>
                <span className="mt-1 font-bold text-slate-950 tabular-nums text-sm block">
                  {assumptions.inflation ? `${(assumptions.inflation * 100).toFixed(1)}% p.a.` : '6.0% p.a.'}
                </span>
                <span className="mt-0.5 text-[11px] text-slate-500 block">
                  Long-term CPI benchmark
                </span>
              </div>

              {assumptions.returns && (
                <>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-slate-500 block">Equity Expected Return</span>
                    <span className="mt-1 font-bold text-slate-950 tabular-nums text-sm block">
                      {assumptions.returns.equity ? `${(assumptions.returns.equity * 100).toFixed(1)}% p.a.` : '12.0% p.a.'}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-500 block">
                      Diversified equities & mutual funds
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-slate-500 block">Balanced Expected Return</span>
                    <span className="mt-1 font-bold text-slate-950 tabular-nums text-sm block">
                      {assumptions.returns.balanced ? `${(assumptions.returns.balanced * 100).toFixed(1)}% p.a.` : '10.0% p.a.'}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-500 block">
                      Hybrid / multi-asset allocation
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="text-slate-500 block">Debt Expected Return</span>
                    <span className="mt-1 font-bold text-slate-950 tabular-nums text-sm block">
                      {assumptions.returns.debt ? `${(assumptions.returns.debt * 100).toFixed(1)}% p.a.` : '7.0% p.a.'}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-500 block">
                      Fixed income & debt funds
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Deterministic calculations utilize historical compounded asset class returns and constant inflation modeling. Review and rebalance annually.
            </p>
          </Disclosure>
        </div>
      )}
    </div>
  );
};

export default Goals;
