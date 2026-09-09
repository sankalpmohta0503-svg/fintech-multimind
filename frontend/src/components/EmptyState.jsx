import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title, message, action, icon: Icon = Inbox, className = '' }) => (
  <section className={`rounded border border-dashed border-slate-300 bg-slate-50 p-8 text-center ${className}`}>
    <Icon size={24} className="mx-auto text-slate-400" aria-hidden="true" />
    <h2 className="mt-3 text-sm font-semibold text-slate-900">{title}</h2>
    {message && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </section>
);

export default EmptyState;
