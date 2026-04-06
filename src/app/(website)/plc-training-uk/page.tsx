import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  ChevronRight,
  Award,
  Monitor,
  Users,
  Factory,
  Zap,
  GraduationCap,
} from "lucide-react";
import { getUKCities, type CityPage } from "@/lib/seo-cities";
import { ScrollReveal } from "@/components/ScrollReveal";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title:
    "PLC Training UK | SCADA Courses Across the United Kingdom | EDWartens",
  description:
    "Find CPD accredited PLC and SCADA training near you. EDWartens UK offers industrial automation courses accessible from 30+ UK cities including London, Manchester, Birmingham, Sheffield, and more.",
  keywords: [
    "PLC training UK",
    "SCADA training UK",
    "PLC courses near me",
    "industrial automation training UK",
    "CPD accredited PLC course",
  ],
  alternates: { canonical: "https://edwartens.co.uk/plc-training-uk" },
  openGraph: {
    title:
      "PLC Training UK | SCADA Courses Across the United Kingdom | EDWartens",
    description:
      "Find CPD accredited PLC and SCADA training near you. EDWartens UK offers industrial automation courses accessible from 30+ UK cities.",
    url: "https://edwartens.co.uk/plc-training-uk",
    siteName: "EDWartens UK",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Region grouping
// ---------------------------------------------------------------------------

interface RegionGroup {
  name: string;
  cities: CityPage[];
}

const regionOrder: Record<string, string[]> = {
  "London & South East": [
    "London",
    "Reading",
    "Southampton",
    "Cambridge",
    "Milton Keynes",
    "Swindon",
  ],
  Midlands: [
    "Birmingham",
    "Coventry",
    "Leicester",
    "Nottingham",
    "Derby",
    "Wolverhampton",
    "Stoke-on-Trent",
  ],
  "North West": ["Manchester", "Liverpool", "Warrington", "Crewe"],
  "Yorkshire & North East": [
    "Leeds",
    "Sheffield",
    "Hull",
    "Newcastle",
    "Middlesbrough",
    "Sunderland",
  ],
  "South West": ["Bristol", "Plymouth"],
  Scotland: ["Glasgow", "Edinburgh", "Aberdeen"],
  Wales: ["Cardiff"],
  "Northern Ireland": ["Belfast"],
};

function groupByRegion(cities: CityPage[]): RegionGroup[] {
  const cityMap = new Map(cities.map((c) => [c.city, c]));
  return Object.entries(regionOrder)
    .map(([name, cityNames]) => ({
      name,
      cities: cityNames
        .map((n) => cityMap.get(n))
        .filter(Boolean) as CityPage[],
    }))
    .filter((g) => g.cities.length > 0);
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "PLC Training Locations Across the UK",
  description:
    "CPD accredited PLC and SCADA training accessible from 30+ UK cities.",
  numberOfItems: 30,
  itemListElement: getUKCities().map((city, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `PLC Training ${city.city}`,
    url: `https://edwartens.co.uk/${city.slug}`,
  })),
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PLCTrainingUKPage() {
  const ukCities = getUKCities();
  const regions = groupByRegion(ukCities);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-neon-blue/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-neon-blue/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-blue/20 bg-neon-blue/5 text-neon-blue text-xs font-medium mb-6">
              <MapPin size={14} />
              30+ UK Cities Covered
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              PLC &amp; SCADA Training
              <br />
              <span className="bg-gradient-to-r from-neon-blue to-blue-400 bg-clip-text text-transparent">
                Across the UK
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
              CPD Accredited industrial automation training accessible from
              every major UK city. In-person at our Milton Keynes centre or
              join live online from anywhere.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Enquire Now
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.03] transition-colors"
              >
                View Courses
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-dark-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: MapPin, label: "UK Cities", value: "30+" },
              { icon: Award, label: "CPD Accredited", value: "Yes" },
              { icon: Monitor, label: "Online Option", value: "Live" },
              { icon: Users, label: "Students Trained", value: "2,000+" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 100}>
                <div className="flex flex-col items-center gap-2">
                  <stat.icon size={20} className="text-neon-blue" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── City Grid by Region ───────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Find Training Near You
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                Select your nearest city to see local industry info, travel
                times, and upcoming course dates.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-14">
            {regions.map((region, ri) => (
              <ScrollReveal key={region.name} delay={ri * 80}>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                    {region.name}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {region.cities.map((city, ci) => (
                      <Link
                        key={city.slug}
                        href={`/${city.slug}`}
                        className="group glass-card rounded-xl p-5 border border-white/[0.06] hover:border-neon-blue/30 transition-all duration-300 hover:shadow-lg hover:shadow-neon-blue/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-white font-semibold group-hover:text-neon-blue transition-colors">
                            {city.city}
                          </h4>
                          <ChevronRight
                            size={16}
                            className="text-text-muted group-hover:text-neon-blue transition-colors mt-0.5"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {city.industries.slice(0, 3).map((ind) => (
                            <span
                              key={ind}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-text-muted"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course Summary ─────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.06] bg-dark-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                What You Will Learn
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                Our CPD accredited programmes cover the full industrial
                automation stack.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "PLC Programming",
                desc: "Siemens TIA Portal, Allen-Bradley Studio 5000, ladder logic, structured text, and function block programming.",
              },
              {
                icon: Monitor,
                title: "SCADA & HMI",
                desc: "WinCC, FactoryTalk View, Ignition SCADA, alarm management, and real-time data visualisation.",
              },
              {
                icon: Factory,
                title: "Industrial Networking",
                desc: "PROFINET, EtherNet/IP, Modbus TCP, OPC UA, and industrial cybersecurity fundamentals.",
              },
              {
                icon: GraduationCap,
                title: "Hands-On Labs",
                desc: "FactoryIO digital twin simulation, real PLC hardware, and practical troubleshooting exercises.",
              },
              {
                icon: Award,
                title: "CPD Accredited",
                desc: "All courses carry CPD accreditation, recognised by UK employers and professional bodies.",
              },
              {
                icon: Users,
                title: "Career Support",
                desc: "CV workshops, interview preparation, and direct introductions to hiring employers across the UK.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 80}>
                <div className="glass-card rounded-xl p-6 border border-white/[0.06]">
                  <item.icon size={24} className="text-neon-blue mb-3" />
                  <h3 className="text-white font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Your Automation Career?
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Get in touch to discuss which programme is right for you. Our
              admissions team can guide you through funding options, schedules,
              and career pathways.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Enquire Now
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/plc-training-europe"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.03] transition-colors"
              >
                View EU Locations
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
