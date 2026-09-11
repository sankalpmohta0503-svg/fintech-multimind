import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clients.js';
import auditRoutes from './routes/audit.js';
import goalsRoutes from './routes/goals.js';
import portfolioRoutes from './routes/portfolio.js';
import simulationRoutes from './routes/simulation.js';
import recommendationsRoutes from './routes/recommendations.js';
import reportRoutes from './routes/reports.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes registration helper
const registerRoutes = (prefix = '') => {
  app.use(`${prefix}/client`, clientRoutes);
  app.use(`${prefix}/audit`, auditRoutes);
  app.use(`${prefix}/goals`, goalsRoutes);
  app.use(`${prefix}/portfolio`, portfolioRoutes);
  app.use(`${prefix}/simulation`, simulationRoutes);
  app.use(`${prefix}/recommendations`, recommendationsRoutes);
  app.use(`${prefix}/report`, reportRoutes);
  app.get(`${prefix}/health`, (req, res) => {
    res.json({ status: 'ok', message: 'FinAuditX API is running' });
  });
};

// Register for both standard /api and direct serverless invocation
registerRoutes('/api');
registerRoutes('');

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`FinAuditX Backend running on http://localhost:${PORT}`);
  });
}

export default app;
