/**
 * Simulation Engine - What-if scenario analysis
 */

import ScoringEngine from './scoringEngine.js';
import AuditEngine from './auditEngine.js';
import GoalEngine from './goalEngine.js';

export class SimulationEngine {
  /**
   * Run simulation with modified parameters
   */
  static runSimulation(baseClientData, modifications) {
    // Create simulated client data
    const simulatedData = this.applyModifications(baseClientData, modifications);

    // Run all analyses on simulated data
    const healthScore = ScoringEngine.calculateFinancialHealth(simulatedData);
    const audit = AuditEngine.performAudit(simulatedData);
    const goals = GoalEngine.analyzeGoals(simulatedData);

    // Calculate key metrics
    const metrics = this.calculateKeyMetrics(simulatedData);

    return {
      simulatedData,
      healthScore,
      audit,
      goals,
      metrics,
      modifications
    };
  }

  /**
   * Compare two scenarios
   */
  static compareScenarios(baseScenario, simulatedScenario) {
    const comparison = {
      healthScore: {
        before: baseScenario.healthScore.overallScore,
        after: simulatedScenario.healthScore.overallScore,
        delta: simulatedScenario.healthScore.overallScore - baseScenario.healthScore.overallScore
      },
      dimensions: {},
      goalReadiness: {
        before: baseScenario.goals.summary.avgFunding,
        after: simulatedScenario.goals.summary.avgFunding,
        delta: simulatedScenario.goals.summary.avgFunding - baseScenario.goals.summary.avgFunding
      },
      totalGoalGap: {
        before: baseScenario.goals.summary.totalGap,
        after: simulatedScenario.goals.summary.totalGap,
        delta: baseScenario.goals.summary.totalGap - simulatedScenario.goals.summary.totalGap
      },
      criticalFindings: {
        before: baseScenario.audit.categorized.critical.length,
        after: simulatedScenario.audit.categorized.critical.length,
        delta: baseScenario.audit.categorized.critical.length - simulatedScenario.audit.categorized.critical.length
      },
      monthlySurplus: {
        before: baseScenario.metrics.monthlySurplus,
        after: simulatedScenario.metrics.monthlySurplus,
        delta: simulatedScenario.metrics.monthlySurplus - baseScenario.metrics.monthlySurplus
      }
    };

    // Compare dimensions
    for (const dimension in baseScenario.healthScore.dimensions) {
      comparison.dimensions[dimension] = {
        before: baseScenario.healthScore.dimensions[dimension].score,
        after: simulatedScenario.healthScore.dimensions[dimension].score,
        delta: simulatedScenario.healthScore.dimensions[dimension].score - 
               baseScenario.healthScore.dimensions[dimension].score
      };
    }

    // Determine overall impact
    comparison.overallImpact = this.assessOverallImpact(comparison);

    return comparison;
  }

  /**
   * Apply modifications to client data
   */
  static applyModifications(baseData, modifications) {
    const simulated = JSON.parse(JSON.stringify(baseData)); // Deep clone

    if (modifications.monthlyIncome !== undefined) {
      simulated.monthlyIncome = modifications.monthlyIncome;
    }

    if (modifications.monthlyExpenses !== undefined) {
      simulated.monthlyExpenses = modifications.monthlyExpenses;
    }

    if (modifications.portfolio) {
      simulated.portfolio = { ...simulated.portfolio, ...modifications.portfolio };
    }

    if (modifications.monthlyInvestment !== undefined) {
      // Distribute additional investment across goals
      const additionalPerGoal = modifications.monthlyInvestment / simulated.goals.length;
      simulated.goals = simulated.goals.map(goal => ({
        ...goal,
        monthlySIP: (goal.monthlySIP || 0) + additionalPerGoal
      }));
    }

    if (modifications.emergencyFundIncrease !== undefined) {
      simulated.assets.emergencyFund = (simulated.assets.emergencyFund || 0) + 
                                        modifications.emergencyFundIncrease;
    }

    if (modifications.debtReduction !== undefined) {
      // Reduce liabilities
      const totalDebt = Object.values(simulated.liabilities)
        .reduce((sum, l) => sum + (l.outstanding || 0), 0);
      
      const reductionRatio = modifications.debtReduction / totalDebt;
      
      for (const key in simulated.liabilities) {
        if (simulated.liabilities[key].outstanding) {
          simulated.liabilities[key].outstanding *= (1 - reductionRatio);
          if (simulated.liabilities[key].emi) {
            simulated.liabilities[key].emi *= (1 - reductionRatio);
          }
        }
      }
    }

    if (modifications.insuranceIncrease !== undefined) {
      simulated.insurance.life = (simulated.insurance.life || 0) + 
                                  modifications.insuranceIncrease;
    }

    if (modifications.taxSavingInvestments !== undefined) {
      simulated.taxSavingInvestments = modifications.taxSavingInvestments;
    }

    if (modifications.retirementAge !== undefined) {
      const retirementGoal = simulated.goals.find(g => 
        g.name.toLowerCase().includes('retirement')
      );
      if (retirementGoal) {
        retirementGoal.yearsToGoal = modifications.retirementAge - simulated.personalInfo.age;
      }
    }

    if (modifications.expectedReturns) {
      simulated.assumptions.returns = {
        ...simulated.assumptions.returns,
        ...modifications.expectedReturns
      };
    }

    return simulated;
  }

