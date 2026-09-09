import React from 'react';

const MetricCard = ({ label, value, detail, icon: Icon, tone = 'default', className = '' }) => {
  const tones = { default: 'border-slate-200', positive: 'border-teal-200', warning: 'border-amber-200', critical: 'border-red-200' };
  return (
    <section className={`card ${tones[tone] || tones.default} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">{value}</p>
          {detail && <div className="mt-2 text-xs leading-5 text-slate-600">{detail}</div>}
        </div>
        {Icon && <span className="rounded bg-slate-100 p-2 text-slate-600"><Icon size={17} aria-hidden="true" /></span>}
      </div>
    </section>
  );
};

export default MetricCard;
