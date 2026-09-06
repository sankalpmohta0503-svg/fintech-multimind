import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.getRecommendations();
      setRecommendations(response.data);
      // Auto-expand critical recommendations
      const criticalIds = response.data.recommendations
        .filter(r => r.priority === 'critical')
        .map(r => r.id);
      setExpandedRecs(new Set(criticalIds));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecommendation = (id) => {
    setExpandedRecs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="text-red-600" size={24} />;
      case 'high':
        return <AlertCircle className="text-orange-600" size={24} />;
      case 'medium':
        return <Lightbulb className="text-yellow-600" size={24} />;
      default:
        return <CheckCircle className="text-blue-600" size={24} />;
    }
  };

  const getFilteredRecommendations = () => {
    if (!recommendations) return [];
    if (selectedPriority === 'all') return recommendations.recommendations;
    return recommendations.recommendations.filter(r => r.priority === selectedPriority);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating recommendations...</p>
        </div>
      </div>
    );
  }

  const filteredRecs = getFilteredRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Explainable Recommendations</h1>
        <p className="text-gray-600 mt-2">
          Evidence-based actions to improve financial health
        </p>
      </div>

      {/* Summary */}
      <div className="card bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="flex items-center gap-3 mb-3">
          <Lightbulb className="text-yellow-600" size={28} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {recommendations.summary.total} Recommendations
            </h2>
            <p className="text-gray-700">{recommendations.summary.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <div className="text-xl font-bold text-red-600">
                {recommendations.summary.byPriority.critical}
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="text-orange-600" size={20} />
            <div>
              <div className="text-xl font-bold text-orange-600">
                {recommendations.summary.byPriority.high}
              </div>
              <div className="text-xs text-gray-600">High Priority</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-600" size={20} />
            <div>
              <div className="text-xl font-bold text-yellow-600">
                {recommendations.summary.byPriority.medium}
              </div>
              <div className="text-xs text-gray-600">Medium Priority</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPriority('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPriority === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({recommendations.summary.total})
        </button>
        <button
          onClick={() => setSelectedPriority('critical')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPriority === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Critical ({recommendations.summary.byPriority.critical})
        </button>
        <button
          onClick={() => setSelectedPriority('high')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPriority === 'high'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          }`}
        >
          High ({recommendations.summary.byPriority.high})
        </button>
        <button
          onClick={() => setSelectedPriority('medium')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPriority === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          Medium ({recommendations.summary.byPriority.medium})
        </button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isExpanded = expandedRecs.has(rec.id);

          return (
            <div
              key={rec.id}
              className={`card border-2 ${getPriorityColor(rec.priority)}`}
            >
              {/* Header */}
              <button
                onClick={() => toggleRecommendation(rec.id)}
                className="w-full flex items-start gap-4 text-left"
              >
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(rec.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                          {rec.category}
                        </span>
                        <span className="text-xs font-bold uppercase px-2 py-0.5 bg-white bg-opacity-50 rounded">
                          {rec.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{rec.title}</h3>
                      <p className="text-sm opacity-90">{rec.what}</p>
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
                <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4">
                  {/* Why */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span>🔍</span>
                      Why This Matters
                    </h4>
                    <p className="text-sm bg-white bg-opacity-50 rounded p-3">
                      {rec.why}
                    </p>
                  </div>

                  {/* Evidence */}
                  {rec.evidence && Object.keys(rec.evidence).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>📊</span>
                        Supporting Evidence
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(rec.evidence).map(([key, value]) => (
                          <div key={key} className="bg-white bg-opacity-50 rounded p-2">
                            <div className="text-xs opacity-75 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="font-semibold">
                              {typeof value === 'number' && key.toLowerCase().includes('amount')
                                ? formatCurrency(value)
                                : typeof value === 'number' && key.toLowerCase().includes('ratio')
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

                  {/* Expected Impact */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span>🎯</span>
                      Expected Impact
                    </h4>
                    <p className="text-sm bg-white bg-opacity-50 rounded p-3">
                      {rec.expectedImpact}
                    </p>
                  </div>

                  {/* Trade-offs */}
                  {rec.tradeoffs && rec.tradeoffs.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>⚖️</span>
                        Trade-offs to Consider
                      </h4>
                      <ul className="text-sm bg-white bg-opacity-50 rounded p-3 space-y-1">
                        {rec.tradeoffs.map((tradeoff, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="opacity-50">•</span>
                            <span>{tradeoff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Steps */}
                  {rec.actionSteps && rec.actionSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>✅</span>
                        Action Steps
                      </h4>
                      <ol className="text-sm bg-white bg-opacity-50 rounded p-3 space-y-2">
                        {rec.actionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-semibold opacity-75">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Timeframe & Confidence */}
                  <div className="flex items-center gap-4 text-sm">
                    {rec.estimatedTimeframe && (
                      <div className="flex items-center gap-2 bg-white bg-opacity-50 rounded px-3 py-2">
                        <span className="opacity-75">⏱️ Timeframe:</span>
                        <span className="font-semibold">{rec.estimatedTimeframe}</span>
                      </div>
                    )}
                    {rec.confidence && (
                      <div className="flex items-center gap-2 bg-white bg-opacity-50 rounded px-3 py-2">
                        <span className="opacity-75">🎯 Confidence:</span>
                        <span className="font-semibold capitalize">{rec.confidence}</span>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer */}
                  {rec.disclaimer && (
                    <div className="text-xs italic opacity-75 bg-white bg-opacity-30 rounded p-2">
                      ℹ️ {rec.disclaimer}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No recommendations message */}
      {filteredRecs.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No recommendations in this category
          </h3>
          <p className="text-gray-600">
            Select a different priority level to view other recommendations
          </p>
        </div>
      )}

      {/* Methodology */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Recommendation Methodology</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">Evidence-Based</h4>
            <p className="text-gray-600">
              Every recommendation is backed by audit findings and financial calculations
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Explainable Structure</h4>
            <p className="text-gray-600">
              What / Why / Evidence / Impact / Trade-offs clearly presented
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Priority Ranked</h4>
            <p className="text-gray-600">
              Recommendations ordered by urgency and potential impact
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Advisor Retains Control</h4>
            <p className="text-gray-600">
              These are suggestions for advisor review and client discussion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
