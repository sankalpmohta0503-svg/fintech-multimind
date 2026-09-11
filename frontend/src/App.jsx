import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import ClientProfile from './pages/ClientProfile';
import FinancialAudit from './pages/FinancialAudit';
import Goals from './pages/Goals';
import Portfolio from './pages/Portfolio';
import Simulator from './pages/Simulator';
import Recommendations from './pages/Recommendations';
import Report from './pages/Report';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <Routes>
        {/* Standalone Landing & Auth Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignIn />} />

        {/* Advisor Workspace Pages (Wrapped in Layout) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/profile" element={<Layout><ClientProfile /></Layout>} />
        <Route path="/audit" element={<Layout><FinancialAudit /></Layout>} />
        <Route path="/goals" element={<Layout><Goals /></Layout>} />
        <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
        <Route path="/simulator" element={<Layout><Simulator /></Layout>} />
        <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
        <Route path="/report" element={<Layout><Report /></Layout>} />
        <Route path="/reports" element={<Layout><Report /></Layout>} />
        <Route path="/about" element={<Layout><AboutUs /></Layout>} />
        <Route path="/contact" element={<Layout><ContactUs /></Layout>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
