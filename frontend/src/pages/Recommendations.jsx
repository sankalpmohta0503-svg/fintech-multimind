import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Info,
  Lightbulb,
  ListChecks,
  Pin,
  Scale,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';

const priorityStyle = {
  critical: { status: 'critical', label: 'Critical', accent: '#DC2626', soft: '#FEF2F2' },
  high: { status: 'warning', label: 'High priority', accent: '#EA580C', soft: '#FFF7ED' },
  medium: { status: 'opportunity', label: 'Medium', accent: '#1B3A6B', soft: '#EFF6FF' },
  low: { status: 'healthy', label: 'Low', accent: '#15803D', soft: '#F0FDF4' },
};

const formatValue = (key, value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'number') return String(value);
  const normalized = key.toLowerCase();
  if (
    normalized.includes('amount') ||
    normalized.includes('shortfall') ||
    normalized.includes('gap') ||
    normalized.includes('corpus') ||
    normalized.includes('sip') ||
    normalized.includes('income') ||
    normalized.includes('coverage') ||
    value >= 10000
  ) {
    return formatCurrency(value);
  }
  if (
    normalized.includes('ratio') ||
    normalized.includes('percentage') ||
    normalized.includes('allocation') ||
    normalized.includes('rate')
  ) {
    return `${value}%`;
  }
  return value.toLocaleString('en-IN');
};

