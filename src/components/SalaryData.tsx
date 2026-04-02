"use client";

import Image from "next/image";
import { TrendingUp, ExternalLink } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const salaries = [
  {
    role: "PLC Programmer",
    avg: "£45,000",
    range: "£31,000 - £69,000",
    source: "PayScale, Indeed, Glassdoor",
    demand: "High",
  },
  {
    role: "SCADA Engineer",
    avg: "£48,000",
    range: "£35,000 - £76,000",
    source: "Indeed, Glassdoor, Talent.com",
    demand: "Very High",
  },
  {
    role: "Automation Engineer",
    avg: "£45,000",
    range: "£34,000 - £77,000",
    source: "Indeed, PayScale, Reed",
    demand: "Very High",
  },
  {
    role: "Controls Engineer",
    avg: "£47,000",
    range: "£33,000 - £63,000",
    source: "Indeed, Reed, Glassdoor",
    demand: "High",
  },
  {
    role: "Commissioning Engineer",
    avg: "£43,000",
    range: "£29,000 - £68,000",
    source: "Indeed, PayScale, IT Jobs Watch",
    demand: "High",
  },
  {
    role: "Industrial IoT / AI Engineer",
    avg: "£52,000",
    range: "£40,000 - £86,000",
    source: "Talent.com, Glassdoor, Indeed",
    demand: "Very High",
  },
];

const sources = [
  { name: "Indeed UK", url: "https://uk.indeed.com/career" },
  { name: "Glassdoor UK", url: "https://www.glassdoor.co.uk/Salaries" },
  { name: "PayScale UK", url: "https://www.payscale.com/research/UK" },
  { name: "Reed.co.uk", url: "https://www.reed.co.uk/average-salary" },
  { name: "Talent.com UK", url: "https://uk.talent.com/salary" },
];

export default function SalaryData() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <ScrollReveal>
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
          <div className="text-center lg:text-left">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              UK Salary Data 2025–2026
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Automation Careers Pay{" "}
              <span className="gradient-text gradient-text-animated">Top Salaries</span>
            </h2>
            <p className="text-text-secondary max-w-3xl mx-auto lg:mx-0">
              The UK faces a growing shortage of skilled automation professionals.
              Companies across manufacturing, energy, food & beverage, utilities,
              and infrastructure are actively recruiting — driving salaries upward
              year on year.
            </p>
          </div>
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/images/stock/data-dashboard.jpg"
              alt="Automation career salary data and industry growth"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a14]/30 via-[#0a0a14]/50 to-[#0a0a14]/70" />
          </div>
        </div>
        </ScrollReveal>

        {/* Salary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {salaries.map((s, idx) => (
            <ScrollReveal key={s.role} delay={idx * 100}>
            <div
              className="glass-card rounded-xl p-6 flex flex-col gap-3 hover:border-neon-green/20 transition-all card-hover-glow h-full"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={18} className="text-neon-green" />
                  </div>
                  <p className="text-sm font-semibold text-white">{s.role}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.demand === "Very High"
                      ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                      : "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                  }`}
                >
                  {s.demand} Demand
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white data-display">{s.avg}</p>
                  <p className="text-xs text-text-muted">UK average per year</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neon-green font-medium data-display">
                    {s.range}
                  </p>
                  <p className="text-[10px] text-text-muted">full range</p>
                </div>
              </div>
              <p className="text-[10px] text-text-muted border-t border-border pt-2">
                Sources: {s.source}
              </p>
            </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sources & Disclaimer */}
        <div className="mt-10 glass-card rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-text-secondary mb-1">
                <strong className="text-white">Data Sources:</strong> Salary
                figures are aggregated from leading UK job market platforms,
                based on reported salaries and job postings from 2025–2026.
              </p>
              <p className="text-xs text-text-muted">
                Actual salaries vary by location, experience, employer, and
                market conditions. London roles typically command 15–30% more.
                EDWartens does not guarantee any specific salary outcome.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {sources.map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-neon-blue transition-colors px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]"
                >
                  {src.name}
                  <ExternalLink size={8} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
