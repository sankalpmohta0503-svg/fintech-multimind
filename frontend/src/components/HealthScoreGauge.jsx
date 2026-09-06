import React from 'react';
import { getHealthScoreStatus, getHealthScoreColor } from '../utils/formatters';

const HealthScoreGauge = ({ score, size = 'large' }) => {
  const status = getHealthScoreStatus(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  const textSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };

  const labelSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={
              score >= 80 ? '#10b981' :
              score >= 70 ? '#3b82f6' :
              score >= 60 ? '#eab308' :
              score >= 50 ? '#f97316' :
              '#ef4444'
            }
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${textSizes[size]} ${status.color}`}>
            {score}
          </span>
          <span className={`${labelSizes[size]} text-gray-500`}>/ 100</span>
        </div>
      </div>
      
      <div className={`mt-2 font-semibold ${status.color} ${labelSizes[size]}`}>
        {status.label}
      </div>
    </div>
  );
};

export default HealthScoreGauge;
