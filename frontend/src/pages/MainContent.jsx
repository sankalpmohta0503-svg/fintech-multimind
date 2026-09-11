import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  ShieldCheck,
  Target,
  SlidersHorizontal,
  Sparkles,
  FileText,
  LayoutDashboard,
  UserCircle,
  PieChart,
  Clock,
  MessageSquareText,
  ArrowRight,
} from 'lucide-react';

import bse from '../assets/homeImages/bse.jfif';
import bull from '../assets/homeImages/bull.jfif';
import financialInstitute from '../assets/homeImages/financial institute.jfif';
import minister from '../assets/homeImages/minister.jfif';
import nse from '../assets/homeImages/nse.jfif';

// --- Static content -------------------------------------------------------

const SLIDES = [
  { src: bull, caption: 'Market-aware portfolio views' },
  { src: bse, caption: 'BSE-linked data context' },
  { src: nse, caption: 'NSE-linked data context' },
  { src: financialInstitute, caption: 'Built for institutional-grade rigor' },
  { src: minister, caption: 'Grounded in India\u2019s regulatory landscape' },
];

const WORKFLOW = [
  { icon: Database, title: 'Consolidate', copy: 'Pull client data, holdings, and goals into a single working view.' },
  { icon: ShieldCheck, title: 'Audit', copy: 'Run a structured audit of the financial plan against its stated goals.' },
  { icon: Target, title: 'Identify', copy: 'Surface risks, gaps, and misalignments an advisor should act on.' },
  { icon: SlidersHorizontal, title: 'Simulate', copy: 'Test what-if scenarios before recommending any change.' },
  { icon: Sparkles, title: 'Recommend', copy: 'Get a ranked set of recommendations, each with its reasoning attached.' },
  { icon: FileText, title: 'Report', copy: 'Turn the audit into a client-ready advisor report.' },
];

const FEATURES = [
  { icon: LayoutDashboard, title: 'Dashboard', copy: 'One screen for every client, plan, and open action item.' },
  { icon: UserCircle, title: 'Client Profile', copy: 'Full financial context: income, obligations, goals, and history.' },
  { icon: ShieldCheck, title: 'Financial Audit', copy: 'Structured checks against gaps, over-exposure, and missed goals.' },
  { icon: Target, title: 'Goals', copy: 'Track progress on every goal against the plan that supports it.' },
  { icon: PieChart, title: 'Portfolio', copy: 'Allocation, concentration, and performance in one view.' },
  { icon: SlidersHorizontal, title: 'What-If Simulator', copy: 'Model market, income, or life-event changes before they happen.' },
  { icon: Sparkles, title: 'Recommendations', copy: 'Explainable suggestions an advisor can stand behind.' },
  { icon: FileText, title: 'Advisor Report', copy: 'A clear, client-facing summary generated from the audit.' },
];

const VALUE_PROPS = [
  {
    icon: Clock,
    title: 'Less time compiling, more time advising',
    copy: 'FinAuditX consolidates the numbers so the conversation can start at the analysis, not the spreadsheet.',
  },
  {
    icon: MessageSquareText,
    title: 'Recommendations you can explain',
    copy: 'Every suggestion carries the reasoning behind it, so advisors can walk clients through the "why," not just the "what."',
  },
  {
    icon: ShieldCheck,
    title: 'An audit trail for every plan',
    copy: 'Each review is structured and repeatable, so nothing depends on memory or a one-off spreadsheet.',
  },
];

