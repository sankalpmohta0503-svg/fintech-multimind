import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Shield,
  CreditCard,
  Wallet
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import HealthScoreGauge from '../components/HealthScoreGauge';
import InsightCard from '../components/InsightCard';
import { formatCurrency, formatDimensionName } from '../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    healthScore: null,
    summary: null,
    audit: null,
    goals: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [healthRes, summaryRes, auditRes, goalsRes] = await Promise.all([
        api.getHealthScore(),
        api.getFinancialSummary(),
        api.getAudit(),
        api.getGoals()
      ]);

      setData({
        healthScore: healthRes.data,
        summary: summaryRes.data,
        audit: auditRes.data,
        goals: goalsRes.data
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial intelligence...</p>
        </div>
      </div>
    );
  }

  const { healthScore, summary, audit, goals } = data;

  // Get top critical insights
  const topInsights = [
    ...audit.categorized.critical.map(f => ({ ...f, severity: 'critical' })),
    ...audit.categorized.warning.slice(0, 2).map(f => ({ ...f, severity: 'warning' })),
    ...audit.categorized.opportunity.slice(0, 2).map(f => ({ ...f, severity: 'opportunity' }))
  ].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive financial health analysis for {summary.personalInfo.name}
        </p>
      </div>

      {/* Health Score Section */}
      <div className="card bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Financial Health Score</h2>
            <p className="text-gray-600 mb-4">
              Overall financial wellness across 8 key dimensions
            </p>
            
            {/* Dimension scores */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(healthScore.dimensions).map(([key, dim]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">
                      {formatDimensionName(key)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            dim.score >= 80 ? 'bg-green-500' :
                            dim.score >= 70 ? 'bg-blue-500' :
                            dim.score >= 60 ? 'bg-yellow-500' :
                            dim.score >= 50 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8">
                        {dim.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Score Gauge */}
          <div className="ml-8">
            <HealthScoreGauge score={healthScore.overallScore} />
          </div>
        </div>
      </div>

      {/* Critical Insights */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-header mb-0">Critical Insights</h2>
          <button 
            onClick={() => navigate('/audit')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View Full Audit →
          </button>
        </div>
        
        <div className="grid gap-3">
          {topInsights.map((insight, idx) => (
            <InsightCard
              key={idx}
              severity={insight.severity}
              title={insight.title}
              description={insight.description}
              onClick={() => navigate('/audit')}
            />
          ))}
        </div>

        {/* Summary counts */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <span className="font-semibold text-red-600">{audit.categorized.critical.length}</span>
            <span className="text-gray-600 ml-1">Critical</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-amber-600">{audit.categorized.warning.length}</span>
            <span className="text-gray-600 ml-1">Warnings</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-yellow-600">{audit.categorized.opportunity.length}</span>
            <span className="text-gray-600 ml-1">Opportunities</span>
          </div>
        </div>
      </div>

      {/* Financial Snapshot */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Net Worth"
            value={formatCurrency(summary.netWorth)}
            icon={DollarSign}
          />
          <StatCard
            label="Monthly Income"
            value={formatCurrency(summary.monthlyIncome)}
            sublabel="After tax"
            icon={TrendingUp}
          />
          <StatCard
            label="Monthly Surplus"
            value={formatCurrency(summary.monthlySurplus)}
            sublabel={`${((summary.monthlySurplus / summary.monthlyIncome) * 100).toFixed(0)}% savings rate`}
            icon={Wallet}
          />
          <StatCard
            label="Total Investments"
            value={formatCurrency(summary.totalInvestments)}
            icon={TrendingUp}
          />
          <StatCard
            label="Total Debt"
            value={formatCurrency(summary.totalDebt)}
            sublabel={`₹${(summary.monthlyEMIs / 1000).toFixed(0)}K monthly EMI`}
            icon={CreditCard}
          />
          <StatCard
            label="Insurance Coverage"
            value={formatCurrency(summary.insuranceCoverage)}
            icon={Shield}
          />
          <StatCard
            label="Active Goals"
            value={summary.goalCount}
            sublabel={`${goals.summary.onTrack} on track`}
            icon={Target}
          />
          <StatCard
            label="Monthly Expenses"
            value={formatCurrency(summary.monthlyExpenses)}
            sublabel={`${((summary.monthlyExpenses / summary.monthlyIncome) * 100).toFixed(0)}% of income`}
            icon={TrendingDown}
          />
        </div>
      </div>

      {/* Goal Health */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-header mb-0">Goal Health</h2>
          <button 
            onClick={() => navigate('/goals')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Goals →
          </button>
        </div>

        <div className="space-y-4">
          {goals.goals.map((goal, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                    <span className={`
                      px-2 py-0.5 text-xs rounded-full font-medium
                      ${goal.analysis.status === 'on-track' ? 'bg-green-100 text-green-700' :
                        goal.analysis.status === 'attention' ? 'bg-yellow-100 text-yellow-700' :
                        goal.analysis.status === 'at-risk' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }
                    `}>
                      {goal.analysis.statusMessage}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Target: {formatCurrency(goal.targetAmount)}</span>
                    <span>•</span>
                    <span>{goal.yearsToGoal} years</span>
                    <span>•</span>
                    <span className="capitalize">{goal.priority} priority</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {goal.analysis.fundingPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">funded</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Current: {formatCurrency(goal.analysis.projectedCorpus)}</span>
                  <span>Required: {formatCurrency(goal.analysis.inflationAdjustedTarget)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      goal.analysis.status === 'on-track' ? 'bg-green-500' :
                      goal.analysis.status === 'attention' ? 'bg-yellow-500' :
                      goal.analysis.status === 'at-risk' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(goal.analysis.fundingPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{goals.summary.total}</div>
              <div className="text-xs text-gray-600">Total Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{goals.summary.onTrack}</div>
              <div className="text-xs text-gray-600">On Track</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{goals.summary.atRisk}</div>
              <div className="text-xs text-gray-600">At Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={() => navigate('/simulator')}
          className="card hover:shadow-md transition-shadow text-left"
        >
          <div className="text-primary-600 mb-2">✨</div>
          <h3 className="font-semibold text-gray-900">Run What-If Simulation</h3>
          <p className="text-sm text-gray-600 mt-1">Test how changes impact your financial health</p>
        </button>
        
        <button 
          onClick={() => navigate('/recommendations')}
          className="card hover:shadow-md transition-shadow text-left"
        >
          <div className="text-yellow-600 mb-2">💡</div>
          <h3 className="font-semibold text-gray-900">View Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">Explainable actions to improve your plan</p>
        </button>
        
        <button 
          onClick={() => navigate('/report')}
          className="card hover:shadow-md transition-shadow text-left"
        >
          <div className="text-blue-600 mb-2">📄</div>
          <h3 className="font-semibold text-gray-900">Generate Report</h3>
          <p className="text-sm text-gray-600 mt-1">Comprehensive advisor-ready documentation</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
