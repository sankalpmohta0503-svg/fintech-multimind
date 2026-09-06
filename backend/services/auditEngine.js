/**
 * Audit Engine - Automated financial plan auditing
 * Detects gaps, risks, inefficiencies, and opportunities
 */

import FinancialEngine from './financialEngine.js';

export class AuditEngine {
  /**
   * Perform complete financial audit
   */
  static performAudit(clientData) {
    const findings = [];

    // Run all audit checks
    findings.push(...this.auditGoalFunding(clientData));
    findings.push(...this.auditEmergencyFund(clientData));
    findings.push(...this.auditDebtHealth(clientData));
    findings.push(...this.auditRiskAlignment(clientData));
    findings.push(...this.auditPortfolioConcentration(clientData));
    findings.push(...this.auditInsuranceCoverage(clientData));
    findings.push(...this.auditLiquidity(clientData));
    findings.push(...this.auditTaxOpportunities(clientData));

    // Categorize findings
    const categorized = {
      critical: findings.filter(f => f.severity === 'critical'),
      warning: findings.filter(f => f.severity === 'warning'),
      opportunity: findings.filter(f => f.severity === 'opportunity'),
      healthy: findings.filter(f => f.severity === 'healthy')
    };

    return {
      totalFindings: findings.length,
      findings,
      categorized,
      summary: this.generateAuditSummary(categorized)
    };
  }

  /**
   * Audit Goal Funding
   */
  static auditGoalFunding(clientData) {
    const findings = [];
    const { goals, assumptions } = clientData;

    if (!goals || goals.length === 0) {
      return findings;
    }

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

      const gap = inflationAdjustedTarget - projectedCorpus;

      if (fundingPercentage < 70) {
        findings.push({
          id: `goal_${goal.name.toLowerCase().replace(/\s/g, '_')}`,
          category: 'Goal Funding',
          severity: goal.priority === 'high' && fundingPercentage < 50 ? 'critical' : 'warning',
          title: `${goal.name} Funding Gap`,
          description: `Projected corpus is only ${Math.round(fundingPercentage)}% of the required amount`,
          evidence: {
            targetAmount: goal.targetAmount,
            inflationAdjustedTarget: Math.round(inflationAdjustedTarget),
            projectedCorpus: Math.round(projectedCorpus),
            gap: Math.round(gap),
            yearsRemaining,
            currentSIP: goal.monthlySIP || 0
          },
          impact: `May need to compromise on ${goal.name} or significantly increase contributions`,
          recommendation: `Increase monthly SIP or extend timeline for ${goal.name}`
        });
      } else if (fundingPercentage >= 95) {
        findings.push({
          id: `goal_${goal.name.toLowerCase().replace(/\s/g, '_')}_healthy`,
          category: 'Goal Funding',
          severity: 'healthy',
          title: `${goal.name} On Track`,
          description: `Goal is ${Math.round(fundingPercentage)}% funded with current strategy`,
          evidence: {
            targetAmount: goal.targetAmount,
            projectedCorpus: Math.round(projectedCorpus),
            fundingPercentage: Math.round(fundingPercentage)
          },
          impact: 'Goal likely to be achieved',
          recommendation: 'Continue current investment strategy'
        });
      }
    }

