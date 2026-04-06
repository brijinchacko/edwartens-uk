import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  Award,
  Cpu,
  Factory,
  Zap,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Wrench,
  Monitor,
  Network,
  Settings,
  Bug,
  Droplets,
  Fuel,
  UtensilsCrossed,
  Pill,
  Car,
  Wind,
  Send,
  CheckCircle,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import CareerGuideClient from "./CareerGuideClient";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title:
    "How to Become an Automation Engineer in 2026 | Career Guide | EDWartens UK",
  description:
    "Complete guide to becoming an automation engineer in the UK. Learn about PLC programming careers, required skills, salary expectations, and the fastest path from beginner to employed.",
  keywords: [
    "how to become automation engineer",
    "plc programmer career",
    "industrial automation career uk",
    "automation engineer salary",
    "plc engineer jobs",
    "controls engineer career path",
    "scada engineer training",
    "plc programming career uk",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/automation-engineer-career-guide",
  },
  openGraph: {
    title:
      "How to Become an Automation Engineer in 2026 | Career Guide | EDWartens UK",
    description:
      "Complete guide to becoming an automation engineer in the UK. Learn about PLC programming careers, required skills, salary expectations, and the fastest path from beginner to employed.",
    url: "https://edwartens.co.uk/automation-engineer-career-guide",
    siteName: "EDWartens UK",
    type: "article",
  },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const careerSteps = [
  {
    step: 1,
    title: "Foundation",
    desc: "Engineering degree OR relevant industry experience in electrical, mechanical, or manufacturing roles.",
    color: "text-neon-blue",
    bg: "bg-neon-blue/10",
  },
  {
    step: 2,
    title: "PLC / SCADA Training",
    desc: "5-day intensive course with online recorded sessions at EDWartens covering Siemens TIA Portal, SCADA configuration, and hands-on labs.",
    color: "text-neon-green",
    bg: "bg-neon-green/10",
  },
  {
    step: 3,
    title: "First Role",
    desc: "Junior Controls Engineer or PLC Programmer. Typical salary: \u00a328,000 \u2013 \u00a335,000.",
    color: "text-cyan",
    bg: "bg-cyan/10",
  },
  {
    step: 4,
    title: "Mid-Level",
    desc: "Automation Engineer managing full control-system projects. Typical salary: \u00a340,000 \u2013 \u00a355,000.",
    color: "text-purple",
    bg: "bg-purple/10",
  },
  {
    step: 5,
    title: "Senior / Lead",
    desc: "Lead Controls Engineer or SCADA Architect overseeing multi-site deployments. Typical salary: \u00a355,000 \u2013 \u00a375,000+.",
    color: "text-neon-blue",
    bg: "bg-neon-blue/10",
  },
];

const skills = [
  { name: "PLC Programming", detail: "Siemens, Allen-Bradley", icon: Cpu },
  { name: "SCADA / HMI", detail: "Configuration & design", icon: Monitor },
  { name: "Electrical Schematics", detail: "Reading & creating", icon: Zap },
  { name: "Industrial Networking", detail: "Profinet, EtherNet/IP", icon: Network },
  { name: "Process Control", detail: "PID, instrumentation", icon: Settings },
  { name: "Troubleshooting", detail: "Fault-finding & diagnostics", icon: Bug },
];

const salaryData = [
  { level: "Entry", role: "Junior PLC Programmer", range: "\u00a328,000 \u2013 \u00a335,000" },
  { level: "Mid", role: "Automation Engineer", range: "\u00a340,000 \u2013 \u00a355,000" },
  { level: "Senior", role: "Lead Controls Engineer", range: "\u00a355,000 \u2013 \u00a375,000" },
  { level: "Specialist", role: "SCADA Architect", range: "\u00a365,000 \u2013 \u00a385,000" },
];

const industries = [
  { name: "Water & Wastewater", icon: Droplets, color: "text-neon-blue" },
  { name: "Oil & Gas", icon: Fuel, color: "text-yellow-400" },
  { name: "Food & Beverage", icon: UtensilsCrossed, color: "text-neon-green" },
  { name: "Pharmaceuticals", icon: Pill, color: "text-purple" },
  { name: "Automotive", icon: Car, color: "text-cyan" },
  { name: "Energy & Renewables", icon: Wind, color: "text-emerald-400" },
];

