import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Sliders, Target } from 'lucide-react';
import api from '../services/api';
import GoalTrajectoryChart from '../charts/GoalTrajectoryChart';
import StatusBadge from '../components/StatusBadge';
import Disclosure from '../components/Disclosure';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatTimeframe } from '../utils/formatters';

const statusMap = {
  'on-track': { status: 'healthy', label: 'On track', color: '#15803D' },
  attention: { status: 'opportunity', label: 'Attention', color: '#1B3A6B' },
  'at-risk': { status: 'warning', label: 'At risk', color: '#EA580C' },
  critical: { status: 'critical', label: 'Critical', color: '#DC2626' },
};

const Goals = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalsData, setGoalsData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalsRes, clientRes] = await Promise.all([
        api.getGoals(),
        api.getClient().catch(() => ({ data: null })),
      ]);
      setGoalsData(goalsRes.data);
      setClientData(clientRes.data);
      if (goalsRes.data?.goals?.length) {
        setSelectedGoal(goalsRes.data.goals[0]);
      }
    } catch (err) {
      console.error('Failed to load goals data:', err);
      setError('Unable to load client goals and projection trajectory. Please check the connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-28" />
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (!goalsData?.goals?.length) {
    return (
      <div>
        <EmptyState
          title="No financial goals found"
          message="There are currently no active financial goals configured for this client profile."
        />
      </div>
    );
  }

  const { summary, goals } = goalsData;
  const clientName = clientData?.personalInfo?.name || 'Client';
  const selectedAnalysis = selectedGoal?.analysis || {};

  return (
    <div className="animate-enter space-y-6">
      {/* 1. Header with Eyebrow and Actions */}
      <header className="card bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
              <Target size={15} /> Plan · Goals & Trajectories
            </div>
            <h1 className="mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-[#1B3A6B]">
              Client Goals & Projections
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#374151]">
              A forward-looking view of what {clientName} is working toward, how each goal is progressing, and where additional SIP allocations are required.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/report"
              className="btn-secondary rounded-lg text-xs"
            >
              <FileText size={15} /> Goals Summary
            </Link>
            <Link
              to="/simulator"
              className="btn-primary rounded-lg text-xs"
            >
              <Sliders size={15} /> Explore Scenario
            </Link>
          </div>
        </div>
      </header>

      {/* 2. The Horizon at a Glance */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 card bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Horizon Overview</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1B3A6B] leading-none">
                {summary?.total || goals.length}
              </span>
              <span className="text-sm font-semibold text-[#4B6080]">Active Financial Goals</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#374151]">
              <strong className="text-[#14532D]">{summary?.onTrack || 0}</strong> are currently on track, with an average funding progress of <strong className="text-[#1B3A6B]">{summary?.avgFunding || 0}%</strong> across active milestones.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DBEAFE] flex items-center gap-2 text-xs text-[#2563EB]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Projections calculated using deterministic goal-based compounding framework</span>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
          <div className="card bg-white p-4 flex flex-col justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">On Track</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#14532D]">{summary?.onTrack || 0}</div>
            <div className="text-[11px] font-medium text-[#15803D]">Milestones Met</div>
          </div>
          <div className="card bg-white p-4 flex flex-col justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">At Risk</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#EA580C]">{summary?.atRisk || 0}</div>
            <div className="text-[11px] font-medium text-[#EA580C]">Needs Attention</div>
          </div>
          <div className="card bg-white p-4 flex flex-col justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Avg Funded</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B3A6B]">{summary?.avgFunding || 0}%</div>
            <div className="text-[11px] font-medium text-[#2563EB]">Current Coverage</div>
          </div>
        </div>
      </section>

      {/* 3. Goal Selection & Trajectory Analysis */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Goals List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">Available Goals</h2>
            <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-bold text-[#1B3A6B] border border-[#BFDBFE]">
              {goals.length} Goals
            </span>
          </div>
          <div className="space-y-2.5">
            {goals.map((goal, index) => {
              const status = statusMap[goal.analysis?.status] || {
                status: 'opportunity',
                label: goal.analysis?.status || 'Review',
                color: '#1B3A6B',
              };
              const selected = selectedGoal?.name === goal.name;
              return (
                <button
                  key={goal.name || index}
                  type="button"
                  onClick={() => setSelectedGoal(goal)}
                  className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                    selected
                      ? 'border-[#1B3A6B] bg-[#EFF6FF] shadow-sm ring-1 ring-[#1B3A6B]/30'
                      : 'border-[#DBEAFE] bg-white hover:-translate-y-0.5 hover:shadow-sm hover:border-[#BFDBFE]'
                  }`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: selected ? '#1B3A6B' : status.color,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        <span>{goal.priority || 'Medium'} Priority</span>
                        <span>•</span>
                        <span>{formatTimeframe(goal.yearsToGoal)}</span>
                      </div>
                      <h3 className="truncate text-sm sm:text-base font-bold text-[#1B3A6B]">
                        {goal.name}
                      </h3>
                    </div>
                    <StatusBadge status={status.status} label={status.label} />
                  </div>
                  <div className="mt-3 flex items-end justify-between border-t border-[#DBEAFE] pt-2.5">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Target Amount</div>
                      <div className="mt-0.5 text-xs sm:text-sm font-bold text-[#111827]">
                        {formatCurrency(goal.targetAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-extrabold" style={{ color: status.color }}>
                        {goal.analysis?.fundingPercentage || 0}%
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Funded</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Goal Details & Trajectory */}
        {selectedGoal && (
          <div className="lg:col-span-8 space-y-4">
            {/* Selected Goal Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B3A6B] via-[#1E427B] to-[#162E56] p-6 text-white shadow-md">
              <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-white/10" />
              <div className="relative">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#93C5FD]">
                      Active Selection
                    </div>
                    <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {selectedGoal.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
                        {selectedGoal.priority || 'Medium'} Priority
                      </span>
                      <span className="text-xs text-blue-200">{formatTimeframe(selectedGoal.yearsToGoal)} Horizon</span>
                      <span className="text-xs text-blue-200">•</span>
                      <span className="text-xs text-blue-200">Asset Class: {selectedGoal.assetClass}</span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                      {selectedAnalysis.fundingPercentage || 0}%
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-blue-200 font-semibold">Funded</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4 sm:grid-cols-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Target Goal</div>
                    <div className="mt-1 text-sm sm:text-base font-bold text-white">{formatCurrency(selectedGoal.targetAmount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Current Corpus</div>
                    <div className="mt-1 text-sm sm:text-base font-bold text-white">{formatCurrency(selectedGoal.currentCorpus)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Current SIP</div>
                    <div className="mt-1 text-sm sm:text-base font-bold text-white">{formatCurrency(selectedGoal.monthlySIP)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">Funding Gap</div>
                    <div className={`mt-1 text-sm sm:text-base font-bold ${selectedAnalysis.gap > 0 ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'}`}>
                      {selectedAnalysis.gap > 0 ? formatCurrency(selectedAnalysis.gap) : '₹0 (Fully Funded)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trajectory Chart Card */}
            <div className="card bg-white p-5 rounded-xl border border-[#DBEAFE]">
              <div className="flex items-center justify-between pb-3 border-b border-[#DBEAFE]">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">Trajectory Analysis</div>
                  <h3 className="text-base font-bold text-[#111827]">
                    Projected Path vs Required Path
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#4B6080]">{formatTimeframe(selectedGoal.yearsToGoal)} Projection</span>
              </div>

              <div className="mt-4">
                <GoalTrajectoryChart data={selectedAnalysis.trajectory} goalName={selectedGoal.name} />
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#DBEAFE] pt-3 text-xs text-[#4B6080]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1 w-5 rounded bg-[#DC2626]" />
                  <span>Current Path</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-5 border-t-2 border-dashed border-[#15803D]" />
                  <span>Required Path (Target Target)</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1 w-5 rounded bg-[#1B3A6B]" />
                  <span>Final Milestone Target</span>
                </span>
              </div>
            </div>

            {/* Strategy Comparison Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="card bg-white p-4 rounded-xl border border-[#DBEAFE]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Current Strategy</div>
                <div className="mt-1.5 text-base font-bold text-[#1B3A6B]">
                  {formatCurrency(selectedGoal.monthlySIP)} / month
                </div>
                <p className="mt-1 text-xs text-[#4B6080]">
                  Projected Corpus: <strong className="text-[#111827]">{formatCurrency(selectedAnalysis.projectedCorpus)}</strong>
                </p>
              </div>
              <div className="card bg-white p-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#14532D]">Required Strategy</div>
                <div className="mt-1.5 text-base font-bold text-[#14532D]">
                  {formatCurrency(selectedAnalysis.requiredMonthlySIP)} / month
                </div>
                <p className="mt-1 text-xs text-[#14532D]">
                  Additional SIP Needed: <strong>{formatCurrency(selectedAnalysis.additionalSIP || 0)}</strong>
                </p>
              </div>
            </div>

            {/* Assumptions Disclosure */}
            <Disclosure
              title="Projection Assumptions & Model Parameters"
              className="rounded-xl border border-[#DBEAFE] bg-white shadow-sm"
            >
              <div className="space-y-2 text-xs leading-relaxed text-[#4B6080]">
                <p>Expected Portfolio Return: <strong className="text-[#111827]">{selectedAnalysis.expectedReturn}% p.a.</strong></p>
                <p>Allocated Asset Class: <strong className="text-[#111827]">{selectedGoal.assetClass}</strong></p>
                <p>Compounding Frequency: <strong className="text-[#111827]">Monthly SIP contributions</strong></p>
                <p className="border-t border-[#DBEAFE] pt-2 text-[11px] italic text-[#6B7280]">
                  Projections are calculated based on constant compound interest over the investment horizon in accordance with SEBI RIA planning standards.
                </p>
              </div>
            </Disclosure>
          </div>
        )}
      </section>
    </div>
  );
};

export default Goals;
