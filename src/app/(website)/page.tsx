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

export default function HomePage() {
  return (
    <>
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
