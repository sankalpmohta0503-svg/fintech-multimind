/**
 * Report Engine - Generate advisor-ready reports
 */

export class ReportEngine {
  /**
   * Generate complete advisor report
   */
  static generateReport(clientData, healthScore, audit, goals, recommendations, simulation = null) {
    const report = {
      metadata: this.generateMetadata(clientData),
      executive: this.generateExecutiveSummary(healthScore, audit, goals),
      clientOverview: this.generateClientOverview(clientData),
      financialSnapshot: this.generateFinancialSnapshot(clientData),
      healthScore: this.formatHealthScore(healthScore),
      strengths: this.identifyStrengths(audit, healthScore),
      criticalFindings: this.formatCriticalFindings(audit),
      goalAnalysis: this.formatGoalAnalysis(goals),
      riskPortfolioAnalysis: this.formatRiskPortfolioAnalysis(clientData, audit),
      liquidityAnalysis: this.formatLiquidityAnalysis(audit),
      protectionAnalysis: this.formatProtectionAnalysis(audit),
      opportunities: this.formatOpportunities(audit),
      recommendations: this.formatRecommendations(recommendations),
      simulationResults: simulation ? this.formatSimulationResults(simulation) : null,
      expectedImpact: this.calculateExpectedImpact(recommendations, simulation),
      advisorNotes: this.generateAdvisorNotes(healthScore, audit, goals)
    };

    return report;
  }

  /**
   * Generate report metadata
   */
  static generateMetadata(clientData) {
    return {
      reportDate: new Date().toISOString(),
      clientName: clientData.personalInfo.name,
      reportType: 'Financial Plan Audit & Advisory Report',
      reportVersion: '1.0'
    };
  }

  /**
   * Generate executive summary
   */
  static generateExecutiveSummary(healthScore, audit, goals) {
    return {
      overallHealthScore: healthScore.overallScore,
      status: this.getHealthStatus(healthScore.overallScore),
      criticalIssues: audit.categorized.critical.length,
      warningItems: audit.categorized.warning.length,
      opportunities: audit.categorized.opportunity.length,
      goalsOnTrack: goals.summary.onTrack,
      goalsAtRisk: goals.summary.atRisk,
      summary: this.generateExecutiveText(healthScore, audit, goals)
    };
  }

  /**
   * Generate executive summary text
   */
  static generateExecutiveText(healthScore, audit, goals) {
    const score = healthScore.overallScore;
    let text = '';

    if (score >= 80) {
      text = 'The client maintains a strong financial position with solid fundamentals. ';
    } else if (score >= 70) {
      text = 'The client has a good financial foundation with room for improvement. ';
    } else if (score >= 60) {
      text = 'The client\'s financial plan shows moderate health with several areas requiring attention. ';
    } else {
      text = 'The client\'s financial plan requires significant improvement in multiple areas. ';
    }

    if (audit.categorized.critical.length > 0) {
      text += `${audit.categorized.critical.length} critical issue${audit.categorized.critical.length > 1 ? 's' : ''} require immediate action. `;
    }

    if (goals.summary.atRisk > 0) {
      text += `${goals.summary.atRisk} goal${goals.summary.atRisk > 1 ? 's are' : ' is'} at risk of underfunding. `;
    }

    if (audit.categorized.opportunity.length > 0) {
      text += `${audit.categorized.opportunity.length} optimization opportunit${audit.categorized.opportunity.length > 1 ? 'ies have' : 'y has'} been identified.`;
    }

    return text;
  }

  /**
   * Get health status label
   */
  static getHealthStatus(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Improvement';
    return 'Critical';
  }

  /**
   * Generate client overview
   */
  static generateClientOverview(clientData) {
    return {
      personal: clientData.personalInfo,
      riskProfile: clientData.riskProfile,
      financialGoals: clientData.goals.map(g => ({
        name: g.name,
        target: g.targetAmount,
        timeline: g.yearsToGoal,
        priority: g.priority
      }))
    };
  }

