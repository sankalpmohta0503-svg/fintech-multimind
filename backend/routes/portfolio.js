/**
 * Portfolio routes - Handle portfolio analysis operations
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';
import ScoringEngine from '../services/scoringEngine.js';

const router = express.Router();

/**
 * GET /api/portfolio - Get portfolio analysis
 */
router.get('/', (req, res) => {
  try {
    const { portfolio, riskProfile, assets } = demoClient;
    
    // Calculate portfolio metrics
    const totalValue = Object.values(assets).reduce((sum, val) => sum + val, 0);
    
    const allocation = Object.entries(portfolio).map(([assetClass, percentage]) => ({
      assetClass,
      percentage,
      value: Math.round((percentage / 100) * totalValue)
    }));

    // Get risk alignment score
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const riskAlignmentScore = healthScore.dimensions.riskAlignment;
    const diversificationScore = healthScore.dimensions.diversification;

    const analysis = {
      currentAllocation: allocation,
      totalValue,
      riskProfile,
      riskAlignmentScore,
      diversificationScore,
      recommendations: []
    };

    // Add recommendations based on scores
    if (riskAlignmentScore.score < 70) {
      analysis.recommendations.push({
        type: 'risk_alignment',
        message: riskAlignmentScore.reason,
        priority: 'high'
      });
    }

    if (diversificationScore.score < 70) {
      analysis.recommendations.push({
        type: 'diversification',
        message: diversificationScore.reason,
        priority: 'medium'
      });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze portfolio', message: error.message });
  }
});

export default router;
