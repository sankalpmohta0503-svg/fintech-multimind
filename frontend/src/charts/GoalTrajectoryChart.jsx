import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const GoalTrajectoryChart = ({ data, goalName }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 mb-2">Year {payload[0].payload.year}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="year" 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => formatCurrency(value)}
          label={{ value: 'Amount', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="current" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Current Trajectory"
          dot={{ fill: '#ef4444', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="required" 
          stroke="#10b981" 
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Required Trajectory"
          dot={{ fill: '#10b981', r: 3 }}
          activeDot={{ r: 5 }}
        />
        {data.some(d => d.target) && (
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Target"
            dot={{ fill: '#3b82f6', r: 5 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GoalTrajectoryChart;
