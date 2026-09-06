import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  RotateCcw,
  Play
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';

const Simulator = () => {
  const [loading, setLoading] = useState(false);
  const [baseScenario, setBaseScenario] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [presets, setPresets] = useState({});
  
  // Simulation inputs
  const [modifications, setModifications] = useState({
    monthlyInvestment: 0,
    portfolio: null,
    emergencyFundIncrease: 0,
    debtReduction: 0,
    insuranceIncrease: 0,
    taxSavingInvestments: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [healthRes, auditRes, goalsRes, presetsRes] = await Promise.all([
        api.getHealthScore(),
        api.getAudit(),
        api.getGoals(),
        api.getPresets()
      ]);

      setBaseScenario({
        healthScore: healthRes.data,
        audit: auditRes.data,
        goals: goalsRes.data,
        metrics: {
          monthlySurplus: 140000,
          monthlyEMIs: 26500,
          availableForInvestment: 113500,
          savingsRate: 56
        }
      });

      setPresets(presetsRes.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    try {
      setLoading(true);
      
      // Filter out empty modifications
      const cleanModifications = {};
      if (modifications.monthlyInvestment > 0) {
        cleanModifications.monthlyInvestment = modifications.monthlyInvestment;
      }
      if (modifications.portfolio) {
        cleanModifications.portfolio = modifications.portfolio;
      }
      if (modifications.emergencyFundIncrease > 0) {
        cleanModifications.emergencyFundIncrease = modifications.emergencyFundIncrease;
      }
      if (modifications.debtReduction > 0) {
        cleanModifications.debtReduction = modifications.debtReduction;
      }
      if (modifications.insuranceIncrease > 0) {
        cleanModifications.insuranceIncrease = modifications.insuranceIncrease;
      }
      if (modifications.taxSavingInvestments > 0) {
        cleanModifications.taxSavingInvestments = modifications.taxSavingInvestments;
      }

      const response = await api.runSimulation(cleanModifications);
      setSimulation(response.data);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPresetScenario = async (presetName) => {
    try {
      setLoading(true);
      const response = await api.runPreset(presetName);
      setSimulation(response.data);
      
      // Update input controls to reflect preset
      const preset = presets[presetName];
      if (preset && preset.modifications) {
        setModifications({
          monthlyInvestment: preset.modifications.monthlyInvestment || 0,
          portfolio: preset.modifications.portfolio || null,
          emergencyFundIncrease: preset.modifications.emergencyFundIncrease || 0,
          debtReduction: preset.modifications.debtReduction || 0,
          insuranceIncrease: preset.modifications.insuranceIncrease || 0,
          taxSavingInvestments: preset.modifications.taxSavingInvestments || 0
        });
      }
    } catch (error) {
      console.error('Failed to run preset:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setSimulation(null);
    setModifications({
      monthlyInvestment: 0,
      portfolio: null,
      emergencyFundIncrease: 0,
      debtReduction: 0,
      insuranceIncrease: 0,
      taxSavingInvestments: 0
    });
  };

  const ComparisonCard = ({ label, before, after, isCurrency = true, higherIsBetter = true }) => {
    const delta = after - before;
    const isPositive = higherIsBetter ? delta > 0 : delta < 0;
    const displayDelta = Math.abs(delta);

    return (
      <div className="card">
        <div className="text-sm text-gray-600 mb-2">{label}</div>
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500">Before</div>
            <div className="text-xl font-bold text-gray-900">
              {isCurrency ? formatCurrency(before) : before}
            </div>
          </div>
          
          <ArrowRight className="text-gray-400" size={20} />
          
          <div>
            <div className="text-xs text-gray-500">After</div>
            <div className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isCurrency ? formatCurrency(after) : after}
            </div>
          </div>
        </div>
        
        {delta !== 0 && (
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>
              {isPositive ? '+' : '-'}
              {isCurrency ? formatCurrency(displayDelta) : displayDelta}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading && !baseScenario) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">What-If Financial Simulator</h1>
        <p className="text-gray-600 mt-2">
          Explore how financial decisions change future outcomes in real-time
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="card">
        <h2 className="card-header">Quick Scenarios</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => runPresetScenario(key)}
              disabled={loading}
              className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{preset.name}</h3>
              <p className="text-sm text-gray-600">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Simulation Inputs */}
      <div className="card">
        <h2 className="card-header">Custom Simulation</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Investment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Increase Monthly Investment
            </label>
            <input
              type="number"
              value={modifications.monthlyInvestment}
              onChange={(e) => setModifications({...modifications, monthlyInvestment: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="₹0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Additional amount to invest monthly across goals</p>
          </div>

          {/* Emergency Fund */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add to Emergency Fund
            </label>
            <input
              type="number"
              value={modifications.emergencyFundIncrease}
              onChange={(e) => setModifications({...modifications, emergencyFundIncrease: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="₹0"
              step="10000"
            />
            <p className="text-xs text-gray-500 mt-1">One-time addition to build emergency reserves</p>
          </div>

          {/* Debt Reduction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reduce Outstanding Debt
            </label>
            <input
              type="number"
              value={modifications.debtReduction}
              onChange={(e) => setModifications({...modifications, debtReduction: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="₹0"
              step="50000"
            />
            <p className="text-xs text-gray-500 mt-1">One-time payment to reduce debt burden</p>
          </div>

          {/* Insurance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Increase Life Insurance
            </label>
            <input
              type="number"
              value={modifications.insuranceIncrease}
              onChange={(e) => setModifications({...modifications, insuranceIncrease: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="₹0"
              step="100000"
            />
            <p className="text-xs text-gray-500 mt-1">Additional life insurance coverage</p>
          </div>

          {/* Portfolio Rebalance */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rebalance Portfolio
            </label>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-600">Equity %</label>
                <input
                  type="number"
                  value={modifications.portfolio?.equity || ''}
                  onChange={(e) => setModifications({
                    ...modifications, 
                    portfolio: {...(modifications.portfolio || {}), equity: parseInt(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="72"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Debt %</label>
                <input
                  type="number"
                  value={modifications.portfolio?.debt || ''}
                  onChange={(e) => setModifications({
                    ...modifications, 
                    portfolio: {...(modifications.portfolio || {}), debt: parseInt(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="15"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Gold %</label>
                <input
                  type="number"
                  value={modifications.portfolio?.gold || ''}
                  onChange={(e) => setModifications({
                    ...modifications, 
                    portfolio: {...(modifications.portfolio || {}), gold: parseInt(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="8"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Cash %</label>
                <input
                  type="number"
                  value={modifications.portfolio?.cash || ''}
                  onChange={(e) => setModifications({
                    ...modifications, 
                    portfolio: {...(modifications.portfolio || {}), cash: parseInt(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="5"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Adjust asset allocation (total should equal 100%)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            Run Simulation
          </button>
          <button
            onClick={resetSimulation}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      {simulation && (
        <>
          {/* Impact Summary */}
          <div className={`card ${
            simulation.comparison.overallImpact.overall === 'positive' 
              ? 'bg-green-50 border-2 border-green-200' 
              : simulation.comparison.overallImpact.overall === 'negative'
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className={
                simulation.comparison.overallImpact.overall === 'positive' 
                  ? 'text-green-600' 
                  : 'text-gray-600'
              } size={24} />
              <h2 className="text-xl font-bold text-gray-900">Simulation Impact</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Overall Impact: <span className="font-semibold capitalize">
                {simulation.comparison.overallImpact.overall}
              </span>
              {' '}({simulation.comparison.overallImpact.positiveCount} improvements, {simulation.comparison.overallImpact.negativeCount} tradeoffs)
            </p>

            {simulation.comparison.overallImpact.significantImpacts.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-900">Key Changes:</h3>
                {simulation.comparison.overallImpact.significantImpacts.map((impact, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className={impact.impact === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {impact.impact === 'positive' ? '✓' : '⚠'}
                    </span>
                    <span className="text-gray-700">
                      {impact.message || `${impact.metric}: ${impact.delta > 0 ? '+' : ''}${impact.delta.toFixed(0)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Before/After Comparison */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Before vs After</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <ComparisonCard
                label="Financial Health Score"
                before={simulation.comparison.healthScore.before}
                after={simulation.comparison.healthScore.after}
                isCurrency={false}
              />
              
              <ComparisonCard
                label="Goal Readiness"
                before={simulation.comparison.goalReadiness.before}
                after={simulation.comparison.goalReadiness.after}
                isCurrency={false}
              />
              
              <ComparisonCard
                label="Total Goal Gap"
                before={simulation.comparison.totalGoalGap.before}
                after={simulation.comparison.totalGoalGap.after}
                higherIsBetter={false}
              />
              
              <ComparisonCard
                label="Critical Findings"
                before={simulation.comparison.criticalFindings.before}
                after={simulation.comparison.criticalFindings.after}
                isCurrency={false}
                higherIsBetter={false}
              />
              
              <ComparisonCard
                label="Monthly Surplus"
                before={simulation.comparison.monthlySurplus.before}
                after={simulation.comparison.monthlySurplus.after}
              />
            </div>
          </div>

          {/* Dimension Changes */}
          <div className="card">
            <h2 className="card-header">Dimension-Level Changes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(simulation.comparison.dimensions).map(([dimension, data]) => {
                const delta = data.delta;
                if (delta === 0) return null;
                
                return (
                  <div key={dimension} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {dimension.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{data.before}</span>
                      <ArrowRight size={14} className="text-gray-400" />
                      <span className={`text-sm font-semibold ${
                        delta > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.after}
                      </span>
                      <span className={`text-xs font-medium ${
                        delta > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({delta > 0 ? '+' : ''}{delta})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Impact */}
          {simulation.simulated.goals && (
            <div className="card">
              <h2 className="card-header">Goal Impact</h2>
              <div className="space-y-3">
                {simulation.simulated.goals.goals.map((goal, idx) => {
                  const baseGoal = simulation.base.goals.goals[idx];
                  const fundingChange = goal.analysis.fundingPercentage - baseGoal.analysis.fundingPercentage;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">{goal.name}</div>
                        <div className="text-xs text-gray-600">
                          Gap: {formatCurrency(baseGoal.analysis.gap)} → {formatCurrency(goal.analysis.gap)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{baseGoal.analysis.fundingPercentage}%</span>
                          <ArrowRight size={14} className="text-gray-400" />
                          <span className={`text-sm font-semibold ${
                            fundingChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {goal.analysis.fundingPercentage}%
                          </span>
                        </div>
                        {fundingChange !== 0 && (
                          <div className={`text-xs font-medium ${
                            fundingChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {fundingChange > 0 ? '+' : ''}{fundingChange.toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Assumptions */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Simulation Assumptions</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-700">
          <div>
            <div className="font-medium mb-1">Projection Method</div>
            <div className="text-gray-600">Deterministic calculation based on current profile</div>
          </div>
          <div>
            <div className="font-medium mb-1">Returns</div>
            <div className="text-gray-600">Historical averages by asset class</div>
          </div>
          <div>
            <div className="font-medium mb-1">Time Horizon</div>
            <div className="text-gray-600">Based on existing goal timelines</div>
          </div>
          <div>
            <div className="font-medium mb-1">Variables</div>
            <div className="text-gray-600">Controllable inputs only</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Simulations are for illustration only. Actual results may vary based on market conditions, timing, and execution.
        </p>
      </div>
    </div>
  );
};

export default Simulator;