  /**
   * Calculate key metrics
   */
  static calculateKeyMetrics(clientData) {
    const { monthlyIncome, monthlyExpenses, liabilities } = clientData;
    
    const monthlySurplus = monthlyIncome - monthlyExpenses;
    const monthlyEMIs = Object.values(liabilities).reduce((sum, val) => sum + (val.emi || 0), 0);
    const availableForInvestment = monthlySurplus - monthlyEMIs;

    return {
      monthlySurplus,
      monthlyEMIs,
      availableForInvestment,
      savingsRate: (monthlySurplus / monthlyIncome) * 100
    };
  }

  /**
   * Assess overall impact of changes
   */
  static assessOverallImpact(comparison) {
    let positiveCount = 0;
    let negativeCount = 0;
    let significantImpacts = [];

    // Health score
    if (comparison.healthScore.delta > 5) {
      positiveCount++;
      significantImpacts.push({
        metric: 'Financial Health Score',
        impact: 'positive',
        delta: comparison.healthScore.delta
      });
    } else if (comparison.healthScore.delta < -5) {
      negativeCount++;
      significantImpacts.push({
        metric: 'Financial Health Score',
        impact: 'negative',
        delta: comparison.healthScore.delta
      });
    }

    // Goal readiness
    if (comparison.goalReadiness.delta > 10) {
      positiveCount++;
      significantImpacts.push({
        metric: 'Goal Readiness',
        impact: 'positive',
        delta: comparison.goalReadiness.delta
      });
    } else if (comparison.goalReadiness.delta < -10) {
      negativeCount++;
      significantImpacts.push({
        metric: 'Goal Readiness',
        impact: 'negative',
        delta: comparison.goalReadiness.delta
      });
    }

    // Critical findings
    if (comparison.criticalFindings.delta > 0) {
      positiveCount++;
      significantImpacts.push({
        metric: 'Critical Issues',
        impact: 'positive',
        delta: comparison.criticalFindings.delta,
        message: `${comparison.criticalFindings.delta} critical issue(s) resolved`
      });
    }

    return {
      overall: positiveCount > negativeCount ? 'positive' : 
               negativeCount > positiveCount ? 'negative' : 'neutral',
      positiveCount,
      negativeCount,
      significantImpacts
    };
  }

  /**
   * Generate preset scenarios
   */
  static generatePresetScenarios(baseData) {
    return {
      increaseSIP: {
        name: 'Increase Monthly Investment',
        description: 'Increase monthly investment by ₹10,000',
        modifications: {
          monthlyInvestment: 10000
        }
      },
      balancedPortfolio: {
        name: 'Balanced Portfolio',
        description: 'Rebalance to moderate risk allocation',
        modifications: {
          portfolio: {
            equity: 55,
            debt: 30,
            gold: 10,
            cash: 5
          }
        }
      },
      accelerateDebt: {
        name: 'Accelerate Debt Repayment',
        description: 'Pay down 30% of outstanding debt',
        modifications: {
          debtReduction: baseData.liabilities ? 
            Object.values(baseData.liabilities).reduce((sum, l) => sum + (l.outstanding || 0), 0) * 0.3 : 0
        }
      },
      buildEmergency: {
        name: 'Build Emergency Fund',
        description: 'Increase emergency fund to 6 months',
        modifications: {
          emergencyFundIncrease: Math.max(0, 
            (baseData.monthlyExpenses * 6) - ((baseData.assets?.emergencyFund || 0) + (baseData.assets?.cash || 0))
          )
        }
      },
      extendRetirement: {
        name: 'Extend Retirement Age',
        description: 'Work 2 more years before retirement',
        modifications: {
          retirementAge: (baseData.personalInfo?.age || 0) + 24
        }
      }
    };
  }
}

export default SimulationEngine;
