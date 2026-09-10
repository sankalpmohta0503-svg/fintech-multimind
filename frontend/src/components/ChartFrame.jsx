import React from 'react';

const ChartFrame = ({ title, description, action, children, summary, className = '' }) => (
  <section className={`card ${className}`}>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xs sm:text-sm font-semibold text-[#1B3A6B]">{title}</h2>{description && <p className="mt-1 text-xs sm:text-sm text-[#2D4A6B]">{description}</p>}</div>{action}</div>
    {children}
    {summary && <div className="mt-4 border-t border-[#BFDBFE] pt-4 text-xs sm:text-sm text-[#2D4A6B]">{summary}</div>}
  </section>
);

export default ChartFrame;
