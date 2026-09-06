/**
 * Scoring Engine - Calculate financial health scores
 * 8-dimension weighted scoring system
 */

import FinancialEngine from './financialEngine.js';

export class ScoringEngine {
  static WEIGHTS = {
    cashFlow: 0.15,      // 15%
    liquidity: 0.10,     // 10%
    goalReadiness: 0.20, // 20%
    riskAlignment: 0.15, // 15%
    diversification: 0.10, // 10%
    debtHealth: 0.10,    // 10%
    protection: 0.10,    // 10%
    taxEfficiency: 0.10  // 10%
  };

  /**
   * Calculate overall financial health score
   */
  static calculateFinancialHealth(clientData) {
    const scores = {
      cashFlow: this.scoreCashFlow(clientData),
      liquidity: this.scoreLiquidity(clientData),
      goalReadiness: this.scoreGoalReadiness(clientData),
      riskAlignment: this.scoreRiskAlignment(clientData),
      diversification: this.scoreDiversification(clientData),
      debtHealth: this.scoreDebtHealth(clientData),
      protection: this.scoreProtection(clientData),
      taxEfficiency: this.scoreTaxEfficiency(clientData)
    };

    // Calculate weighted total
    let totalScore = 0;
    for (const dimension in scores) {
      totalScore += scores[dimension].score * this.WEIGHTS[dimension];
    }

    return {
      overallScore: Math.round(totalScore),
      dimensions: scores
    };
  }

  /**
   * Score Cash Flow (0-100)
   */
  static scoreCashFlow(clientData) {
    const { monthlyIncome, monthlyExpenses } = clientData;
    const surplus = monthlyIncome - monthlyExpenses;
    const savingsRate = FinancialEngine.savingsRate(surplus, monthlyIncome);
    
    let score = 0;
    let reason = '';
    const metrics = { savingsRate, surplus };

    if (savingsRate >= 30) {
      score = 100;
      reason = 'Excellent savings rate above 30%';
    } else if (savingsRate >= 20) {
      score = 85;
      reason = 'Good savings rate between 20-30%';
    } else if (savingsRate >= 15) {
      score = 70;
      reason = 'Moderate savings rate between 15-20%';
    } else if (savingsRate >= 10) {
      score = 55;
      reason = 'Below average savings rate between 10-15%';
    } else if (savingsRate >= 5) {
      score = 35;
      reason = 'Low savings rate between 5-10%';
    } else {
      score = 20;
      reason = 'Critical: Savings rate below 5%';
    }

    return { score, reason, metrics };
  }

  /**
   * Score Liquidity (0-100)
   */
  static scoreLiquidity(clientData) {
    const { assets, monthlyExpenses } = clientData;
    const liquidAssets = (assets.cash || 0) + (assets.emergencyFund || 0);
    const emergencyMonths = FinancialEngine.emergencyFundCoverage(liquidAssets, monthlyExpenses);
    
    let score = 0;
    let reason = '';
    const metrics = { emergencyMonths, liquidAssets };

    if (emergencyMonths >= 6) {
      score = 100;
      reason = 'Emergency fund covers 6+ months of expenses';
    } else if (emergencyMonths >= 4) {
      score = 75;
      reason = 'Emergency fund covers 4-6 months';
    } else if (emergencyMonths >= 3) {
      score = 60;
      reason = 'Emergency fund covers 3-4 months';
    } else if (emergencyMonths >= 2) {
      score = 40;
      reason = 'Emergency fund covers only 2-3 months';
    } else if (emergencyMonths >= 1) {
      score = 25;
      reason = 'Critical: Emergency fund covers only 1-2 months';
    } else {
      score = 10;
      reason = 'Critical: Emergency fund below 1 month';
    }

    return { score, reason, metrics };
  }

