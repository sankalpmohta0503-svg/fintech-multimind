import React from 'react';

const StatCard = ({ label, value, sublabel, icon: Icon, trend, trendLabel, onClick }) => {
  return (
    <div 
      className={`card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sublabel && (
            <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend > 0 && '↑'}
              {trend < 0 && '↓'}
              {trend === 0 && '→'}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon className="text-primary-600" size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
