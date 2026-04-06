import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  TrendingUp,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  PoundSterling,
  BarChart3,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import SalaryGuideClient from "./SalaryGuideClient";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title:
    "PLC & Automation Engineer Salary Guide UK 2026 | EDWartens",
  description:
    "Comprehensive PLC engineer salary data for the UK in 2026. Compare salaries by role, region, experience, and industry. Controls engineers, SCADA engineers, and automation specialists.",
  keywords: [
    "plc engineer salary uk",
    "automation engineer salary",
    "scada engineer salary uk",
    "controls engineer pay",
    "plc programmer salary 2026",
    "industrial automation salary uk",
    "controls engineer salary london",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/plc-engineer-salary-uk",
  },
  openGraph: {
    title: "PLC & Automation Engineer Salary Guide UK 2026 | EDWartens",
    description:
      "Comprehensive PLC engineer salary data for the UK in 2026. Compare salaries by role, region, experience, and industry.",
    url: "https://edwartens.co.uk/plc-engineer-salary-uk",
    siteName: "EDWartens UK",
    type: "article",
  },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const salaryByRole = [
  { role: "Junior PLC Programmer", low: 28, high: 35, avg: 31 },
  { role: "PLC Technician", low: 30, high: 38, avg: 34 },
  { role: "Controls Engineer", low: 35, high: 48, avg: 42 },
  { role: "Automation Engineer", low: 40, high: 55, avg: 47 },
  { role: "SCADA Engineer", low: 42, high: 58, avg: 50 },
  { role: "Systems Integrator", low: 45, high: 60, avg: 52 },
  { role: "Senior Controls Engineer", low: 50, high: 65, avg: 57 },
  { role: "Lead Automation Engineer", low: 55, high: 72, avg: 63 },
  { role: "SCADA Architect", low: 65, high: 85, avg: 74 },
  { role: "Controls Engineering Manager", low: 65, high: 90, avg: 76 },
  { role: "Automation Consultant", low: 70, high: 95, avg: 80 },
  { role: "Freelance PLC Programmer", low: 55, high: 100, avg: 75 },
];

const salaryByRegion = [
  { region: "London & South East", modifier: "+15%", avg: 52, color: "text-neon-blue" },
  { region: "Midlands", modifier: "Baseline", avg: 45, color: "text-white" },
  { region: "North West", modifier: "+3%", avg: 46, color: "text-neon-green" },
  { region: "North East", modifier: "-2%", avg: 44, color: "text-text-secondary" },
  { region: "Scotland", modifier: "-5%", avg: 43, color: "text-cyan" },
  { region: "Wales", modifier: "-7%", avg: 42, color: "text-purple" },
  { region: "South West", modifier: "+1%", avg: 45, color: "text-neon-green" },
  { region: "East Anglia", modifier: "-3%", avg: 44, color: "text-text-secondary" },
];

const salaryByExperience = [
  { range: "0 \u2013 2 years", avg: "\u00a330,000", desc: "Graduate or career-changer with PLC training certification. Junior roles in commissioning or programming support." },
  { range: "3 \u2013 5 years", avg: "\u00a345,000", desc: "Independent controls engineer handling full project lifecycle. Often specialising in a single PLC platform." },
  { range: "5 \u2013 10 years", avg: "\u00a358,000", desc: "Senior engineer or team lead. Multi-platform experience across Siemens, Rockwell, and Schneider. Managing junior staff." },
  { range: "10+ years", avg: "\u00a372,000+", desc: "Principal engineer, architect, or consulting roles. Deep domain expertise in sectors like water, pharma, or oil and gas." },
];

const salaryByIndustry = [
  { industry: "Oil & Gas", avg: 65, note: "Highest-paying sector, often includes offshore premium" },
  { industry: "Water & Wastewater", avg: 52, note: "Large public-sector employers, stable demand" },
  { industry: "Pharmaceuticals", avg: 55, note: "GMP-regulated, high attention to validation" },
  { industry: "Energy & Renewables", avg: 50, note: "Growing sector with battery and solar projects" },
  { industry: "Automotive", avg: 48, note: "Robotics integration, high-volume production lines" },
  { industry: "Food & Beverage", avg: 42, note: "High volume of roles, lower average pay" },
  { industry: "Building Automation", avg: 40, note: "BMS/HVAC controls, strong growth in smart buildings" },
  { industry: "Defence", avg: 58, note: "Security clearance required, premium compensation" },
];