  /**
   * Score Goal Readiness (0-100)
   */
  static scoreGoalReadiness(clientData) {
    const { goals, assumptions } = clientData;
    
    if (!goals || goals.length === 0) {
      return { score: 50, reason: 'No goals defined', metrics: {} };
    }

    let totalFunding = 0;
    let onTrackGoals = 0;
    const goalDetails = [];

    for (const goal of goals) {
      const yearsRemaining = goal.yearsToGoal;
      const inflationAdjustedTarget = FinancialEngine.inflationAdjustedGoal(
        goal.targetAmount,
        assumptions.inflation,
        yearsRemaining
      );

      const projectedCorpus = FinancialEngine.projectGoalCorpus(
        goal.currentCorpus || 0,
        goal.monthlySIP || 0,
        assumptions.returns[goal.assetClass] || assumptions.returns.balanced,
        yearsRemaining
      );

      const fundingPercentage = FinancialEngine.goalFundingPercentage(
        projectedCorpus,
        inflationAdjustedTarget
      );

      totalFunding += fundingPercentage;
      if (fundingPercentage >= 90) onTrackGoals++;
      
      goalDetails.push({
        name: goal.name,
        fundingPercentage,
        projectedCorpus,
        requiredCorpus: inflationAdjustedTarget
      });
    }

    const avgFunding = totalFunding / goals.length;
    let score = Math.min(avgFunding, 100);
    
    let reason = '';
    if (avgFunding >= 90) {
      reason = `All ${goals.length} goals are well funded`;
    } else if (avgFunding >= 75) {
      reason = `Most goals are adequately funded (${onTrackGoals}/${goals.length} on track)`;
    } else if (avgFunding >= 60) {
      reason = `Some goals have funding gaps (${onTrackGoals}/${goals.length} on track)`;
    } else {
      reason = `Multiple goals have significant funding gaps`;
    }

    return { score, reason, metrics: { avgFunding, onTrackGoals, totalGoals: goals.length, goalDetails } };
  }

  /**
   * Score Risk Alignment (0-100)
   */
  static scoreRiskAlignment(clientData) {
    const { riskProfile, portfolio } = clientData;
    
    const equityAllocation = portfolio.equity || 0;
    
    // Define recommended equity ranges by risk profile
    const ranges = {
      conservative: { min: 20, max: 40, optimal: 30 },
      moderate: { min: 45, max: 65, optimal: 55 },
      aggressive: { min: 70, max: 90, optimal: 80 }
    };

    const range = ranges[riskProfile.toLowerCase()] || ranges.moderate;
    
    let score = 0;
    let reason = '';
    const metrics = { equityAllocation, recommendedRange: `${range.min}-${range.max}%` };

    const deviation = Math.abs(equityAllocation - range.optimal);
    
    if (equityAllocation >= range.min && equityAllocation <= range.max) {
      if (deviation <= 5) {
        score = 100;
        reason = `Portfolio allocation aligns perfectly with ${riskProfile} risk profile`;
      } else if (deviation <= 10) {
        score = 85;
        reason = `Portfolio allocation is well-aligned with ${riskProfile} risk profile`;
      } else {
        score = 70;
        reason = `Portfolio allocation is acceptable for ${riskProfile} risk profile`;
      }
    } else if (equityAllocation < range.min) {
      const gap = range.min - equityAllocation;
      score = Math.max(30, 70 - gap);
      reason = `Portfolio is too conservative for ${riskProfile} risk profile`;
    } else {
      const excess = equityAllocation - range.max;
      score = Math.max(30, 70 - excess);
      reason = `Portfolio is too aggressive for ${riskProfile} risk profile`;
    }

    return { score, reason, metrics };
  }

  /**
   * Score Diversification (0-100)
   */
  static scoreDiversification(clientData) {
    const { portfolio } = clientData;
    
    const allocations = [
      portfolio.equity || 0,
      portfolio.debt || 0,
      portfolio.gold || 0,
      portfolio.realEstate || 0,
      portfolio.cash || 0
    ].filter(v => v > 0);

    const concentration = FinancialEngine.concentrationRisk(allocations);
    
    let score = 0;
    let reason = '';
    const metrics = { concentration, assetClasses: allocations.length };

    // Lower Herfindahl index = better diversification
    if (concentration <= 30) {
      score = 100;
      reason = 'Excellent diversification across asset classes';
    } else if (concentration <= 40) {
      score = 85;
      reason = 'Good diversification';
    } else if (concentration <= 50) {
      score = 70;
      reason = 'Moderate diversification';
    } else if (concentration <= 60) {
      score = 55;
      reason = 'Concentration risk present';
    } else {
      score = 35;
      reason = 'High concentration risk detected';
    }

    return { score, reason, metrics };
  }

