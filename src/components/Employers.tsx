"use client";

import Image from "next/image";
import { ScrollReveal } from "./ScrollReveal";

const employers = [
  { name: "Siemens", logo: "/images/Company-Logos/Siemens-Logo-white.webp" },
  { name: "ABB", logo: "/images/Company-Logos/ABB-logo-white.webp" },
  { name: "Schneider Electric", logo: "/images/Company-Logos/Scheider-logo-white.webp" },
  { name: "Shell", logo: "/images/Company-Logos/Shell-logo-white.webp" },
  { name: "BP", logo: "/images/Company-Logos/bp-logo-png.webp" },
  { name: "Honeywell", logo: "/images/Company-Logos/Honeywell.webp" },
  { name: "Emerson", logo: "/images/Company-Logos/Emerson-logo-white.webp" },
  { name: "Jaguar Land Rover", logo: "/images/Company-Logos/Jaguar-white.webp" },
  { name: "Tata Steel", logo: "/images/Company-Logos/TATA-steel-logo-white.webp" },
  { name: "Amazon", logo: "/images/Company-Logos/Amazon-logo-white.webp" },
  { name: "Nissan", logo: "/images/Company-Logos/Logo-nissan-white.webp" },
  { name: "Ford", logo: "/images/Company-Logos/ford-logo-white.webp" },
  { name: "AstraZeneca", logo: "/images/Company-Logos/Astra-logo-white.webp" },
  { name: "GSK", logo: "/images/Company-Logos/GSK-logo-white.webp" },
  { name: "National Grid", logo: "/images/Company-Logos/national-logo-white.webp" },
  { name: "Network Rail", logo: "/images/Company-Logos/Network-Rail.webp" },
  { name: "BT", logo: "/images/Company-Logos/logo-bt-white.webp" },
  { name: "BAE Systems", logo: "/images/Company-Logos/Bae-systems-white.webp" },
  { name: "EDF Energy", logo: "/images/Company-Logos/EDF-energy-logo-white.webp" },
  { name: "Unilever", logo: "/images/Company-Logos/unilever-white-bg.webp" },
  { name: "Nestlé", logo: "/images/Company-Logos/nestle-logo-White.webp" },
  { name: "Mars", logo: "/images/Company-Logos/MARS-LOGO-WHITE.webp" },
  { name: "Coca-Cola", logo: "/images/Company-Logos/Cola-white-1.webp" },
  { name: "PepsiCo", logo: "/images/Company-Logos/Pepsi-PNG-White.webp" },
  { name: "Tesco", logo: "/images/Company-Logos/Tesco-logo-white.webp" },
  { name: "Sainsbury's", logo: "/images/Company-Logos/Sainsb-logo-white.webp" },
  { name: "Morrisons", logo: "/images/Company-Logos/Morrisons-logo-white.webp" },
  { name: "ASDA", logo: "/images/Company-Logos/ASDA-logo-png.webp" },
  { name: "Ocado", logo: "/images/Company-Logos/oacdo-logo-white.webp" },
  { name: "Heathrow", logo: "/images/Company-Logos/heathrow-logo-white.webp" },
  { name: "Severn Trent", logo: "/images/Company-Logos/Severn-Trent-logo-white.webp" },
  { name: "Thames Water", logo: "/images/Company-Logos/Thames-Water-logo-white.webp" },
  { name: "Anglian Water", logo: "/images/Company-Logos/Anglian-logo-white.webp" },
  { name: "Dŵr Cymru", logo: "/images/Company-Logos/Dwr-logo-white.webp" },
  { name: "Actemium", logo: "/images/Company-Logos/Actemium-logo-white.webp" },
];

// Split into two rows for the marquee
const row1 = employers.slice(0, 18);
const row2 = employers.slice(18);

export default function Employers() {
  return (
    <section className="py-24 mesh-gradient-alt relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <ScrollReveal>
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Industry Demand
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            These Companies Hire{" "}
            <span className="gradient-text gradient-text-animated">Automation Engineers</span>
          </h2>
          <p className="text-text-secondary max-w-3xl mx-auto leading-relaxed">
            The UK&apos;s largest manufacturers, energy companies, food & beverage
            producers, utilities, and infrastructure operators are constantly
            recruiting PLC programmers, controls engineers, and automation
            specialists. The demand for skilled automation professionals has never
            been higher.
          </p>
        </div>
        </ScrollReveal>
      </div>

      {/* Scrolling Marquee Row 1 - Left to Right */}
      <div className="relative mt-12 mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-primary to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-primary to-transparent z-10" />
        <div className="flex animate-marquee gap-8 items-center">
          {[...row1, ...row1].map((employer, i) => (
            <div
              key={`${employer.name}-${i}`}
              className="flex-shrink-0 w-32 h-16 flex items-center justify-center glass-card rounded-xl px-4 hover:border-neon-blue/20 transition-all group"
            >
              <Image
                src={employer.logo}
                alt={`${employer.name} logo`}
                width={100}
                height={40}
                className="max-h-8 w-auto opacity-50 group-hover:opacity-90 transition-opacity object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling Marquee Row 2 - Right to Left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-primary to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-primary to-transparent z-10" />
        <div className="flex animate-marquee-reverse gap-8 items-center">
          {[...row2, ...row2].map((employer, i) => (
            <div
              key={`${employer.name}-${i}`}
              className="flex-shrink-0 w-32 h-16 flex items-center justify-center glass-card rounded-xl px-4 hover:border-neon-blue/20 transition-all group"
            >
              <Image
                src={employer.logo}
                alt={`${employer.name} logo`}
                width={100}
                height={40}
                className="max-h-8 w-auto opacity-50 group-hover:opacity-90 transition-opacity object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 mt-10">
        <p className="text-xs text-text-muted text-center">
          Logos shown represent companies that actively recruit automation
          professionals in the UK. EDWartens is not affiliated with these
          companies.
        </p>
      </div>
    </section>
  );
}