  /**
   * Generate financial snapshot
   */
  static generateFinancialSnapshot(clientData) {
    const totalAssets = Object.values(clientData.assets).reduce((sum, val) => sum + val, 0);
    const totalLiabilities = Object.values(clientData.liabilities)
      .reduce((sum, val) => sum + (val.outstanding || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    return {
      monthlyIncome: clientData.monthlyIncome,
      monthlyExpenses: clientData.monthlyExpenses,
      monthlySurplus: clientData.monthlyIncome - clientData.monthlyExpenses,
      totalInvestments: totalAssets,
      totalDebt: totalLiabilities,
      netWorth,
      insuranceCoverage: clientData.insurance.life || 0
    };
  }

  /**
   * Format health score
   */
  static formatHealthScore(healthScore) {
    return {
      overall: healthScore.overallScore,
      dimensions: Object.entries(healthScore.dimensions).map(([name, data]) => ({
        name,
        score: data.score,
        reason: data.reason,
        weight: this.getWeight(name)
      }))
    };
  }

  /**
   * Get dimension weight
   */
  static getWeight(dimension) {
    const weights = {
      cashFlow: 15,
      liquidity: 10,
      goalReadiness: 20,
      riskAlignment: 15,
      diversification: 10,
      debtHealth: 10,
      protection: 10,
      taxEfficiency: 10
    };
    return weights[dimension] || 0;
  }

  /**
   * Identify strengths
   */
  static identifyStrengths(audit, healthScore) {
    const strengths = [];

    // High-scoring dimensions
    for (const [dimension, data] of Object.entries(healthScore.dimensions)) {
      if (data.score >= 80) {
        strengths.push({
          area: this.formatDimensionName(dimension),
          score: data.score,
          description: data.reason
        });
      }
    }

    // Healthy findings
    for (const finding of audit.categorized.healthy) {
      strengths.push({
        area: finding.category,
        description: finding.description
      });
    }

    return strengths;
  }

  /**
   * Format dimension name
   */
  static formatDimensionName(dimension) {
    const names = {
      cashFlow: 'Cash Flow Management',
      liquidity: 'Liquidity Position',
      goalReadiness: 'Goal Readiness',
      riskAlignment: 'Risk Alignment',
      diversification: 'Portfolio Diversification',
      debtHealth: 'Debt Management',
      protection: 'Insurance Protection',
      taxEfficiency: 'Tax Efficiency'
    };
    return names[dimension] || dimension;
  }

  /**
   * Format critical findings
   */
  static formatCriticalFindings(audit) {
    return [...audit.categorized.critical, ...audit.categorized.warning].map(finding => ({
      severity: finding.severity,
      category: finding.category,
      title: finding.title,
      description: finding.description,
      evidence: finding.evidence,
      impact: finding.impact
    }));
  }

  /**
   * Format goal analysis
   */
  static formatGoalAnalysis(goals) {
    return {
      summary: goals.summary,
      goals: goals.goals.map(goal => ({
        name: goal.name,
        target: goal.targetAmount,
        timeline: goal.yearsToGoal,
        priority: goal.priority,
        status: goal.analysis.status,
        fundingPercentage: goal.analysis.fundingPercentage,
        projectedCorpus: goal.analysis.projectedCorpus,
        gap: goal.analysis.gap
      }))
    };
  }

  /**
   * Format risk/portfolio analysis
   */
  static formatRiskPortfolioAnalysis(clientData, audit) {
    const riskFindings = audit.findings.filter(f => 
      f.category === 'Risk Alignment' || f.category === 'Portfolio Concentration'
    );

    return {
      currentAllocation: clientData.portfolio,
      riskProfile: clientData.riskProfile,
      findings: riskFindings.map(f => ({
        title: f.title,
        description: f.description,
        recommendation: f.recommendation
      }))
    };
  }

  /**
   * Format liquidity analysis
   */
  static formatLiquidityAnalysis(audit) {
    const liquidityFindings = audit.findings.filter(f => 
      f.category === 'Emergency Fund' || f.category === 'Liquidity'
    );

    return liquidityFindings.map(f => ({
      title: f.title,
      description: f.description,
      evidence: f.evidence,
      recommendation: f.recommendation
    }));
  }

  /**
   * Format protection analysis
   */
  static formatProtectionAnalysis(audit) {
    const insuranceFindings = audit.findings.filter(f => 
      f.category === 'Insurance Coverage'
    );

    return insuranceFindings.map(f => ({
      title: f.title,
      description: f.description,
      evidence: f.evidence,
      recommendation: f.recommendation
    }));
  }

  /**
   * Format opportunities
   */
  static formatOpportunities(audit) {
    return audit.categorized.opportunity.map(finding => ({
      category: finding.category,
      title: finding.title,
      description: finding.description,
      potentialBenefit: finding.impact,
      recommendation: finding.recommendation,
      disclaimer: finding.disclaimer
    }));
  }

  /**
   * Format recommendations
   */
  static formatRecommendations(recommendations) {
    return {
      summary: recommendations.summary,
      recommendations: recommendations.recommendations.map(rec => ({
        priority: rec.priority,
        category: rec.category,
        title: rec.title,
        what: rec.what,
        why: rec.why,
        expectedImpact: rec.expectedImpact,
        tradeoffs: rec.tradeoffs,
        actionSteps: rec.actionSteps,
        timeframe: rec.estimatedTimeframe,
        confidence: rec.confidence
      }))
    };
  }

  /**
   * Format simulation results
   */
  static formatSimulationResults(simulation) {
    return {
      modifications: simulation.modifications,
      comparison: simulation.comparison,
      impact: simulation.comparison.overallImpact
    };
  }

  /**
   * Calculate expected impact
   */
  static calculateExpectedImpact(recommendations, simulation) {
    const impact = {
      financialHealth: 'Expected improvement based on recommendation implementation',
      goalReadiness: null,
      riskReduction: null,
      estimatedTimeToImplement: null
    };

    if (simulation && simulation.comparison) {
      impact.healthScoreChange = simulation.comparison.healthScore.delta;
      impact.goalReadiness = simulation.comparison.goalReadiness.delta;
    }

    // Estimate time to implement
    const timeframes = recommendations.recommendations.map(r => r.estimatedTimeframe);
    if (timeframes.length > 0) {
      impact.estimatedTimeToImplement = 'Varies by recommendation: from 1-2 months to 12-24 months';
    }

    return impact;
  }

  /**
   * Generate advisor notes
   */
  static generateAdvisorNotes(healthScore, audit, goals) {
    const notes = [];

    // Key discussion points
    notes.push({
      topic: 'Overall Financial Health',
      note: `Client has financial health score of ${healthScore.overallScore}/100. ` +
            `This indicates ${this.getHealthStatus(healthScore.overallScore).toLowerCase()} financial position.`
    });

    if (audit.categorized.critical.length > 0) {
      notes.push({
        topic: 'Critical Actions',
        note: `Discuss ${audit.categorized.critical.length} critical issue(s) requiring immediate attention. ` +
              `Prioritize these in client conversation.`
      });
    }

    if (goals.summary.atRisk > 0) {
      notes.push({
        topic: 'Goal Funding',
        note: `${goals.summary.atRisk} goal(s) currently at risk. ` +
              `Review contribution strategy and timelines with client.`
      });
    }

    notes.push({
      topic: 'Client Engagement',
      note: 'Review recommendations in order of priority. Ensure client understands trade-offs. ' +
            'Set realistic expectations for implementation timeline.'
    });

    return notes;
  }
}

export default ReportEngine;
