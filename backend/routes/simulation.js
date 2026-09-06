/**
 * Simulation routes - Handle what-if simulation operations
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';
import SimulationEngine from '../services/simulationEngine.js';
import ScoringEngine from '../services/scoringEngine.js';
import AuditEngine from '../services/auditEngine.js';
import GoalEngine from '../services/goalEngine.js';

const router = express.Router();

/**
 * POST /api/simulation/run - Run simulation with modifications
 */
router.post('/run', (req, res) => {
  try {
    const { modifications } = req.body;

    if (!modifications) {
      return res.status(400).json({ error: 'Modifications are required' });
    }

    // Get base scenario
    const baseHealthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const baseAudit = AuditEngine.performAudit(demoClient);
    const baseGoals = GoalEngine.analyzeGoals(demoClient);
    const baseMetrics = SimulationEngine.calculateKeyMetrics(demoClient);

    const baseScenario = {
      healthScore: baseHealthScore,
      audit: baseAudit,
      goals: baseGoals,
      metrics: baseMetrics
    };

    // Run simulation
    const simulatedScenario = SimulationEngine.runSimulation(demoClient, modifications);

    // Compare scenarios
    const comparison = SimulationEngine.compareScenarios(baseScenario, simulatedScenario);

    res.json({
      base: baseScenario,
      simulated: simulatedScenario,
      comparison
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run simulation', message: error.message });
  }
});

/**
 * GET /api/simulation/presets - Get preset scenarios
 */
router.get('/presets', (req, res) => {
  try {
    const presets = SimulationEngine.generatePresetScenarios(demoClient);
    res.json(presets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate presets', message: error.message });
  }
});

/**
 * POST /api/simulation/preset/:presetName - Run preset scenario
 */
router.post('/preset/:presetName', (req, res) => {
  try {
    const { presetName } = req.params;
    const presets = SimulationEngine.generatePresetScenarios(demoClient);
    
    const preset = presets[presetName];
    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    // Get base scenario
    const baseHealthScore = ScoringEngine.calculateFinancialHealth(demoClient);
    const baseAudit = AuditEngine.performAudit(demoClient);
    const baseGoals = GoalEngine.analyzeGoals(demoClient);
    const baseMetrics = SimulationEngine.calculateKeyMetrics(demoClient);

    const baseScenario = {
      healthScore: baseHealthScore,
      audit: baseAudit,
      goals: baseGoals,
      metrics: baseMetrics
    };

    // Run simulation with preset
    const simulatedScenario = SimulationEngine.runSimulation(demoClient, preset.modifications);

    // Compare scenarios
    const comparison = SimulationEngine.compareScenarios(baseScenario, simulatedScenario);

    res.json({
      presetName,
      presetDescription: preset.description,
      base: baseScenario,
      simulated: simulatedScenario,
      comparison
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run preset simulation', message: error.message });
  }
});

export default router;