const RecommendationPanel = ({ recommendation, expanded, onToggle }) => {
  const style = priorityStyle[recommendation.priority] || priorityStyle.medium;
  const evidence = recommendation.evidence && Object.entries(recommendation.evidence);

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
        expanded
          ? 'shadow-md border-[#1B3A6B]/40 ring-1 ring-[#1B3A6B]/20'
          : 'shadow-sm border-[#1B3A6B22] hover:-translate-y-0.5 hover:shadow-md'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: style.accent,
      }}
    >
      <div className="p-5 pl-6 md:p-6 md:pl-7">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: style.soft, color: style.accent }}
          >
            <Lightbulb size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={style.status} label={style.label} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                {recommendation.category}
              </span>
              {recommendation.estimatedTimeframe && (
                <span className="inline-flex items-center gap-1 text-xs text-[#4B6080]">
                  <Clock size={12} />
                  {recommendation.estimatedTimeframe}
                </span>
              )}
            </div>
            <button type="button" onClick={onToggle} className="mt-2.5 block w-full text-left" aria-expanded={expanded}>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1B3A6B] transition-colors group-hover:text-[#2563EB]">
                {recommendation.title}
              </h2>
              <p className="mt-1.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#374151]">
                {recommendation.what}
              </p>
            </button>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide recommendation details' : 'Show recommendation details'}
            className="rounded-full border border-[#DBEAFE] p-2 text-[#4B6080] transition hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-[#EFF6FF]"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#DBEAFE] pt-3 text-xs text-[#4B6080]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.accent }} />
            <span>Actionable Fiduciary Insight</span>
          </span>
          {recommendation.confidence && (
            <span>
              Confidence: <strong className="capitalize text-[#111827]">{recommendation.confidence}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#1B3A6B] hover:text-[#2563EB]"
          >
            {expanded ? 'Hide rationale' : 'Review rationale'} <ArrowRight size={13} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#DBEAFE] px-5 pb-6 pt-5 md:px-7" style={{ backgroundColor: style.soft }}>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            <section className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
                  <Info size={15} style={{ color: style.accent }} />
                  Why this matters
                </div>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#1F2937]">{recommendation.why}</p>
              </div>
              {recommendation.expectedImpact && (
                <div className="border-t border-[#DBEAFE] pt-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
                    Expected Impact
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-[#14532D]">
                    {recommendation.expectedImpact}
                  </p>
                </div>
              )}
              {evidence?.length ? (
                <div className="border-t border-[#DBEAFE] pt-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4B6080]">
                    Supporting Evidence
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {evidence.map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-[#DBEAFE] bg-white px-3 py-2.5">
                        <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="mt-0.5 truncate text-xs sm:text-sm font-bold text-[#1B3A6B]">
                          {formatValue(key, value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
            <section className="space-y-4 lg:border-l lg:border-[#DBEAFE] lg:pl-6">
              {recommendation.actionSteps?.length ? (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
                    <CheckCircle2 size={15} style={{ color: style.accent }} />
                    Action steps
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {recommendation.actionSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-[#1F2937]">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[11px] font-bold text-[#1B3A6B]">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {recommendation.tradeoffs?.length ? (
                <div className="border-t border-[#DBEAFE] pt-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                    <Scale size={15} />
                    Trade-offs to consider
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {recommendation.tradeoffs.map((tradeoff, index) => (
                      <p key={index} className="text-xs leading-relaxed text-[#4B6080]">
                        • {tradeoff}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
          {recommendation.disclaimer && (
            <div className="mt-4 border-t border-[#DBEAFE] pt-2.5 text-[11px] italic text-[#6B7280]">
              {recommendation.disclaimer}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [expandedRecs, setExpandedRecs] = useState(new Set());
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recsRes, clientRes] = await Promise.all([
        api.getRecommendations(),
        api.getClient().catch(() => ({ data: null })),
      ]);
      setRecommendationsData(recsRes.data);
      setClientData(clientRes.data);
      const criticalIds =
        recsRes.data?.recommendations?.filter((rec) => rec.priority === 'critical').map((rec) => rec.id) || [];
      setExpandedRecs(new Set(criticalIds));
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Unable to load recommendations. Please check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRecommendation = (id) =>
    setExpandedRecs((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const recommendations = recommendationsData?.recommendations || [];
  const summary = recommendationsData?.summary;
  const categories = summary?.categories || [];

  const filteredRecommendations = useMemo(
    () =>
      recommendations.filter((rec) => {
        if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false;
        if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return [rec.title, rec.what, rec.why, rec.category].some((value) => value?.toLowerCase().includes(query));
        }
        return true;
      }),
    [recommendations, selectedPriority, selectedCategory, searchQuery]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-28" />
        <Skeleton className="h-20" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const counts = summary?.byPriority || {};
  const clientName = clientData?.personalInfo?.name || 'Client';

  return (
    <div className="animate-enter space-y-6">
      {/* 1. Header with Eyebrow and Actions */}
      <header className="card bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">
              <Compass size={15} /> Advise · Actionable Roadmap
            </div>
            <h1 className="mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-[#1B3A6B]">
              Strategic Recommendations
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#374151]">
              A curated set of fiduciary actions grounded in {clientName}’s audited profile. Review supporting rationale and expected impact before exploring scenarios.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/audit"
              className="btn-secondary rounded-lg text-xs"
            >
              <Target size={15} /> Review Audit
            </Link>
            <Link
              to="/simulator"
              className="btn-primary rounded-lg text-xs"
            >
              <Sparkles size={15} /> Explore Scenario
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Summary Banner & Priority Badges */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B3A6B] via-[#1E427B] to-[#162E56] p-6 text-white shadow-md flex flex-col justify-between">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/10" />
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-widest text-[#93C5FD]">Action Brief</div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black leading-none tracking-tight text-white">
                {summary?.total || recommendations.length}
              </span>
              <span className="text-sm font-semibold text-blue-100">
                Action Items Recommended
              </span>
            </div>
            <div className="mt-3 max-w-xl border-t border-white/20 pt-3 text-xs sm:text-sm text-blue-100 leading-relaxed">
              {summary?.message || 'Review prioritized recommendations and underlying fiduciary rationale below.'}
            </div>
          </div>
          <div className="mt-4 pt-2 flex items-center gap-2 text-xs text-blue-200 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#86EFAC] animate-pulse" />
            <span>Generated from deterministic SEBI RIA scoring & audit engine</span>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <div className="card bg-[#FEF2F2] border border-[#FECACA] p-4 flex flex-col justify-between rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">Critical</div>
              <Pin size={15} className="text-[#DC2626]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#DC2626]">
              {counts.critical || 0}
            </div>
            <div className="text-[11px] font-medium text-[#DC2626]">Requires Immediate Action</div>
          </div>
          <div className="card bg-[#FFF7ED] border border-[#FFEDD5] p-4 flex flex-col justify-between rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">High Priority</div>
              <Pin size={15} className="text-[#EA580C]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#EA580C]">{counts.high || 0}</div>
            <div className="text-[11px] font-medium text-[#EA580C]">Important Financial Risk</div>
          </div>
          <div className="card bg-[#EFF6FF] border border-[#BFDBFE] p-4 flex flex-col justify-between rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B3A6B]">Medium</div>
              <Pin size={15} className="text-[#1B3A6B]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1B3A6B]">{counts.medium || 0}</div>
            <div className="text-[11px] font-medium text-[#2563EB]">Optimization Steps</div>
          </div>
          <div className="card bg-[#F0FDF4] border border-[#BBF7D0] p-4 flex flex-col justify-between rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#14532D]">Low / Ongoing</div>
              <Pin size={15} className="text-[#15803D]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#14532D]">{counts.low || 0}</div>
            <div className="text-[11px] font-medium text-[#15803D]">Maintenance Tasks</div>
          </div>
        </div>
      </section>

      {/* 3. Review Controls & Filters Card */}
      <section className="card bg-white p-5 rounded-xl border border-[#DBEAFE]">
        <div className="flex items-center gap-2 border-b border-[#DBEAFE] pb-3">
          <SlidersHorizontal size={16} className="text-[#1B3A6B]" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1B3A6B]">Filter & Search Controls</div>
            <p className="text-xs text-[#4B6080]">Filter action items by priority level, planning domain, or keyword.</p>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {['all', 'critical', 'high', 'medium', ...(counts.low > 0 ? ['low'] : [])].map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => setSelectedPriority(priority)}
              className={`rounded-md border px-3 py-1.5 text-xs font-bold capitalize transition ${
                selectedPriority === priority
                  ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white shadow-sm'
                  : 'border-[#DBEAFE] bg-white text-[#4B6080] hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-[#EFF6FF]'
              }`}
            >
              {priority === 'all' ? 'All' : priority}
              <span className="ml-1.5 opacity-80">
                ({priority === 'all' ? recommendations.length : counts[priority] || 0})
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
          <label className="relative md:col-span-7">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <span className="sr-only">Search recommendations</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search recommendations, rationale, or category..."
              className="w-full rounded-md border border-[#DBEAFE] bg-[#F8FAFC] py-2 pl-9 pr-3 text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
            />
          </label>
          <label className="relative md:col-span-5">
            <span className="sr-only">Filter by category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-md border border-[#DBEAFE] bg-[#F8FAFC] px-3 py-2 text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
            >
              <option value="all">All categories ({categories.length})</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-3 text-xs border-t border-[#DBEAFE] pt-2.5">
          <button
            type="button"
            onClick={() => setExpandedRecs(new Set(recommendations.map((rec) => rec.id)))}
            className="font-bold text-[#1B3A6B] hover:text-[#2563EB]"
          >
            Expand all
          </button>
          <span className="text-[#DBEAFE]">|</span>
          <button
            type="button"
            onClick={() => setExpandedRecs(new Set())}
            className="font-bold text-[#1B3A6B] hover:text-[#2563EB]"
          >
            Collapse all
          </button>
        </div>
      </section>

      {/* 4. Action List */}
      <section aria-live="polite" className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#DBEAFE]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B3A6B]">
            Curated Action Items
          </h2>
          <span className="rounded bg-[#EFF6FF] px-2 py-0.5 text-xs font-bold text-[#1B3A6B] border border-[#BFDBFE]">
            {filteredRecommendations.length} Shown
          </span>
        </div>
        {filteredRecommendations.length ? (
          filteredRecommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="animate-enter"
              style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}
            >
              <RecommendationPanel
                recommendation={rec}
                expanded={expandedRecs.has(rec.id)}
                onToggle={() => toggleRecommendation(rec.id)}
              />
            </div>
          ))
        ) : (
          <EmptyState
            title="No recommendations match your filters"
            message="Try another priority, category, or search phrase."
            action={
              <button
                type="button"
                className="btn-secondary text-xs rounded-md"
                onClick={() => {
                  setSelectedPriority('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset filters
              </button>
            }
          />
        )}
      </section>

      {/* 5. Bottom Advice Note */}
      <section className="card bg-white p-4 rounded-xl border border-[#DBEAFE] flex items-start gap-3">
        <ListChecks size={18} className="mt-0.5 text-[#1B3A6B] shrink-0" />
        <div>
          <div className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Fiduciary Advisor Advisory Notice</div>
          <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-[#4B6080]">
            These recommendations are prioritized based on SEBI RIA fiduciary guidelines. Use the supporting rationale, evidence, and simulator to review trade-offs prior to client implementation.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Recommendations;
