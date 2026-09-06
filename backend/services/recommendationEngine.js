/**
 * Recommendation Engine - Generate explainable recommendations
 * What / Why / Evidence / Impact / Trade-off / Confidence structure
 */

export class RecommendationEngine {
  /**
   * Generate all recommendations
   */
  static generateRecommendations(clientData, auditFindings, healthScore, goalAnalysis) {
    const recommendations = [];

    // Generate recommendations based on audit findings
    for (const finding of auditFindings.findings) {
      if (finding.severity === 'critical' || finding.severity === 'warning') {
        const recommendation = this.createRecommendationFromFinding(finding, clientData);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    // Generate opportunity recommendations
    for (const finding of auditFindings.findings) {
      if (finding.severity === 'opportunity') {
        const recommendation = this.createOpportunityRecommendation(finding, clientData);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    // Prioritize recommendations
    const prioritized = this.prioritizeRecommendations(recommendations, clientData, healthScore);

    return {
      recommendations: prioritized,
      summary: this.generateRecommendationSummary(prioritized)
    };
  }

  /**
   * Create recommendation from audit finding
   */
  static createRecommendationFromFinding(finding, clientData) {
    const recommendation = {
      id: `rec_${finding.id}`,
      category: finding.category,
      priority: this.determinePriority(finding),
      title: finding.recommendation || finding.title,
      what: '',
      why: '',
      evidence: finding.evidence,
      expectedImpact: '',
      tradeoffs: [],
      confidence: 'high',
      actionSteps: [],
      estimatedTimeframe: '',
      disclaimer: finding.disclaimer
    };

    // Customize based on category
    switch (finding.category) {
      case 'Emergency Fund':
        return this.createEmergencyFundRecommendation(finding, clientData, recommendation);
      
      case 'Goal Funding':
        return this.createGoalFundingRecommendation(finding, clientData, recommendation);
      
      case 'Debt Health':
        return this.createDebtRecommendation(finding, clientData, recommendation);
      
      case 'Risk Alignment':
        return this.createRiskAlignmentRecommendation(finding, clientData, recommendation);
      
      case 'Portfolio Concentration':
        return this.createDiversificationRecommendation(finding, clientData, recommendation);
      
      case 'Insurance Coverage':
        return this.createInsuranceRecommendation(finding, clientData, recommendation);
      
      case 'Liquidity':
        return this.createLiquidityRecommendation(finding, clientData, recommendation);
      
      default:
        return null;
    }
  }

  /**
   * Create emergency fund recommendation
   */
  static createEmergencyFundRecommendation(finding, clientData, recommendation) {
    const shortfall = finding.evidence.shortfall;
    const monthlyTarget = Math.round(shortfall / 6); // Build over 6 months

    recommendation.what = `Build emergency fund to ₹${(shortfall / 100000).toFixed(1)}L (${finding.evidence.recommended} months of expenses)`;
    recommendation.why = `Current emergency coverage of ${finding.evidence.emergencyMonths} months leaves you vulnerable to unexpected expenses like medical emergencies or job loss`;
    recommendation.expectedImpact = `Achieve financial security baseline with ${finding.evidence.recommended} months of expense coverage`;
    recommendation.tradeoffs = [
      'Temporarily reduces available capital for investment growth',
      'Liquid emergency fund typically earns lower returns than equity investments'
    ];
    recommendation.confidence = 'high';
    recommendation.actionSteps = [
      `Set aside ₹${(monthlyTarget / 1000).toFixed(0)}K per month for emergency fund`,
      'Keep emergency fund in high-interest savings account or liquid fund',
      'Do not use emergency fund for planned expenses or investments'
    ];
    recommendation.estimatedTimeframe = '6-12 months';

    return recommendation;
  }

  /**
   * Create goal funding recommendation
   */
  static createGoalFundingRecommendation(finding, clientData, recommendation) {
    const gap = finding.evidence.gap;
    const yearsRemaining = finding.evidence.yearsRemaining;
    const additionalSIP = Math.round(gap / (yearsRemaining * 12));

    recommendation.what = `Increase monthly investment by ₹${(additionalSIP / 1000).toFixed(0)}K to close funding gap`;
    recommendation.why = `Current trajectory will result in a shortfall of ₹${(gap / 100000).toFixed(0)}L for ${finding.title}`;
    recommendation.expectedImpact = `Achieve full funding for ${finding.title} by maintaining increased contribution`;
    recommendation.tradeoffs = [
      'Requires higher monthly commitment',
      'May impact other discretionary spending'
    ];
    recommendation.confidence = 'high';
    recommendation.actionSteps = [
      `Start additional SIP of ₹${(additionalSIP / 1000).toFixed(0)}K per month`,
      'Choose appropriate investment vehicle based on time horizon',
      'Review progress annually and adjust if needed'
    ];
    recommendation.estimatedTimeframe = `${yearsRemaining} years`;

    return recommendation;
  }

  /**
   * Create debt recommendation
   */
  static createDebtRecommendation(finding, clientData, recommendation) {
    const dti = finding.evidence.dti;
    const targetDTI = 40;
    const monthlyReduction = Math.round((dti - targetDTI) / 100 * clientData.monthlyIncome);

    recommendation.what = `Reduce debt burden to bring DTI below ${targetDTI}%`;
    recommendation.why = `Current DTI of ${dti}% severely constrains your ability to save and invest for goals`;
    recommendation.expectedImpact = `Free up ₹${(monthlyReduction / 1000).toFixed(0)}K per month for savings and investments`;
    recommendation.tradeoffs = [
      'Requires dedicating extra funds to debt repayment',
      'Short-term reduction in investment contributions'
    ];
    recommendation.confidence = 'high';
    recommendation.actionSteps = [
      'Prioritize high-interest debt (credit cards, personal loans)',
      'Consider debt consolidation if applicable',
      'Avoid taking on new debt during repayment period',
      'Apply any bonuses or windfalls to debt reduction'
    ];
    recommendation.estimatedTimeframe = '12-24 months';

    return recommendation;
  }

  /**
   * Create risk alignment recommendation
   */
  static createRiskAlignmentRecommendation(finding, clientData, recommendation) {
    const current = finding.evidence.equityAllocation;
    const recommended = finding.evidence.recommendedRange;

    if (current > parseInt(recommended)) {
      // Too aggressive
      recommendation.what = `Rebalance portfolio to ${recommended} equity allocation`;
      recommendation.why = `Current ${current}% equity allocation exceeds your ${finding.evidence.riskProfile} risk tolerance, exposing you to unnecessary volatility`;
      recommendation.expectedImpact = `Reduce portfolio volatility and better align with your risk comfort level`;
      recommendation.tradeoffs = [
        'Potential reduction in long-term growth rate',
        'May miss some upside during strong equity markets'
      ];
    } else {
      // Too conservative
      recommendation.what = `Increase equity allocation to ${recommended}`;
      recommendation.why = `Current ${current}% equity allocation is below your ${finding.evidence.riskProfile} risk capacity, potentially limiting growth`;
      recommendation.expectedImpact = `Enhance long-term growth potential while staying within risk tolerance`;
      recommendation.tradeoffs = [
        'Increased short-term volatility',
        'Requires comfort with market fluctuations'
      ];
    }

    recommendation.confidence = 'high';
    recommendation.actionSteps = [
      'Gradually rebalance over 3-6 months',
      'Use new investments to achieve target allocation',
      'Review allocation quarterly',
      'Rebalance when deviation exceeds 5%'
    ];
    recommendation.estimatedTimeframe = '3-6 months';

    return recommendation;
  }

  /**
   * Create diversification recommendation
   */
  static createDiversificationRecommendation(finding, clientData, recommendation) {
    recommendation.what = 'Diversify portfolio across multiple asset classes';
    recommendation.why = 'High concentration risk exposes portfolio to asset-class specific downturns';
    recommendation.expectedImpact = 'Reduce portfolio volatility and improve risk-adjusted returns';
    recommendation.tradeoffs = [
      'May reduce returns during strong performance of concentrated asset',
      'Requires managing multiple investments'
    ];
    recommendation.confidence = 'high';
    recommendation.actionSteps = [
      'Gradually reduce over-concentration',
      'Add uncorrelated asset classes',
      'Maintain diversification through rebalancing',
      'Consider index funds for automatic diversification'
    ];
    recommendation.estimatedTimeframe = '6-12 months';

    return recommendation;
  }

  /**
   * Create insurance recommendation
   */
  static createInsuranceRecommendation(finding, clientData, recommendation) {
    const gap = finding.evidence.gap;

    recommendation.what = `Increase life insurance coverage by ₹${(gap / 100000).toFixed(0)}L`;
    recommendation.why = `Current coverage leaves dependents with ${finding.evidence.coverageRatio}% of estimated financial protection need`;
    recommendation.expectedImpact = `Provide adequate financial security for dependents in case of unforeseen events`;
    recommendation.tradeoffs = [
      'Additional monthly premium expense',
      'Premium increases with age and health conditions'
    ];
    recommendation.confidence = 'medium';
    recommendation.actionSteps = [
      'Evaluate term insurance options for cost-effectiveness',
      'Get quotes from multiple insurers',
      'Complete health checkup if required',
      'Review coverage every 3-5 years'
    ];
    recommendation.estimatedTimeframe = '1-2 months';

    return recommendation;
  }

  /**
   * Create liquidity recommendation
   */
  static createLiquidityRecommendation(finding, clientData, recommendation) {
    recommendation.what = 'Increase liquid assets for short-term goals';
    recommendation.why = 'Short-term goals may require liquidating long-term investments at unfavorable times';
    recommendation.expectedImpact = 'Avoid forced selling of growth investments';
    recommendation.tradeoffs = [
      'Lower returns on liquid assets',
      'Opportunity cost of not being fully invested'
    ];
    recommendation.confidence = 'medium';
    recommendation.actionSteps = [
      'Move funds for goals within 2 years to debt/liquid funds',
      'Create separate buckets for different time horizons',
      'Review goal timelines annually'
    ];
    recommendation.estimatedTimeframe = '3-6 months';

    return recommendation;
  }

  /**
   * Create opportunity recommendation
   */
  static createOpportunityRecommendation(finding, clientData) {
    if (finding.category === 'Tax Optimization') {
      return {
        id: `rec_${finding.id}`,
        category: finding.category,
        priority: 'medium',
        title: finding.title,
        what: finding.recommendation,
        why: 'Unutilized tax-saving limits represent missed savings',
        evidence: finding.evidence,
        expectedImpact: finding.impact,
        tradeoffs: [
          'Most tax-saving investments have 3-year lock-in',
          'Limited liquidity during lock-in period'
        ],
        confidence: 'medium',
        actionSteps: [
          'Review Section 80C eligible investments (PPF, ELSS, EPF)',
          'Consider Section 80D for health insurance',
          'Consult tax advisor for personalized strategy',
          'Ensure investments align with financial goals'
        ],
        estimatedTimeframe: 'Before financial year end',
        disclaimer: finding.disclaimer
      };
    }

    return null;
  }

  /**
   * Determine priority level
   */
  static determinePriority(finding) {
    if (finding.severity === 'critical') return 'critical';
    if (finding.severity === 'warning') return 'high';
    if (finding.severity === 'opportunity') return 'medium';
    return 'low';
  }

  /**
   * Prioritize recommendations
   */
  static prioritizeRecommendations(recommendations, clientData, healthScore) {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return recommendations.sort((a, b) => {
      // First by priority level
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      // Then by impact (emergency fund and debt come first)
      const categoryPriority = {
        'Emergency Fund': 5,
        'Debt Health': 4,
        'Goal Funding': 3,
        'Insurance Coverage': 2,
        'Risk Alignment': 1
      };

      return (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0);
    });
  }

  /**
   * Generate recommendation summary
   */
  static generateRecommendationSummary(recommendations) {
    const byPriority = {
      critical: recommendations.filter(r => r.priority === 'critical').length,
      high: recommendations.filter(r => r.priority === 'high').length,
      medium: recommendations.filter(r => r.priority === 'medium').length,
      low: recommendations.filter(r => r.priority === 'low').length
    };

    const categories = [...new Set(recommendations.map(r => r.category))];

    return {
      total: recommendations.length,
      byPriority,
      categories,
      message: this.getSummaryMessage(byPriority)
    };
  }

  /**
   * Get summary message
   */
  static getSummaryMessage(byPriority) {
    if (byPriority.critical > 0) {
      return `${byPriority.critical} critical action${byPriority.critical > 1 ? 's' : ''} requiring immediate attention`;
    } else if (byPriority.high > 0) {
      return `${byPriority.high} high-priority recommendation${byPriority.high > 1 ? 's' : ''} identified`;
    } else if (byPriority.medium > 0) {
      return `${byPriority.medium} optimization opportunit${byPriority.medium > 1 ? 'ies' : 'y'} available`;
    } else {
      return 'Financial plan is generally well-structured';
    }
  }
}

export default RecommendationEngine;
