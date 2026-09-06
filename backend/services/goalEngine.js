/**
 * Goal Engine - Goal analysis and projection
 */

import FinancialEngine from './financialEngine.js';

export class GoalEngine {
  /**
   * Analyze all goals
   */
  static analyzeGoals(clientData) {
    const { goals, assumptions } = clientData;
    
    if (!goals || goals.length === 0) {
      return { goals: [], summary: {} };
    }

    const analyzedGoals = goals.map(goal => this.analyzeGoal(goal, assumptions));
    
    const summary = this.generateGoalSummary(analyzedGoals);

    return {
      goals: analyzedGoals,
      summary
    };
  }

  /**
   * Analyze individual goal
   */
  static analyzeGoal(goal, assumptions) {
    const yearsRemaining = goal.yearsToGoal;
    
    // Calculate inflation-adjusted target
    const inflationAdjustedTarget = FinancialEngine.inflationAdjustedGoal(
      goal.targetAmount,
      assumptions.inflation,
      yearsRemaining
    );

    // Project current trajectory
    const expectedReturn = assumptions.returns[goal.assetClass] || assumptions.returns.balanced;
    const projectedCorpus = FinancialEngine.projectGoalCorpus(
      goal.currentCorpus || 0,
      goal.monthlySIP || 0,
      expectedReturn,
      yearsRemaining
    );

    // Calculate gap
    const gap = inflationAdjustedTarget - projectedCorpus;
    const fundingPercentage = FinancialEngine.goalFundingPercentage(
      projectedCorpus,
      inflationAdjustedTarget
    );

    // Calculate required SIP to close gap
    const requiredMonthlySIP = gap > 0 
      ? FinancialEngine.requiredMonthlySIP(gap, expectedReturn, yearsRemaining)
      : 0;

    // Generate trajectory data for charts
    const trajectory = this.generateTrajectory(
      goal.currentCorpus || 0,
      goal.monthlySIP || 0,
      expectedReturn,
      yearsRemaining,
      inflationAdjustedTarget
    );

    // Determine status
    let status = 'on-track';
    let statusMessage = '';
    
    if (fundingPercentage >= 95) {
      status = 'on-track';
      statusMessage = 'Goal is well funded';
    } else if (fundingPercentage >= 80) {
      status = 'attention';
      statusMessage = 'Minor funding gap';
    } else if (fundingPercentage >= 60) {
      status = 'at-risk';
      statusMessage = 'Significant funding gap';
    } else {
      status = 'critical';
      statusMessage = 'Major funding gap';
    }

    return {
      ...goal,
      analysis: {
        inflationAdjustedTarget: Math.round(inflationAdjustedTarget),
        projectedCorpus: Math.round(projectedCorpus),
        gap: Math.round(gap),
        fundingPercentage: Math.round(fundingPercentage),
        requiredMonthlySIP: Math.round(requiredMonthlySIP),
        additionalSIP: Math.round(Math.max(0, requiredMonthlySIP - (goal.monthlySIP || 0))),
        status,
        statusMessage,
        trajectory,
        expectedReturn: (expectedReturn * 100).toFixed(1)
      }
    };
  }

  /**
   * Generate trajectory data for visualization
   */
  static generateTrajectory(currentCorpus, monthlySIP, expectedReturn, years, target) {
    const trajectory = [];
    const requiredMonthlySIP = FinancialEngine.requiredMonthlySIP(target, expectedReturn, years);

    for (let year = 0; year <= years; year++) {
      const currentPath = FinancialEngine.projectGoalCorpus(
        currentCorpus,
        monthlySIP,
        expectedReturn,
        year
      );

      const requiredPath = FinancialEngine.projectGoalCorpus(
        currentCorpus,
        requiredMonthlySIP,
        expectedReturn,
        year
      );

      trajectory.push({
        year,
        current: Math.round(currentPath),
        required: Math.round(requiredPath),
        target: year === years ? Math.round(target) : null
      });
    }

    return trajectory;
  }

  /**
   * Generate goal summary
   */
  static generateGoalSummary(analyzedGoals) {
    const total = analyzedGoals.length;
    const onTrack = analyzedGoals.filter(g => g.analysis.status === 'on-track').length;
    const atRisk = analyzedGoals.filter(g => g.analysis.status === 'at-risk' || g.analysis.status === 'critical').length;
    
    const totalRequired = analyzedGoals.reduce((sum, g) => sum + g.analysis.inflationAdjustedTarget, 0);
    const totalProjected = analyzedGoals.reduce((sum, g) => sum + g.analysis.projectedCorpus, 0);
    const totalGap = Math.max(0, totalRequired - totalProjected);
    
    const avgFunding = total > 0 
      ? analyzedGoals.reduce((sum, g) => sum + g.analysis.fundingPercentage, 0) / total 
      : 0;

    return {
      total,
      onTrack,
      atRisk,
      totalRequired: Math.round(totalRequired),
      totalProjected: Math.round(totalProjected),
      totalGap: Math.round(totalGap),
      avgFunding: Math.round(avgFunding)
    };
  }

  /**
   * Calculate goal priority score
   */
  static calculatePriorityScore(goal) {
    let score = 0;

    // Priority weight
    const priorityWeights = { high: 40, medium: 25, low: 10 };
    score += priorityWeights[goal.priority] || 25;

    // Time urgency
    if (goal.yearsToGoal <= 2) score += 30;
    else if (goal.yearsToGoal <= 5) score += 20;
    else if (goal.yearsToGoal <= 10) score += 10;

    // Funding gap severity
    const funding = goal.analysis?.fundingPercentage || 0;
    if (funding < 50) score += 30;
    else if (funding < 70) score += 20;
    else if (funding < 90) score += 10;

    return score;
  }
}

export default GoalEngine;
