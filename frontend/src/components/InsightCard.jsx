import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getSeverityIcon, getSeverityColor } from '../utils/formatters';

const InsightCard = ({ severity, title, description, onClick }) => {
  return (
    <div 
      className={`
        px-4 py-3 rounded-lg border cursor-pointer
        hover:shadow-md transition-all
        ${getSeverityColor(severity)}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{getSeverityIcon(severity)}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm leading-snug">{title}</h4>
          {description && (
            <p className="text-xs mt-1 opacity-90 line-clamp-2">{description}</p>
          )}
        </div>
        <ChevronRight size={16} className="flex-shrink-0 opacity-50" />
      </div>
    </div>
  );
};

export default InsightCard;
