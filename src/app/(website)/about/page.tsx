import Image from "next/image";
import { Building2, Globe, Users, Award, Calendar } from "lucide-react";
import Ecosystem from "@/components/Ecosystem";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About EDWartens UK - Training Division of Wartens",
  description:
    "Learn about EDWartens, the training division of Wartens - a global engineering company. 30,000+ engineers trained across 4 countries. CPD Accredited PLC, SCADA, and industrial automation training in Milton Keynes, UK.",
  keywords: [
    "about EDWartens",
    "EDWartens UK",
    "Wartens training division",
    "automation training company UK",
    "PLC training provider Milton Keynes",
    "industrial automation education",
    "CPD accredited training provider",
    "engineering training company UK",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/about",
  },
  openGraph: {
    title: "About EDWartens UK - Training Division of Wartens",
    description:
      "30,000+ engineers trained globally. CPD Accredited PLC, SCADA & industrial automation training in Milton Keynes.",
    url: "https://edwartens.co.uk/about",
  },
};

const timeline = [
  { year: "2015", event: "Wartens founded as an engineering & technology company" },
  { year: "2018", event: "EDWartens training division launched in India" },
  { year: "2022", event: "Expanded to UAE (edwartens.biz)" },
  { year: "2023", event: "UK operations launched - Milton Keynes office established" },
  { year: "2024", event: "US expansion (edwartens.us) - 30,000+ engineers trained globally" },
  { year: "2025", event: "UK StartUp Awards National Winner - CPD Accreditation achieved" },
];

const techPartners = [
  "Siemens", "Rockwell Automation", "ABB", "Delta", "FANUC",
  "Festo", "Mitsubishi Electric", "Omron", "Factory I/O", "Meta (VR)",
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">About Us</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            About <span className="gradient-text">EDWartens</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            EDWartens is the training division of Wartens, a global engineering and technology company.
            We train engineers in Physical AI (Industrial Automation) and Digital AI, with operations in
            India, UK, UAE, and the United States.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 border border-white/[0.06]">
              <Image
                src="/images/JBC.jpeg"
                alt="Founder"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neon-green mb-2">Founder & CEO</p>
              <h2 className="text-2xl font-bold text-white mb-3">Brijin Chacko</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                A seasoned automation engineer and entrepreneur, Brijin founded Wartens with a vision to
                bridge the skills gap in industrial automation. Under his leadership, EDWartens has trained
                over 30,000 engineers across four countries, earning multiple national awards and industry accreditations.
              </p>
              <a
                href="https://jbc404.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neon-blue hover:underline"
              >
                jbc404.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-8">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-4">
                <Globe size={24} className="text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-text-secondary leading-relaxed">
                To provide world-class industrial automation and AI training that bridges the gap between
                academia and industry, empowering engineers with practical skills demanded by global employers.
              </p>
            </div>
            <div className="glass-card rounded-xl p-8">
              <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center mb-4">
                <Building2 size={24} className="text-neon-green" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Not a Training Institute</h3>
              <p className="text-text-secondary leading-relaxed">
                EDWartens is an engineering company that trains. Our instructors are practising engineers,
                and our curriculum is built from real-world projects - not textbooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, value: "10+", label: "Years of Excellence" },
              { icon: Users, value: "30,000+", label: "Engineers Trained" },
              { icon: Globe, value: "4", label: "Countries" },
              { icon: Award, value: "✓", label: "Dedicated Career Support" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card rounded-xl p-6 text-center">
                  <Icon size={28} className="text-neon-blue mx-auto mb-3" />
                  <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{s.value}</div>
                  <div className="text-sm text-text-muted">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Our <span className="gradient-text">Journey</span>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-4 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-green/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{item.year}</span>
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-neon-blue/20 to-transparent mt-2" />
                  )}
                </div>
                <div className="glass-card rounded-lg p-4 flex-1 mb-2">
                  <p className="text-sm text-text-secondary">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Technology <span className="gradient-text">Partners</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techPartners.map((p) => (
              <span key={p} className="px-5 py-2.5 rounded-full glass-card text-sm text-text-secondary">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Wartens Ecosystem */}
      <Ecosystem />
    </div>
  );
}
