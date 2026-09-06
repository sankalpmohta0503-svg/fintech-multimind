# FinAuditX

**Intelligent Financial Advisory & Audit System for Data-Driven Decision Support**

> From Financial Data to Explainable Decisions

FinAuditX is an intelligent financial audit and decision-support platform for advisors that automatically consolidates client information, audits financial plans, detects gaps and risks, and provides explainable recommendations.

## 🎯 Core Workflow

**Consolidate → Audit → Detect → Simulate → Explain → Decide**

## ✨ Key Features

### 1. **Executive Dashboard**
- 8-dimension Financial Health Score with animated circular gauge (61/100 for demo client)
- Real-time critical insights with severity indicators
- Comprehensive financial snapshot (8 key metrics)
- Goal health tracking with funding percentages
- Quick action buttons for simulation, recommendations, and reports

### 2. **Automated Financial Audit**
- **9 automated findings detected** for demo client:
  - 3 Critical issues (Retirement gap, Emergency fund, Insurance shortfall)
  - 4 Warnings (Goal funding gaps, Liquidity mismatch)
  - 2 Opportunities (Risk rebalancing, Tax savings)
- Category-based filtering (Critical, Warning, Opportunity, Healthy)
- Expandable finding cards with evidence, impact, and recommendations
- "Why am I seeing this?" explainability feature

### 3. **Goal Analyzer**
- Interactive goal selection and detailed analysis
- **Trajectory projection charts** showing current vs required paths
- Year-by-year corpus visualization using Recharts
- Funding gap calculation with additional SIP recommendations
- Inflation-adjusted targets and expected returns

### 4. **What-If Simulator** ⚡
- Real-time financial scenario testing
- Interactive sliders for:
  - Monthly investment increase
  - Portfolio rebalancing (Equity/Debt/Gold/Cash)
  - Emergency fund additions
  - Debt reduction
  - Insurance increases
- **5 Preset Scenarios:**
  - Increase Monthly Investment
  - Balanced Portfolio
  - Accelerate Debt Repayment
  - Build Emergency Fund
  - Extend Retirement Age
- **Before/After Comparison:**
  - Health Score: 61 → 81
  - Goal Readiness: 42% → 87%
  - Critical Findings: 3 → 0
  - Dimension-level impact analysis
  - Overall impact assessment (Positive/Negative/Neutral)

### 5. **Explainable Recommendations** 💡
- Priority-ranked recommendations (Critical → High → Medium → Low)
- **What/Why/Evidence/Impact/Tradeoffs** structure
- Action steps with timeframes (1-2 months to 12-24 months)
- Confidence levels (High/Medium/Low)
- Evidence-backed with specific financial data
- Advisor retains final decision control

### 6. **Client Financial Profile**
- Complete personal information display
- Income/Expenses breakdown
- Assets overview (₹55L total for demo client)
- Liabilities with EMI details (₹18L total debt)
- Insurance coverage summary
- Financial goals with priorities
- Portfolio allocation visualization

### 7. **Advisor Report** 📄
- Print-ready professional format
- Executive summary with health score
- Financial snapshot
- Health score dimension breakdown
- Critical findings and recommendations
- Advisor notes for client discussion
- Comprehensive decision-support documentation

## 🎨 Design Highlights

- **Premium Fintech UI**: Professional, modern design inspired by institutional wealth management platforms
- **Animated Components**: Smooth transitions, circular gauges, progress bars
- **Severity-Based Coloring**: Visual distinction between critical (red), warnings (amber), opportunities (yellow), and healthy (green) states
- **Responsive Layout**: Optimized for desktop/laptop presentation
- **Collapsible Sidebar**: Clean navigation with 8 main sections
- **Indian Financial Context**: ₹ currency, Cr/L/K formatting, SIP terminology

## 🧠 Financial Intelligence

### Deterministic Calculation Engines

1. **FinancialEngine**: Core formulas (FV, SIP, inflation, DTI, insurance, EMI)
2. **ScoringEngine**: 8-dimension weighted health scoring
3. **AuditEngine**: Rule-based findings detection across 8 categories
4. **GoalEngine**: Trajectory projection and funding gap analysis
5. **SimulationEngine**: What-if scenario processing with comparison
6. **RecommendationEngine**: Priority-based explainable recommendations
7. **ReportEngine**: Advisor-ready report generation

### Scoring Dimensions (with weights)

- Cash Flow: 15%
- Liquidity: 10%
- Goal Readiness: 20%
- Risk Alignment: 15%
- Diversification: 10%
- Debt Health: 10%
- Protection: 10%
- Tax Efficiency: 10%

### Audit Categories

- Goal Funding Analysis
- Emergency Fund Adequacy
- Debt Health Assessment
- Risk-Portfolio Alignment
- Portfolio Concentration
- Insurance Coverage
- Liquidity Management
- Tax Optimization Opportunities

## 🚀 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Chart visualizations
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **Axios** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **ES Modules** - Modern JavaScript

