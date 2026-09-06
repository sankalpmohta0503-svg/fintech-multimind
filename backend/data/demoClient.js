/**
 * Demo Client Data - Rahul Sharma
 * Intentionally includes multiple financial issues for audit discovery:
 * - Retirement funding gap
 * - Emergency fund inadequacy (only 1.8 months)
 * - Equity overconcentration (72% vs moderate 45-65%)
 * - Insurance coverage gap
 * - High debt burden
 * - Tax-saving opportunity
 */

export const demoClient = {
  personalInfo: {
    name: 'Rahul Sharma',
    age: 38,
    occupation: 'IT Professional',
    location: 'Bangalore',
    dependents: 2,
    maritalStatus: 'Married'
  },

  riskProfile: 'Moderate',

  monthlyIncome: 250000,
  monthlyExpenses: 110000,

  assets: {
    cash: 100000,
    emergencyFund: 200000, // Only 1.8 months - ISSUE
    equity: 2200000, // 40% of investments - Overconcentrated
    mutualFunds: 1800000, // 32.7% - equity-heavy
    debt: 800000, // 14.5%
    gold: 450000, // 8.2%
    realEstate: 0,
    epf: 350000 // 6.4%
  },

  liabilities: {
    homeLoan: {
      outstanding: 1500000,
      emi: 18000,
      interestRate: 8.5,
      tenureRemaining: 12 // years
    },
    carLoan: {
      outstanding: 300000,
      emi: 8500,
      interestRate: 9.0,
      tenureRemaining: 3
    }
  },

  insurance: {
    life: 5000000, // Only ~2x annual income - ISSUE (should be 10-15x)
    health: 1000000,
    accidental: 500000
  },

  portfolio: {
    equity: 72, // Too high for moderate risk - ISSUE
    debt: 15,
    gold: 8,
    cash: 5,
    realEstate: 0
  },

  goals: [
    {
      name: 'Child Education',
      targetAmount: 3500000,
      yearsToGoal: 8,
      currentCorpus: 400000,
      monthlySIP: 15000,
      priority: 'high',
      assetClass: 'balanced'
    },
    {
      name: 'Home Upgrade',
      targetAmount: 2500000,
      yearsToGoal: 5,
      currentCorpus: 200000,
      monthlySIP: 12000,
      priority: 'medium',
      assetClass: 'balanced'
    },
    {
      name: 'Retirement',
      targetAmount: 40000000,
      yearsToGoal: 22,
      currentCorpus: 1200000,
      monthlySIP: 20000, // Not enough - ISSUE
      priority: 'high',
      assetClass: 'equity'
    },
    {
      name: 'Vacation Fund',
      targetAmount: 500000,
      yearsToGoal: 2,
      currentCorpus: 50000,
      monthlySIP: 8000,
      priority: 'low',
      assetClass: 'debt'
    }
  ],

  taxSavingInvestments: 80000, // Only ₹80K of ₹1.5L limit - ISSUE

  assumptions: {
    inflation: 0.06, // 6%
    returns: {
      equity: 0.12, // 12%
      debt: 0.07, // 7%
      gold: 0.08, // 8%
      balanced: 0.10, // 10%
      cash: 0.04 // 4%
    }
  }
};

export default demoClient;
