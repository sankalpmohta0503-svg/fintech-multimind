import React from 'react';
import { getHealthScoreStatus } from '../utils/formatters';

const HealthScoreGauge = ({ score, size = 'large' }) => {
  const status = getHealthScoreStatus(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const gradientId = `gaugeGrad-${size}`;

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  const textSizes = {
    small: 'text-lg sm:text-xl',
    medium: 'text-xl sm:text-2xl',
    large: 'text-4xl'
  };

  const labelSizes = {
    small: 'text-xs',
    medium: 'text-xs sm:text-sm',
    large: 'text-xs sm:text-sm'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="35%" stopColor="#F97316" />
              <stop offset="65%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="8"
          />
          {/* Gradient progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${textSizes[size]} text-[#1B3A6B]`}>
            {score}
          </span>
          <span className={`${labelSizes[size]} text-[#4B6080]`}>/ 100</span>
        </div>
      </div>

      <div className={`mt-2 font-bold ${status.color} ${labelSizes[size]}`}>
        {status.label}
      </div>
    </div>
  );
};

export default HealthScoreGauge;

