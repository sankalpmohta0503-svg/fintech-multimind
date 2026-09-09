import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  Info,
  Scale,
  ListChecks,
  Compass
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recsRes, clientRes] = await Promise.all([
        api.getRecommendations(),
        api.getClient().catch(() => ({ data: null }))
      ]);

      setRecommendationsData(recsRes.data);
      setClientData(clientRes.data);

      // Auto-expand critical recommendations by default
      if (recsRes.data?.recommendations) {
        const criticalIds = recsRes.data.recommendations
          .filter(r => r.priority === 'critical')
          .map(r => r.id);
        setExpandedRecs(new Set(criticalIds));
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Unable to generate explainable recommendations. Please check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecommendation = (id) => {
    setExpandedRecs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!recommendationsData?.recommendations) return;
    setExpandedRecs(new Set(recommendationsData.recommendations.map((r) => r.id)));
  };

  const collapseAll = () => {
    setExpandedRecs(new Set());
  };

  const getPriorityBadgeStatus = (priority) => {
    switch (priority) {
      case 'critical':
        return { status: 'critical', label: 'Critical' };
      case 'high':
        return { status: 'warning', label: 'High Priority' };
      case 'medium':
        return { status: 'opportunity', label: 'Medium' };
      case 'low':
        return { status: 'healthy', label: 'Low' };
      default:
        return { status: 'neutral', label: priority };
    }
  };

  const getPriorityBorderClass = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-l-rose-600';
      case 'high':
        return 'border-l-4 border-l-amber-500';
      case 'medium':
        return 'border-l-4 border-l-blue-500';
      case 'low':
        return 'border-l-4 border-l-teal-500';
      default:
        return 'border-l-4 border-l-slate-400';
    }
  };

  // Filter recommendations based on active filters
  const filteredRecommendations = useMemo(() => {
    if (!recommendationsData?.recommendations) return [];

    return recommendationsData.recommendations.filter((rec) => {
      // Priority filter
      if (selectedPriority !== 'all' && rec.priority !== selectedPriority) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = rec.title?.toLowerCase().includes(query);
        const matchesWhat = rec.what?.toLowerCase().includes(query);
        const matchesWhy = rec.why?.toLowerCase().includes(query);
        const matchesCategory = rec.category?.toLowerCase().includes(query);
        return matchesTitle || matchesWhat || matchesWhy || matchesCategory;
      }
      return true;
    });
  }, [recommendationsData, selectedPriority, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" height="56px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="300px" height="32px" />
          <Skeleton variant="text" width="550px" height="18px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
        </div>
        <Skeleton variant="card" height="56px" />
        <div className="space-y-4">
          <Skeleton variant="card" height="180px" />
          <Skeleton variant="card" height="180px" />
          <Skeleton variant="card" height="180px" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const { summary, recommendations = [] } = recommendationsData || {};
  const clientName = clientData?.personalInfo?.name || 'Client';
  const categories = summary?.categories || [];

  return (
    <div className="space-y-6">
      {/* 1. Client Context & Breadcrumb Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Accounts</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-medium text-slate-700">Advisory Portfolio</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-medium text-slate-900">{clientName}</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-950">Explainable Recommendations</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
            Audit-Linked Logic
          </span>
        </div>
      </div>

      {/* 2. Executive Page Header & Action Triggers */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-800 uppercase tracking-wide">
              <Compass size={13} className="text-slate-600" />
              Explainable Decision Support
            </span>
            <span className="text-xs text-slate-500">Evidence-Based Fiduciary Plan</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Advisory Recommendations & Action Plan
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            {summary?.total || recommendations.length} Algorithmic Recommendations (
            <span className="font-semibold text-rose-700">{summary?.byPriority?.critical || 0} Critical</span>,{' '}
            <span className="font-semibold text-amber-700">{summary?.byPriority?.high || 0} High Priority</span>,{' '}
            <span className="font-semibold text-blue-700">{summary?.byPriority?.medium || 0} Optimization</span>
            ) ranked by urgency, solvency impact, and risk alignment.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            to="/audit"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ShieldCheck size={15} className="text-slate-500" />
            <span>Inspect Audit Findings</span>
          </Link>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Sliders size={15} />
            <span>Simulate in What-If</span>
          </Link>
        </div>
      </div>

      {/* 3. Priority Summary Metric Banner (4 Institutional Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Total Action Items</span>
            <ListChecks size={16} className="text-slate-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
              {summary?.total || recommendations.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Active evidence-backed actions
            </p>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-slate-50 px-4 py-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100">
            <span>Action Status</span>
            <span className="font-semibold text-slate-900">{summary?.message || 'Ready for Review'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Critical Priority</span>
            <ShieldAlert size={16} className="text-rose-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
              {summary?.byPriority?.critical || 0}
            </div>
            <p className="mt-1 text-xs text-rose-700">
              Immediate fiduciary remediation
            </p>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-rose-50/80 px-4 py-2 text-xs text-rose-800 flex items-center justify-between border-t border-rose-100">
            <span>Risk Severity</span>
            <span className="font-bold">Urgent Action</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>High Priority</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              {summary?.byPriority?.high || 0}
            </div>
            <p className="mt-1 text-xs text-amber-700">
              Structural & goal adjustments
            </p>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-amber-50/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between border-t border-amber-100">
            <span>Horizon Focus</span>
            <span className="font-bold">Quarterly Target</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Optimization / Medium</span>
            <Sparkles size={16} className="text-blue-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold tracking-tight text-blue-600 tabular-nums">
              {(summary?.byPriority?.medium || 0) + (summary?.byPriority?.low || 0)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Tax & portfolio efficiency upgrades
            </p>
          </div>
          <div className="-mx-4 -mb-4 rounded-b-xl bg-blue-50/80 px-4 py-2 text-xs text-blue-900 flex items-center justify-between border-t border-blue-100">
            <span>Efficiency Scope</span>
            <span className="font-bold">Yield Optimization</span>
          </div>
        </div>
      </div>

      {/* 4. Filter, Category & Search Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Priority Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPriority('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedPriority === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({summary?.total || recommendations.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPriority('critical')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedPriority === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Critical ({summary?.byPriority?.critical || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPriority('high')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedPriority === 'high'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              High ({summary?.byPriority?.high || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPriority('medium')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedPriority === 'medium'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Optimization ({summary?.byPriority?.medium || 0})
            </button>
            {summary?.byPriority?.low > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPriority('low')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedPriority === 'low'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                Low ({summary.byPriority.low})
              </button>
            )}
          </div>

          {/* Expand/Collapse Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search & Category Dropdown Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recommendations by title, rationale, or category..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {categories.length > 0 && (
            <div className="w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-slate-900 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recommendations List (Dense, Professional Cards) */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => {
          const isExpanded = expandedRecs.has(rec.id);
          const badgeProps = getPriorityBadgeStatus(rec.priority);
          const borderClass = getPriorityBorderClass(rec.priority);

          return (
            <div
              key={rec.id}
              className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-150 ${borderClass}`}
            >
              {/* Card Header Section */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                        {rec.category}
                      </span>
                      <StatusBadge status={badgeProps.status} label={badgeProps.label} />
                      {rec.estimatedTimeframe && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                          <Clock size={11} className="text-slate-400" />
                          {rec.estimatedTimeframe}
                        </span>
                      )}
                      {rec.confidence && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 capitalize">
                          <Target size={11} className="text-slate-400" />
                          {rec.confidence} Confidence
                        </span>
                      )}
                    </div>

                    {/* Recommendation Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                      {rec.title}
                    </h3>
                  </div>

                  {/* Top-Right Quick Action Triggers */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                    <Link
                      to="/simulator"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors"
                    >
                      <Sliders size={13} className="text-slate-500" />
                      <span>Simulate</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleRecommendation(rec.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Primary Proposal & Expected Impact Callouts (Always Visible) */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                      Action Required (What)
                    </span>
                    <p className="text-slate-900 font-medium leading-relaxed">{rec.what}</p>
                  </div>
                  <div className="rounded-lg bg-teal-50/70 border border-teal-100 p-3">
                    <span className="font-semibold text-teal-800 uppercase tracking-wider text-[11px] block mb-1">
                      Target Outcome (Expected Impact)
                    </span>
                    <p className="text-teal-950 font-medium leading-relaxed">{rec.expectedImpact}</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Details Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                  {/* Why This Matters */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Info size={14} className="text-slate-400" />
                      Why This Matters (Fiduciary Rationale)
                    </h4>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800">
                      {rec.why}
                    </div>
                  </div>

                  {/* Audited Evidence */}
                  {rec.evidence && Object.keys(rec.evidence).length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Target size={14} className="text-slate-400" />
                        Audited Evidence & Diagnostic Data
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {Object.entries(rec.evidence).map(([key, value]) => {
                          const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase());

                          let displayVal = value;
                          if (typeof value === 'number') {
                            if (key.toLowerCase().includes('shortfall') || key.toLowerCase().includes('gap') || key.toLowerCase().includes('amount') || value >= 10000) {
                              displayVal = formatCurrency(value);
                            } else if (key.toLowerCase().includes('months') || key.toLowerCase().includes('recommended') || key.toLowerCase().includes('years')) {
                              displayVal = `${value} ${key.toLowerCase().includes('year') ? 'Years' : 'Months'}`;
                            } else if (key.toLowerCase().includes('ratio') || key.toLowerCase().includes('allocation') || key.toLowerCase().includes('dti')) {
                              displayVal = `${value}%`;
                            }
                          }

                          return (
                            <div
                              key={key}
                              className="rounded-lg border border-slate-200 bg-white p-2.5"
                            >
                              <span className="text-[11px] text-slate-500 block truncate">
                                {formattedKey}
                              </span>
                              <span className="mt-0.5 text-xs font-bold text-slate-900 tabular-nums block truncate">
                                {String(displayVal)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2-Column: Action Steps & Trade-offs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Implementation Action Steps */}
                    {rec.actionSteps && rec.actionSteps.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-teal-600" />
                          Recommended Implementation Steps
                        </h4>
                        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-xs">
                          {rec.actionSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-slate-800">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trade-offs to Consider */}
                    {rec.tradeoffs && rec.tradeoffs.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Scale size={14} className="text-amber-600" />
                          Trade-offs & Considerations
                        </h4>
                        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-xs">
                          {rec.tradeoffs.map((tradeoff, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 text-slate-700">
                              <span className="text-amber-600 font-bold">•</span>
                              <span className="leading-relaxed">{tradeoff}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer / Regulatory Note if present */}
                  {rec.disclaimer && (
                    <div className="rounded-lg border border-slate-100 bg-white/70 px-3 py-2 text-[11px] italic text-slate-500">
                      ℹ️ {rec.disclaimer}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty Search / Filter Results */}
        {filteredRecommendations.length === 0 && (
          <EmptyState
            title="No matching recommendations"
            description="There are no recommendations matching your current priority, category, or search filters."
            action={
              <button
                type="button"
                onClick={() => {
                  setSelectedPriority('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            }
          />
        )}
      </div>

      {/* 6. Recommendation Methodology Framework */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Compass size={15} className="text-slate-400" />
          Fiduciary Recommendation Methodology
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">1. Evidence-Based</h4>
            <p className="text-slate-600 leading-relaxed">
              Every recommendation is directly derived from quantitative audit findings and balance-sheet diagnostics.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">2. Explainable Structure</h4>
            <p className="text-slate-600 leading-relaxed">
              Structured transparently across What / Why / Evidence / Expected Impact / Trade-offs.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">3. Priority-Ranked</h4>
            <p className="text-slate-600 leading-relaxed">
              Ordered by solvency urgency, risk exposure severity, and overall financial health uplift.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">4. Advisor Oversight</h4>
            <p className="text-slate-600 leading-relaxed">
              Acts as objective decision support for professional financial advisors and client discussion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
