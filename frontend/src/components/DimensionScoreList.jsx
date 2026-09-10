import React from 'react';
import { formatDimensionName } from '../utils/formatters';

const scoreTone = (score) => {
  if (score >= 70) return 'bg-[#16A34A]';
  return 'bg-[#DC2626]';
};

const DimensionScoreList = ({ dimensions }) => {
  const rankedDimensions = Object.entries(dimensions || {}).sort(([, left], [, right]) => left.score - right.score);

  return (
    <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
      {rankedDimensions.map(([key, dimension], index) => (
        <div key={key} className={`rounded px-2 py-1.5 ${index < 2 ? 'bg-[#E2E8F0]' : ''}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">{formatDimensionName(key)}</span>
            <span className="shrink-0 text-xs sm:text-sm font-bold tabular-nums text-[#1B3A6B]">{dimension.score}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#DBEAFE]" aria-label={`${formatDimensionName(key)} score: ${dimension.score} out of 100`}>
            <div className={`h-full rounded-full ${scoreTone(dimension.score)}`} style={{ width: `${Math.max(0, Math.min(dimension.score, 100))}%` }} />
          </div>
          {dimension.reason && <p className="mt-1.5 text-xs sm:text-sm leading-snug text-[#4B6080]">{dimension.reason}</p>}
        </div>
      ))}
    </div>
  );
};

export default DimensionScoreList;