  /**
   * Score Debt Health (0-100)
   */
  static scoreDebtHealth(clientData) {
    const { liabilities, monthlyIncome } = clientData;
    
    const totalDebt = Object.values(liabilities).reduce((sum, val) => sum + (val.outstanding || 0), 0);
    const monthlyEMIs = Object.values(liabilities).reduce((sum, val) => sum + (val.emi || 0), 0);
    
    const dti = FinancialEngine.debtToIncomeRatio(monthlyEMIs, monthlyIncome);
    
    let score = 0;
    let reason = '';
    const metrics = { dti, totalDebt, monthlyEMIs };

    if (totalDebt === 0) {
      score = 100;
      reason = 'Debt-free status';
    } else if (dti <= 30) {
      score = 90;
      reason = 'Healthy debt levels (DTI below 30%)';
    } else if (dti <= 40) {
      score = 75;
      reason = 'Manageable debt levels (DTI 30-40%)';
    } else if (dti <= 50) {
      score = 55;
      reason = 'High debt burden (DTI 40-50%)';
    } else {
      score = 30;
      reason = 'Critical: Very high debt burden (DTI above 50%)';
    }

    return { score, reason, metrics };
  }

  /**
   * Score Protection (0-100)
   */
  static scoreProtection(clientData) {
    const { insurance, monthlyIncome, liabilities, personalInfo } = clientData;
    
    const annualIncome = monthlyIncome * 12;
    const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + (val.outstanding || 0), 0);
    
    const requiredCoverage = FinancialEngine.insuranceRequirement(
      annualIncome,
      Math.max(0, 60 - personalInfo.age),
      personalInfo.dependents || 0,
      totalLiabilities
    );

    const lifeCoverage = insurance.life || 0;
    const coverageRatio = (lifeCoverage / requiredCoverage) * 100;
    
    let score = 0;
    let reason = '';
    const metrics = { coverageRatio, lifeCoverage, requiredCoverage };

    if (coverageRatio >= 100) {
      score = 100;
      reason = 'Adequate life insurance coverage';
    } else if (coverageRatio >= 80) {
      score = 80;
      reason = 'Good life insurance coverage';
    } else if (coverageRatio >= 60) {
      score = 65;
      reason = 'Moderate insurance gap';
    } else if (coverageRatio >= 40) {
      score = 45;
      reason = 'Significant insurance gap';
    } else {
      score = 25;
      reason = 'Critical: Major insurance coverage gap';
    }

    return { score, reason, metrics };
  }

  /**
   * Score Tax Efficiency (0-100)
   */
  static scoreTaxEfficiency(clientData) {
    const { monthlyIncome, taxSavingInvestments } = clientData;
    
    const annualIncome = monthlyIncome * 12;
    const currentInvestments = taxSavingInvestments || 0;
    const potential = FinancialEngine.potentialTaxSavings(currentInvestments);
    const utilizationRate = (currentInvestments / 150000) * 100;
    
    let score = 0;
    let reason = '';
    const metrics = { utilizationRate, currentInvestments, potential };

    if (annualIncome <= 300000) {
      // Below taxable limit
      score = 100;
      reason = 'Income below taxable limit';
    } else if (utilizationRate >= 90) {
      score = 100;
      reason = 'Excellent tax-saving investment utilization';
    } else if (utilizationRate >= 70) {
      score = 85;
      reason = 'Good tax-saving investment utilization';
    } else if (utilizationRate >= 50) {
      score = 70;
      reason = 'Moderate tax-saving opportunity usage';
    } else if (utilizationRate >= 30) {
      score = 55;
      reason = 'Underutilized tax-saving opportunities';
    } else {
      score = 40;
      reason = 'Significant tax-saving opportunities available';
    }

    return { score, reason, metrics };
  }
}

export default ScoringEngine;
