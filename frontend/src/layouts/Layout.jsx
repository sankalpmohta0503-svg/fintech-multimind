import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FileText,
  Info,
  LayoutDashboard,
  Lightbulb,
  Mail,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

const navigationGroups = [
  { label: 'Overview', items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] },
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
  {
    label: 'Company',
    items: [
      { name: 'About Us', path: '/about', icon: Info },
      { name: 'Contact Us', path: '/contact', icon: Mail },
    ],
  },
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

  const isActive = (path) => (path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path));

  return (
    <div className="manus-page flex min-h-screen bg-[#E2E8F0] font-sans antialiased text-[#111827]">
      <aside className={`app-shell-chrome sticky top-0 flex h-screen shrink-0 flex-col bg-[#1B3A6B] text-blue-100 transition-all duration-200 ${sidebarOpen ? 'w-64' : 'w-[76px]'}`}>
        <div className={`flex h-[72px] items-center border-b border-blue-900/60 ${sidebarOpen ? 'justify-between px-5' : 'justify-center px-3'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={logo} alt="FinAuditX" className="h-8 w-8 object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                  FinAudit<span className="text-yellow-400">X</span>
                </h1>
                <p className="text-xs text-blue-300 mt-1">Advisor workspace</p>
              </div>
            </div>
          ) : (
            <img src={logo} alt="FinAuditX" className="h-8 w-8 object-contain" />
          )}
          <button type="button" onClick={() => setSidebarOpen((open) => !open)} className="rounded p-2 text-blue-300 transition-colors hover:bg-blue-900 hover:text-green-300" aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
          {navigationGroups.map((group) => (
            <section key={group.label}>
              {sidebarOpen && <h2 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">{group.label}</h2>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} title={!sidebarOpen ? item.name : undefined} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs sm:text-sm transition-colors ${active ? 'bg-[#16A34A] font-bold text-white shadow-sm' : 'text-blue-100 hover:bg-blue-900/60 hover:text-green-300'}`}>
                      <Icon size={18} strokeWidth={active ? 2.25 : 1.8} className="shrink-0" aria-hidden="true" />
                      {sidebarOpen && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="border-t border-blue-900/60 bg-[#1B3A6B] px-5 py-4">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Client context</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded bg-[#1B3A6B] flex items-center justify-center flex-shrink-0 border border-blue-800">
                <User size={12} className="text-blue-100" />
              </div>
              <div className="truncate text-xs sm:text-sm font-semibold text-white">{client?.personalInfo?.name || 'Demo client'}</div>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-xs text-blue-300">
              <ShieldCheck size={14} className="text-blue-400" aria-hidden="true" />
              <span>{client?.riskProfile ? `${client.riskProfile} risk profile` : 'Loading profile'}</span>
            </div>
          </div>
        )}
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 bg-[#E2E8F0]/50">
          <div className="mx-auto max-w-[1500px] px-6 py-6">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
