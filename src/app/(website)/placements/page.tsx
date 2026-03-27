import Link from "next/link";
import {
  TrendingUp,
  Users,
  Building2,
  Award,
  BarChart3,
  Briefcase,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Support & Placements - Automation Engineer Careers UK",
  description:
    "Dedicated career support for EDWartens graduates. Explore UK employers hiring automation engineers, salary ranges for PLC programmers, SCADA engineers, and controls engineers. Average 6-week time to hire.",
  keywords: [
    "automation engineer career UK",
    "PLC programmer career",
    "SCADA engineer salary UK",
    "engineering career support",
    "controls engineer salary",
    "automation engineer jobs UK",
    "PLC engineer salary UK",
    "commissioning engineer UK",
    "IIoT engineer jobs",
    "automation placements UK",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/placements",
  },
  openGraph: {
    title: "Career Support & Placements | EDWartens UK",
    description:
      "Dedicated career support for automation graduates. 200+ UK employer network. PLC, SCADA & controls engineering roles.",
    url: "https://edwartens.co.uk/placements",
  },
};

const stats = [
  { label: "Dedicated Career Support", value: "✓", icon: TrendingUp },
  { label: "UK Employers Network", value: "200+", icon: Building2 },
  { label: "Graduates Supported", value: "2,500+", icon: Users },
  { label: "Average Time to Hire", value: "6 Weeks", icon: BarChart3 },
];

const employers = [
  "Siemens",
  "ABB",
  "Schneider Electric",
  "Shell",
  "BP",
  "Honeywell",
  "Emerson",
  "Rolls Royce",
  "JLR",
  "Tata Steel",
  "Amazon",
  "Nissan",
  "Ford",
  "AstraZeneca",
  "GSK",
  "National Grid",
  "Network Rail",
  "BT",
  "BAE Systems",
  "EDF Energy",
];

const salaries = [
  {
    role: "PLC Programmer",
    range: "£35,000 -£55,000",
    description:
      "Design and implement PLC control logic for manufacturing, water treatment, and process industries using Siemens, Allen Bradley, and other platforms.",
  },
  {
    role: "SCADA Engineer",
    range: "£40,000 -£65,000",
    description:
      "Develop supervisory control and data acquisition systems. Build operator dashboards, alarm management, and historian configurations for plant-wide visibility.",
  },
  {
    role: "Automation Engineer",
    range: "£38,000 -£60,000",
    description:
      "Integrate PLCs, drives, sensors, and actuators into automated production lines. Manage project delivery from design to commissioning.",
  },
  {
    role: "Controls Engineer",
    range: "£42,000 -£68,000",
    description:
      "Specify and program control systems for complex industrial processes. Lead FAT and SAT activities, and provide ongoing system optimisation.",
  },
  {
    role: "Commissioning Engineer",
    range: "£45,000 -£70,000",
    description:
      "Bring automated systems to life on site. Perform loop checks, I/O testing, sequence testing, and handover to operations teams across the UK and internationally.",
  },
  {
    role: "IIoT Engineer",
    range: "£45,000 -£75,000",
    description:
      "Bridge OT and IT by implementing Industrial IoT solutions. Deploy edge devices, MQTT brokers, cloud connectivity, and data analytics platforms.",
  },
];

export default function PlacementsPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Career Support
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Your Career in <span className="gradient-text">Automation</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            EDWartens graduates are working at the UK&apos;s leading engineering
            and industrial companies. Our training programmes include dedicated
            career support designed to help you pursue opportunities in
            automation.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={22} className="text-neon-blue" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employers Grid */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              Employer Network
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Top UK Employers Hiring{" "}
              <span className="gradient-text">Our Graduates</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Our graduates work across energy, manufacturing,
              pharmaceuticals, automotive, defence, and infrastructure sectors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {employers.map((name) => (
              <div
                key={name}
                className="glass-card rounded-xl p-4 flex items-center justify-center text-center"
              >
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-neon-blue flex-shrink-0" />
                  <span className="text-sm text-text-secondary font-medium">
                    {name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary Data */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              UK Salary Data
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Automation Careers Pay{" "}
              <span className="gradient-text">Top Salaries</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Industrial automation professionals are in high demand across the
              UK. These are typical salary ranges for roles our graduates move
              into.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaries.map((s) => (
              <div key={s.role} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-neon-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {s.role}
                    </h3>
                    <p className="text-sm text-neon-green font-medium">
                      {s.range}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Career Support Works */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              The Process
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              How Career Support <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Complete Training",
                text: "Finish your CPD Accredited course and earn your EDWartens certification.",
              },
              {
                step: "02",
                title: "CV & Profile Building",
                text: "Our team helps you craft an industry-ready CV and LinkedIn profile tailored to automation roles.",
              },
              {
                step: "03",
                title: "Employer Matching",
                text: "Oscabe, our recruitment partner, matches you with relevant employers based on your skills and location.",
              },
              {
                step: "04",
                title: "Interview & Offer",
                text: "Receive interview coaching, attend interviews, and secure your offer. We support you until day one.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card rounded-xl p-6">
                <span className="text-2xl font-bold text-neon-blue/30 mb-3 block">
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Start Your Automation{" "}
            <span className="gradient-text">Career Today</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Join the next cohort and benefit from our dedicated career support.
            Speak with our admissions team to learn which programme is right for
            you.
          </p>
          <p className="text-xs text-text-muted max-w-2xl mx-auto mb-8">
            Career support services are provided to assist graduates. Employment
            outcomes depend on individual qualifications, market conditions, and
            effort. EDWartens does not guarantee employment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Get in Touch
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              View Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
