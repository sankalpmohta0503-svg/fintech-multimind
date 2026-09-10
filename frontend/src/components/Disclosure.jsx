import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Disclosure = ({ title, children, defaultOpen = false, className = '' }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <section className={`rounded border border-[#BFDBFE] bg-white ${className}`}>
      <button type="button" className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-xs sm:text-sm font-medium text-[#111827]" onClick={() => setOpen((visible) => !visible)} aria-expanded={open} aria-controls={contentId}>
        <span>{title}</span><ChevronDown size={17} className={`shrink-0 text-[#4B6080] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <div id={contentId} className="border-t border-[#BFDBFE] px-4 py-4">{children}</div>}
    </section>
  );
};

export default Disclosure;