const faqs = [
  {
    q: "How long does it take to become an automation engineer?",
    a: "With a relevant engineering background, you can complete PLC and SCADA training in just 5 intensive days plus online recorded sessions and begin applying for junior roles immediately. Most graduates secure their first controls-engineering position within 2 to 4 months of completing training. Career progression to mid-level typically takes 2 to 3 years of hands-on experience.",
  },
  {
    q: "Do I need a university degree to work in automation?",
    a: "A degree in electrical, mechanical, or control engineering is helpful but not strictly required. Many successful automation engineers enter the field through apprenticeships, HNDs, or by transitioning from electrician or maintenance-technician roles. What employers value most is practical PLC programming ability and familiarity with industrial control systems.",
  },
  {
    q: "What programming languages do PLC engineers use?",
    a: "PLC programming uses the IEC 61131-3 standard languages: Ladder Diagram (LD), Structured Text (ST), Function Block Diagram (FBD), Instruction List (IL), and Sequential Function Chart (SFC). Ladder Diagram remains the most widely used in UK industry, while Structured Text is growing in popularity for complex logic. EDWartens courses cover all five languages.",
  },
  {
    q: "Is there a shortage of automation engineers in the UK?",
    a: "Yes. The UK engineering sector faces a well-documented skills gap, with the Institution of Engineering and Technology estimating the country needs tens of thousands of additional engineers each year. Automation and controls engineering roles are among the hardest to fill, making it an excellent career choice with strong job security and competitive salaries.",
  },
  {
    q: "What is the earning potential for automation engineers?",
    a: "Entry-level PLC programmers typically earn between \u00a328,000 and \u00a335,000. With 3 to 5 years of experience, automation engineers command \u00a340,000 to \u00a355,000. Senior and specialist roles in sectors like oil and gas or water treatment can exceed \u00a375,000, especially in London and the South East where a regional premium applies.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AutomationEngineerCareerGuidePage() {
  return (
    <div className="pt-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 pt-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-text-secondary">Automation Engineer Career Guide</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Career Guide 2026</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 max-w-4xl">
            Your Complete Guide to Becoming an{" "}
            <span className="gradient-text">Automation Engineer</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mb-8">
            Automation engineers design, programme, and maintain the control systems that keep factories,
            water-treatment plants, and energy facilities running. It is one of the fastest-growing and
            best-paid engineering disciplines in the UK, and the skills gap means qualified professionals
            are in extremely high demand.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
            >
              <GraduationCap size={16} />
              View PLC Courses
            </Link>
            <Link
              href="/plc-engineer-salary-uk"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] text-white font-semibold text-sm hover:bg-white/[0.04] transition-all"
            >
              <TrendingUp size={16} />
              Salary Guide
            </Link>
          </div>
        </div>
      </section>

      {/* What is an Automation Engineer? */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">The Role</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                What Is an Automation Engineer?
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                An automation engineer is responsible for designing, programming, testing, and maintaining
                automated control systems used in industrial environments. These professionals work with
                Programmable Logic Controllers (PLCs), Supervisory Control and Data Acquisition (SCADA)
                systems, Human-Machine Interfaces (HMIs), and industrial networking equipment to ensure
                that manufacturing processes, utilities, and infrastructure operate safely and efficiently.
              </p>
              <p className="text-text-secondary leading-relaxed">
                In practice, the day-to-day work can range from writing PLC ladder-logic programmes for
                a new production line to troubleshooting a SCADA communication fault on a live water-treatment
                plant. Automation engineers typically collaborate with electrical engineers, process engineers,
                and operations teams. The role requires both strong technical skills and the ability to
                work under pressure, since downtime on critical infrastructure can be extremely costly.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Career Path Diagram */}
      <section className="py-20 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3 text-center">
              Career Path
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
              From Beginner to <span className="gradient-text">Senior Engineer</span>
            </h2>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue/40 via-neon-green/40 to-purple/40 hidden sm:block" />

            <div className="space-y-8 sm:space-y-12">
              {careerSteps.map((step, i) => (
                <ScrollReveal key={step.step} delay={i * 100}>
                  <div
                    className={`relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8 ${
                      i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    {/* Step number bubble */}
                    <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-10 flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full ${step.bg} border border-white/[0.06] flex items-center justify-center`}
                      >
                        <span className={`text-lg font-bold ${step.color}`}>{step.step}</span>
                      </div>
                    </div>

                    {/* Content card */}
                    <div
                      className={`glass-card rounded-xl p-6 flex-1 sm:max-w-md ${
                        i % 2 === 0 ? "sm:mr-auto sm:pr-8" : "sm:ml-auto sm:pl-8"
                      }`}
                    >
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Required */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3 text-center">
              Skills You Need
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
              Core Skills for <span className="gradient-text">Automation Engineers</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, i) => (
              <ScrollReveal key={skill.name} delay={i * 80}>
                <div className="glass-card rounded-xl p-6 card-hover-glow h-full">
                  <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-4">
                    <skill.icon size={20} className="text-neon-blue" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{skill.name}</h3>
                  <p className="text-sm text-text-secondary">{skill.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Salary Data */}
      <section className="py-20 mesh-gradient-purple">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3 text-center">
              Salary Data
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
              What Automation Engineers <span className="gradient-text">Earn in 2026</span>
            </h2>
            <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
              UK salaries for automation and controls engineers, based on industry data from
              recruitment platforms and employer surveys.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="glass-card rounded-2xl overflow-hidden max-w-3xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Level
                      </th>
                      <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Role
                      </th>
                      <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-text-muted font-medium">
                        Salary Range
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryData.map((row, i) => (
                      <tr
                        key={row.role}
                        className={
                          i < salaryData.length - 1
                            ? "border-b border-white/[0.06]"
                            : ""
                        }
                      >
                        <td className="px-6 py-4 text-text-muted">{row.level}</td>
                        <td className="px-6 py-4 text-white font-medium">{row.role}</td>
                        <td className="px-6 py-4 text-neon-green font-semibold data-display">
                          {row.range}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          <div className="text-center mt-6">
            <Link
              href="/plc-engineer-salary-uk"
              className="inline-flex items-center gap-1.5 text-sm text-neon-blue hover:underline"
            >
              View full salary breakdown by region and industry
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Industries Hiring */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3 text-center">
              Industries Hiring
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
              Sectors That Need <span className="gradient-text">Automation Engineers</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((ind, i) => (
              <ScrollReveal key={ind.name} delay={i * 60}>
                <div className="glass-card rounded-xl p-5 text-center card-hover-glow h-full">
                  <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <ind.icon size={22} className={ind.color} />
                  </div>
                  <p className="text-xs font-semibold text-white leading-tight">{ind.name}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How EDWartens Gets You There */}
      <section className="py-20 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto">
              <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
                Your Fast Track
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                How EDWartens Gets You There
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                EDWartens offers CPD-accredited, intensive PLC and SCADA training that takes you from
                beginner to job-ready with just 5 days of intensive training plus online sessions. Our Professional Module covers Siemens TIA Portal,
                FactoryIO 3D simulation, industrial networking, and real-world troubleshooting. Training
                is delivered at our Milton Keynes centre and online, with small batch sizes of 12 students
                maximum to ensure hands-on attention.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Course Length", value: "5 Days + Online", icon: Award },
                  { label: "Batch Size", value: "Max 12", icon: Briefcase },
                  { label: "Job Placement", value: "Support Included", icon: TrendingUp },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <item.icon size={18} className="text-neon-blue flex-shrink-0" />
                    <div>
                      <p className="text-xs text-text-muted">{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
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
                  Explore Courses
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] text-white font-semibold text-sm hover:bg-white/[0.04] transition-all"
                >
                  Talk to an Advisor
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
              Ready to Start Your <span className="gradient-text">Automation Career</span>?
            </h2>
            <p className="text-text-secondary text-center mb-10 max-w-xl mx-auto">
              Fill in the form below and our team will get back to you within 24 hours with course
              details, upcoming batch dates, and funding options.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <CareerGuideClient />
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 mesh-gradient-purple">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3 text-center">
              FAQs
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <CareerGuideFAQ faqs={faqs} />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm text-neon-blue hover:underline"
            >
              View all 30+ FAQs
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />

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
                name: "Automation Engineer Career Guide",
                item: "https://edwartens.co.uk/automation-engineer-career-guide",
              },
            ],
          }),
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Server-side FAQ Component (no interactivity needed for SEO)
// ---------------------------------------------------------------------------

function CareerGuideFAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <details key={i} className="glass-card rounded-xl group">
          <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer">
            <span className="text-sm font-semibold text-white">{faq.q}</span>
            <ChevronRight
              size={18}
              className="text-text-muted flex-shrink-0 transition-transform duration-200 group-open:rotate-90"
            />
          </summary>
          <div className="px-5 pb-5 -mt-1">
            <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
