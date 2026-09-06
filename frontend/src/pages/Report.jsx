import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getHealthScoreStatus } from '../utils/formatters';

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.getReport();
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating advisor report...</p>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthScoreStatus(report.executive.overallHealthScore);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advisor Report</h1>
          <p className="text-gray-600 mt-2">Comprehensive financial audit and advisory report</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 print:shadow-none print:border-0">
        {/* Report Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">FinAuditX</h1>
              <p className="text-sm text-gray-600">{report.metadata.reportType}</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Report Date: {new Date(report.metadata.reportDate).toLocaleDateString()}</div>
              <div>Version: {report.metadata.reportVersion}</div>
            </div>
          </div>
        </div>

        {/* Client Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
              <div className="space-y-1 text-sm">
                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{report.clientOverview.personal.name}</span></div>
                <div><span className="text-gray-600">Age:</span> <span className="font-medium">{report.clientOverview.personal.age} years</span></div>
                <div><span className="text-gray-600">Occupation:</span> <span className="font-medium">{report.clientOverview.personal.occupation}</span></div>
                <div><span className="text-gray-600">Location:</span> <span className="font-medium">{report.clientOverview.personal.location}</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Risk Profile</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {report.clientOverview.riskProfile}
              </span>
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="mb-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${healthStatus.color}`}>
                {report.executive.overallHealthScore}
              </div>
              <div className="text-xs text-gray-600">Health Score</div>
              <div className={`text-sm font-medium ${healthStatus.color}`}>{healthStatus.label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{report.executive.criticalIssues}</div>
              <div className="text-xs text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{report.executive.goalsOnTrack}</div>
              <div className="text-xs text-gray-600">Goals On Track</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{report.executive.opportunities}</div>
              <div className="text-xs text-gray-600">Opportunities</div>
            </div>
          </div>
          <p className="text-sm text-gray-700">{report.executive.summary}</p>
        </section>

        {/* Financial Snapshot */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Snapshot</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Net Worth</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(report.financialSnapshot.netWorth)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Income</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(report.financialSnapshot.monthlyIncome)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Surplus</div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(report.financialSnapshot.monthlySurplus)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Investments</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(report.financialSnapshot.totalInvestments)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Debt</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(report.financialSnapshot.totalDebt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Insurance Coverage</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(report.financialSnapshot.insuranceCoverage)}</div>
            </div>
          </div>
        </section>

        {/* Financial Health Score */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Health Score Breakdown</h2>
          <div className="space-y-3">
            {report.healthScore.dimensions.map((dim, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700">{dim.name}</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      dim.score >= 80 ? 'bg-green-500' :
                      dim.score >= 70 ? 'bg-blue-500' :
                      dim.score >= 60 ? 'bg-yellow-500' :
                      dim.score >= 50 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-semibold text-gray-900">{dim.score}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Critical Findings */}
        {report.criticalFindings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Critical Findings</h2>
            <div className="space-y-3">
              {report.criticalFindings.slice(0, 5).map((finding, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                  <p className="text-sm text-gray-700 mt-1"><strong>Impact:</strong> {finding.impact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Recommendations</h2>
          <div className="space-y-4">
            {report.recommendations.recommendations.slice(0, 5).map((rec, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.what}</p>
                <p className="text-sm text-gray-700"><strong>Expected Impact:</strong> {rec.expectedImpact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advisor Notes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Advisor Notes</h2>
          <div className="space-y-3">
            {report.advisorNotes.map((note, idx) => (
              <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{note.topic}</h3>
                <p className="text-sm text-gray-700">{note.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 mt-8 text-center text-sm text-gray-600">
          <p>This report was generated by FinAuditX - Intelligent Financial Advisory & Audit System</p>
          <p className="mt-2">All recommendations are for advisor review and should be discussed with the client before implementation.</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
