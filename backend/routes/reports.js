/**
 * Reports routes - Handle report generation
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';
import ReportEngine from '../services/reportEngine.js';
import ScoringEngine from '../services/scoringEngine.js';
import AuditEngine from '../services/auditEngine.js';
import GoalEngine from '../services/goalEngine.js';
import RecommendationEngine from '../services/recommendationEngine.js';

const router = express.Router();

/**
 * GET /api/report - Generate complete advisor report
 */
router.get('/', (req, res) => {
  try {
    // Run all analyses
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const audit = AuditEngine.performAudit(demoClient);
    const goals = GoalEngine.analyzeGoals(demoClient);
    const recommendations = RecommendationEngine.generateRecommendations(
      demoClient,
      audit,
      healthScore,
      goals
    );

    // Generate report
    const report = ReportEngine.generateReport(
      demoClient,
      healthScore,
      audit,
      goals,
      recommendations
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report', message: error.message });
  }
});

/**
 * POST /api/report/with-simulation - Generate report with simulation results
 */
router.post('/with-simulation', (req, res) => {
  try {
    const { simulationComparison } = req.body;

    // Run all analyses
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const audit = AuditEngine.performAudit(demoClient);
    const goals = GoalEngine.analyzeGoals(demoClient);
    const recommendations = RecommendationEngine.generateRecommendations(
      demoClient,
      audit,
      healthScore,
      goals
    );

    // Generate report with simulation
    const report = ReportEngine.generateReport(
      demoClient,
      healthScore,
      audit,
      goals,
      recommendations,
      simulationComparison
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report with simulation', message: error.message });
  }
});

/**
 * GET /api/report/health-score - Get health score only
 */
router.get('/health-score', (req, res) => {
  try {
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    res.json(healthScore);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate health score', message: error.message });
  }
});

export default router;
