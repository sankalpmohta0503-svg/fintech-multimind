import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import logo from '../assets/logo.png';
import './Header2.css';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'What-If Simulator', href: '/simulator' },
  { label: 'Advisor Reports', href: '/report' },
];

function Header2() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-[#DCE3EC] sticky top-0 z-50">
      {/* Trust strip */}
      <div className="hidden md:flex items-center justify-between bg-[#0A2E5C] text-[#B9C9E0] text-xs px-8 py-1.5">
        <span>Financial audit &amp; advisory intelligence for modern advisors</span>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram size={14} /></a>
          <a href="#" aria-label="Facebook" className="hover:text-white transition-colors"><Facebook size={14} /></a>
          <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter size={14} /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin size={14} /></a>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={logo} alt="FinAuditX" className="h-9 w-9 object-contain" />
          <span className="font-finAudit text-2xl text-[#0A2E5C] tracking-tight">
            FinAudit<span className="text-yellow-400">X</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-[#334155] hover:text-[#0A2E5C] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link to="/signin" className="text-sm font-semibold text-[#0A2E5C] hover:text-[#0EA5A0] transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold text-white bg-[#0EA5A0] hover:bg-[#0C8F8A] transition-colors rounded-full px-5 py-2"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden text-[#0A2E5C]"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[#DCE3EC] px-6 py-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block text-sm font-medium text-[#334155]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 pt-3 border-t border-[#DCE3EC]">
            <Link to="/signin" className="text-sm font-semibold text-[#0A2E5C]" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-white bg-[#0EA5A0] rounded-full px-5 py-2"
              onClick={() => setMenuOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header2;
