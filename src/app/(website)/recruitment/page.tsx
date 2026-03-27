import Link from "next/link";
import {
  Users,
  Briefcase,
  Building2,
  Search,
  FileCheck,
  Handshake,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Recruitment UK - Oscabe Partnership",
  description:
    "EDWartens partners with Oscabe to provide specialist recruitment services for automation and engineering professionals across the UK. PLC programmers, SCADA engineers, controls engineers, and more.",
  keywords: [
    "automation recruitment UK",
    "PLC engineer recruitment",
    "engineering staffing UK",
    "SCADA engineer recruitment",
    "controls engineer jobs UK",
    "automation engineer recruitment",
    "Oscabe recruitment",
    "engineering recruitment agency UK",
    "PLC programmer jobs",
    "commissioning engineer recruitment",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/recruitment",
  },
  openGraph: {
    title: "Automation Recruitment UK - Oscabe Partnership | EDWartens UK",
    description:
      "Specialist recruitment for automation engineers. PLC, SCADA, controls & commissioning roles across the UK.",
    url: "https://edwartens.co.uk/recruitment",
  },
};

const howItWorks = [
  {
    step: "01",
    icon: FileCheck,
    title: "Complete Your Training",
    description:
      "Finish your EDWartens CPD Accredited programme. Your skills, assessment results, and project portfolio are shared with our recruitment team.",
  },
  {
    step: "02",
    icon: Search,
    title: "Profile & CV Preparation",
    description:
      "Oscabe recruiters work with you to build a professional CV and LinkedIn profile that highlights your automation skills and certifications.",
  },
  {
    step: "03",
    icon: Handshake,
    title: "Employer Matching",
    description:
      "Your profile is matched to active vacancies across our network of 200+ UK employers. Oscabe handles initial introductions and interview scheduling.",
  },
  {
    step: "04",
    icon: Briefcase,
    title: "Interview & Career Support",
    description:
      "Receive personalised interview coaching, technical mock interviews, and salary negotiation support. Oscabe provides ongoing career support throughout your job search.",
  },
];

const roleTypes = [
  "PLC Programmer",
  "SCADA Engineer",
  "Automation Engineer",
  "Controls Engineer",
  "Commissioning Engineer",
  "Industrial IoT Engineer",
  "Instrument Technician",
  "Systems Integrator",
  "Electrical Design Engineer",
  "Project Engineer (Controls)",
  "Panel Builder / Wiring Technician",
  "Field Service Engineer",
];

const benefits = [
  "Dedicated recruiter assigned to each graduate",
  "Access to exclusive automation vacancies not advertised publicly",
  "Technical interview preparation with industry-specific questions",
  "Salary benchmarking and negotiation support",
  "Ongoing career guidance after hiring",
  "No cost to candidates - Oscabe is funded by hiring employers",
];

export default function RecruitmentPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/[0.08] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
            </span>
            <span className="text-[11px] text-text-muted tracking-wide">
              Powered by Oscabe
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Recruitment <span className="gradient-text">Services</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            EDWartens partners with Oscabe, a specialist recruitment company
            within the Wartens ecosystem, to connect our graduates with leading
            automation and engineering employers across the UK.
          </p>
        </div>
      </section>

      {/* About Oscabe */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
                Our Partner
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
                About <span className="gradient-text">Oscabe</span>
              </h2>
              <p className="text-text-secondary mb-4 leading-relaxed">
                Oscabe is a specialist recruitment company focused on
                engineering, automation, and technology roles. As part of the
                Wartens ecosystem, Oscabe has deep connections with industrial
                employers who need automation-skilled professionals.
              </p>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Unlike generic recruitment agencies, Oscabe understands PLC
                programming, SCADA development, and industrial networking at a
                technical level. This means better candidate-employer matching
                and higher candidate-employer match rates.
              </p>
              <a
                href="https://oscabe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-neon-blue hover:underline"
              >
                Visit oscabe.com <ArrowRight size={14} />
              </a>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-6">
                Why Oscabe
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-neon-green flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-text-secondary">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              The Process
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              How Recruitment <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-6">
                <span className="text-2xl font-bold text-neon-blue/30 mb-3 block">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-neon-blue" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Roles */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              Career Paths
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Types of Roles <span className="gradient-text">Available</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Oscabe connects EDWartens graduates with a wide range of automation
              and engineering opportunities across the UK.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {roleTypes.map((role) => (
              <div
                key={role}
                className="glass-card rounded-xl p-4 flex items-center gap-3"
              >
                <Briefcase size={16} className="text-neon-green flex-shrink-0" />
                <span className="text-sm text-text-secondary">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Ready to Start Your <span className="gradient-text">Career</span>?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Contact us to learn about our training programmes and how our
            partnership with Oscabe can fast-track your career in automation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Contact Us
            </Link>
            <Link
              href="/placements"
              className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              View Career Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
