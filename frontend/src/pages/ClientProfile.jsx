import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, Users, DollarSign, TrendingDown, Building, Shield } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';

const ClientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const response = await api.getClient();
      setClient(response.data);
    } catch (error) {
      console.error('Failed to load client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Client Financial Profile</h1>

      {/* Personal Information */}
      <div className="card">
        <h2 className="card-header">Personal Information</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <User className="text-primary-600" size={20} />
            <div>
              <div className="text-xs text-gray-600">Name</div>
              <div className="font-semibold">{client.personalInfo.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="text-primary-600" size={20} />
            <div>
              <div className="text-xs text-gray-600">Occupation</div>
              <div className="font-semibold">{client.personalInfo.occupation}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-primary-600" size={20} />
            <div>
              <div className="text-xs text-gray-600">Location</div>
              <div className="font-semibold">{client.personalInfo.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="text-primary-600" size={20} />
            <div>
              <div className="text-xs text-gray-600">Dependents</div>
              <div className="font-semibold">{client.personalInfo.dependents}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-primary-600 font-bold">
              {client.personalInfo.age}
            </div>
            <div>
              <div className="text-xs text-gray-600">Age</div>
              <div className="font-semibold">{client.personalInfo.age} years</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Risk Profile</div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {client.riskProfile}
            </span>
          </div>
        </div>
      </div>

      {/* Income & Expenses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="card-header">Income</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Income</span>
              <span className="font-semibold">{formatCurrency(client.monthlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Income</span>
              <span className="font-semibold">{formatCurrency(client.monthlyIncome * 12)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-header">Expenses</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Expenses</span>
              <span className="font-semibold">{formatCurrency(client.monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Surplus</span>
              <span className="font-semibold text-green-600">{formatCurrency(client.monthlyIncome - client.monthlyExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="card">
        <h2 className="card-header">Assets</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(client.assets).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(value)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Assets</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(Object.values(client.assets).reduce((sum, v) => sum + v, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Liabilities */}
      <div className="card">
        <h2 className="card-header">Liabilities</h2>
        <div className="space-y-3">
          {Object.entries(client.liabilities).map(([key, liability]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <span className="text-lg font-bold text-red-600">{formatCurrency(liability.outstanding)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600">Monthly EMI</div>
                  <div className="font-semibold">{formatCurrency(liability.emi)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Interest Rate</div>
                  <div className="font-semibold">{liability.interestRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Tenure Remaining</div>
                  <div className="font-semibold">{liability.tenureRemaining} years</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Debt</span>
            <span className="text-2xl font-bold text-red-600">
              {formatCurrency(Object.values(client.liabilities).reduce((sum, l) => sum + l.outstanding, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Insurance */}
      <div className="card">
        <h2 className="card-header">Insurance Coverage</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(client.insurance).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 capitalize mb-1">
                {key} Insurance
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="card">
        <h2 className="card-header">Financial Goals</h2>
        <div className="space-y-3">
          {client.goals.map((goal, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{goal.name}</h3>
                  <span className="text-xs text-gray-600 capitalize">{goal.priority} Priority</span>
                </div>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(goal.targetAmount)}</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600">Timeline</div>
                  <div className="font-semibold">{goal.yearsToGoal} years</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Current Corpus</div>
                  <div className="font-semibold">{formatCurrency(goal.currentCorpus)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Monthly SIP</div>
                  <div className="font-semibold">{formatCurrency(goal.monthlySIP)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Asset Class</div>
                  <div className="font-semibold capitalize">{goal.assetClass}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Allocation */}
      <div className="card">
        <h2 className="card-header">Portfolio Allocation</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(client.portfolio).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{value}%</div>
              <div className="text-sm text-gray-600 capitalize mt-1">{key}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
