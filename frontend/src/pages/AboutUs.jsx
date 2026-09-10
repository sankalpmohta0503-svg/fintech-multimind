import React from "react";
import { Shield, Target, Eye, TrendingUp, BarChart3, Building } from 'lucide-react';

function AboutUs() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1B3A6B]">About Us</h1>
        <p className="text-[#4B6080] mt-1">
          Learn about FinAuditX and our commitment to financial advisory excellence
        </p>
      </div>
      {/* Hero Banner */}
      <div className="card bg-gradient-to-br from-[#EFF6FF] to-blue-50">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded-lg">
                <Building className="text-[#1D4ED8]" size={28} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1B3A6B]">FinAuditX</h2>
                <p className="text-xs sm:text-sm text-[#4B6080]">Financial Co-Pilot • Audit & Advisory Platform</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#1F3555] leading-relaxed">
              FinAuditX is a comprehensive digital audit and advisory platform
              designed to empower clients with reliable financial insights,
              improved compliance, and informed decision-making for a stronger
              financial future.
            </p>
          </div>
          <div className="w-full md:w-80 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80"
              alt="FinAuditX audit and advisory team"
              className="w-full h-48 object-cover rounded-lg border border-[#BFDBFE]"
            />
          </div>
        </div>
      </div>
      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#EFF6FF] rounded-lg">
              <Target className="text-[#EA580C]" size={20} />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Our Mission</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#1F3555] leading-relaxed">
            Our mission is to simplify and strengthen the audit and advisory
            process by providing clients with a reliable digital platform for
            better financial insights, improved compliance, and informed
            decision-making.
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#EFF6FF] rounded-lg">
              <Eye className="text-[#15803D]" size={20} />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-[#1B3A6B]">Our Vision</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#1F3555] leading-relaxed">
            Our vision is to build a trusted and accessible audit and advisory
            platform that empowers clients with clear financial understanding,
            stronger compliance, and meaningful guidance for confident future
            decisions.
          </p>
        </div>
      </div>
      {/* What We Offer */}
      <div className="card">
        <h2 className="card-header">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#BFDBFE] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-[#1D4ED8]" size={18} />
              <span className="font-bold text-[#1B3A6B] text-xs sm:text-sm">Comprehensive Audits</span>
            </div>
            <p className="text-xs text-[#4B6080] leading-relaxed">
              In-depth financial health analysis covering income, expenses,
              assets, liabilities, and insurance coverage.
            </p>
          </div>
          <div className="bg-white border border-[#BFDBFE] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-[#15803D]" size={18} />
              <span className="font-bold text-[#1B3A6B] text-xs sm:text-sm">Smart Recommendations</span>
            </div>
            <p className="text-xs text-[#4B6080] leading-relaxed">
              AI-powered, personalized advisory insights to optimize your
              financial strategy and meet your goals.
            </p>
          </div>
          <div className="bg-white border border-[#BFDBFE] p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-[#EA580C]" size={18} />
              <span className="font-bold text-[#1B3A6B] text-xs sm:text-sm">Goal-Based Planning</span>
            </div>
            <p className="text-xs text-[#4B6080] leading-relaxed">
              Track, simulate, and plan across multiple financial goals with
              clear projections and gap analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
