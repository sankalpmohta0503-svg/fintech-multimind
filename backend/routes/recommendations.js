/**
 * Recommendations routes - Handle recommendation generation
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';
import RecommendationEngine from '../services/recommendationEngine.js';
import AuditEngine from '../services/auditEngine.js';
import ScoringEngine from '../services/scoringEngine.js';
import GoalEngine from '../services/goalEngine.js';

const router = express.Router();

/**
 * GET /api/recommendations - Get all recommendations
 */
router.get('/', (req, res) => {
  try {
    // Run analyses
    const audit = AuditEngine.performAudit(demoClient);
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const goals = GoalEngine.analyzeGoals(demoClient);

    // Generate recommendations
    const recommendations = RecommendationEngine.generateRecommendations(
      demoClient,
      audit,
      healthScore,
      goals
    );

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations', message: error.message });
  }
});

/**
 * GET /api/recommendations/:id - Get specific recommendation
 */
router.get('/:id', (req, res) => {
  try {
    const audit = AuditEngine.performAudit(demoClient);
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const goals = GoalEngine.analyzeGoals(demoClient);

    const recommendations = RecommendationEngine.generateRecommendations(
      demoClient,
      audit,
      healthScore,
      goals
    );

    const recommendation = recommendations.recommendations.find(r => r.id === req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendation', message: error.message });
  }
});

/**
 * GET /api/recommendations/priority/:level - Get recommendations by priority
 */
router.get('/priority/:level', (req, res) => {
  try {
    const { level } = req.params;
    
    const audit = AuditEngine.performAudit(demoClient);
    const healthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const goals = GoalEngine.analyzeGoals(demoClient);

    const recommendations = RecommendationEngine.generateRecommendations(
      demoClient,
      audit,
      healthScore,
      goals
    );

    const filtered = recommendations.recommendations.filter(r => r.priority === level);

    res.json({
      priority: level,
      count: filtered.length,
      recommendations: filtered
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter recommendations', message: error.message });
  }
});

export default router;
