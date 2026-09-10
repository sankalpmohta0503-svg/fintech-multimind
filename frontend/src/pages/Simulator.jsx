import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  Landmark,
  Layers,
  Lightbulb,
  Play,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';
import Dialog from '../components/Dialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import Skeleton from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent, getHealthScoreStatus } from '../utils/formatters';

const initialModifications = {
  monthlyInvestment: 0,
  emergencyFundIncrease: 0,
  debtReduction: 0,
  insuranceIncrease: 0,
  taxSavingInvestments: 0,
  retirementAge: 60,
  portfolio: {
    equity: 50,
    debt: 35,
    gold: 10,
    cash: 5,
  },
};

const dimensionLabels = {
  cashFlow: 'Cash Flow & Savings',
  liquidity: 'Liquidity Coverage',
  goalReadiness: 'Retirement & Goals',
  riskAlignment: 'Asset Allocation',
  diversification: 'Diversification',
  debtHealth: 'Debt Management',
  protection: 'Insurance & Protection',
  taxEfficiency: 'Tax Efficiency',
};

const Simulator = () => {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  const [baseScenario, setBaseScenario] = useState(null);
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [presets, setPresets] = useState({});
  const [activePreset, setActivePreset] = useState(null);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);

  // Form State
  const [modifications, setModifications] = useState(initialModifications);

  // Load Baseline Data & Available Presets
  const loadBaseline = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const [healthRes, auditRes, goalsRes, clientRes, presetsRes] = await Promise.allSettled([
        api.getHealthScore(),
        api.getAudit(),
        api.getGoals(),
        api.getClient(),
        api.getPresets(),
      ]);

      if (healthRes.status === 'fulfilled' && auditRes.status === 'fulfilled' && goalsRes.status === 'fulfilled') {
        const clientData = clientRes.status === 'fulfilled' ? clientRes.value.data : {};
        const monthlyIncome = clientData.monthlyIncome || 250000;
        const monthlyExpenses = clientData.monthlyExpenses || 110000;
        const monthlySurplus = monthlyIncome - monthlyExpenses;
        const liabilities = clientData.liabilities || {};
        const monthlyEMIs = Object.values(liabilities).reduce((sum, l) => sum + (l.emi || 0), 0);
        const age = clientData.personalInfo?.age || 38;

        const base = {
          healthScore: healthRes.value.data,
          audit: auditRes.value.data,
          goals: goalsRes.value.data,
          client: clientData,
          metrics: {
            monthlyIncome,
            monthlyExpenses,
            monthlySurplus,
            monthlyEMIs,
            availableForInvestment: monthlySurplus - monthlyEMIs,
            savingsRate: (monthlySurplus / monthlyIncome) * 100,
          },
        };

        setBaseScenario(base);

        // Initial default portfolio from client
        if (clientData.portfolio) {
          setModifications((prev) => ({
            ...prev,
            portfolio: {
              equity: clientData.portfolio.equity || 50,
              debt: clientData.portfolio.debt || 35,
              gold: clientData.portfolio.gold || 10,
              cash: clientData.portfolio.cash || 5,
            },
            retirementAge: age + 22,
          }));
        }
      } else {
        throw new Error('Could not load base financial diagnostic.');
      }

      if (presetsRes.status === 'fulfilled') {
        setPresets(presetsRes.value.data || {});
      }
    } catch (err) {
      console.error('Failed to load baseline simulator data:', err);
      setError('Failed to initialize simulation workspace. Please retry.');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBaseline();
  }, [loadBaseline]);

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setActivePreset(null);
    setModifications((prev) => ({
      ...prev,
      [field]: typeof value === 'number' ? Math.max(0, value) : value,
    }));
  };

  const handlePortfolioChange = (asset, value) => {
    setActivePreset(null);
    const num = Math.max(0, Math.min(100, Number(value) || 0));
    setModifications((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        [asset]: num,
      },
    }));
  };

  // Run Custom Simulation
  const executeSimulation = async () => {
    setSimulating(true);
    setError(null);
    try {
      const payload = {
        monthlyInvestment: Number(modifications.monthlyInvestment) || 0,
        emergencyFundIncrease: Number(modifications.emergencyFundIncrease) || 0,
        debtReduction: Number(modifications.debtReduction) || 0,
        insuranceIncrease: Number(modifications.insuranceIncrease) || 0,
        taxSavingInvestments: Number(modifications.taxSavingInvestments) || 0,
        retirementAge: Number(modifications.retirementAge) || 60,
        portfolio: modifications.portfolio,
      };

      const response = await api.runSimulation(payload);
      setSimulatedResult(response.data);
    } catch (err) {
      console.error('Simulation execution failed:', err);
      setError('Simulation failed to run. Please check your inputs and retry.');
    } finally {
      setSimulating(false);
    }
  };

  // Run Preset Scenario
  const selectPreset = async (presetKey) => {
    setActivePreset(presetKey);
    setSimulating(true);
    setError(null);
    try {
      const response = await api.runPreset(presetKey);
      setSimulatedResult(response.data);

      const presetData = presets[presetKey];
      if (presetData?.modifications) {
        setModifications((prev) => ({
          ...prev,
          monthlyInvestment: presetData.modifications.monthlyInvestment || 0,
          emergencyFundIncrease: presetData.modifications.emergencyFundIncrease || 0,
          debtReduction: presetData.modifications.debtReduction || 0,
          insuranceIncrease: presetData.modifications.insuranceIncrease || 0,
          taxSavingInvestments: presetData.modifications.taxSavingInvestments || 0,
          retirementAge: presetData.modifications.retirementAge || prev.retirementAge,
          portfolio: presetData.modifications.portfolio || prev.portfolio,
        }));
      }
    } catch (err) {
      console.error(`Failed to run preset ${presetKey}:`, err);
      setError(`Failed to apply preset "${presets[presetKey]?.name || presetKey}".`);
    } finally {
      setSimulating(false);
    }
  };

  // Reset to Baseline
  const resetToBaseline = () => {
    setActivePreset(null);
    setSimulatedResult(null);
    if (baseScenario?.client?.portfolio) {
      const p = baseScenario.client.portfolio;
      const age = baseScenario.client.personalInfo?.age || 38;
      setModifications({
        monthlyInvestment: 0,
        emergencyFundIncrease: 0,
        debtReduction: 0,
        insuranceIncrease: 0,
        taxSavingInvestments: 0,
        retirementAge: age + 22,
        portfolio: {
          equity: p.equity || 50,
          debt: p.debt || 35,
          gold: p.gold || 10,
          cash: p.cash || 5,
        },
      });
    } else {
      setModifications(initialModifications);
    }
  };

  // Asset allocation total validation
  const totalAllocation = useMemo(() => {
    if (!modifications.portfolio) return 100;
    const { equity = 0, debt = 0, gold = 0, cash = 0 } = modifications.portfolio;
    return equity + debt + gold + cash;
  }, [modifications.portfolio]);

  const isAllocationValid = totalAllocation === 100;

  // Key Result Values & Deltas
  const comparison = simulatedResult?.comparison;
  const simulatedScenario = simulatedResult?.simulated;

  // Primary Goal Trajectory Comparison
  const trajectoryChartData = useMemo(() => {
    const baseGoals = baseScenario?.goals?.goals;
    const simGoals = simulatedScenario?.goals?.goals;

    if (!baseGoals || baseGoals.length === 0) return [];

    // Find primary goal (e.g. Retirement or first goal)
    const baseGoal = baseGoals.find((g) => g.name.toLowerCase().includes('retirement')) || baseGoals[0];
    const simGoal = simGoals?.find((g) => g.name.toLowerCase().includes('retirement')) || simGoals?.[0];

    const baseTraj = baseGoal?.analysis?.trajectory || [];
    const simTraj = simGoal?.analysis?.trajectory || [];

    const maxLen = Math.max(baseTraj.length, simTraj.length);
    const combined = [];

    for (let i = 0; i < maxLen; i++) {
      const b = baseTraj[i];
      const s = simTraj[i];
      const year = b?.year || s?.year || i + 1;
      combined.push({
        year: `Yr ${year}`,
        baseline: b ? b.current : null,
        simulated: s ? s.current : null,
        target: b?.target || s?.target || null,
      });
    }

    return combined;
  }, [baseScenario, simulatedScenario]);

  // Dimension Matrix Delta Data
  const dimensionMatrix = useMemo(() => {
    const baseDims = baseScenario?.healthScore?.dimensions || {};
    const simDims = simulatedScenario?.healthScore?.dimensions || {};
    const compDims = comparison?.dimensions || {};

    return Object.keys(dimensionLabels).map((key) => {
      const label = dimensionLabels[key];
      const baseScore = baseDims[key]?.score ?? 0;
      const simScore = simDims[key]?.score ?? baseScore;
      const delta = compDims[key]?.delta ?? (simScore - baseScore);
      return {
        key,
        label,
        baseScore,
        simScore,
        delta,
      };
    });
  }, [baseScenario, simulatedScenario, comparison]);

  // Cash Flow Residual Calculation
  const cashFlowMetrics = useMemo(() => {
    const baseSurplus = baseScenario?.metrics?.monthlySurplus || 0;
    const addedSIP = Number(modifications.monthlyInvestment) || 0;
    const monthlyInsuranceCost = modifications.insuranceIncrease > 0 ? Math.round(modifications.insuranceIncrease * 0.00015) : 0;
    const emiFreed = modifications.debtReduction > 0 ? Math.round((modifications.debtReduction / 1800000) * 26500) : 0;
    const netResidual = baseSurplus + emiFreed - addedSIP - monthlyInsuranceCost;

    return {
      baseSurplus,
      addedSIP,
      monthlyInsuranceCost,
      emiFreed,
      netResidual,
    };
  }, [baseScenario, modifications]);

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error && !baseScenario) {
    return (
      <ErrorState
        title="Simulation Workspace Unavailable"
        message={error}
        onRetry={loadBaseline}
      />
    );
  }

  const baseScore = baseScenario?.healthScore?.overallScore || 64;
  const simScore = simulatedScenario?.healthScore?.overallScore || baseScore;
  const scoreDelta = simScore - baseScore;
  const baseCriticalCount = baseScenario?.audit?.categorized?.critical?.length || 0;
  const simCriticalCount = simulatedScenario?.audit?.categorized?.critical?.length ?? baseCriticalCount;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & OPERATIONAL CONTROLS */}
      <section className="card bg-white p-5 border border-[#BFDBFE]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1F3555] text-xs font-semibold tracking-wide uppercase mb-2">
              <Sparkles size={14} className="text-[#14532D]" />
              <span>Simulation Engine • Deterministic Scenario Testing</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1B3A6B]">
              What-If Scenario Simulator
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#2D4A6B]">
              Simulate parameter adjustments across systematic investments, pure risk protection, debt prepayment, and multi-asset rebalancing against audited baseline metrics in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetToBaseline}
              className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset to Baseline</span>
            </button>
            <button
              type="button"
              onClick={executeSimulation}
              disabled={simulating || !isAllocationValid}
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              {simulating ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Run Simulation</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRESET REMEDIATION MODELS */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4B6080]">
            Preset Remediation Models
          </span>
          <span className="text-xs text-[#4B6080]">Select a model to auto-populate test parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(presets).map(([key, p]) => {
            const isSelected = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectPreset(key)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-slate-950 bg-[#0A1D3B] text-white shadow-sm'
                    : 'border-[#BFDBFE] bg-white hover:border-[#93C5FD] hover:bg-[#E2E8F0] text-[#111827]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-[#4B6080]'}`}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  {isSelected && <CheckCircle2 size={14} className="text-emerald-400" />}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold truncate" title={p.name}>{p.name}</h3>
                <p className={`text-xs mt-1 leading-snug line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-[#4B6080]'}`}>
                  {p.description}
                </p>
              </button>
            );
          })}

          {/* Custom Workspace Card */}
          <button
            type="button"
            onClick={() => setActivePreset(null)}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activePreset === null
                ? 'border-emerald-700 bg-[#F0FDF4]/50 ring-1 ring-emerald-700'
                : 'border-[#BFDBFE] bg-white hover:border-[#93C5FD] hover:bg-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14532D]">Custom Mode</span>
              {activePreset === null && <Sliders size={14} className="text-[#14532D]" />}
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">Advisor Bespoke</h3>
            <p className="text-xs mt-1 leading-snug text-[#2D4A6B]">
              Free-form parameter overrides with live delta checks.
            </p>
          </button>
        </div>
      </section>

      {/* 3. SCENARIO PARAMETERS & CAPITAL ADJUSTMENTS (4 Bento Cards) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#1F3555]" />
            <h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">Scenario Parameters & Capital Adjustments</h2>
          </div>
          {!isAllocationValid && (
            <span className="text-xs font-bold text-[#C2410C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
              Allocation sum must equal 100% (currently {totalAllocation}%)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category A: Systematic Investment & Retirement */}
          <div className="card p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">Category A</span>
                <Wallet size={16} className="text-[#4B6080]" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#1B3A6B] mt-2">Invest & Accumulate</h3>
              <p className="text-xs text-[#4B6080] mt-0.5">Retirement corpus & goal SIP adjustments</p>

              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1F3555] font-medium">Additional Monthly SIP</span>
                    <span className="font-bold text-[#1B3A6B] tabular-nums">
                      +{formatCurrency(modifications.monthlyInvestment)}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="2500"
                    value={modifications.monthlyInvestment}
                    onChange={(e) => handleInputChange('monthlyInvestment', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300 mt-0.5">
                    <span>₹0</span>
                    <span>₹50K</span>
                    <span>₹1.0L</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1F3555] font-medium">Target Retirement Age</span>
                    <span className="font-bold text-[#1B3A6B] tabular-nums">{modifications.retirementAge} yrs</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="70"
                    step="1"
                    value={modifications.retirementAge}
                    onChange={(e) => handleInputChange('retirementAge', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300 mt-0.5">
                    <span>50</span>
                    <span>60</span>
                    <span>70</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#E2E8F0] p-2.5 rounded border border-[#DBEAFE] text-xs text-[#2D4A6B]">
              Allocated across {baseScenario?.goals?.goals?.length || 4} active goal portfolios.
            </div>
          </div>

          {/* Category B: Protection & Solvency */}
          <div className="card p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">Category B</span>
                <Shield size={16} className="text-[#4B6080]" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#1B3A6B] mt-2">Protection & Solvency</h3>
              <p className="text-xs text-[#4B6080] mt-0.5">Pure term life cover & tax offsets</p>

              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1F3555] font-medium">Pure Life Insurance Addition</span>
                    <span className="font-bold text-[#1B3A6B] tabular-nums">
                      +{formatCurrency(modifications.insuranceIncrease)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25000000"
                    step="1000000"
                    value={modifications.insuranceIncrease}
                    onChange={(e) => handleInputChange('insuranceIncrease', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300 mt-0.5">
                    <span>₹0</span>
                    <span>₹1.0 Cr</span>
                    <span>₹2.5 Cr</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1F3555] font-medium">Tax-Saving Investments</span>
                    <span className="font-bold text-[#1B3A6B] tabular-nums">
                      {formatCurrency(modifications.taxSavingInvestments)}/yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150000"
                    step="10000"
                    value={modifications.taxSavingInvestments}
                    onChange={(e) => handleInputChange('taxSavingInvestments', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300 mt-0.5">
                    <span>₹0</span>
                    <span>₹75K</span>
                    <span>₹1.5L</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#E2E8F0] p-2.5 rounded border border-[#DBEAFE] text-xs text-[#2D4A6B]">
              Estimated pure term premium: ~{formatCurrency(modifications.insuranceIncrease > 0 ? modifications.insuranceIncrease * 0.00015 * 12 : 0)}/yr
            </div>
          </div>

          {/* Category C: Debt & Emergency Reserve */}
          <div className="card p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">Category C</span>
                <Landmark size={16} className="text-[#4B6080]" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#1B3A6B] mt-2">Debt & Emergency Fund</h3>
              <p className="text-xs text-[#4B6080] mt-0.5">Liability reduction & cash runway</p>

              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1F3555] font-medium">Lump-Sum Debt Prepayment</span>
                    <span className="font-bold text-[#1B3A6B] tabular-nums">
                      {formatCurrency(modifications.debtReduction)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1800000"
                    step="50000"
                    value={modifications.debtReduction}
                    onChange={(e) => handleInputChange('debtReduction', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300 mt-0.5">
                    <span>₹0</span>
                    <span>₹9.0L</span>
                    <span>₹18.0L</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#1F3555] font-medium">Emergency Fund Addition</span>
                    <span className="font-bold text-[#1B3A6B] tabular-nums">
                      +{formatCurrency(modifications.emergencyFundIncrease)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={modifications.emergencyFundIncrease}
                    onChange={(e) => handleInputChange('emergencyFundIncrease', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-blue-300 mt-0.5">
                    <span>₹0</span>
                    <span>₹5.0L</span>
                    <span>₹10.0L</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#E2E8F0] p-2.5 rounded border border-[#DBEAFE] text-xs text-[#2D4A6B]">
              Prepayment unleashes ~{formatCurrency(cashFlowMetrics.emiFreed)}/mo in cash flow capacity.
            </div>
          </div>

          {/* Category D: Asset Rebalancing */}
          <div className="card p-4 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">Category D</span>
                <span className={`text-xs font-bold ${isAllocationValid ? 'text-[#14532D]' : 'text-[#C2410C]'}`}>
                  {totalAllocation}%
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#1B3A6B] mt-2">Asset Rebalancing</h3>
              <p className="text-xs text-[#4B6080] mt-0.5">Target multi-asset allocation weights</p>

              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#1F3555]">Equity</span>
                    <span className="font-semibold tabular-nums">{modifications.portfolio?.equity || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={modifications.portfolio?.equity || 0}
                    onChange={(e) => handlePortfolioChange('equity', e.target.value)}
                    className="w-full accent-slate-900 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#1F3555]">Debt & Hybrid</span>
                    <span className="font-semibold tabular-nums">{modifications.portfolio?.debt || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={modifications.portfolio?.debt || 0}
                    onChange={(e) => handlePortfolioChange('debt', e.target.value)}
                    className="w-full accent-emerald-600 h-1.5 bg-[#DBEAFE] rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#1F3555]">Gold & Cash</span>
                    <span className="font-semibold tabular-nums">
                      {(modifications.portfolio?.gold || 0) + (modifications.portfolio?.cash || 0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={modifications.portfolio?.gold || 0}
                      onChange={(e) => handlePortfolioChange('gold', e.target.value)}
                      className="rounded border border-[#93C5FD] px-2 py-1 text-xs"
                      title="Gold %"
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={modifications.portfolio?.cash || 0}
                      onChange={(e) => handlePortfolioChange('cash', e.target.value)}
                      className="rounded border border-[#93C5FD] px-2 py-1 text-xs"
                      title="Cash %"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-2 rounded text-xs ${isAllocationValid ? 'bg-[#F0FDF4] text-[#14532D]' : 'bg-[#FFF7ED] text-[#9A3412]'}`}>
              {isAllocationValid ? '✓ Allocation constraints satisfied' : '⚠️ Adjust sliders to total 100%'}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SIMULATED FIDUCIARY IMPACT SUMMARY (Hero Banner) */}
      <section className="rounded-xl bg-[#0A1D3B] text-white p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              Simulated Fiduciary Impact Summary
            </h2>
          </div>
          <span className="text-xs text-blue-300">
            {simulatedResult ? 'Simulated Output Ready' : 'Baseline State (Run simulation to see projected uplift)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
          {/* Metric 1: Health Score */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-medium">
              Health Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-white tabular-nums">{simScore}</span>
              <span className="text-xs text-blue-300">/ 100</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {scoreDelta > 0 ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                  <TrendingUp size={13} /> +{scoreDelta} pts uplift
                </span>
              ) : scoreDelta < 0 ? (
                <span className="text-rose-400 font-semibold inline-flex items-center gap-0.5">
                  <TrendingDown size={13} /> {scoreDelta} pts
                </span>
              ) : (
                <span className="text-blue-300">Baseline level</span>
              )}
            </div>
          </div>

          {/* Metric 2: Solvency Deficit */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-medium">
              Protection Deficit
            </span>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {modifications.insuranceIncrease >= 18000000 ? '₹0.00' : formatCurrency(Math.max(0, 18000000 - modifications.insuranceIncrease))}
            </div>
            <div className="text-xs text-emerald-400 font-medium">
              {modifications.insuranceIncrease >= 18000000 ? '✓ 100% Hedged' : `+${formatCurrency(modifications.insuranceIncrease)} added`}
            </div>
          </div>

          {/* Metric 3: Goal Funding */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-medium">
              Avg Goal Funding
            </span>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {simulatedScenario ? `${Math.round(simulatedScenario.goals?.summary?.avgFunding || 0)}%` : `${Math.round(baseScenario?.goals?.summary?.avgFunding || 76)}%`}
            </div>
            <div className="text-xs text-emerald-400 font-medium">
              {comparison?.goalReadiness?.delta ? `+${Math.round(comparison.goalReadiness.delta)}% readiness uplift` : 'Target: 95%+'}
            </div>
          </div>

          {/* Metric 4: Critical Breaches */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-medium">
              Critical Breaches
            </span>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {simCriticalCount} Remaining
            </div>
            <div className="text-xs text-emerald-400 font-medium">
              {baseCriticalCount - simCriticalCount > 0 ? `✓ ${baseCriticalCount - simCriticalCount} resolved` : '3 Baseline breaches'}
            </div>
          </div>

          {/* Metric 5: Net Residual Surplus */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-medium">
              Residual Cushion
            </span>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {formatCurrency(cashFlowMetrics.netResidual)}/mo
            </div>
            <div className="text-xs text-blue-300">
              Monthly cash surplus
            </div>
          </div>
        </div>
      </section>

      {/* 5. VISUAL TRAJECTORY COMPARISON & ADVISOR TAKEAWAY */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Retirement Capital Trajectory Chart (7 cols) */}
        <div className="lg:col-span-7 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#BFDBFE] mb-4">
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">
                  Retirement Capital Trajectory Comparison
                </h2>
                <p className="text-xs text-[#4B6080]">
                  Baseline projection vs. simulated strategy path
                </p>
              </div>
              <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#1F3555]">
                Retirement Goal
              </span>
            </div>

            {/* Trajectory Recharts */}
            {trajectoryChartData.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => formatCurrency(val)}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), '']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Baseline Path"
                      stroke="#dc2626"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                    />
                    {simulatedResult && (
                      <Line
                        type="monotone"
                        dataKey="simulated"
                        name="Simulated Strategy Path"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target Requirement"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-xs text-[#4B6080]">
                Trajectory chart data will appear upon loading goal analyses.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DBEAFE] text-xs text-[#4B6080] flex items-center justify-between">
            <span>Actuarial life horizon calibrated with compound returns</span>
            <span className="font-medium text-[#14532D]">Deterministic Monte Carlo Baseline</span>
          </div>
        </div>

        {/* Right: Advisor Fiduciary Takeaway & Cash Flow Deployment (5 cols) */}
        <div className="lg:col-span-5 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#BFDBFE] mb-3">
              <ShieldCheck size={18} className="text-[#14532D]" />
              <h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">Advisor Fiduciary Takeaway</h2>
            </div>

            <div className="text-xs leading-relaxed text-[#1F3555] space-y-2 bg-[#E2E8F0] p-3.5 rounded border border-[#BFDBFE] mb-4">
              <p>
                <strong>Strategy Synthesis: </strong>
                {scoreDelta > 0
                  ? `Executing this simulation increases composite financial health by +${scoreDelta} points (${baseScore} → ${simScore}) and resolves critical solvency breaches.`
                  : 'Adjust parameters above and click "Run Simulation" to model optimal solvency and investment allocation.'}
              </p>
              {modifications.insuranceIncrease > 0 && (
                <p>
                  Pure term life addition of {formatCurrency(modifications.insuranceIncrease)} provides vital protection coverage for family dependents.
                </p>
              )}
            </div>

            {/* Monthly Surplus Deployment Waterfall */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#4B6080] text-[10px] block">
                Monthly Cash Flow Reconciliation
              </span>
              <div className="flex justify-between py-1 border-b border-[#DBEAFE]">
                <span className="text-[#2D4A6B]">Unallocated Base Surplus</span>
                <span className="font-medium text-[#111827] tabular-nums">
                  {formatCurrency(cashFlowMetrics.baseSurplus)}/mo
                </span>
              </div>
              {cashFlowMetrics.emiFreed > 0 && (
                <div className="flex justify-between py-1 border-b border-[#DBEAFE] text-[#14532D] font-medium">
                  <span>+ Freed Loan EMI Capacity</span>
                  <span className="tabular-nums">+{formatCurrency(cashFlowMetrics.emiFreed)}/mo</span>
                </div>
              )}
              {cashFlowMetrics.addedSIP > 0 && (
                <div className="flex justify-between py-1 border-b border-[#DBEAFE] text-[#1F3555]">
                  <span>- Additional Goal SIP</span>
                  <span className="tabular-nums">-{formatCurrency(cashFlowMetrics.addedSIP)}/mo</span>
                </div>
              )}
              {cashFlowMetrics.monthlyInsuranceCost > 0 && (
                <div className="flex justify-between py-1 border-b border-[#DBEAFE] text-[#1F3555]">
                  <span>- Term Life Premium</span>
                  <span className="tabular-nums">-{formatCurrency(cashFlowMetrics.monthlyInsuranceCost)}/mo</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 font-bold text-[#1B3A6B]">
                <span>Net Residual Surplus</span>
                <span className={`tabular-nums ${cashFlowMetrics.netResidual >= 0 ? 'text-[#14532D]' : 'text-[#C2410C]'}`}>
                  {formatCurrency(cashFlowMetrics.netResidual)}/mo
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DBEAFE] mt-4">
            <button
              type="button"
              onClick={() => navigate('/recommendations')}
              className="btn-primary w-full text-xs py-2 justify-center"
            >
              <span>Review Action Plan in Recommendations</span>
              <ArrowRight size={13} className="ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. AUDITED BASELINE VS. SIMULATED OUTCOME MATRIX (Detailed Table) */}
      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#BFDBFE] mb-4">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">
              Audited Baseline vs. Simulated Outcome Matrix
            </h2>
            <p className="text-xs text-[#4B6080]">
              Granular metric comparison across all 8 fiduciary health dimensions
            </p>
          </div>
          <span className="text-xs text-[#4B6080]">
            {simulatedResult ? 'Comparison Active' : 'Baseline Active'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#BFDBFE] bg-[#E2E8F0] text-[#4B6080] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 rounded-l">Planning Dimension</th>
                <th className="py-2.5 px-3">Audited Baseline</th>
                <th className="py-2.5 px-3">Simulated Outcome</th>
                <th className="py-2.5 px-3">Net Variance</th>
                <th className="py-2.5 px-3 text-right rounded-r">Fiduciary Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Overall Health Score Row */}
              <tr className="bg-[#E2E8F0]/50 font-semibold">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 text-[#1B3A6B] font-bold">
                    <Sparkles size={14} className="text-[#14532D]" />
                    <span>Overall Financial Health Score</span>
                  </div>
                </td>
                <td className="py-3 px-3 tabular-nums text-[#1B3A6B]">{baseScore} / 100</td>
                <td className="py-3 px-3 tabular-nums text-[#1B3A6B] font-bold">{simScore} / 100</td>
                <td className="py-3 px-3 tabular-nums">
                  {scoreDelta > 0 ? (
                    <span className="text-[#14532D] font-bold">+{scoreDelta} pts</span>
                  ) : scoreDelta < 0 ? (
                    <span className="text-[#C2410C] font-bold">{scoreDelta} pts</span>
                  ) : (
                    <span className="text-blue-300">0 pts</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  <StatusBadge status={simScore >= 70 ? 'healthy' : simScore >= 50 ? 'warning' : 'critical'} label={getHealthScoreStatus(simScore).label} />
                </td>
              </tr>

              {/* Dimension Rows */}
              {dimensionMatrix.map((dim) => {
                const status = dim.simScore >= 70 ? 'healthy' : dim.simScore >= 50 ? 'warning' : 'critical';
                return (
                  <tr key={dim.key} className="hover:bg-[#E2E8F0] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#1B3A6B]">
                      {dim.label}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-[#2D4A6B]">
                      {dim.baseScore} / 100
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-semibold text-[#111827]">
                      {dim.simScore} / 100
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">
                      {dim.delta > 0 ? (
                        <span className="text-[#14532D] font-semibold">+{dim.delta} pts</span>
                      ) : dim.delta < 0 ? (
                        <span className="text-[#C2410C] font-semibold">{dim.delta} pts</span>
                      ) : (
                        <span className="text-blue-300">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={status} label={status === 'healthy' ? 'Optimal' : status === 'warning' ? 'Moderate' : 'Vulnerable'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Simulator;
