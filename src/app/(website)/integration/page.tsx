import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  Monitor,
  Settings,
  Zap,
  Factory,
  Network,
  ArrowRight,
  CheckCircle,
  Shield,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering & Integration Services",
  description:
    "Wartens provides industrial automation engineering services including PLC programming, SCADA integration, system commissioning, and ongoing support across the UK.",
};

const services = [
  {
    icon: Cpu,
    title: "PLC Programming",
    description:
      "Custom PLC software development for Siemens, Allen Bradley, ABB, Schneider, Mitsubishi, and other platforms. From simple machine control to complex batch processing and motion control applications.",
  },
  {
    icon: Monitor,
    title: "SCADA Integration",
    description:
      "Design and deployment of SCADA systems using WinCC, Ignition, FactoryTalk, AVEVA, and Citect. We build operator dashboards, alarm management, trending, and reporting solutions.",
  },
  {
    icon: Settings,
    title: "System Commissioning",
    description:
      "On-site commissioning of automation systems. We handle loop checks, I/O testing, sequence testing, FAT, SAT, and handover to your operations team anywhere in the UK.",
  },
  {
    icon: Network,
    title: "Industrial Networking",
    description:
      "Design and implementation of PROFINET, Ethernet/IP, Modbus TCP, PROFIBUS, and DeviceNet networks. We ensure reliable communications between PLCs, drives, and field devices.",
  },
  {
    icon: Factory,
    title: "Control Panel Design",
    description:
      "Electrical design, schematic creation, and panel build for control cabinets, MCC panels, and distribution boards. Designed to BS EN 61439 standards.",
  },
  {
    icon: Zap,
    title: "IIoT & Data Solutions",
    description:
      "Bridge the gap between OT and IT with edge computing, MQTT, OPC-UA, cloud connectivity, and real-time analytics. Turn your plant data into actionable insights.",
  },
];

const industries = [
  "Manufacturing",
  "Oil & Gas",
  "Water & Wastewater",
  "Pharmaceuticals",
  "Food & Beverage",
  "Automotive",
  "Energy & Utilities",
  "Logistics & Warehousing",
  "Aerospace & Defence",
  "Building Automation",
];

const whyWartens = [
  "20+ years of engineering experience across global markets",
  "Siemens Solution Partner and Rockwell Automation Recognised System Integrator",
  "UK-based engineering team available for on-site and remote support",
  "Full project lifecycle: specification, design, build, commissioning, and maintenance",
  "Competitive rates with transparent project pricing",
  "CPD Accredited training programmes",
];

export default function IntegrationPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/stock/industrial-panel.jpg"
            alt="Industrial control panel engineering"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/90 to-[#0a0a14]/70" />
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/[0.08] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
            </span>
            <span className="text-[11px] text-text-muted tracking-wide">
              Powered by Wartens
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Engineering &{" "}
            <span className="gradient-text">Integration Services</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Wartens, the parent company of EDWartens, provides end-to-end
            industrial automation engineering services. From PLC programming
            to system commissioning, we deliver reliable control solutions for
            UK industries.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
              Our Services
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              What We <span className="gradient-text">Deliver</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-5">
                  <service.icon size={24} className="text-neon-blue" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
              Sectors
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Industries We <span className="gradient-text">Serve</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry) => (
              <span
                key={industry}
                className="px-5 py-2.5 rounded-full glass-card text-sm text-text-secondary hover:text-white hover:border-neon-blue/20 transition-colors"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Image Strip */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: "/images/stock/control-system.jpg", alt: "Industrial control system", label: "Control Systems" },
              { src: "/images/stock/engineering-work.jpg", alt: "Engineering work on automation systems", label: "Engineering Services" },
              { src: "/images/stock/data-dashboard.jpg", alt: "SCADA data dashboard", label: "SCADA & IIoT" },
            ].map((img) => (
              <div key={img.src} className="relative h-52 rounded-xl overflow-hidden border border-white/[0.06] group">
                <Image src={img.src} alt={img.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/90 via-[#0a0a14]/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold text-sm">{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Wartens */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
                Why Choose Us
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
                Why <span className="gradient-text">Wartens</span>
              </h2>
              <div className="space-y-4">
                {whyWartens.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-neon-green flex-shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-text-secondary">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-6">
                <Shield size={28} className="text-neon-blue" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Trusted Engineering Partner
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Wartens has delivered automation projects across four continents.
                Our UK engineering team combines deep technical expertise with
                local presence to provide responsive, high-quality service.
              </p>
              <a
                href="https://wartens.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
              >
                Visit wartens.com <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Need Automation{" "}
            <span className="gradient-text">Engineering Support</span>?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Whether you need a PLC programme written, a SCADA system designed,
            or a complete automation project delivered, Wartens can help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wartens.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Visit wartens.com <ArrowRight size={14} />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              Contact EDWartens
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
