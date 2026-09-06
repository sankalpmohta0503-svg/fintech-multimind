import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileSearch, 
  Target, 
  PieChart, 
  Sparkles, 
  Lightbulb, 
  FileText,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Client Profile', path: '/profile', icon: User },
    { name: 'Financial Audit', path: '/audit', icon: FileSearch },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'What-If Simulator', path: '/simulator', icon: Sparkles },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Advisor Report', path: '/report', icon: FileText },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-primary-600">FinAuditX</h1>
              <p className="text-xs text-gray-500">Financial Co-Pilot</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${active 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Demo Client Info */}
        {sidebarOpen && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs font-medium text-gray-500 mb-1">Demo Client</div>
            <div className="text-sm font-semibold text-gray-900">Rahul Sharma</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-gray-600">Risk:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Moderate</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-gray-600">Health:</span>
              <span className="font-semibold text-yellow-600">61/100</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
