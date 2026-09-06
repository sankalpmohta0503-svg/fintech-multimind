# FinAuditX - Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### Step 1: Install Dependencies (First Time Only)
```bash
npm install
```
*This installs all required packages for both frontend and backend*

### Step 2: Start the Application
```bash
npm run dev
```
*This starts both backend (port 3001) and frontend (port 5173) concurrently*

### Step 3: Open Your Browser
Navigate to: **http://localhost:5173**

**That's it! FinAuditX is now running.**

---

## 🎯 What You'll See

1. **Executive Dashboard** - Opens automatically
   - Financial Health Score: **61/100**
   - **9 findings** detected (3 critical, 4 warnings, 2 opportunities)
   - Complete financial snapshot
   - 4 goals with funding status

2. **Demo Client**: Rahul Sharma
   - IT Professional, Age 38
   - Monthly Income: ₹2.5L
   - Financial issues intentionally included for demonstration

---

## 📱 Navigate the Application

Use the **sidebar menu** on the left to explore:

1. **Dashboard** - Overview and health score
2. **Client Profile** - Complete financial information
3. **Financial Audit** - Automated findings (Click here first!)
4. **Goals** - Trajectory analysis with charts
5. **Portfolio** - Asset allocation analysis
6. **What-If Simulator** - Test financial scenarios
7. **Recommendations** - Explainable action items
8. **Advisor Report** - Print-ready documentation

---

## 🎬 3-Minute Demo Flow

### For Judges/Evaluators:

**1. Dashboard (30 seconds)**
- Note the health score: 61/100
- See 9 findings detected
- View financial snapshot

**2. Financial Audit (45 seconds)**
- Click "Financial Audit" in sidebar
- See 3 critical findings automatically discovered
- Click a critical finding to expand
- Show evidence, impact, and recommendations

**3. Goals (30 seconds)**
- Click "Goals" in sidebar
- Select "Retirement" goal
- Show trajectory chart: Current (red) vs Required (green)
- Point out 28% funding vs 100% needed

**4. What-If Simulator (60 seconds)**
- Click "What-If Simulator"
- Click "Increase Monthly Investment" preset
- Show before/after comparison:
  - Health Score: 61 → 81
  - Goal Gap reduced by ₹51L
  - Critical findings: 3 → 0

**5. Recommendations (45 seconds)**
- Click "Recommendations"
- Expand a critical recommendation
- Show What/Why/Evidence/Impact structure
- Point out action steps and timeframe

**Key Message**: "FinAuditX doesn't just show data—it discovers problems, explains why they matter, tests solutions, and provides evidence-backed recommendations."

---

## 🔍 Key Features to Highlight

### 1. Automated Discovery
- System automatically finds 9 financial issues
- No manual analysis required
- Rule-based, explainable logic

### 2. Intelligent Analysis
- 8-dimension health scoring
- Goal trajectory projections
- Risk-portfolio alignment
- Emergency fund adequacy

### 3. What-If Simulation
- Real-time scenario testing
- Before/after comparison
- Impact on health score, goals, findings
- 5 preset scenarios + custom inputs

### 4. Explainable Recommendations
- Every recommendation includes:
  - What to do
  - Why it matters
  - Supporting evidence
  - Expected impact
  - Trade-offs to consider
  - Action steps
  - Timeframe

### 5. Professional Output
- Advisor-ready reports
- Print functionality
- Evidence-backed documentation

---

## 📊 Demo Client Details

**Rahul Sharma** - IT Professional, 38 years, Bangalore

**Intentional Issues (for demonstration):**
- ❌ Retirement 28% funded (need 100%)
- ❌ Emergency fund: 2.7 months (need 6)
- ❌ Equity: 72% (should be 45-65% for Moderate risk)
- ❌ Life insurance: ₹50L (need ₹4.68Cr)
- 💡 Tax opportunity: ₹70K unutilized

**Financial Health Score: 61/100** (Fair)

---

## 🛠️ Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173

# Then restart
npm run dev
```

### Frontend Not Loading?
```bash
# Install frontend dependencies
cd frontend
npm install
cd ..
npm run dev:frontend
```

### Backend Not Working?
```bash
# Install backend dependencies
cd backend
npm install
cd ..
npm run dev:backend
```

### Clear Cache and Reinstall?
```bash
# Remove all dependencies
rm -rf node_modules frontend/node_modules backend/node_modules

# Reinstall
npm install
```

---

## 🎓 Understanding the Architecture

### Frontend (React + Vite)
- **Port**: 5173
- **Tech**: React 18, Tailwind CSS, Recharts
- **Pages**: 8 main screens
- **Components**: Reusable UI elements

### Backend (Node.js + Express)
- **Port**: 3001
- **Tech**: Express, CORS
- **Engines**: 7 financial calculation engines
- **Routes**: 10+ API endpoints

### Data Flow
```
User → Frontend (React)
  ↓ API Call
Backend (Express)
  ↓ Process
Financial Engines (Calculate)
  ↓ Response
Frontend (Display)
```

---

## 📈 API Endpoints (For Testing)

```bash
# Health check
curl http://localhost:3001/api/health

# Get health score
curl http://localhost:3001/api/report/health-score

# Get audit results
curl http://localhost:3001/api/audit

# Get goals analysis
curl http://localhost:3001/api/goals

# Get recommendations
curl http://localhost:3001/api/recommendations
```

---

## 💡 Tips for Best Demonstration

1. **Start with Dashboard** - Shows immediate value
2. **Highlight Automation** - "9 findings detected automatically"
3. **Show Evidence** - Expand findings to show calculations
4. **Use Simulator** - Most impressive feature for judges
5. **Explain Structure** - What/Why/Evidence/Impact
6. **Emphasize Advisor Control** - System assists, doesn't replace

---

## 🎯 Key Talking Points

### For Judges
- ✅ "Automated financial audit across 8 dimensions"
- ✅ "Discovered 9 issues automatically without manual input"
- ✅ "Every recommendation backed by evidence and calculations"
- ✅ "Real-time what-if simulation with before/after comparison"
- ✅ "Deterministic AI - explainable, not black-box"
- ✅ "Advisor retains control, system provides intelligence"

### For Technical Evaluation
- ✅ "Full-stack React + Node.js architecture"
- ✅ "7 financial calculation engines"
- ✅ "Rule-based, transparent algorithms"
- ✅ "10+ RESTful API endpoints"
- ✅ "Recharts for data visualization"
- ✅ "Responsive, professional UI with Tailwind CSS"

---

## 📝 Additional Resources

- **README.md** - Comprehensive documentation
- **PROJECT_SUMMARY.md** - Detailed completion report
- **Source Code** - Well-organized in frontend/ and backend/

---

## ✨ Success Checklist

Before your demo, verify:

- [ ] Application starts without errors (`npm run dev`)
- [ ] Dashboard loads and shows health score 61
- [ ] Financial Audit shows 9 findings
- [ ] Goals page displays trajectory chart
- [ ] Simulator runs and shows before/after
- [ ] Recommendations page loads with explainable structure
- [ ] Report generates successfully

---

**FinAuditX is ready! Good luck with your presentation! 🚀**

---

*For questions or issues, refer to README.md or PROJECT_SUMMARY.md*
