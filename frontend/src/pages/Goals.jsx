import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import api from '../services/api';
import GoalTrajectoryChart from '../charts/GoalTrajectoryChart';
import { formatCurrency, formatPercent, getGoalStatusColor, formatTimeframe } from '../utils/formatters';

const Goals = () => {
  const [loading, setLoading] = useState(true);
  const [goalsData, setGoalsData] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    loadGoalsData();
  }, []);

  const loadGoalsData = async () => {
    try {
      setLoading(true);
      const response = await api.getGoals();
      setGoalsData(response.data);
      if (response.data.goals.length > 0) {
        setSelectedGoal(response.data.goals[0]);
      }
    } catch (error) {
      console.error('Failed to load goals data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Goal Analyzer</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive analysis of financial goals with projection trajectories
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Goals</div>
          <div className="text-3xl font-bold text-gray-900">{goalsData.summary.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">On Track</div>
          <div className="text-3xl font-bold text-green-600">{goalsData.summary.onTrack}</div>
          <div className="text-xs text-gray-500 mt-1">≥90% funded</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">At Risk</div>
          <div className="text-3xl font-bold text-red-600">{goalsData.summary.atRisk}</div>
          <div className="text-xs text-gray-500 mt-1">&lt;70% funded</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Avg Funding</div>
          <div className="text-3xl font-bold text-gray-900">{goalsData.summary.avgFunding}%</div>
          <div className="text-xs text-gray-500 mt-1">Average readiness</div>
        </div>
      </div>

      {/* Goal Selector */}
      <div className="card">
        <h2 className="card-header">Select Goal to Analyze</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {goalsData.goals.map((goal, idx) => {
            const isSelected = selectedGoal && selectedGoal.name === goal.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedGoal(goal)}
                className={`
                  text-left p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getGoalStatusColor(goal.analysis.status)}`}>
                    {goal.analysis.fundingPercentage}%
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{formatCurrency(goal.targetAmount)}</span>
                  <span>•</span>
                  <span>{formatTimeframe(goal.yearsToGoal)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Goal Analysis */}
      {selectedGoal && (
        <>
          {/* Goal Overview */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGoal.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${getGoalStatusColor(selectedGoal.analysis.status)}`}>
                    {selectedGoal.analysis.statusMessage}
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm capitalize">
                    {selectedGoal.priority} Priority
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-600">
                  {selectedGoal.analysis.fundingPercentage}%
                </div>
                <div className="text-sm text-gray-600">Funded</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Target Amount</div>
                <div className="font-semibold text-gray-900">{formatCurrency(selectedGoal.targetAmount)}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Inflation Adjusted</div>
                <div className="font-semibold text-gray-900">{formatCurrency(selectedGoal.analysis.inflationAdjustedTarget)}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Time Remaining</div>
                <div className="font-semibold text-gray-900">{formatTimeframe(selectedGoal.yearsToGoal)}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Expected Return</div>
                <div className="font-semibold text-gray-900">{selectedGoal.analysis.expectedReturn}%</div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Trajectory */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Current Strategy</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Corpus</span>
                  <span className="font-semibold">{formatCurrency(selectedGoal.currentCorpus)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly SIP</span>
                  <span className="font-semibold">{formatCurrency(selectedGoal.monthlySIP)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Projected Corpus</span>
                  <span className="font-semibold text-red-600">{formatCurrency(selectedGoal.analysis.projectedCorpus)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Funding Gap</span>
                    <span className="font-bold text-red-600">
                      {selectedGoal.analysis.gap > 0 ? formatCurrency(selectedGoal.analysis.gap) : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Strategy */}
            <div className="card bg-green-50 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4">Required to Meet Goal</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Required Corpus</span>
                  <span className="font-semibold">{formatCurrency(selectedGoal.analysis.inflationAdjustedTarget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Required Monthly SIP</span>
                  <span className="font-semibold text-green-700">{formatCurrency(selectedGoal.analysis.requiredMonthlySIP)}</span>
                </div>
                {selectedGoal.analysis.additionalSIP > 0 && (
                  <div className="flex justify-between items-center pt-3 border-t border-green-200">
                    <span className="text-gray-900 font-medium">Additional SIP Needed</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(selectedGoal.analysis.additionalSIP)}
                    </span>
                  </div>
                )}
              </div>

              {selectedGoal.analysis.gap > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-green-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      Increase monthly SIP by {formatCurrency(selectedGoal.analysis.additionalSIP)} to fully fund this goal
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trajectory Chart */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Projection Trajectory: Current vs Required
            </h3>
            <GoalTrajectoryChart 
              data={selectedGoal.analysis.trajectory}
              goalName={selectedGoal.name}
            />
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Understanding the Chart</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-0.5 bg-red-500"></div>
                    <span className="font-medium text-gray-900">Current Trajectory</span>
                  </div>
                  <p className="text-gray-600">
                    Where you'll end up with current {formatCurrency(selectedGoal.monthlySIP)}/month SIP
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-0.5 bg-green-500 border-dashed border-2 border-green-500"></div>
                    <span className="font-medium text-gray-900">Required Trajectory</span>
                  </div>
                  <p className="text-gray-600">
                    Path needed to reach your inflation-adjusted goal
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-1 bg-blue-500 rounded"></div>
                    <span className="font-medium text-gray-900">Target Amount</span>
                  </div>
                  <p className="text-gray-600">
                    Final goal amount after {formatTimeframe(selectedGoal.yearsToGoal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Projection Assumptions</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Inflation Rate</div>
                <div className="font-semibold text-gray-900">6%</div>
              </div>
              <div>
                <div className="text-gray-600">Expected Return</div>
                <div className="font-semibold text-gray-900">{selectedGoal.analysis.expectedReturn}%</div>
              </div>
              <div>
                <div className="text-gray-600">Asset Class</div>
                <div className="font-semibold text-gray-900 capitalize">{selectedGoal.assetClass}</div>
              </div>
              <div>
                <div className="text-gray-600">Contribution Frequency</div>
                <div className="font-semibold text-gray-900">Monthly</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              These projections are estimates based on historical averages. Actual returns may vary. Review and adjust annually.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Goals;
