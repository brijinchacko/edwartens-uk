import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  MapPin,
  Clock,
  Train,
  Globe,
  Monitor,
  Award,
  Wrench,
  Briefcase,
  Building2,
  ChevronRight,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  Cpu,
  Factory,
  Zap,
} from "lucide-react";
import { getCityBySlug, getAllCitySlugs, getAllCities } from "@/lib/seo-cities";
import { prisma } from "@/lib/prisma";
import { ScrollReveal } from "@/components/ScrollReveal";
import CityEnquiryForm from "@/components/CityEnquiryForm";

// ---------------------------------------------------------------------------
// Static Params + Metadata
// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ citySlug: string }>;
};

export async function generateStaticParams() {
  return getAllCitySlugs().map((slug) => ({ citySlug: slug }));
}

export const dynamicParams = false; // 404 for unknown slugs
export const revalidate = 3600; // Revalidate every hour for fresh batch data

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return { title: "Not Found" };

  return {
    title: city.title,
    description: city.description,
    keywords: city.keywords.join(", "),
    alternates: {
      canonical: `https://edwartens.co.uk/${city.slug}`,
      languages: {
        "en-GB": `https://edwartens.co.uk/${city.slug}`,
        "x-default": `https://edwartens.co.uk/${city.slug}`,
        ...(city.countryCode === "DE" ? { "en-DE": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "FR" ? { "en-FR": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "NL" ? { "en-NL": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "IE" ? { "en-IE": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "ES" ? { "en-ES": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "IT" ? { "en-IT": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "PL" ? { "en-PL": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "SE" ? { "en-SE": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "AT" ? { "en-AT": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "BE" ? { "en-BE": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "CH" ? { "en-CH": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "DK" ? { "en-DK": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "FI" ? { "en-FI": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "NO" ? { "en-NO": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "PT" ? { "en-PT": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "CZ" ? { "en-CZ": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "HU" ? { "en-HU": `https://edwartens.co.uk/${city.slug}` } : {}),
        ...(city.countryCode === "RO" ? { "en-RO": `https://edwartens.co.uk/${city.slug}` } : {}),
      },
    },
    openGraph: {
      title: city.title,
      description: city.description,
      url: `https://edwartens.co.uk/${city.slug}`,
      siteName: "EDWartens UK",
      type: "website",
      locale: "en_GB",
      images: [
        {
          url: "https://edwartens.co.uk/images/stock/hero-automation.jpg",
          width: 1200,
          height: 630,
          alt: city.h1,
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Helper: Fetch upcoming batches
// ---------------------------------------------------------------------------

async function getUpcomingBatches() {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: "UPCOMING" },
      orderBy: { startDate: "asc" },
      take: 3,
      select: {
        id: true,
        name: true,
        startDate: true,
        capacity: true,
        course: true,
        _count: { select: { students: true } },
      },
    });
    return batches;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function CityLandingPage({ params }: Props) {
  const { citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const batches = await getUpcomingBatches();

  // Structured data (LocalBusiness schema)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "EDWartens UK",
    description: city.description,
    url: `https://edwartens.co.uk/${city.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Milton Keynes",
      addressRegion: "Buckinghamshire",
      addressCountry: "GB",
    },
    areaServed: {
      "@type": "City",
      name: city.city,
      containedInPlace: {
        "@type": "Country",
        name: city.country,
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "PLC & SCADA Training Courses",
      itemListElement: [
        {
          "@type": "Course",
          name: "Professional Module - PLC, SCADA & HMI",
          description:
            "5-day CPD accredited training in Siemens TIA Portal, Allen-Bradley, SCADA, HMI, and FactoryIO",
          provider: { "@type": "Organization", name: "EDWartens UK" },
        },
        {
          "@type": "Course",
          name: "AI Module - AI in Industrial Automation",
          description:
            "AI, Machine Learning, and Computer Vision for industrial automation applications",
          provider: { "@type": "Organization", name: "EDWartens UK" },
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Course Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "Professional PLC & SCADA Training",
            description:
              "CPD Accredited 5-day intensive course with online recorded sessions covering Siemens S7-1200/1500 PLC programming, WinCC SCADA, HMI design, industrial networking, and FactoryIO simulation. Includes career support and job placement assistance.",
            provider: {
              "@type": "EducationalOrganization",
              name: "EDWartens UK",
              url: "https://edwartens.co.uk",
            },
            courseCode: "EDW-PROF-2026",
            educationalLevel: "Professional Development",
            inLanguage: "en",
            availableLanguage: "English",
            isAccessibleForFree: false,
            offers: {
              "@type": "Offer",
              price: city.isUK ? "2140" : "2499",
              priceCurrency: city.isUK ? "GBP" : "EUR",
              availability: "https://schema.org/InStock",
              url: "https://edwartens.co.uk/courses/professional",
            },
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "Online",
              duration: "P5D",
              courseWorkload: "PT40H",
              instructor: {
                "@type": "Person",
                name: "EDWartens Training Team",
              },
            },
            occupationalCategory: "15-1299.00",
            teaches: [
              "PLC Programming",
              "SCADA Systems",
              "HMI Design",
              "Industrial Networking",
              "Siemens TIA Portal",
            ],
            educationalCredentialAwarded: "CPD Accredited Certificate",
          }),
        }}
      />

      {/* ====== HERO ====== */}
      <section className="px-3 sm:px-5 lg:px-6 pt-3">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.06] min-h-[60vh] flex items-center">
          {/* Background Image */}
          <Image
            src="/images/stock/hero-automation.jpg"
            alt={`PLC and SCADA Training for ${city.city} professionals`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14]/80 via-[#0a0a14]/70 to-[#0a0a14]/90 z-[1]" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-24 sm:py-32 w-full text-center flex flex-col items-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/[0.08] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
              </span>
              <span className="text-[11px] text-text-muted tracking-wide">
                CPD Accredited Training
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
              <span className="text-white text-glow-blue">{city.h1}</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-4 leading-relaxed">
              CPD Accredited Industrial Automation Training for {city.city} Professionals
            </p>
            <p className="text-sm text-text-muted max-w-xl mb-8">
              {city.isUK
                ? `In-person at our Milton Keynes centre or live online from ${city.city}`
                : `Live online sessions from ${city.city}, ${city.country} | In-person available in Milton Keynes, UK`}
            </p>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#enquiry"
                className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all holo-border"
              >
                Enquire Now
              </a>
              <Link
                href="/courses"
                className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors holo-border"
              >
                View Course Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== LOCAL CONTEXT ====== */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                  <MapPin size={20} className="text-neon-blue" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Industrial Automation in {city.city}
                </h2>
              </div>

              <p className="text-text-secondary leading-relaxed mb-8 text-base sm:text-lg">
                {city.localIntro}
              </p>

              {/* Industries */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                  <Factory size={14} />
                  Key Industries in {city.city}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {city.industries.map((ind) => (
                    <span
                      key={ind}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Major Employers */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                  <Building2 size={14} />
                  Major Employers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(city.topEmployersDetailed || city.majorEmployers).map((emp) => (
                    <span
                      key={emp}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/20"
                    >
                      {emp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Average Salary Card */}
              {city.averageSalary && (
                <div className="mb-8">
                  <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-neon-blue/5 border border-neon-blue/20">
                    <Briefcase size={20} className="text-neon-blue" />
                    <div>
                      <p className="text-white font-bold text-lg">
                        Average Automation Engineer Salary in {city.city}:{" "}
                        {city.averageSalaryCurrency === "GBP" ? "\u00a3" : "\u20ac"}
                        {city.averageSalary.toLocaleString()}/year
                      </p>
                      {city.vatRate && (
                        <p className="text-xs text-text-muted mt-1">
                          Local VAT rate: {city.vatRate}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Why Train for Local Jobs */}
              {city.whyTrainLocal && (
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                    <Zap size={14} />
                    Why Train for {city.city} Jobs?
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {city.whyTrainLocal}
                  </p>
                </div>
              )}

              {/* Nearby Areas */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                  <Globe size={14} />
                  Also Serving
                </h3>
                <p className="text-text-secondary text-sm">
                  {city.nearbyAreas.join(" \u00b7 ")}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== TRAINING IMAGES ====== */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { src: "/images/stock/hands-on-training.jpg", alt: `Hands-on PLC training for ${city.city} engineers` },
                { src: "/images/stock/plc-training.jpg", alt: `Siemens PLC programming course in ${city.city}` },
                { src: "/images/stock/data-dashboard.jpg", alt: `SCADA dashboard training for ${city.city} professionals` },
                { src: "/images/stock/students-learning.jpg", alt: `Industrial automation students from ${city.city}` },
              ].map((img) => (
                <div key={img.src} className="relative h-36 sm:h-44 rounded-xl overflow-hidden border border-white/[0.06]">
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/60 to-transparent" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== COURSE CARDS ====== */}
      <section className="py-20 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
                Our Courses
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Training Programmes for{" "}
                <span className="gradient-text">{city.city}</span> Professionals
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Professional Module */}
            <ScrollReveal delay={100}>
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col gradient-border">
                <div className="w-14 h-14 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-6">
                  <Cpu size={28} className="text-neon-blue" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Professional Module
                </h3>
                <p className="text-sm text-neon-blue font-medium mb-4">
                  PLC, SCADA, HMI & FactoryIO
                </p>
                <ul className="space-y-2.5 text-sm text-text-secondary mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <Clock size={14} className="text-neon-blue mt-0.5 shrink-0" />
                    <span><strong className="text-white">Duration:</strong> 5 Working Days + Online Recorded Sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe size={14} className="text-neon-blue mt-0.5 shrink-0" />
                    <span><strong className="text-white">Language:</strong> English</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Monitor size={14} className="text-neon-blue mt-0.5 shrink-0" />
                    <span><strong className="text-white">Delivery:</strong>{" "}
                      {city.isUK
                        ? "Live Online + In-person (Milton Keynes, UK)"
                        : "100% Live Online — join from " + city.city}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen size={14} className="text-neon-blue mt-0.5 shrink-0" />
                    <span><strong className="text-white">Covers:</strong> Siemens TIA Portal, SCADA, HMI, FactoryIO</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award size={14} className="text-neon-blue mt-0.5 shrink-0" />
                    <span><strong className="text-white">Certificate:</strong> CPD Accredited</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-2xl font-bold text-white mb-1">
                    {city.isUK ? "£2,140 + VAT" : "€2,499 + VAT"}{" "}
                    <span className="text-sm font-normal text-text-muted">
                      full programme
                    </span>
                  </p>
                  {!city.isUK && (
                    <p className="text-[10px] text-text-muted mb-3">Approx. £2,140 + VAT · Payment in GBP</p>
                  )}
                  <Link
                    href="/courses/professional"
                    className="inline-flex items-center gap-2 text-neon-blue text-sm font-medium hover:underline"
                  >
                    View full course details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* AI Module */}
            <ScrollReveal delay={200}>
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col gradient-border">
                <div className="w-14 h-14 rounded-xl bg-purple/10 flex items-center justify-center mb-6">
                  <Zap size={28} className="text-purple" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Module</h3>
                <p className="text-sm text-purple font-medium mb-4">
                  AI in Industrial Automation
                </p>
                <ul className="space-y-2 text-sm text-text-secondary mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <BookOpen size={14} className="text-purple mt-0.5 shrink-0" />
                    <span>AI & Machine Learning for Automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen size={14} className="text-purple mt-0.5 shrink-0" />
                    <span>Computer Vision for Quality Inspection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen size={14} className="text-purple mt-0.5 shrink-0" />
                    <span>Predictive Maintenance with AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award size={14} className="text-purple mt-0.5 shrink-0" />
                    <span>CPD Accredited Certification</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-white/[0.06]">
                  <Link
                    href="/courses/ai-module"
                    className="inline-flex items-center gap-2 text-purple text-sm font-medium hover:underline"
                  >
                    Learn more <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====== WHAT YOU'LL LEARN (Detailed Professional Module) ====== */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                What You&apos;ll Learn in the <span className="gradient-text">Professional Module</span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-sm">
                A comprehensive 5-day intensive programme with online recorded sessions covering everything from PLC fundamentals to advanced SCADA systems — designed to make you job-ready.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Day 1–2: PLC Fundamentals", items: ["Siemens S7-1200 & S7-1500 hardware", "TIA Portal software setup & navigation", "Ladder Logic & Function Block programming", "Digital & analog I/O configuration"] },
              { title: "Day 3: Advanced PLC Programming", items: ["Structured Text (ST) programming", "Timer, counter & comparator functions", "Data handling & memory management", "Program debugging & testing"] },
              { title: "Day 4: SCADA & HMI Systems", items: ["WinCC SCADA configuration", "HMI screen design & navigation", "Alarm management & trending", "Data logging & historical reports"] },
              { title: "Day 5: Networking & Projects", items: ["PROFINET & PROFIBUS protocols", "Ethernet/IP communication", "PLC-to-PLC data exchange", "Network troubleshooting techniques"] },
              { title: "Online: Simulation & Assessment", items: ["FactoryIO 3D simulation", "Real-world automation scenarios", "Conveyor, sorting & batch processes", "Final capstone project & assessment"] },
              { title: "Career & Certification", items: ["CPD Accredited certificate", "CV building & LinkedIn optimisation", "Interview preparation & mock interviews", "Direct introductions to hiring employers"] },
            ].map((week, i) => (
              <ScrollReveal key={week.title} delay={i * 80}>
                <div className="glass-card rounded-xl p-5 h-full">
                  <h3 className="text-sm font-bold text-white mb-3">{week.title}</h3>
                  <ul className="space-y-1.5">
                    {week.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="text-neon-green mt-0.5 shrink-0">{"•"}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== AUTOMATION OPPORTUNITIES IN THIS CITY ====== */}
      <section className="py-16 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Automation Opportunities in <span className="gradient-text">{city.city}</span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-sm">
                The industrial automation sector in {city.city} is growing rapidly. Here&apos;s why PLC and SCADA skills are in high demand.
              </p>
            </div>
            {/* Banner Image */}
            <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-white/[0.06] mb-8">
              <Image
                src="/images/stock/factory-automation.jpg"
                alt={`Industrial automation and PLC engineering opportunities in ${city.city}`}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14]/80 to-[#0a0a14]/40 flex items-center px-8">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{city.isUK ? "£35k – £75k" : "€40k – €85k"}</p>
                  <p className="text-sm text-text-secondary">Average automation engineer salary range in {city.isUK ? "the UK" : city.country}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-neon-blue" />
                  Career Roles Available in {city.city}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "PLC Programmer",
                    "Controls Engineer",
                    "Automation Engineer",
                    "SCADA Developer",
                    "Systems Integrator",
                    "Commissioning Engineer",
                    "Maintenance Technician",
                    "Instrumentation Engineer",
                  ].map((role) => (
                    <div key={role} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span className="w-1 h-1 rounded-full bg-neon-blue shrink-0" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Factory size={16} className="text-neon-green" />
                  {city.city} Industry Demand
                </h3>
                <div className="space-y-3 text-xs text-text-secondary">
                  <p>
                    The {city.industries.slice(0, 3).join(", ")} sectors in {city.city} are actively investing in automation. Companies like {city.majorEmployers.slice(0, 3).join(", ")} regularly recruit PLC and SCADA engineers.
                  </p>
                  <p>
                    Average salaries for automation engineers in {city.isUK ? "the UK" : city.country} range from {city.isUK ? "£35,000 to £65,000" : "€40,000 to €75,000"}, with senior roles commanding {city.isUK ? "£70,000+" : "€80,000+"}.
                  </p>
                  <p>
                    The UK faces a shortage of over 20,000 automation engineers, making this one of the fastest routes to employment after training.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Cpu size={16} className="text-purple" />
                  Technologies Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Siemens S7-1200", "Siemens S7-1500", "TIA Portal V18",
                    "WinCC SCADA", "FactoryIO", "PROFINET",
                    "Ladder Logic", "Function Blocks", "Structured Text",
                    "HMI Design", "PID Control", "Industrial IoT",
                  ].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-text-secondary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-400" />
                  Why Train Now?
                </h3>
                <div className="space-y-2 text-xs text-text-secondary">
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green shrink-0 mt-0.5">1.</span>
                    <span><strong className="text-white">Industry 4.0 adoption</strong> is accelerating — companies need skilled automation engineers now</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green shrink-0 mt-0.5">2.</span>
                    <span><strong className="text-white">Salary premium</strong> — PLC engineers earn 30-50% more than general maintenance roles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green shrink-0 mt-0.5">3.</span>
                    <span><strong className="text-white">Job security</strong> — automation skills are recession-proof with constant demand</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green shrink-0 mt-0.5">4.</span>
                    <span><strong className="text-white">Fast-track to employment</strong> — our graduates get placed within weeks of completing training</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====== UPCOMING BATCHES ====== */}
      {batches.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
                  Upcoming Batches
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                  Reserve Your{" "}
                  <span className="gradient-text">Spot</span>
                </h2>
                <p className="text-text-secondary max-w-xl mx-auto">
                  All courses are delivered as <strong className="text-white">live online sessions in English</strong> with limited seats per batch for personalised attention.
                  {city.isUK
                    ? " In-person attendance also available at our Milton Keynes training centre."
                    : ` Join from ${city.city} — no travel required.`}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {batches.map((batch, idx) => {
                const spotsLeft = batch.capacity - batch._count.students;
                return (
                  <ScrollReveal key={batch.id} delay={idx * 100}>
                    <div className="glass-card rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
                          <GraduationCap size={16} className="text-neon-green" />
                        </div>
                        <span className="text-xs font-medium text-neon-green uppercase">
                          {batch.course === "PROFESSIONAL_MODULE"
                            ? "Professional"
                            : "AI Module"}
                        </span>
                      </div>
                      <h3 className="text-white font-bold mb-3">{batch.name}</h3>
                      <div className="space-y-1.5 text-text-secondary text-xs mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="shrink-0" />
                          <span>
                            Starts{" "}
                            {new Date(batch.startDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="shrink-0" />
                          <span>5 Days Live + Recorded Sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor size={12} className="shrink-0" />
                          <span>Live Online Course</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe size={12} className="shrink-0" />
                          <span>English</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={12} className="shrink-0" />
                          <span className={spotsLeft <= 2 ? "text-red-400 font-medium" : ""}>
                            {spotsLeft > 0
                              ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} remaining`
                              : "Fully booked"}
                          </span>
                        </div>
                      </div>
                      {spotsLeft > 0 && (
                        <a
                          href="#enquiry"
                          className="block text-center px-4 py-2.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm font-medium hover:bg-neon-green/20 transition-colors"
                        >
                          Reserve Your Spot
                        </a>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ====== WHY EDWARTENS ====== */}
      <section className="py-20 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">
                Why EDWartens
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Why {city.city} Engineers Choose{" "}
                <span className="gradient-text">EDWartens</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: "CPD Accredited",
                desc: "Internationally recognised CPD accreditation, valued by UK and European employers.",
                color: "neon-blue",
              },
              {
                icon: Wrench,
                title: "Hands-on Labs",
                desc: "Real Siemens S7-1200/1500 PLCs, Allen-Bradley, SCADA systems, and FactoryIO simulation.",
                color: "neon-green",
              },
              {
                icon: Briefcase,
                title: "Career Support",
                desc: `Dedicated placement team connecting graduates with employers${city.majorEmployers.length > 0 ? ` like ${city.majorEmployers[0]} and ${city.majorEmployers[1]}` : ""}.`,
                color: "purple",
              },
              {
                icon: Monitor,
                title: city.isUK ? "Flexible Delivery" : "Online Access",
                desc: city.isUK
                  ? `Attend in-person at our Milton Keynes centre or join live online sessions from ${city.city}.`
                  : `Join live online sessions from ${city.city}. In-person training available at our Milton Keynes, UK centre.`,
                color: "cyan",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={idx * 100}>
                  <div className="glass-card rounded-xl p-6 h-full">
                    <div
                      className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center mb-4`}
                    >
                      <Icon size={24} className={`text-${item.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== TRAVEL / ONLINE SECTION ====== */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
              {city.isUK ? (
                <>
                  <div className="w-14 h-14 rounded-xl bg-neon-blue/10 flex items-center justify-center mx-auto mb-6">
                    <Train size={28} className="text-neon-blue" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Getting to Our Training Centre from {city.city}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <MapPin size={16} className="text-neon-blue" />
                      <span>{city.distanceFromMK}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock size={16} className="text-neon-blue" />
                      <span>{city.travelTime}</span>
                    </div>
                  </div>
                  <p className="text-text-secondary max-w-2xl mx-auto mb-6">
                    Our training centre is located in Milton Keynes, easily
                    accessible from {city.city} by train or car. Milton Keynes
                    Central station has excellent connections to all major UK
                    cities. Can&apos;t travel? Join our live online sessions instead.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="#enquiry"
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
                    >
                      Book In-person Training
                    </a>
                    <a
                      href="#enquiry"
                      className="inline-flex items-center px-6 py-3 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
                    >
                      Join Online Instead
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-xl bg-purple/10 flex items-center justify-center mx-auto mb-6">
                    <Globe size={28} className="text-purple" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Online Training Available from {city.city}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Monitor size={16} className="text-purple" />
                      <span>Live Online Sessions</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <MapPin size={16} className="text-purple" />
                      <span>In-person at Milton Keynes, UK</span>
                    </div>
                  </div>
                  <p className="text-text-secondary max-w-2xl mx-auto mb-6">
                    Join our live sessions from {city.city}, {city.country}.
                    All course materials, lab simulations via FactoryIO, and instructor
                    interaction are available online. In-person training is also
                    available at our Milton Keynes, UK centre for those who
                    prefer hands-on equipment access.
                  </p>
                  <a
                    href="#enquiry"
                    className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-purple to-purple/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple/25 active:scale-[0.98] transition-all"
                  >
                    Enquire About Online Training
                  </a>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== EU: HOW IT WORKS ====== */}
      {!city.isUK && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
            <ScrollReveal>
              <div className="glass-card rounded-2xl p-8 sm:p-12">
                <div className="text-center mb-10">
                  <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
                    International Students
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Training from{" "}
                    <span className="gradient-text">{city.country}</span> — How
                    It Works
                  </h2>
                  <p className="text-text-secondary max-w-2xl mx-auto text-sm">
                    Joining from {city.city} is simple. Here&apos;s the step-by-step
                    process for international students.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    {
                      step: "1",
                      title: "Enquire & Book",
                      desc: "Enquire & book your spot online",
                    },
                    {
                      step: "2",
                      title: "Get Materials",
                      desc: "Receive course materials and software access",
                    },
                    {
                      step: "3",
                      title: "Join Live Sessions",
                      desc: `Join live online sessions from ${city.city} (Mon\u2013Fri, UK time)`,
                    },
                    {
                      step: "4",
                      title: "Hands-on Projects",
                      desc: "Complete hands-on projects with instructor guidance",
                    },
                    {
                      step: "5",
                      title: "Get Certified",
                      desc: "Receive CPD certificate and career support",
                    },
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="w-10 h-10 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-neon-blue font-bold text-sm">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                  <p className="text-sm text-text-secondary">
                    <strong className="text-white">Payment:</strong> in GBP via
                    bank transfer or card (approx{" "}
                    <span className="text-neon-green font-medium">
                      &euro;2,499
                    </span>
                    )
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ====== ENQUIRY FORM ====== */}
      <section id="enquiry" className="py-20 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
                Get Started
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Enquire About Training from{" "}
                <span className="gradient-text">{city.city}</span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Fill in the form below and our team will get back to you within 24 hours
                with course details, batch availability, and pricing.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <CityEnquiryForm citySlug={city.slug} cityName={city.city} />
          </ScrollReveal>
        </div>
      </section>

      {/* ====== ACCREDITATIONS ====== */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-3 text-text-muted">
                <Award size={20} className="text-neon-blue" />
                <span className="text-sm">CPD Accredited</span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <Award size={20} className="text-neon-green" />
                <span className="text-sm">UKRLP Registered</span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <Award size={20} className="text-purple" />
                <span className="text-sm">ISO 9001 Quality</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== BREADCRUMBS ====== */}
      <section className="pb-12 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-text-muted flex items-center gap-1 flex-wrap"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            {!city.isUK && (
              <>
                <span>{city.country}</span>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-text-secondary">
              {city.city} PLC Training
            </span>
          </nav>
        </div>
      </section>

      {/* ====== NEARBY CITIES (Hub-Spoke Internal Links) ====== */}
      <section className="pb-8 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">
                PLC Training Also Available For Professionals In
              </h3>
              <div className="flex flex-wrap gap-2">
                {getAllCities()
                  .filter((c) => c.slug !== city.slug && c.country === city.country)
                  .slice(0, 12)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-text-secondary hover:text-neon-blue hover:border-neon-blue/20 transition-colors"
                    >
                      {c.city}
                    </Link>
                  ))}
              </div>
              <div className="flex gap-3 mt-4 pt-3 border-t border-white/[0.06]">
                <Link href="/plc-training-uk" className="text-xs text-neon-blue hover:underline">
                  View All UK Locations →
                </Link>
                <Link href="/plc-training-europe" className="text-xs text-neon-blue hover:underline">
                  View All EU Locations →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== WHY ENGINEERS CHOOSE EDWARTENS ====== */}
      <section className="pb-8 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <ScrollReveal>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">
                Why Engineers in {city.city} Choose EDWartens
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
                <div className="flex items-start gap-2">
                  <span className="text-neon-green shrink-0">✓</span>
                  <span><strong className="text-white">Career Transition:</strong> Move from general engineering into high-demand PLC/SCADA roles with £35-65k salary range</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-neon-green shrink-0">✓</span>
                  <span><strong className="text-white">Upskill Existing Role:</strong> Add PLC programming to your CV while working — online + weekend options available</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-neon-green shrink-0">✓</span>
                  <span><strong className="text-white">Industry Shortage:</strong> UK faces a critical shortage of automation engineers — {city.industries.slice(0, 2).join(", ")} sectors in {city.city} are actively hiring</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-neon-green shrink-0">✓</span>
                  <span><strong className="text-white">Placement Support:</strong> 100% career support including CV writing, interview prep, and direct introductions to employers like {city.majorEmployers.slice(0, 2).join(", ")}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====== INTERNAL LINKS (SEO) ====== */}
      <section className="pb-16 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">
              Explore More
            </h3>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link href="/courses" className="text-neon-blue hover:underline">All Courses</Link>
              <Link href="/courses/professional" className="text-neon-blue hover:underline">Professional Module</Link>
              <Link href="/courses/ai-module" className="text-neon-blue hover:underline">AI Module</Link>
              <Link href="/training" className="text-neon-blue hover:underline">Training Approach</Link>
              <Link href="/placements" className="text-neon-blue hover:underline">Placements & Careers</Link>
              <Link href="/reviews" className="text-neon-blue hover:underline">Student Reviews</Link>
              <Link href="/contact" className="text-neon-blue hover:underline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
