import React from 'react';

const ChartFrame = ({ title, description, action, children, summary, className = '' }) => (
  <section className={`card ${className}`}>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-semibold text-slate-950">{title}</h2>{description && <p className="mt-1 text-sm text-slate-600">{description}</p>}</div>{action}</div>
    {children}
    {summary && <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">{summary}</div>}
  </section>
);

export default ChartFrame;
