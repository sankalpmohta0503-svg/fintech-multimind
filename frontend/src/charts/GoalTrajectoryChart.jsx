import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const GoalTrajectoryChart = ({ data, goalName }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Trajectory data not available for this goal.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label === 0 ? 'Year 0 (Today)' : `Year ${label}`}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-600">{entry.name}:</span>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="#94A3B8"
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(val) => (val === 0 ? 'Today' : `Yr ${val}`)}
            label={{ value: 'Timeline Horizon (Years)', position: 'insideBottom', offset: -12, fill: '#64748B', fontSize: 11 }}
          />
          <YAxis
            stroke="#94A3B8"
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(value) => formatCurrency(value)}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#0F172A"
            strokeWidth={2.5}
            name="Current Path"
            dot={{ fill: '#0F172A', r: 3 }}
            activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="required"
            stroke="#0D9488"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            name="Required Path"
            dot={{ fill: '#0D9488', r: 3 }}
            activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }}
          />
          {data.some((d) => d.target !== null && d.target !== undefined) && (
            <Line
              type="monotone"
              dataKey="target"
              stroke="#2563EB"
              strokeWidth={3}
              name="Target Corpus"
              dot={{ fill: '#2563EB', r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalTrajectoryChart;
