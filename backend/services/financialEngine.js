/**
 * Financial Engine - Core financial calculations
 * Provides deterministic financial formulas and calculations
 */

export class FinancialEngine {
  /**
   * Calculate Future Value with compound interest
   * FV = PV × (1 + r)^n
   */
  static futureValue(presentValue, annualRate, years) {
    return presentValue * Math.pow(1 + annualRate, years);
  }

  /**
   * Calculate SIP Future Value
   * FV = P × [((1 + r)^n - 1) / r] × (1 + r)
   */
  static sipFutureValue(monthlyInvestment, annualRate, years) {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
      return monthlyInvestment * months;
    }
    
    return monthlyInvestment * 
           ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
           (1 + monthlyRate);
  }

  /**
   * Calculate inflation-adjusted future goal
   */
  static inflationAdjustedGoal(currentGoal, inflationRate, years) {
    return currentGoal * Math.pow(1 + inflationRate, years);
  }

  /**
   * Calculate required monthly SIP for a goal
   */
  static requiredMonthlySIP(futureValue, annualRate, years) {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
      return futureValue / months;
    }
    
    return futureValue / 
           (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
           (1 + monthlyRate));
  }

  /**
   * Calculate emergency fund coverage in months
   */
  static emergencyFundCoverage(liquidAssets, monthlyExpenses) {
    if (monthlyExpenses === 0) return 0;
    return liquidAssets / monthlyExpenses;
  }

  /**
   * Calculate debt-to-income ratio
   */
  static debtToIncomeRatio(monthlyDebtPayments, monthlyIncome) {
    if (monthlyIncome === 0) return 0;
    return (monthlyDebtPayments / monthlyIncome) * 100;
  }

  /**
   * Calculate savings rate
   */
  static savingsRate(monthlySavings, monthlyIncome) {
    if (monthlyIncome === 0) return 0;
    return (monthlySavings / monthlyIncome) * 100;
  }

  /**
   * Calculate portfolio expected return based on allocation
   */
  static portfolioExpectedReturn(allocation, returns) {
    let expectedReturn = 0;
    for (const assetClass in allocation) {
      const weight = allocation[assetClass] / 100;
      const returnRate = returns[assetClass] || 0;
      expectedReturn += weight * returnRate;
    }
    return expectedReturn;
  }

  /**
   * Calculate goal funding percentage
   */
  static goalFundingPercentage(projectedCorpus, requiredCorpus) {
    if (requiredCorpus === 0) return 100;
    return Math.min((projectedCorpus / requiredCorpus) * 100, 100);
  }

  /**
   * Calculate life insurance requirement (Human Life Value method)
   */
  static insuranceRequirement(annualIncome, yearsToRetirement, dependents, existingLiabilities) {
    // Simplified calculation: 10-15x annual income + liabilities
    const multiplier = dependents > 0 ? 15 : 10;
    return (annualIncome * multiplier) + existingLiabilities;
  }

  /**
   * Calculate EMI (Equated Monthly Installment)
   */
  static calculateEMI(principal, annualRate, tenureYears) {
    const monthlyRate = annualRate / 12 / 100;
    const months = tenureYears * 12;
    
    if (monthlyRate === 0) {
      return principal / months;
    }
    
    return principal * monthlyRate * 
           Math.pow(1 + monthlyRate, months) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }

  /**
   * Calculate tax liability estimate (simplified)
   */
  static estimateTaxLiability(annualIncome, regime = 'new') {
    // Simplified Indian tax calculation for demonstration
    let tax = 0;
    let income = annualIncome;
    
    if (regime === 'new') {
      // New regime slabs (2024-25 example)
      if (income > 300000) tax += (Math.min(income, 600000) - 300000) * 0.05;
      if (income > 600000) tax += (Math.min(income, 900000) - 600000) * 0.10;
      if (income > 900000) tax += (Math.min(income, 1200000) - 900000) * 0.15;
      if (income > 1200000) tax += (Math.min(income, 1500000) - 1200000) * 0.20;
      if (income > 1500000) tax += (income - 1500000) * 0.30;
    }
    
    return tax;
  }

  /**
   * Calculate potential tax savings
   */
  static potentialTaxSavings(currentInvestments, taxSavingLimit = 150000) {
    const potential = taxSavingLimit - currentInvestments;
    return Math.max(0, potential);
  }

  /**
   * Project goal corpus with current strategy
   */
  static projectGoalCorpus(currentCorpus, monthlySIP, expectedReturn, yearsRemaining) {
    const futureValueOfCurrent = this.futureValue(currentCorpus, expectedReturn, yearsRemaining);
    const futureValueOfSIP = this.sipFutureValue(monthlySIP, expectedReturn, yearsRemaining);
    return futureValueOfCurrent + futureValueOfSIP;
  }

  /**
   * Calculate concentration risk (Herfindahl Index)
   */
  static concentrationRisk(allocations) {
    let herfindahl = 0;
    for (const allocation of allocations) {
      const weight = allocation / 100;
      herfindahl += weight * weight;
    }
    return herfindahl * 100; // Return as percentage
  }
}

export default FinancialEngine;
