import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = 'Unable to load this information', message = 'Please try again.', onRetry, className = '' }) => (
  <section className={`rounded border border-red-200 bg-red-50 p-5 ${className}`} role="alert">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 shrink-0 text-red-700" size={20} aria-hidden="true" />
      <div><h2 className="text-sm font-semibold text-red-950">{title}</h2><p className="mt-1 text-sm text-red-800">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="btn-secondary mt-3 border-red-200 bg-white text-red-800"><RefreshCw size={15} aria-hidden="true" />Retry</button>}</div>
    </div>
  </section>
);

export default ErrorState;
