/**
 * Client routes - Handle client data operations
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';

const router = express.Router();

/**
 * GET /api/client - Get client data
 */
router.get('/', (req, res) => {
  try {
    res.json(demoClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client data', message: error.message });
  }
});

/**
 * GET /api/client/financial-summary - Get financial summary
 */
router.get('/financial-summary', (req, res) => {
  try {
    const totalAssets = Object.values(demoClient.assets).reduce((sum, val) => sum + val, 0);
    const totalLiabilities = Object.values(demoClient.liabilities)
      .reduce((sum, val) => sum + (val.outstanding || 0), 0);
    const monthlyEMIs = Object.values(demoClient.liabilities)
      .reduce((sum, val) => sum + (val.emi || 0), 0);

    const summary = {
      personalInfo: demoClient.personalInfo,
      netWorth: totalAssets - totalLiabilities,
      monthlyIncome: demoClient.monthlyIncome,
      monthlyExpenses: demoClient.monthlyExpenses,
      monthlySurplus: demoClient.monthlyIncome - demoClient.monthlyExpenses,
      totalInvestments: totalAssets,
      totalDebt: totalLiabilities,
      monthlyEMIs,
      insuranceCoverage: demoClient.insurance.life,
      riskProfile: demoClient.riskProfile,
      goalCount: demoClient.goals.length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate financial summary', message: error.message });
  }
});

export default router;
