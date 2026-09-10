import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import ClientProfile from './pages/ClientProfile'
import FinancialAudit from './pages/FinancialAudit'
import Goals from './pages/Goals'
import Portfolio from './pages/Portfolio'
import Simulator from './pages/Simulator'
import Recommendations from './pages/Recommendations'
import Report from './pages/Report'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ClientProfile />} />
          <Route path="/audit" element={<FinancialAudit />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/report" element={<Report />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
