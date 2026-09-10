import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function Header() {
  return (
    <header className="app-shell-chrome w-full bg-white border-b border-[#BFDBFE] shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">

          {/* Left branding */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1B3A6B] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
                FIN
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-[#1B3A6B] leading-none">
                  FinAudit<span className="text-yellow-400">X</span>
                </h1>
                <p className="text-xs text-[#4B6080] mt-1">
                  Intelligent Financial Advisory & Audit
                </p>
              </div>
            </Link>
          </div>

          {/* Center navigation & tagline */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-xs sm:text-sm font-semibold text-[#1F3555] hover:text-[#EA580C] transition-colors">
              Dashboard
            </Link>
            <Link to="/about" className="text-xs sm:text-sm font-semibold text-[#1F3555] hover:text-[#EA580C] transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-xs sm:text-sm font-semibold text-[#1F3555] hover:text-[#EA580C] transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8] border border-[#BFDBFE]">
              SIH 2026
            </span>

            <div className="hidden sm:flex items-center gap-3 text-[#4B6080]">
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-[#EA580C] transition-colors"
              >
                <InstagramIcon />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-[#EA580C] transition-colors"
              >
                <FacebookIcon />
              </a>

              <a
                href="#"
                aria-label="Twitter X"
                className="hover:text-[#EA580C] transition-colors"
              >
                <XIcon />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-[#EA580C] transition-colors"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;