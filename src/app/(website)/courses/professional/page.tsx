import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  BarChart3,
  Monitor,
  CheckCircle2,
  Cpu,
  BookOpen,
  Wrench,
  Users,
  Award,
  ArrowRight,
  Download,
  Layers,
  Settings,
  Zap,
  Shield,
  TrendingUp,
  FileText,
  Briefcase,
  GraduationCap,
  PoundSterling,
  Target,
  Video,
  BadgeCheck,
} from "lucide-react";
import FAQAccordion from "@/components/FAQAccordion";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Professional Module - Career-Focused PLC, HMI & SCADA Training",
  description:
    "EDWartens UK flagship Professional Module: 5-day classroom training + 12 hours recorded sessions. Covers Basic Electrical, Electronics, Pneumatics, Siemens PLC, HMI, WinCC SCADA. CPD Accredited with dedicated career support. £2,140 + VAT.",
  keywords: [
    "professional PLC course UK",
    "SCADA engineer training",
    "automation engineering course",
    "CPD accredited PLC training",
    "career focused PLC course",
    "Siemens PLC SCADA training",
    "HMI training UK",
    "WinCC SCADA course",
    "CPD accredited automation training",
    "industrial automation career",
    "PLC HMI SCADA course UK",
    "automation engineer training UK",
    "EDWartens professional module",
    "TIA Portal training UK",
    "Milton Keynes PLC training",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/courses/professional",
  },
  openGraph: {
    title:
      "Professional Module - Career-Focused PLC, HMI & SCADA Training | EDWartens UK",
    description:
      "Flagship 5-day + 12hr recorded sessions programme. Covers Electrical, Electronics, Pneumatics, Siemens PLC, HMI, WinCC SCADA. CPD Accredited with dedicated career support. £2,140 + VAT.",
    url: "https://edwartens.co.uk/courses/professional",
  },
};

const faqData = [
  {
    q: "What career support is included with this course?",
    a: "Our Professional Module includes dedicated interview preparation, resume writing, and career support. We work with a network of employers across the UK. While we cannot guarantee employment, our structured career support and industry connections give you the strongest possible foundation for pursuing your first automation role. Career outcomes depend on individual qualifications, experience, and market conditions.",
  },
  {
    q: "What does the £2,140 + VAT cover?",
    a: "The fee covers 5 full days of classroom training, 12+ hours of pre-recorded sessions for self-paced learning, all course materials and software licences for the duration, FactoryIO simulation access, CPD Accredited certification, interview preparation sessions, resume review, and lifetime access to our alumni community.",
  },
  {
    q: "Do I need prior engineering experience?",
    a: "No. The course starts with Phase 0 (pre-recorded sessions) covering Basic Electrical and Basic Electronics from scratch. This means even career switchers with no engineering background can follow the programme. However, a genuine interest in technology and willingness to study the pre-recorded material before the classroom sessions is essential.",
  },
  {
    q: "What is the format - is it all classroom-based?",
    a: "The programme combines two formats: 12+ hours of pre-recorded sessions (Phase 0) that you study at your own pace before the classroom dates, followed by 5 full days of intensive classroom training at our Milton Keynes facility. The recorded sessions build your foundation so you can make the most of the hands-on classroom time.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes, we offer flexible payment plans. Please contact our team to discuss instalment options that work for your budget. We want the course to be accessible to anyone serious about building a career in automation.",
  },
  {
    q: "How is the CPD accreditation verified?",
    a: "Your CPD Accredited certificate is issued through EDWartens UK and can be verified by employers through our online verification portal. CPD accreditation demonstrates that the course meets recognised standards of continuing professional development in the UK.",
  },
  {
    q: "What kind of roles can I apply for after completing this course?",
    a: "Graduates typically pursue roles such as PLC Programmer, Controls Engineer, Automation Technician, SCADA Engineer, Commissioning Engineer, and System Integrator. Salary ranges for these roles in the UK are typically between £30,000 and £55,000, with experienced engineers earning significantly more.",
  },
  {
    q: "Do you provide career support?",
    a: "Yes. Beyond interview prep and resume writing, we actively connect graduates with hiring employers in our network. Our career support team provides job leads, interview scheduling support, and follow-up coaching for up to 6 months after course completion. Employment is not guaranteed and outcomes depend on individual effort and market conditions.",
  },
];

