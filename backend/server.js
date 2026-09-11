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

// Routes
app.use('/api/client', clientRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/report', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinAuditX API is running' });
});

app.listen(PORT, () => {
  console.log(`FinAuditX Backend running on http://localhost:${PORT}`);
});

export default app;
