/**
 * Audit routes - Handle financial audit operations
 */

import express from 'express';
import { demoClient } from '../data/demoClient.js';
import AuditEngine from '../services/auditEngine.js';

const router = express.Router();

/**
 * GET /api/audit - Perform financial audit
 */
router.get('/', (req, res) => {
  try {
    const auditResults = AuditEngine.performAudit(demoClient);
    res.json(auditResults);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform audit', message: error.message });
  }
});

/**
 * GET /api/audit/finding/:id - Get specific finding details
 */
router.get('/finding/:id', (req, res) => {
  try {
    const auditResults = AuditEngine.performAudit(demoClient);
    const finding = auditResults.findings.find(f => f.id === req.params.id);
    
    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    res.json(finding);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finding', message: error.message });
  }
});

export default router;
