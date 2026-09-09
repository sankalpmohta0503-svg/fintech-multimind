import React from 'react';

const PageHeader = ({ eyebrow, title, description, actions, children, className = '' }) => (
  <header className={`flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between ${className}`}>
    <div className="min-w-0">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-[28px]">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