    return findings;
  }

  /**
   * Audit Emergency Fund
   */
  static auditEmergencyFund(clientData) {
    const findings = [];
    const { assets, monthlyExpenses } = clientData;

    const liquidAssets = (assets.cash || 0) + (assets.emergencyFund || 0);
    const emergencyMonths = FinancialEngine.emergencyFundCoverage(liquidAssets, monthlyExpenses);

    const recommendedMin = 6;
    const acceptableMin = 3;

    if (emergencyMonths < acceptableMin) {
      findings.push({
        id: 'emergency_fund_critical',
        category: 'Emergency Fund',
        severity: 'critical',
        title: 'Inadequate Emergency Fund',
        description: `Emergency fund covers only ${emergencyMonths.toFixed(1)} months of expenses`,
        evidence: {
          liquidAssets,
          monthlyExpenses,
          emergencyMonths: emergencyMonths.toFixed(1),
          recommended: recommendedMin,
          shortfall: Math.round((recommendedMin - emergencyMonths) * monthlyExpenses)
        },
        impact: 'High vulnerability to unexpected financial emergencies',
        recommendation: `Build emergency fund to cover at least ${recommendedMin} months of expenses`
      });
    } else if (emergencyMonths < recommendedMin) {
      findings.push({
        id: 'emergency_fund_warning',
        category: 'Emergency Fund',
        severity: 'warning',
        title: 'Emergency Fund Below Recommended Level',
        description: `Emergency fund covers ${emergencyMonths.toFixed(1)} months, below recommended ${recommendedMin} months`,
        evidence: {
          liquidAssets,
          monthlyExpenses,
          emergencyMonths: emergencyMonths.toFixed(1),
          recommended: recommendedMin,
          shortfall: Math.round((recommendedMin - emergencyMonths) * monthlyExpenses)
        },
        impact: 'Moderate vulnerability to financial disruptions',
        recommendation: `Increase emergency fund to ${recommendedMin} months of expenses`
      });
    } else {
      findings.push({
        id: 'emergency_fund_healthy',
        category: 'Emergency Fund',
        severity: 'healthy',
        title: 'Strong Emergency Fund',
        description: `Emergency fund covers ${emergencyMonths.toFixed(1)} months of expenses`,
        evidence: {
          liquidAssets,
          monthlyExpenses,
          emergencyMonths: emergencyMonths.toFixed(1)
        },
        impact: 'Good protection against financial emergencies',
        recommendation: 'Maintain current emergency fund levels'
      });
    }

    return findings;
  }

  /**
   * Audit Debt Health
   */
  static auditDebtHealth(clientData) {
    const findings = [];
    const { liabilities, monthlyIncome } = clientData;

    const monthlyEMIs = Object.values(liabilities).reduce((sum, val) => sum + (val.emi || 0), 0);
    const dti = FinancialEngine.debtToIncomeRatio(monthlyEMIs, monthlyIncome);

    if (dti > 50) {
      findings.push({
        id: 'debt_critical',
        category: 'Debt Health',
        severity: 'critical',
        title: 'Very High Debt Burden',
        description: `Debt-to-income ratio is ${dti.toFixed(1)}%, significantly above healthy levels`,
        evidence: {
          dti: dti.toFixed(1),
          monthlyEMIs,
          monthlyIncome,
          recommendedMax: 40
        },
        impact: 'Severe constraint on savings and investment capacity',
        recommendation: 'Prioritize debt reduction; consider debt consolidation'
      });
    } else if (dti > 40) {
      findings.push({
        id: 'debt_warning',
        category: 'Debt Health',
        severity: 'warning',
        title: 'High Debt Burden',
        description: `Debt-to-income ratio is ${dti.toFixed(1)}%, above recommended 40%`,
        evidence: {
          dti: dti.toFixed(1),
          monthlyEMIs,
          monthlyIncome,
          recommendedMax: 40
        },
        impact: 'Limited flexibility for savings and emergencies',
        recommendation: 'Accelerate debt repayment when possible'
      });
    } else if (monthlyEMIs === 0) {
      findings.push({
        id: 'debt_healthy_none',
        category: 'Debt Health',
        severity: 'healthy',
        title: 'Debt-Free Status',
        description: 'No outstanding debt obligations',
        evidence: {
          dti: 0,
          monthlyEMIs: 0
        },
        impact: 'Maximum financial flexibility',
        recommendation: 'Maintain debt-free status'
      });
    }

    return findings;
  }

  /**
   * Audit Risk Alignment
   */
  static auditRiskAlignment(clientData) {
    const findings = [];
    const { riskProfile, portfolio } = clientData;

    const equityAllocation = portfolio.equity || 0;

    const ranges = {
      conservative: { min: 20, max: 40 },
      moderate: { min: 45, max: 65 },
      aggressive: { min: 70, max: 90 }
    };

    const range = ranges[riskProfile.toLowerCase()] || ranges.moderate;

    if (equityAllocation > range.max) {
      const excess = equityAllocation - range.max;
      findings.push({
        id: 'risk_misalignment_aggressive',
        category: 'Risk Alignment',
        severity: excess > 15 ? 'warning' : 'opportunity',
        title: 'Portfolio More Aggressive Than Risk Profile',
        description: `Equity allocation of ${equityAllocation}% exceeds recommended range for ${riskProfile} profile`,
        evidence: {
          equityAllocation,
          riskProfile,
          recommendedRange: `${range.min}-${range.max}%`,
          excess
        },
        impact: 'Higher volatility than comfortable risk tolerance may suggest',
        recommendation: `Consider rebalancing to ${range.min}-${range.max}% equity allocation`
      });
    } else if (equityAllocation < range.min) {
      const shortfall = range.min - equityAllocation;
      findings.push({
        id: 'risk_misalignment_conservative',
        category: 'Risk Alignment',
        severity: 'opportunity',
        title: 'Portfolio More Conservative Than Risk Profile',
        description: `Equity allocation of ${equityAllocation}% is below recommended range for ${riskProfile} profile`,
        evidence: {
          equityAllocation,
          riskProfile,
          recommendedRange: `${range.min}-${range.max}%`,
          shortfall
        },
        impact: 'Potentially missing growth opportunities',
        recommendation: `Consider increasing equity to ${range.min}-${range.max}%`
      });
    }

    return findings;
  }

  /**
   * Audit Portfolio Concentration
   */
  static auditPortfolioConcentration(clientData) {
    const findings = [];
    const { portfolio } = clientData;

    const allocations = [
      portfolio.equity || 0,
      portfolio.debt || 0,
      portfolio.gold || 0,
      portfolio.realEstate || 0,
      portfolio.cash || 0
    ].filter(v => v > 0);

    const concentration = FinancialEngine.concentrationRisk(allocations);

    if (concentration > 60) {
      findings.push({
        id: 'concentration_high',
        category: 'Portfolio Concentration',
        severity: 'warning',
        title: 'High Concentration Risk',
        description: 'Portfolio is heavily concentrated in few asset classes',
        evidence: {
          concentration: concentration.toFixed(1),
          assetClasses: allocations.length,
          portfolio
        },
        impact: 'Increased vulnerability to asset class specific risks',
        recommendation: 'Diversify across more asset classes'
      });
    }

    // Check individual asset class dominance
    const maxAllocation = Math.max(...Object.values(portfolio));
    if (maxAllocation > 75) {
      const dominantClass = Object.keys(portfolio).find(key => portfolio[key] === maxAllocation);
      findings.push({
        id: 'concentration_single_class',
        category: 'Portfolio Concentration',
        severity: 'warning',
        title: `Excessive ${dominantClass} Concentration`,
        description: `${dominantClass} represents ${maxAllocation}% of portfolio`,
        evidence: {
          assetClass: dominantClass,
          allocation: maxAllocation
        },
        impact: `High exposure to ${dominantClass} market risks`,
        recommendation: `Reduce ${dominantClass} allocation to improve diversification`
      });
    }

    return findings;
  }

  /**
   * Audit Insurance Coverage
   */
  static auditInsuranceCoverage(clientData) {
    const findings = [];
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
    const gap = requiredCoverage - lifeCoverage;
    const coverageRatio = (lifeCoverage / requiredCoverage) * 100;

    if (coverageRatio < 60) {
      findings.push({
        id: 'insurance_critical',
        category: 'Insurance Coverage',
        severity: 'critical',
        title: 'Major Life Insurance Gap',
        description: `Life insurance coverage is only ${coverageRatio.toFixed(0)}% of estimated requirement`,
        evidence: {
          currentCoverage: lifeCoverage,
          requiredCoverage: Math.round(requiredCoverage),
          gap: Math.round(gap),
          coverageRatio: coverageRatio.toFixed(0)
        },
        impact: 'Dependents face significant financial risk',
        recommendation: `Increase life insurance coverage by ₹${(gap / 100000).toFixed(0)}L`
      });
    } else if (coverageRatio < 80) {
      findings.push({
        id: 'insurance_warning',
        category: 'Insurance Coverage',
        severity: 'warning',
        title: 'Life Insurance Gap',
        description: `Life insurance coverage is ${coverageRatio.toFixed(0)}% of estimated requirement`,
        evidence: {
          currentCoverage: lifeCoverage,
          requiredCoverage: Math.round(requiredCoverage),
          gap: Math.round(gap),
          coverageRatio: coverageRatio.toFixed(0)
        },
        impact: 'Moderate protection gap for dependents',
        recommendation: `Consider increasing life insurance coverage`
      });
    }

    return findings;
  }

  /**
   * Audit Liquidity
   */
  static auditLiquidity(clientData) {
    const findings = [];
    const { assets, goals } = clientData;

    const liquidAssets = (assets.cash || 0) + (assets.emergencyFund || 0);
    const totalAssets = Object.values(assets).reduce((sum, val) => sum + val, 0);
    const liquidityRatio = (liquidAssets / totalAssets) * 100;

    // Check for short-term goals without adequate liquidity
    const shortTermGoals = goals.filter(g => g.yearsToGoal <= 2);
    const shortTermNeed = shortTermGoals.reduce((sum, g) => sum + g.targetAmount, 0);

    if (shortTermNeed > liquidAssets * 0.8) {
      findings.push({
        id: 'liquidity_shortterm',
        category: 'Liquidity',
        severity: 'warning',
        title: 'Liquidity Mismatch for Short-Term Goals',
        description: 'Short-term goals may require liquidation of long-term investments',
        evidence: {
          shortTermNeed: Math.round(shortTermNeed),
          liquidAssets: Math.round(liquidAssets),
          shortfall: Math.round(shortTermNeed - liquidAssets)
        },
        impact: 'May need to sell investments at unfavorable times',
        recommendation: 'Increase liquid assets or adjust goal timelines'
      });
    }

    return findings;
  }

  /**
   * Audit Tax Opportunities
   */
  static auditTaxOpportunities(clientData) {
    const findings = [];
    const { monthlyIncome, taxSavingInvestments } = clientData;

    const annualIncome = monthlyIncome * 12;

    if (annualIncome <= 300000) {
      return findings; // Below taxable limit
    }

    const potential = FinancialEngine.potentialTaxSavings(taxSavingInvestments || 0);

    if (potential > 50000) {
      const estimatedSavings = potential * 0.20; // Assuming 20% marginal rate
      findings.push({
        id: 'tax_opportunity',
        category: 'Tax Optimization',
        severity: 'opportunity',
        title: 'Tax-Saving Investment Opportunity',
        description: `Potential to invest ₹${(potential / 100000).toFixed(1)}L more in tax-saving instruments`,
        evidence: {
          currentInvestments: taxSavingInvestments || 0,
          potential,
          estimatedSavings: Math.round(estimatedSavings),
          limit: 150000
        },
        impact: `Could save approximately ₹${(estimatedSavings / 1000).toFixed(0)}K in taxes`,
        recommendation: 'Explore Section 80C, 80D and other tax-saving opportunities',
        disclaimer: 'Verify eligibility and current tax rules before implementation'
      });
    }

    return findings;
  }

  /**
   * Generate audit summary
   */
  static generateAuditSummary(categorized) {
    return {
      critical: categorized.critical.length,
      warning: categorized.warning.length,
      opportunity: categorized.opportunity.length,
      healthy: categorized.healthy.length,
      message: this.getSummaryMessage(categorized)
    };
  }

  /**
   * Get summary message
   */
  static getSummaryMessage(categorized) {
    const { critical, warning, opportunity } = categorized;

    if (critical.length > 0) {
      return `${critical.length} critical issue${critical.length > 1 ? 's' : ''} requiring immediate attention`;
    } else if (warning.length > 2) {
      return `${warning.length} areas need attention to improve financial health`;
    } else if (opportunity.length > 0) {
      return `${opportunity.length} optimization opportunit${opportunity.length > 1 ? 'ies' : 'y'} identified`;
    } else {
      return 'Financial plan is generally healthy';
    }
  }
}

export default AuditEngine;