const phases = [
  {
    phase: "Phase 0",
    title: "Foundation (Pre-recorded)",
    duration: "12+ hours self-paced",
    icon: Video,
    color: "neon-blue",
    topics: [
      "Basic Electrical - voltage, current, resistance, circuit theory",
      "AC and DC fundamentals, power calculations",
      "Basic Electronics - semiconductors, transistors, relays",
      "Sensor types - proximity, photoelectric, temperature, pressure",
      "Reading and interpreting electrical schematics",
    ],
  },
  {
    phase: "Phase 1",
    title: "Pneumatics & Industrial Automation",
    duration: "Day 1",
    icon: Settings,
    color: "neon-green",
    topics: [
      "Pneumatic system components - compressors, valves, actuators",
      "Pneumatic circuit design and reading P&ID diagrams",
      "Introduction to industrial automation architecture",
      "Sensors and actuators in automation systems",
      "Industrial communication basics - fieldbus overview",
    ],
  },
  {
    phase: "Phase 2",
    title: "PLC Fundamentals & Siemens S7-1200",
    duration: "Day 2",
    icon: Cpu,
    color: "neon-blue",
    topics: [
      "What is a PLC - architecture, scan cycle, memory",
      "Siemens S7-1200 hardware overview and I/O configuration",
      "TIA Portal setup and project creation",
      "Ladder logic - contacts, coils, latching, timers, counters",
      "Hands-on programming exercises with FactoryIO",
    ],
  },
  {
    phase: "Phase 3",
    title: "Siemens HMI & TIA Portal",
    duration: "Day 3",
    icon: Monitor,
    color: "neon-green",
    topics: [
      "Introduction to HMI - purpose and industrial applications",
      "Designing HMI screens in TIA Portal",
      "Tag configuration and PLC-HMI communication",
      "Alarm management and event logging",
      "Building a complete HMI project for a FactoryIO scenario",
    ],
  },
  {
    phase: "Phase 4",
    title: "WinCC SCADA",
    duration: "Day 4",
    icon: Layers,
    color: "neon-blue",
    topics: [
      "Introduction to SCADA systems and architecture",
      "WinCC installation and project configuration",
      "Creating SCADA screens, trends, and reports",
      "OPC communication setup with Siemens PLC",
      "Building a supervisory control project end-to-end",
    ],
  },
  {
    phase: "Phase 5",
    title: "Career Preparation & Assessment",
    duration: "Day 5",
    icon: Briefcase,
    color: "neon-green",
    topics: [
      "Comprehensive project combining PLC, HMI, and SCADA",
      "Technical interview preparation and common questions",
      "Resume and CV writing for automation roles",
      "LinkedIn profile optimisation for the automation industry",
      "Final assessment and CPD certificate award",
    ],
  },
];

const completionItems = [
  {
    icon: BadgeCheck,
    title: "CPD Accredited Certificate",
    desc: "Industry-recognised certification verifiable by employers via our online portal.",
  },
  {
    icon: Video,
    title: "12+ Hours Recorded Content",
    desc: "Lifetime access to 12+ hours of pre-recorded foundation sessions for revision and reference.",
  },
  {
    icon: FileText,
    title: "Interview Prep Pack",
    desc: "Technical question bank, CV template, and LinkedIn optimisation guide.",
  },
  {
    icon: Download,
    title: "Course Materials",
    desc: "All slides, PLC project files, HMI templates, and SCADA configuration guides.",
  },
  {
    icon: Users,
    title: "Alumni Network Access",
    desc: "Join 30,000+ engineers for job leads, mentorship, and industry updates.",
  },
  {
    icon: Briefcase,
    title: "6-Month Career Support",
    desc: "Active job matching, interview scheduling, and career coaching post-completion.",
  },
];

const salaryData = [
  { role: "PLC Programmer", range: "£31,000 - £69,000" },
  { role: "Controls Engineer", range: "£33,000 - £63,000" },
  { role: "SCADA Engineer", range: "£35,000 - £76,000" },
  { role: "Automation Engineer", range: "£34,000 - £77,000" },
  { role: "Commissioning Engineer", range: "£29,000 - £68,000" },
  { role: "Senior Automation Engineer", range: "£55,000 - £85,000+" },
];

