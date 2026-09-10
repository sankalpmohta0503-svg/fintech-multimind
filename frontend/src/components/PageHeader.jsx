import React from 'react';

const PageHeader = ({ eyebrow, title, description, actions, children, className = '' }) => (
  <header className={`flex flex-col gap-4 border-b border-[#BFDBFE] pb-5 md:flex-row md:items-end md:justify-between ${className}`}>
    <div className="min-w-0">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4B6080]">{eyebrow}</p>}
      <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1B3A6B] md:text-[28px]">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-6 text-[#2D4A6B]">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
