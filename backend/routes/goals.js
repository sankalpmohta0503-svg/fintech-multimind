/**
 * Goals routes - Handle goal analysis operations
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';
import GoalEngine from '../services/goalEngine.js';

const router = express.Router();

/**
 * GET /api/goals - Get all goals with analysis
 */
router.get('/', (req, res) => {
  try {
    const goalAnalysis = GoalEngine.analyzeGoals(demoClient);
    res.json(goalAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze goals', message: error.message });
  }
});

/**
 * GET /api/goals/:index - Get specific goal analysis
 */
router.get('/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    if (isNaN(index) || index < 0 || index >= demoClient.goals.length) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = demoClient.goals[index];
    const analyzed = GoalEngine.analyzeGoal(goal, demoClient.assumptions);
    
    res.json(analyzed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze goal', message: error.message });
  }
});

export default router;
