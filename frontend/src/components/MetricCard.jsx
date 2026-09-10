import React from 'react';

const MetricCard = ({ label, value, detail, icon: Icon, tone = 'default', className = '' }) => {
  const tones = { default: 'border-[#BFDBFE]', positive: 'border-[#BBF7D0]', warning: 'border-[#FED7AA]', critical: 'border-[#FED7AA]' };
  return (
    <section className={`card ${tones[tone] || tones.default} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4B6080]">{label}</p>
          <p className="mt-2 text-lg sm:text-xl font-semibold tracking-tight text-[#1B3A6B] tabular-nums">{value}</p>
          {detail && <div className="mt-2 text-xs leading-5 text-[#2D4A6B]">{detail}</div>}
        </div>
        {Icon && <span className="rounded bg-[#EFF6FF] p-2 text-[#2D4A6B]"><Icon size={17} aria-hidden="true" /></span>}
      </div>
    </section>
  );
};

export default MetricCard;