// --- Motion variants --------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const heroWord = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function MainContent() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const headline = 'Audit-grade clarity for every financial plan you build.';

  return (
    <main className="bg-white">
      {/* --- Hero --- */}
      <section className="bg-[#0A2E5C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.h1
              className="text-4xl lg:text-5xl font-semibold leading-tight tracking-tight"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {headline.split(' ').map((word, i) => (
                <motion.span key={i} variants={heroWord} className="inline-block mr-2">
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="mt-6 text-base lg:text-lg text-[#C6D3E8] max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              FinAuditX helps advisors consolidate client data, audit financial plans, and turn
              analysis into recommendations they can explain with confidence.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 bg-[#0EA5A0] hover:bg-[#0C8F8A] transition-colors text-white font-semibold px-6 py-3 rounded-full"
              >
                Get started
                <ArrowRight size={18} />
              </button>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 transition-colors font-semibold px-6 py-3 rounded-full"
              >
                Sign in
              </Link>
            </motion.div>
          </div>

          {/* Slideshow */}
          <motion.div
            className="relative w-full h-72 lg:h-96 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <img
                  src={SLIDES[slideIndex].src}
                  alt={SLIDES[slideIndex].caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-sm font-medium text-white">{SLIDES[slideIndex].caption}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute top-3 right-3 flex gap-1.5">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === slideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Introduction --- */}
      <motion.section
        className="max-w-5xl mx-auto px-6 py-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
      >
        <h2 className="text-3xl font-semibold text-[#0A2E5C] mb-5">What FinAuditX does</h2>
        <p className="text-base lg:text-lg text-[#475569] leading-relaxed max-w-3xl mx-auto">
          FinAuditX is a financial advisory and audit platform built for advisors working in the
          Indian market. It brings client data, goals, and portfolios into one place, audits
          financial plans for risks and gaps, and runs what-if simulations before a recommendation
          ever reaches a client &mdash; so every suggestion comes with the reasoning behind it.
        </p>
      </motion.section>

      {/* --- Core workflow --- */}
      <section className="bg-[#F5F7FA] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-3xl font-semibold text-[#0A2E5C] text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            The core workflow
          </motion.h2>

          <motion.div
            className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {/* connecting line, desktop only */}
            <div className="hidden lg:block absolute top-6 left-[8%] right-[8%] h-px bg-[#DCE3EC]" />

            {WORKFLOW.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title} variants={fadeUp} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#0A2E5C] text-[#0A2E5C] mb-4">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-semibold text-[#0EA5A0] mb-1">{`0${i + 1}`}</span>
                  <h3 className="text-sm font-semibold text-[#0A2E5C] mb-1">{step.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{step.copy}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- Key platform features --- */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-3xl font-semibold text-[#0A2E5C] text-center mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            Everything an advisor's practice needs
          </motion.h2>
          <motion.p
            className="text-center text-[#64748B] max-w-xl mx-auto mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            Eight modules, one platform, no switching between spreadsheets and tools.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="group p-6 rounded-xl border border-[#E2E8F0] hover:border-[#0EA5A0] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#EAF6F5] text-[#0EA5A0] mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0A2E5C] mb-2">{feature.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{feature.copy}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- Indian financial context --- */}
      <motion.section
        className="bg-[#0A2E5C] text-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-5">Built around the Indian financial system</h2>
            <p className="text-[#C6D3E8] leading-relaxed mb-4">
              Advisors in India work within a specific regulatory and market context &mdash;
              exchange-listed instruments, evolving policy, and clients who expect their advisor
              to know the landscape. FinAuditX is designed with that context in mind, not adapted
              from a generic global template.
            </p>
            <p className="text-[#C6D3E8] leading-relaxed">
              The audit and recommendation logic accounts for the instruments, institutions, and
              regulatory backdrop an Indian advisor actually works with every day.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={nse} alt="NSE market context" className="rounded-lg h-40 w-full object-cover" />
            <img src={bse} alt="BSE market context" className="rounded-lg h-40 w-full object-cover mt-8" />
            <img
              src={financialInstitute}
              alt="Institutional financial context"
              className="rounded-lg h-40 w-full object-cover"
            />
            <img src={minister} alt="Policy and regulatory context" className="rounded-lg h-40 w-full object-cover mt-8" />
          </div>
        </div>
      </motion.section>

      {/* --- Advisor-focused value --- */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-3xl font-semibold text-[#0A2E5C] text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            Why advisors use FinAuditX
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {VALUE_PROPS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeUp} className="p-2">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#0A2E5C] text-white mb-5">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-[#0A2E5C] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{item.copy}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- CTA --- */}
      <motion.section
        className="bg-[#EAF6F5] py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-[#0A2E5C] mb-4">
            Bring audit-grade rigor to your practice
          </h2>
          <p className="text-[#475569] mb-8">
            Set up your first client audit in minutes and see where the plan needs attention.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 bg-[#0EA5A0] hover:bg-[#0C8F8A] transition-colors text-white font-semibold px-8 py-3.5 rounded-full"
          >
            Create your account
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.section>
    </main>
  );
}

export default MainContent;
