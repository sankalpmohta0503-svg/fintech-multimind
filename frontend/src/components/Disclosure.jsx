import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Disclosure = ({ title, children, defaultOpen = false, className = '' }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <section className={`rounded border border-slate-200 bg-white ${className}`}>
      <button type="button" className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-slate-900" onClick={() => setOpen((visible) => !visible)} aria-expanded={open} aria-controls={contentId}>
        <span>{title}</span><ChevronDown size={17} className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <div id={contentId} className="border-t border-slate-200 px-4 py-4">{children}</div>}
    </section>
  );
};

export default Disclosure;
