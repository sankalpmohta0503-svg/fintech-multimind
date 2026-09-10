import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = 'Unable to load this information', message = 'Please try again.', onRetry, className = '' }) => (
  <section className={`rounded border border-[#FED7AA] bg-[#FFF7ED] p-5 ${className}`} role="alert">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 shrink-0 text-[#C2410C]" size={20} aria-hidden="true" />
      <div><h2 className="text-xs sm:text-sm font-semibold text-rose-950">{title}</h2><p className="mt-1 text-xs sm:text-sm text-[#9A3412]">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="btn-secondary mt-3 border-[#FED7AA] bg-white text-[#9A3412]"><RefreshCw size={15} aria-hidden="true" />Retry</button>}</div>
    </div>
  </section>
);

export default ErrorState;
