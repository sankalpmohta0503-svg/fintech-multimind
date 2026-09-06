import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getSeverityColor, getSeverityIcon } from '../utils/formatters';

const FinancialAudit = () => {
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [expandedFindings, setExpandedFindings] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const response = await api.getAudit();
      setAudit(response.data);
      // Auto-expand critical findings
      const criticalIds = response.data.categorized.critical.map(f => f.id);
      setExpandedFindings(new Set(criticalIds));
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFinding = (id) => {
    setExpandedFindings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="text-red-600" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600" size={24} />;
      case 'opportunity':
        return <Lightbulb className="text-yellow-600" size={24} />;
      case 'healthy':
        return <CheckCircle className="text-green-600" size={24} />;
      default:
        return <Info className="text-gray-600" size={24} />;
    }
  };

  const getCategoryTitle = (severity) => {
    switch (severity) {
      case 'critical':
        return 'Critical Issues';
      case 'warning':
        return 'Attention Required';
      case 'opportunity':
        return 'Opportunities';
      case 'healthy':
        return 'Strengths';
      default:
        return 'Findings';
    }
  };

  const getCategoryDescription = (severity) => {
    switch (severity) {
      case 'critical':
        return 'Immediate action required to address significant financial risks';
      case 'warning':
        return 'Important areas requiring attention for financial improvement';
      case 'opportunity':
        return 'Optimization opportunities to enhance financial health';
      case 'healthy':
        return 'Areas where the financial plan is performing well';
      default:
        return '';
    }
  };

  const getFilteredFindings = () => {
    if (!audit) return [];
    
    if (selectedCategory === 'all') {
      return audit.findings;
    }
    
    return audit.categorized[selectedCategory] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running financial audit...</p>
        </div>
      </div>
    );
  }

  const filteredFindings = getFilteredFindings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Plan Audit</h1>
        <p className="text-gray-600 mt-2">
          Automated analysis of financial gaps, risks, inefficiencies and opportunities
        </p>
      </div>

      {/* Audit Summary */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {audit.totalFindings} Findings Detected
            </h2>
            <p className="text-gray-700 mb-4">{audit.summary.message}</p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {getCategoryIcon('critical')}
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {audit.categorized.critical.length}
                  </div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getCategoryIcon('warning')}
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {audit.categorized.warning.length}
                  </div>
                  <div className="text-xs text-gray-600">Warnings</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getCategoryIcon('opportunity')}
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {audit.categorized.opportunity.length}
                  </div>
                  <div className="text-xs text-gray-600">Opportunities</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getCategoryIcon('healthy')}
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {audit.categorized.healthy.length}
                  </div>
                  <div className="text-xs text-gray-600">Healthy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({audit.totalFindings})
        </button>
        <button
          onClick={() => setSelectedCategory('critical')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Critical ({audit.categorized.critical.length})
        </button>
        <button
          onClick={() => setSelectedCategory('warning')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Warnings ({audit.categorized.warning.length})
        </button>
        <button
          onClick={() => setSelectedCategory('opportunity')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'opportunity'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          Opportunities ({audit.categorized.opportunity.length})
        </button>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => {
          const isExpanded = expandedFindings.has(finding.id);
          
          return (
            <div
              key={finding.id}
              className={`card border-2 transition-all ${getSeverityColor(finding.severity)}`}
            >
              {/* Finding Header */}
              <button
                onClick={() => toggleFinding(finding.id)}
                className="w-full flex items-start gap-4 text-left"
              >
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(finding.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                          {finding.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{finding.title}</h3>
                      <p className="text-sm opacity-90">{finding.description}</p>
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="flex-shrink-0 mt-1" size={20} />
                    ) : (
                      <ChevronDown className="flex-shrink-0 mt-1" size={20} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  {/* Evidence */}
                  {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>📊</span>
                        Evidence
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(finding.evidence).map(([key, value]) => (
                          <div key={key} className="bg-white bg-opacity-50 rounded p-2">
                            <div className="text-xs opacity-75 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="font-semibold">
                              {typeof value === 'number' && key.toLowerCase().includes('amount')
                                ? formatCurrency(value)
                                : typeof value === 'number' && (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('ratio'))
                                ? `${value}%`
                                : typeof value === 'number' && value > 1000
                                ? formatCurrency(value)
                                : value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impact */}
                  {finding.impact && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>⚠️</span>
                        Impact
                      </h4>
                      <p className="text-sm bg-white bg-opacity-50 rounded p-3">
                        {finding.impact}
                      </p>
                    </div>
                  )}

                  {/* Recommendation */}
                  {finding.recommendation && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>💡</span>
                        Recommendation
                      </h4>
                      <p className="text-sm bg-white bg-opacity-50 rounded p-3">
                        {finding.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {finding.disclaimer && (
                    <div className="text-xs italic opacity-75 bg-white bg-opacity-30 rounded p-2">
                      ℹ️ {finding.disclaimer}
                    </div>
                  )}

                  {/* Why am I seeing this */}
                  <button 
                    className="mt-3 text-xs font-medium underline hover:no-underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`This finding was detected because:\n\nThreshold: The audit engine detected values that fall outside recommended ranges.\n\nRule Applied: ${finding.category} analysis rule\n\nImpact Assessment: ${finding.impact}\n\nThis is part of the automated financial health audit that analyzes your complete financial profile.`);
                    }}
                  >
                    Why am I seeing this? →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No findings message */}
      {filteredFindings.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No findings in this category
          </h3>
          <p className="text-gray-600">
            Select a different category to view other audit findings
          </p>
        </div>
      )}

      {/* Audit Methodology */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Audit Methodology</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">Automated Analysis</h4>
            <p className="text-gray-600">
              Rule-based engine analyzes your complete financial profile across 8 dimensions
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Evidence-Based</h4>
            <p className="text-gray-600">
              Every finding is backed by specific financial data and calculations
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Categories Analyzed</h4>
            <p className="text-gray-600">
              Goal Funding, Emergency Fund, Debt, Risk, Portfolio, Insurance, Liquidity, Tax
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Explainable Results</h4>
            <p className="text-gray-600">
              Each finding includes why it matters and recommended actions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAudit;
