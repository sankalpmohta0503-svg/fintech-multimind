import React from 'react';

const Skeleton = ({ className = '', lines = 0 }) => (
  <div className={`animate-pulse rounded bg-[#DBEAFE]/80 ${className}`} aria-hidden="true">
    {lines > 0 && <div className="space-y-2 p-4">{Array.from({ length: lines }, (_, index) => <div key={index} className="h-3 rounded bg-slate-300/70" />)}</div>}
  </div>
);

export default Skeleton;
