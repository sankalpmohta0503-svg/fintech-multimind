import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const Dialog = ({ open, onClose, title, children, className = '' }) => {
  const headingId = useId();
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default bg-slate-950/35" onClick={onClose} aria-label="Close dialog" />
      <section ref={dialogRef} className={`relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded border border-slate-200 bg-white shadow-xl ${className}`} role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><h2 id={headingId} className="text-base font-semibold text-slate-950">{title}</h2><button ref={closeButtonRef} type="button" onClick={onClose} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Close dialog"><X size={18} aria-hidden="true" /></button></header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
};

export default Dialog;