const euComparison = [
  { country: "United Kingdom", avg: "\u00a345,000", eur: "\u20ac52,000" },
  { country: "Germany", avg: "\u20ac55,000", eur: "\u20ac55,000" },
  { country: "Netherlands", avg: "\u20ac50,000", eur: "\u20ac50,000" },
  { country: "France", avg: "\u20ac42,000", eur: "\u20ac42,000" },
  { country: "Ireland", avg: "\u20ac48,000", eur: "\u20ac48,000" },
  { country: "Spain", avg: "\u20ac32,000", eur: "\u20ac32,000" },
  { country: "Poland", avg: "z\u0142120,000", eur: "\u20ac28,000" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PLCEngineerSalaryPage() {
  return (
    <div className="pt-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 pt-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-text-secondary">PLC Engineer Salary UK</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
            Salary Data 2026
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 max-w-4xl">
            PLC & Automation Engineer{" "}
            <span className="gradient-text">Salary Guide UK 2026</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mb-6">
            A comprehensive breakdown of what PLC programmers, controls engineers, SCADA specialists,
            and automation professionals earn across the United Kingdom. Data compiled from job-board
            listings, recruiter surveys, and employer reports.
          </p>

          {/* Key stat */}
          <div className="inline-flex items-center gap-4 glass-card rounded-xl px-6 py-4">
            <div className="w-12 h-12 rounded-lg bg-neon-green/10 flex items-center justify-center">
              <PoundSterling size={24} className="text-neon-green" />
            </div>
            <div>
              <p className="text-xs text-text-muted">UK Median Salary (All Levels)</p>
              <p className="text-2xl font-bold text-white data-display">&pound;42,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Salary by Role */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">By Role</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Salary by <span className="gradient-text">Job Title</span>
            </h2>
            <p className="text-text-secondary mb-10 max-w-2xl">
              Salaries vary significantly depending on job title and level of responsibility.
              Specialist roles like SCADA Architect or Automation Consultant command the highest premiums.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Role
                      </th>
                      <th className="text-right px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Low
                      </th>
                      <th className="text-right px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Average
                      </th>
                      <th className="text-right px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        High
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryByRole.map((row, i) => (
                      <tr
                        key={row.role}
                        className={
                          i < salaryByRole.length - 1
                            ? "border-b border-white/[0.04]"
                            : ""
                        }
                      >
                        <td className="px-5 py-3.5 text-white font-medium">{row.role}</td>
                        <td className="px-5 py-3.5 text-right text-text-muted data-display">
                          &pound;{row.low}k
                        </td>
                        <td className="px-5 py-3.5 text-right text-neon-green font-semibold data-display">
                          &pound;{row.avg}k
                        </td>
                        <td className="px-5 py-3.5 text-right text-text-muted data-display">
                          &pound;{row.high}k
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Salary by Region */}
      <section className="py-20 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">By Region</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Regional <span className="gradient-text">Pay Differences</span>
            </h2>
            <p className="text-text-secondary mb-10 max-w-2xl">
              London and the South East consistently offer the highest salaries, driven by higher
              cost of living and concentration of engineering consultancies. The Midlands serves as the
              baseline for national comparisons.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {salaryByRegion.map((reg, i) => (
              <ScrollReveal key={reg.region} delay={i * 60}>
                <div className="glass-card rounded-xl p-5 card-hover-glow h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-neon-blue" />
                    <p className="text-sm font-semibold text-white">{reg.region}</p>
                  </div>
                  <p className="text-2xl font-bold text-white data-display mb-1">
                    &pound;{reg.avg}k
                  </p>
                  <p className={`text-xs font-medium ${reg.color}`}>{reg.modifier}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Salary by Experience */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">By Experience</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
              How Experience Affects <span className="gradient-text">Your Salary</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {salaryByExperience.map((exp, i) => (
              <ScrollReveal key={exp.range} delay={i * 80}>
                <div className="glass-card rounded-xl p-6 card-hover-glow h-full">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-text-muted uppercase tracking-widest">{exp.range}</p>
                    <p className="text-lg font-bold text-neon-green data-display">{exp.avg}</p>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{exp.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Salary by Industry */}
      <section className="py-20 mesh-gradient-purple">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">By Industry</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Which Industries Pay the <span className="gradient-text">Most</span>?
            </h2>
            <p className="text-text-secondary mb-10 max-w-2xl">
              Industry choice has a major impact on earning potential. Oil and gas leads the way,
              while food and beverage and building automation typically sit at the lower end but offer
              the highest volume of available positions.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="space-y-3 max-w-3xl">
              {salaryByIndustry.map((ind) => {
                const barWidth = Math.round((ind.avg / 70) * 100);
                return (
                  <div key={ind.industry} className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">{ind.industry}</p>
                      <p className="text-sm font-bold text-neon-green data-display">
                        &pound;{ind.avg}k avg
                      </p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.04] mb-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-green"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted">{ind.note}</p>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* EU Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">EU Comparison</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How the UK Compares to <span className="gradient-text">Europe</span>
            </h2>
            <p className="text-text-secondary mb-10 max-w-2xl">
              UK automation engineer salaries are competitive within Europe. Germany leads in
              absolute terms, but the UK offers a strong combination of salary, demand, and career
              mobility.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass-card rounded-2xl overflow-hidden max-w-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Country
                      </th>
                      <th className="text-right px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Local Currency
                      </th>
                      <th className="text-right px-5 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        EUR Equiv.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {euComparison.map((row, i) => (
                      <tr
                        key={row.country}
                        className={`${
                          row.country === "United Kingdom" ? "bg-neon-blue/5" : ""
                        } ${i < euComparison.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                      >
                        <td className="px-5 py-3.5 text-white font-medium">
                          {row.country}
                          {row.country === "United Kingdom" && (
                            <span className="ml-2 text-[10px] bg-neon-blue/10 text-neon-blue px-1.5 py-0.5 rounded-full font-medium">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-text-secondary data-display">
                          {row.avg}
                        </td>
                        <td className="px-5 py-3.5 text-right text-neon-green font-semibold data-display">
                          {row.eur}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How to Increase Your Salary */}
      <section className="py-20 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto">
              <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
                Boost Your Earnings
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                How to Increase Your Salary
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                The single most effective way to increase your earning potential as an automation
                engineer is to gain formal PLC certification alongside practical, hands-on
                experience. Employers consistently pay a premium for candidates who hold recognised
                training credentials from accredited providers.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    title: "Get CPD-Accredited PLC Training",
                    desc: "Certified professionals earn 15-25% more than uncertified peers in equivalent roles.",
                  },
                  {
                    title: "Learn Multiple PLC Platforms",
                    desc: "Engineers proficient in both Siemens and Allen-Bradley command the highest salaries.",
                  },
                  {
                    title: "Specialise in a High-Paying Sector",
                    desc: "Oil and gas, water, and pharma pay significantly more than general manufacturing.",
                  },
                  {
                    title: "Develop SCADA and Networking Skills",
                    desc: "Full-stack controls engineers who can handle PLC, SCADA, and networking are rare and valuable.",
                  },
                  {
                    title: "Consider Contracting or Freelancing",
                    desc: "Day rates for freelance PLC programmers range from \u00a3300 to \u00a3550+, translating to very high annual earnings.",
                  },
                ].map((tip, i) => (
                  <div
                    key={tip.title}
                    className="flex gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-neon-green">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{tip.title}</p>
                      <p className="text-sm text-text-secondary">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
                >
                  <GraduationCap size={16} />
                  Start Your PLC Training Today
                </Link>
                <Link
                  href="/automation-engineer-career-guide"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] text-white font-semibold text-sm hover:bg-white/[0.04] transition-all"
                >
                  Read Career Guide
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquire" className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3 text-center">
              Get Started
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
              Ready to <span className="gradient-text">Earn More</span>?
            </h2>
            <p className="text-text-secondary text-center mb-10 max-w-xl mx-auto">
              Enquire about our PLC training courses and take the first step toward a higher-paying
              automation career.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <SalaryGuideClient />
          </ScrollReveal>
        </div>
      </section>

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://edwartens.co.uk",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "PLC Engineer Salary UK 2026",
                item: "https://edwartens.co.uk/plc-engineer-salary-uk",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
