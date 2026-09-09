import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileOutput,
  FileSearch,
  FileText,
  LayoutDashboard,
  Lightbulb,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import api from '../services/api';

const navigationGroups = [
  { label: 'Overview', items: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }] },
  {
    label: 'Understand',
    items: [
      { name: 'Client Profile', path: '/profile', icon: User },
      { name: 'Goals', path: '/goals', icon: Target },
      { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    ],
  },
  {
    label: 'Diagnose',
    items: [
      { name: 'Financial Audit', path: '/audit', icon: FileSearch },
      { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    ],
  },
  { label: 'Explore', items: [{ name: 'What-If Simulator', path: '/simulator', icon: Sparkles }] },
  { label: 'Deliver', items: [{ name: 'Advisor Report', path: '/report', icon: FileText }] },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [client, setClient] = useState(null);

  useEffect(() => {
    let active = true;
    api.getClient()
      .then((response) => {
        if (active) setClient(response.data);
      })
      .catch(() => {
        // A failed context request must not prevent route navigation.
      });

    return () => {
      active = false;
    };
  }, []);

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`app-shell-chrome sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 ${sidebarOpen ? 'w-64' : 'w-[76px]'}`}>
        <div className={`flex h-[72px] items-center border-b border-slate-200 ${sidebarOpen ? 'justify-between px-5' : 'justify-center px-3'}`}>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-slate-950">FinAuditX</h1>
              <p className="text-xs text-slate-500">Advisor workspace</p>
            </div>
          )}
          <button type="button" onClick={() => setSidebarOpen((open) => !open)} className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
          {navigationGroups.map((group) => (
            <section key={group.label}>
              {sidebarOpen && <h2 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group.label}</h2>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} title={!sidebarOpen ? item.name : undefined} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${active ? 'bg-slate-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
                      <Icon size={17} strokeWidth={active ? 2.25 : 1.8} className="shrink-0" aria-hidden="true" />
                      {sidebarOpen && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Client context</div>
            <div className="truncate text-sm font-semibold text-slate-900">{client?.personalInfo?.name || 'Demo client'}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck size={14} className="text-teal-700" aria-hidden="true" />
              <span>{client?.riskProfile ? `${client.riskProfile} risk profile` : 'Loading profile'}</span>
            </div>
          </div>
        )}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="app-shell-chrome sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <span className="truncate">{client?.personalInfo?.name || 'Financial planning workspace'}</span>
                {client?.personalInfo?.age && <span className="text-slate-400">{client.personalInfo.age}</span>}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                {client?.personalInfo?.location && <span>{client.personalInfo.location}</span>}
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Deterministic analysis</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost hidden sm:inline-flex" aria-label="Notifications"><Bell size={17} aria-hidden="true" /></button>
              <Link to="/report" className="btn-primary whitespace-nowrap"><FileOutput size={16} aria-hidden="true" /><span className="hidden sm:inline">Generate report</span><span className="sm:hidden">Report</span></Link>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)]">
          <div className="mx-auto max-w-[1440px] px-6 py-7">{children}</div>
        </main>
        <footer className="app-shell-footer border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-500">
          FinAuditX is a prototype decision-support workspace. Financial outcomes remain subject to advisor review.
        </footer>
      </div>
    </div>
  );
};

export default Layout;
