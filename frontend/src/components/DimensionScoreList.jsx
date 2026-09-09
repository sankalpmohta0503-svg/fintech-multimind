import React from 'react';
import { formatDimensionName } from '../utils/formatters';

const scoreTone = (score) => {
  if (score >= 80) return 'bg-teal-700';
  if (score >= 70) return 'bg-slate-700';
  if (score >= 60) return 'bg-amber-600';
  return 'bg-red-700';
};

const DimensionScoreList = ({ dimensions }) => {
  const rankedDimensions = Object.entries(dimensions || {}).sort(([, left], [, right]) => left.score - right.score);

  return (
    <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
      {rankedDimensions.map(([key, dimension], index) => (
        <div key={key} className={`rounded px-2 py-1.5 ${index < 2 ? 'bg-slate-50' : ''}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-800">{formatDimensionName(key)}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-950">{dimension.score}/100</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" aria-label={`${formatDimensionName(key)} score: ${dimension.score} out of 100`}>
            <div className={`h-full rounded-full ${scoreTone(dimension.score)}`} style={{ width: `${Math.max(0, Math.min(dimension.score, 100))}%` }} />
          </div>
          {dimension.reason && <p className="mt-1.5 text-xs leading-4 text-slate-500">{dimension.reason}</p>}
        </div>
      ))}
    </div>
  );
};

export default DimensionScoreList;
