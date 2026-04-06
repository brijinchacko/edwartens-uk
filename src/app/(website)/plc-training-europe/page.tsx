import Link from "next/link";
import type { Metadata } from "next";
import {
  Globe,
  ChevronRight,
  Award,
  Monitor,
  Wifi,
  MapPin,
  GraduationCap,
  Factory,
  Zap,
  Users,
} from "lucide-react";
import { getEUCities, type CityPage } from "@/lib/seo-cities";
import { ScrollReveal } from "@/components/ScrollReveal";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title:
    "PLC Training Europe | SCADA Courses for European Professionals | EDWartens",
  description:
    "CPD accredited PLC and SCADA training for European professionals. Live online industrial automation courses from EDWartens UK, accessible from Germany, France, Netherlands, Ireland, and 15+ EU countries.",
  keywords: [
    "PLC training Europe",
    "SCADA training online Europe",
    "PLC courses Germany",
    "industrial automation training EU",
    "online PLC training",
  ],
  alternates: { canonical: "https://edwartens.co.uk/plc-training-europe" },
  openGraph: {
    title:
      "PLC Training Europe | SCADA Courses for European Professionals | EDWartens",
    description:
      "CPD accredited PLC and SCADA training for European professionals. Live online from EDWartens UK.",
    url: "https://edwartens.co.uk/plc-training-europe",
    siteName: "EDWartens UK",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Country grouping
// ---------------------------------------------------------------------------

interface CountryGroup {
  country: string;
  countryCode: string;
  cities: CityPage[];
}

function groupByCountry(cities: CityPage[]): CountryGroup[] {
  const map = new Map<string, CountryGroup>();
  for (const city of cities) {
    if (!map.has(city.country)) {
      map.set(city.country, {
        country: city.country,
        countryCode: city.countryCode,
        cities: [],
      });
    }
    map.get(city.country)!.cities.push(city);
  }
  // Sort by number of cities descending, then alphabetically
  return Array.from(map.values()).sort(
    (a, b) => b.cities.length - a.cities.length || a.country.localeCompare(b.country)
  );
}

// Country flag helper
const countryFlags: Record<string, string> = {
  DE: "🇩🇪", FR: "🇫🇷", NL: "🇳🇱", IE: "🇮🇪", BE: "🇧🇪",
  PL: "🇵🇱", ES: "🇪🇸", IT: "🇮🇹", SE: "🇸🇪", DK: "🇩🇰",
  AT: "🇦🇹", CZ: "🇨🇿", CH: "🇨🇭", FI: "🇫🇮", PT: "🇵🇹",
  NO: "🇳🇴", HU: "🇭🇺", RO: "🇷🇴",
};

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

const euCities = getEUCities();

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "PLC Training Locations Across Europe",
  description:
    "CPD accredited PLC and SCADA training for European professionals via live online sessions.",
  numberOfItems: euCities.length,
  itemListElement: euCities.map((city, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `PLC Training ${city.city}`,
    url: `https://edwartens.co.uk/${city.slug}`,
  })),
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PLCTrainingEuropePage() {
  const cities = getEUCities();
  const countries = groupByCountry(cities);

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
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-neon-blue/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-neon-blue/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-blue/20 bg-neon-blue/5 text-neon-blue text-xs font-medium mb-6">
              <Globe size={14} />
              {countries.length} European Countries
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              PLC &amp; SCADA Training
              <br />
              <span className="bg-gradient-to-r from-neon-blue to-blue-400 bg-clip-text text-transparent">
                for European Professionals
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-6">
              CPD Accredited industrial automation courses delivered live online
              from our UK training centre. Join from anywhere in Europe.
            </p>
          </ScrollReveal>

          {/* Online training badge */}
          <ScrollReveal delay={250}>
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl glass-card border border-neon-blue/20 mb-10">
              <Wifi size={18} className="text-neon-blue" />
              <span className="text-sm text-white font-medium">
                100% Live Online Training Available
              </span>
              <span className="text-xs text-text-muted">
                &mdash; no travel required
              </span>
            </div>
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
              { icon: Globe, label: "Countries", value: `${countries.length}` },
              { icon: MapPin, label: "City Pages", value: `${cities.length}+` },
              { icon: Monitor, label: "Delivery", value: "Live Online" },
              { icon: Award, label: "CPD Accredited", value: "Yes" },
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

      {/* ── Country Grid ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Training Locations by Country
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                Select your country and city to view local industry info,
                course details, and how to join our live online sessions.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-14">
            {countries.map((group, gi) => (
              <ScrollReveal key={group.country} delay={gi * 60}>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <span className="text-xl">
                      {countryFlags[group.countryCode] || "🌍"}
                    </span>
                    {group.country}
                    <span className="text-xs text-text-muted font-normal ml-1">
                      ({group.cities.length}{" "}
                      {group.cities.length === 1 ? "city" : "cities"})
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.cities.map((city) => (
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

      {/* ── Why Online from UK ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.06] bg-dark-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Why Train with EDWartens from Europe?
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                Get UK-quality CPD accredited training without leaving your
                country.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wifi,
                title: "Live Online Sessions",
                desc: "Interactive, instructor-led classes via high-definition video. Ask questions, share your screen, and collaborate in real time.",
              },
              {
                icon: Award,
                title: "CPD Accredited (UK)",
                desc: "Internationally recognised CPD accreditation from a UK-registered training provider. Boost your CV across Europe.",
              },
              {
                icon: Zap,
                title: "Industry-Standard Tools",
                desc: "Siemens TIA Portal, Allen-Bradley Studio 5000, WinCC, FactoryIO digital twin, and real PLC hardware labs.",
              },
              {
                icon: GraduationCap,
                title: "English-Language Training",
                desc: "All courses delivered in English, the lingua franca of international engineering and automation standards.",
              },
              {
                icon: Factory,
                title: "Locally Relevant Content",
                desc: "Course examples reference European industry standards, EU directives, and local manufacturing ecosystems.",
              },
              {
                icon: Users,
                title: "Career Support",
                desc: "Access to our employer network across the UK and Europe. CV reviews, interview coaching, and job introductions.",
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

      {/* ── EU Companies That Hire Automation Engineers ────────────────── */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-6">
              <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
                Industry Demand
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                EU Companies That Hire{" "}
                <span className="bg-gradient-to-r from-neon-blue to-blue-400 bg-clip-text text-transparent">
                  Automation Engineers
                </span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Europe&apos;s largest manufacturers, energy companies, and technology
                leaders are constantly recruiting PLC programmers, controls
                engineers, and automation specialists.
              </p>
            </div>
          </ScrollReveal>

          {/* Scrolling Marquee Row 1 */}
          <div className="relative mt-12 mb-4">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-primary to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-primary to-transparent z-10" />
            <div className="flex animate-marquee gap-6 items-center">
              {[
                "Siemens", "ABB", "Schneider Electric", "ASML", "Shell Europe",
                "Airbus", "Volkswagen Group", "Bosch",
                "Siemens", "ABB", "Schneider Electric", "ASML", "Shell Europe",
                "Airbus", "Volkswagen Group", "Bosch",
              ].map((name, i) => (
                <div
                  key={`eu-r1-${i}`}
                  className="flex-shrink-0 px-6 py-3 glass-card rounded-xl border border-white/[0.06] hover:border-neon-blue/20 transition-all"
                >
                  <span className="text-sm font-semibold text-text-secondary whitespace-nowrap">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrolling Marquee Row 2 */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-dark-primary to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-dark-primary to-transparent z-10" />
            <div className="flex animate-marquee-reverse gap-6 items-center">
              {[
                "Philips", "BASF", "Nestl\u00e9 Europe", "Renault", "BMW",
                "Volvo Group", "Ericsson",
                "Philips", "BASF", "Nestl\u00e9 Europe", "Renault", "BMW",
                "Volvo Group", "Ericsson",
              ].map((name, i) => (
                <div
                  key={`eu-r2-${i}`}
                  className="flex-shrink-0 px-6 py-3 glass-card rounded-xl border border-white/[0.06] hover:border-neon-blue/20 transition-all"
                >
                  <span className="text-sm font-semibold text-text-secondary whitespace-nowrap">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-text-muted text-center mt-8">
            Company names shown represent organisations that actively recruit
            automation professionals across Europe. EDWartens is not affiliated
            with these companies.
          </p>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is the CPD accreditation recognised outside the UK?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. CPD is an internationally recognised standard. Engineers across Europe regularly list CPD-accredited qualifications on their CVs and LinkedIn profiles, and many EU employers are familiar with the UK CPD framework, particularly in engineering and manufacturing sectors.",
                },
              },
              {
                "@type": "Question",
                name: "Are courses delivered in English?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all courses are in English — the standard language of international engineering, automation standards (IEC 61131-3), and Siemens TIA Portal documentation.",
                },
              },
              {
                "@type": "Question",
                name: "What time zone are the live sessions run in?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "UK time (GMT/BST). For European learners, this is 1–2 hours behind — a 9am UK session starts at 10am in Germany/Netherlands/Poland.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to travel to the UK?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. All training is live online via HD video. You join from home or office and receive 15+ hours of recorded sessions.",
                },
              },
              {
                "@type": "Question",
                name: "How does payment and VAT work for EU learners?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We accept GBP or EUR via Stripe. EU VAT is applied at checkout per EU Directive 2022/542. We provide compliant VAT invoices. B2B customers can provide VAT numbers for reverse-charge treatment.",
                },
              },
              {
                "@type": "Question",
                name: "Will this training help me get a job in my country?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our training covers globally standard tools — Siemens TIA Portal, Allen-Bradley Studio 5000, WinCC SCADA, FactoryIO — used by employers across Europe.",
                },
              },
            ],
          }),
        }}
      />

      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                Common questions from European professionals considering our
                training programmes.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {[
              {
                q: "Is the CPD accreditation recognised outside the UK?",
                a: "Yes. CPD is an internationally recognised standard. Engineers across Europe regularly list CPD-accredited qualifications on their CVs and LinkedIn profiles, and many EU employers are familiar with the UK CPD framework, particularly in engineering and manufacturing sectors.",
              },
              {
                q: "Are courses delivered in English?",
                a: "Yes, all courses are in English \u2014 the standard language of international engineering, automation standards (IEC 61131-3), and Siemens TIA Portal documentation.",
              },
              {
                q: "What time zone are the live sessions run in?",
                a: "UK time (GMT/BST). For European learners, this is 1\u20132 hours behind \u2014 a 9am UK session starts at 10am in Germany/Netherlands/Poland.",
              },
              {
                q: "Do I need to travel to the UK?",
                a: "No. All training is live online via HD video. You join from home or office and receive 15+ hours of recorded sessions.",
              },
              {
                q: "How does payment and VAT work for EU learners?",
                a: "We accept GBP or EUR via Stripe. EU VAT is applied at checkout per EU Directive 2022/542. We provide compliant VAT invoices. B2B customers can provide VAT numbers for reverse-charge treatment.",
              },
              {
                q: "Will this training help me get a job in my country?",
                a: "Our training covers globally standard tools \u2014 Siemens TIA Portal, Allen-Bradley Studio 5000, WinCC SCADA, FactoryIO \u2014 used by employers across Europe.",
              },
            ].map((faq, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <details className="group glass-card rounded-xl border border-white/[0.06] overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-semibold text-sm hover:bg-white/[0.02] transition-colors list-none">
                    <span>{faq.q}</span>
                    <ChevronRight
                      size={16}
                      className="text-text-muted group-open:rotate-90 transition-transform duration-200 shrink-0 ml-4"
                    />
                  </summary>
                  <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Your PLC Training Journey
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Whether you are in Munich, Amsterdam, or Dublin, our live online
              sessions let you learn from leading UK instructors without
              leaving home.
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
                href="/plc-training-uk"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.03] transition-colors"
              >
                View UK Locations
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
