import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({ children, searchValue, onSearchChange, searchPlaceholder = 'Search', className = '' }) => (
  <div className={`flex flex-col gap-3 rounded border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center ${className}`}>
    {onSearchChange && <label className="relative min-w-0 flex-1"><span className="sr-only">{searchPlaceholder}</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400" /></label>}
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export default FilterBar;
