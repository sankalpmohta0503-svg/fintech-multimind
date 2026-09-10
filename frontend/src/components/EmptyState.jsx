import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title, message, action, icon: Icon = Inbox, className = '' }) => (
  <section className={`rounded border border-dashed border-[#93C5FD] bg-[#E2E8F0] p-8 text-center ${className}`}>
    <Icon size={24} className="mx-auto text-blue-300" aria-hidden="true" />
    <h2 className="mt-3 text-xs sm:text-sm font-semibold text-[#111827]">{title}</h2>
    {message && <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-[#2D4A6B]">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </section>
);

export default EmptyState;
