/**
 * API Service - Centralized API calls
 */

import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Client endpoints
  getClient: () => axios.get(`${API_BASE}/client`),
  getFinancialSummary: () => axios.get(`${API_BASE}/client/financial-summary`),

  // Audit endpoints
  getAudit: () => axios.get(`${API_BASE}/audit`),
  getFinding: (id) => axios.get(`${API_BASE}/audit/finding/${id}`),

  // Goal endpoints
  getGoals: () => axios.get(`${API_BASE}/goals`),
  getGoal: (index) => axios.get(`${API_BASE}/goals/${index}`),

  // Portfolio endpoints
  getPortfolio: () => axios.get(`${API_BASE}/portfolio`),

  // Simulation endpoints
  runSimulation: (modifications) => axios.post(`${API_BASE}/simulation/run`, { modifications }),
  getPresets: () => axios.get(`${API_BASE}/simulation/presets`),
  runPreset: (presetName) => axios.post(`${API_BASE}/simulation/preset/${presetName}`),

  // Recommendations endpoints
  getRecommendations: () => axios.get(`${API_BASE}/recommendations`),
  getRecommendation: (id) => axios.get(`${API_BASE}/recommendations/${id}`),
  getRecommendationsByPriority: (level) => axios.get(`${API_BASE}/recommendations/priority/${level}`),

  // Report endpoints
  getReport: () => axios.get(`${API_BASE}/report`),
  getReportWithSimulation: (simulationComparison) => 
    axios.post(`${API_BASE}/report/with-simulation`, { simulationComparison }),
  getHealthScore: () => axios.get(`${API_BASE}/report/health-score`)
};

export default api;