### Key Libraries
- No external AI/ML dependencies
- Pure JavaScript/Node.js implementation
- Deterministic financial calculations
- Transparent, explainable algorithms

## 📦 Installation & Setup

```bash
# Install all dependencies (frontend + backend)
npm install

# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 5173
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 🎯 Demo Client

**Rahul Sharma** - IT Professional, Age 38, Bangalore

**Financial Profile:**
- Monthly Income: ₹2,50,000
- Monthly Expenses: ₹1,10,000
- Total Investments: ₹55,00,000
- Total Debt: ₹18,00,000
- Insurance: ₹50,00,000

**Intentional Issues (for audit demonstration):**
- ❌ Retirement only 28% funded (₹1.03Cr gap)
- ❌ Emergency fund covers only 2.7 months (need 6 months)
- ❌ Equity overconcentration at 72% (should be 45-65% for Moderate risk)
- ❌ Life insurance shortfall: ₹50L vs ₹4.68Cr required
- 💡 Tax-saving opportunity: ₹80K vs ₹1.5L limit

**Financial Health Score: 61/100** (Fair)

## 📊 API Endpoints

```
GET  /api/client                    - Client data
GET  /api/client/financial-summary  - Financial summary
GET  /api/audit                     - Complete audit
GET  /api/goals                     - Goal analysis
GET  /api/portfolio                 - Portfolio analysis
POST /api/simulation/run            - Run custom simulation
GET  /api/simulation/presets        - Get preset scenarios
GET  /api/recommendations           - Get recommendations
GET  /api/report                    - Generate advisor report
GET  /api/report/health-score       - Health score only
```

## 🎬 Demo Flow (3-5 Minutes)

1. **Start at Dashboard** - Immediately see Health Score 61/100, 9 findings detected
2. **Open Financial Audit** - Show automated discovery of 3 critical + 4 warnings + 2 opportunities
3. **Click Retirement Goal** - Demonstrate 28% funded vs 100% required trajectory chart
4. **Run What-If Simulation** - Increase monthly investment, show Health Score 61 → 81
5. **View Recommendations** - Show explainable What/Why/Evidence/Impact structure
6. **Generate Report** - Display advisor-ready professional documentation

## 🔍 Key Differentiators

### Traditional Tools vs FinAuditX

**Traditional**: Show data
**FinAuditX**: Understands situation → Audits plan → Identifies gaps → Tests alternatives → Explains recommendations

### Explainability First

Every recommendation includes:
- **What**: The recommended action
- **Why**: The reasoning
- **Evidence**: Supporting data
- **Impact**: Expected outcome
- **Trade-offs**: Potential downsides
- **Confidence**: Level of certainty
- **Action Steps**: How to implement
- **Timeframe**: Expected duration

### Advisor-Centric Design

- System provides decision support, NOT autonomous advice
- Advisor retains final judgment and client relationship
- Transparent calculations and assumptions
- Professional report generation
- Evidence-backed recommendations

## 🏗️ Project Structure

```
finauditx/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (StatCard, HealthScoreGauge, InsightCard)
│   │   ├── pages/           # 8 main screens (Dashboard, Audit, Goals, etc.)
│   │   ├── charts/          # Recharts components (GoalTrajectoryChart)
│   │   ├── layouts/         # Layout with sidebar navigation
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Formatters (currency, percentage, colors)
│   │   └── ...
│   └── ...
│
├── backend/
│   ├── routes/              # API endpoints (7 route modules)
│   ├── services/            # Business logic (7 engines)
│   │   ├── financialEngine.js
│   │   ├── scoringEngine.js
│   │   ├── auditEngine.js
│   │   ├── goalEngine.js
│   │   ├── simulationEngine.js
│   │   ├── recommendationEngine.js
│   │   └── reportEngine.js
│   ├── data/                # Demo client data
│   └── server.js
│
└── package.json             # Workspace configuration
```

## 🎓 Educational Value

FinAuditX demonstrates:

✅ **Deterministic AI** - Explainable rules, not black-box models
✅ **Financial Domain Logic** - Real calculations (FV, SIP, DTI, inflation)
✅ **Full-Stack Architecture** - Clean separation of concerns
✅ **Modern React Patterns** - Hooks, component composition, state management
✅ **RESTful API Design** - Standard endpoints and responses
✅ **Professional UI/UX** - Premium fintech design language
✅ **Data Visualization** - Meaningful charts and gauges
✅ **Responsive Design** - Desktop-optimized presentation

## ⚠️ Disclaimer

This is a **prototype for demonstration purposes**. 

- Not intended for production financial advisory without proper compliance review
- Calculations use simplified models and historical averages
- Tax rules and schemes require verification with current regulations
- All recommendations should be reviewed by qualified financial advisors
- Users should consult certified financial professionals for actual financial planning

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- React, Vite, Tailwind CSS, Recharts
- Node.js, Express
- Lucide React icons
- Modern web technologies

---

**FinAuditX** - See the Gap. Understand the Risk. Make the Better Decision.
