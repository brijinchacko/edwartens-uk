import type { Metadata } from "next";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import CoursesSection from "@/components/CoursesSection";
import WhyEdwartens from "@/components/WhyEdwartens";
import HowItWorks from "@/components/HowItWorks";
import SalaryData from "@/components/SalaryData";
import Employers from "@/components/Employers";
import Awards from "@/components/Awards";
import VerifyCTA from "@/components/VerifyCTA";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "EDWartens UK - Best PLC & SCADA Training in UK | CPD Accredited",
  description:
    "EDWartens UK provides industry-leading PLC, SCADA, and Industrial Automation training in Milton Keynes. CPD Accredited Professional & AI Automation courses with dedicated career support. Training Division of Wartens.",
  keywords: [
    "PLC training UK",
    "SCADA training UK",
    "industrial automation training Milton Keynes",
    "AI automation training UK",
    "CPD accredited PLC course",
    "automation engineer course UK",
    "EDWartens UK",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk",
  },
  openGraph: {
    title: "EDWartens UK - Best PLC & SCADA Training in UK | CPD Accredited",
    description:
      "Industry-leading PLC, SCADA, and Industrial Automation training in Milton Keynes. CPD Accredited with dedicated career support.",
    url: "https://edwartens.co.uk",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://edwartens.co.uk/#organization",
      name: "EDWartens UK",
      alternateName: "Wartens Ltd",
      url: "https://edwartens.co.uk",
      logo: "https://edwartens.co.uk/images/logo.png",
      sameAs: [
        "https://www.linkedin.com/company/ed-wartens-uk/",
        "https://www.instagram.com/edwartensuk/",
        "https://www.youtube.com/channel/UC50h3bbLfdXOz9AxjHtzgdQ",
        "https://www.facebook.com/edwartensuk/",
      ],
      description:
        "EDWartens UK offers CPD Accredited PLC, SCADA, and Industrial Automation training in Milton Keynes with dedicated career support.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Milton Keynes",
        addressCountry: "GB",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "admissions",
        email: "info@wartens.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://edwartens.co.uk/#website",
      url: "https://edwartens.co.uk",
      name: "EDWartens UK",
      publisher: { "@id": "https://edwartens.co.uk/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://edwartens.co.uk/courses?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Course",
      name: "Professional Module — PLC & SCADA Training",
      description:
        "Comprehensive career-focused programme covering Siemens PLC programming, HMI design, and WinCC SCADA. CPD Accredited.",
      provider: { "@id": "https://edwartens.co.uk/#organization" },
      educationalCredentialAwarded: "CPD Certification",
      courseMode: ["Classroom", "Online"],
      url: "https://edwartens.co.uk/courses/professional",
      offers: {
        "@type": "Offer",
        price: "2140",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "Course",
      name: "AI & Industrial Automation Module",
      description:
        "Advanced training in AI-powered industrial automation, machine learning for manufacturing, and smart factory systems.",
      provider: { "@id": "https://edwartens.co.uk/#organization" },
      educationalCredentialAwarded: "CPD Certification",
      courseMode: ["Classroom", "Online"],
      url: "https://edwartens.co.uk/courses/ai-module",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://edwartens.co.uk",
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <StatsBar />
      <CoursesSection />
      <WhyEdwartens />
      <HowItWorks />
      <SalaryData />
      <Employers />
      <Awards />
      <VerifyCTA />
      <LeadForm />
    </>
  );
}