export default async function ProfessionalModulePage() {
  const profBatches = await prisma.batch.findMany({
    where: { course: "PROFESSIONAL_MODULE", status: "UPCOMING", startDate: { gte: new Date() } },
    include: { _count: { select: { students: true } } },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="pt-20">
      {/* ===== HERO ===== */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-neon-blue transition-colors mb-6"
          >
            <ArrowRight size={14} className="rotate-180" />
            All Courses
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue">
              Flagship Programme
            </p>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-green text-[11px] font-semibold text-dark-primary">
              Most Popular
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Professional{" "}
            <span className="gradient-text">Module</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mb-8">
            Our comprehensive, career-focused programme covering everything from
            basic electrical theory to Siemens PLC, HMI, and WinCC SCADA. Five
            days of intensive classroom training plus 12+ hours of recorded
            sessions, with CPD accreditation and dedicated career support.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Clock size={14} className="text-neon-blue" /> 5 Days + 12hrs
              Recorded
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <BarChart3 size={14} className="text-neon-green" /> Comprehensive
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Monitor size={14} className="text-neon-blue" /> Classroom +
              Online
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm font-semibold text-neon-green">
              <PoundSterling size={14} /> £2,140 + VAT
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Shield size={14} className="text-neon-green" /> Career-Focused
            </span>
          </div>
        </div>
      </section>

      {/* ===== COURSE OVERVIEW ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Course <span className="gradient-text">Overview</span>
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  The Professional Module is EDWartens UK&apos;s flagship
                  training programme, designed to take you from zero experience
                  to a job-ready automation engineer. It is the only course in
                  the UK that covers the full stack of industrial automation -
                  from basic electrical theory and electronics through to
                  Siemens PLC programming, HMI design, and WinCC SCADA - in
                  one structured programme.
                </p>
                <p>
                  The course begins with 12+ hours of pre-recorded sessions
                  covering Basic Electrical and Basic Electronics, giving you
                  the foundation knowledge needed before you arrive at the
                  classroom. The five intensive classroom days then build
                  progressively through pneumatics, PLC programming with TIA
                  Portal, HMI development, and SCADA configuration.
                </p>
                <p>
                  What truly sets this programme apart is the career support.
                  Day 5 is dedicated to interview preparation, resume writing,
                  and LinkedIn optimisation. Post-completion, our career support
                  team provides six months of active job matching and career
                  coaching to help you pursue opportunities in the automation
                  sector.
                </p>
              </div>
            </div>

            {/* Pricing & Quick Info Card */}
            <div className="glass-card gradient-border rounded-2xl p-6 h-fit">
              <div className="text-center mb-6">
                <p className="text-sm text-text-muted mb-1">Course Fee</p>
                <p className="text-4xl font-bold gradient-text">£2,140</p>
                <p className="text-sm text-text-muted">+ VAT</p>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Duration</span>
                  <span className="text-white font-medium">
                    5 Days + 12hrs
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Level</span>
                  <span className="text-white font-medium">Comprehensive</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Mode</span>
                  <span className="text-white font-medium">
                    Classroom + Online
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Certificate</span>
                  <span className="text-neon-green font-medium">
                    CPD Accredited
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Career Support</span>
                  <span className="text-neon-green font-medium">
                    Career-Focused
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Payment Plans</span>
                  <span className="text-white font-medium">Available</span>
                </div>
              </div>
              <Link
                href="/contact"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Enrol Now <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-text-muted text-center mt-3">
                Flexible payment plans available
              </p>
              <p className="text-xs text-text-muted text-center mt-2">
                Instalments via Klarna & ClearPay available at checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT'S COVERED (Key Topics) ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              Complete Curriculum
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Everything You&apos;ll <span className="gradient-text">Master</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: "Basic Electrical", color: "neon-blue" },
              { icon: Cpu, label: "Basic Electronics", color: "neon-green" },
              { icon: Settings, label: "Pneumatics", color: "neon-blue" },
              {
                icon: Wrench,
                label: "Industrial Automation",
                color: "neon-green",
              },
              { icon: Layers, label: "PLC Fundamentals", color: "neon-blue" },
              {
                icon: BookOpen,
                label: "Siemens PLC / TIA Portal",
                color: "neon-green",
              },
              {
                icon: Monitor,
                label: "Siemens HMI / TIA Portal",
                color: "neon-blue",
              },
              { icon: Target, label: "WinCC SCADA", color: "neon-green" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="glass-card rounded-xl p-5 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-${item.color}/10 flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={20} className={`text-${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PHASE BREAKDOWN (Syllabus) ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              Phase-by-Phase Syllabus
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Your Learning <span className="gradient-text">Journey</span>
            </h2>
          </div>

          <div className="space-y-6">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <div key={phase.phase} className="glass-card rounded-2xl p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-${phase.color}/10 flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={24} className={`text-${phase.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`text-[11px] uppercase tracking-widest text-${phase.color} font-semibold`}
                        >
                          {phase.phase}
                        </span>
                        <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-white/[0.04]">
                          {phase.duration}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {phase.title}
                      </h3>
                    </div>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {phase.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-start gap-2.5 text-sm text-text-secondary"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-neon-green/60 mt-0.5 flex-shrink-0"
                        />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHO SHOULD ENROL ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
            Who Should <span className="gradient-text">Enrol</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Fresh Graduates",
                desc: "Engineering graduates who want a comprehensive, job-ready skill set that covers the full automation stack, not just one tool.",
              },
              {
                icon: Zap,
                title: "Career Switchers",
                desc: "Professionals from other industries who want to retrain for high-demand automation roles. No prior engineering experience needed.",
              },
              {
                icon: Wrench,
                title: "Electricians & Technicians",
                desc: "Qualified tradespeople looking to move into PLC programming, controls engineering, or system integration for better pay and career growth.",
              },
              {
                icon: Users,
                title: "International Professionals",
                desc: "Engineers relocating to the UK who need UK-recognised qualifications and an understanding of UK industry standards and employers.",
              },
              {
                icon: TrendingUp,
                title: "Upskilling Engineers",
                desc: "Working engineers who want to fill knowledge gaps - from PLC basics through to SCADA - in one structured programme.",
              },
              {
                icon: Briefcase,
                title: "Job Seekers",
                desc: "Anyone actively seeking employment in the automation sector who needs both technical skills and interview preparation support.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-neon-blue" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU GET ON COMPLETION ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
            What You Get on{" "}
            <span className="gradient-text">Completion</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-neon-green" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== REQUIREMENTS ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Requirements
          </h2>
          <div className="glass-card rounded-2xl p-8">
            <ul className="space-y-4">
              {[
                "A laptop with Windows 10 or later (required for TIA Portal and WinCC)",
                "Reliable internet connection (for pre-recorded sessions and software downloads)",
                "No prior engineering or PLC experience required - the programme starts from scratch",
                "Commitment to complete the 12+ hours of pre-recorded sessions before the classroom dates",
                "Valid photo ID for in-person attendance at the Milton Keynes training centre",
                "A genuine interest in pursuing a career in industrial automation",
              ].map((req) => (
                <li
                  key={req}
                  className="flex items-start gap-3 text-text-secondary"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-2.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SALARY DATA ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              UK Salary Data
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Career <span className="gradient-text">Earning Potential</span>
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl mx-auto">
              Automation engineering is one of the fastest-growing and
              highest-paying technical disciplines in the UK. Here are typical
              salary ranges for roles our graduates pursue.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryData.map((item) => (
              <div
                key={item.role}
                className="glass-card rounded-xl p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {item.role}
                  </h3>
                </div>
                <span className="text-sm font-medium text-neon-green whitespace-nowrap">
                  {item.range}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted text-center mt-6">
            Sources: Indeed UK, Glassdoor UK, PayScale, Reed.co.uk, Talent.com (2025–2026). Actual
            salaries vary by location, experience, and employer.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={faqData} />
          </div>
        </div>
      </section>

      {/* ===== UPCOMING BATCHES ===== */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Upcoming Batches</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Choose Your <span className="gradient-text">Start Date</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {profBatches.map((batch) => {
              const seats = batch.capacity - batch._count.students;
              return (
                <Link key={batch.id} href={`/courses/professional/batch/${batch.id}`} className="glass-card rounded-xl p-5 hover:border-neon-blue/20 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">{batch.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${seats <= 3 ? 'bg-yellow-400/10 text-yellow-400' : 'bg-neon-green/10 text-neon-green'}`}>
                      {seats} seats left
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                    <span>Starts: {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(batch.startDate)}</span>
                    <span>{batch.location || 'Milton Keynes'}</span>
                  </div>
                  <span className="text-xs text-neon-blue group-hover:underline">View Details & Register →</span>
                </Link>
              );
            })}
          </div>
          {profBatches.length === 0 && (
            <p className="text-center text-text-muted">No upcoming batches scheduled. <Link href="/contact" className="text-neon-blue hover:underline">Contact us</Link> to express interest.</p>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 mesh-gradient-hero relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Launch Your Automation{" "}
            <span className="gradient-text">Career Today</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-4">
            Join our flagship Professional Module and get the skills,
            certification, and career support you need to land your first
            automation role.
          </p>
          <p className="text-2xl font-bold gradient-text mb-8">
            £2,140 + VAT - Payment Plans Available
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
            >
              Book Free Consultation <ArrowRight size={16} />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg glass-card text-white font-semibold hover:bg-white/[0.06] transition-all"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
