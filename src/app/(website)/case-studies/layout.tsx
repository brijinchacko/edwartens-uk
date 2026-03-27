import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies - Real Success Stories | EDWartens UK",
  description:
    "Read inspiring stories of students who came to the UK, learned industrial automation at EDWartens, and built successful engineering careers. From non-technical backgrounds to automation engineers.",
  keywords: [
    "PLC training success stories",
    "automation career UK",
    "visa sponsorship engineering UK",
    "skilled worker visa automation",
    "career change to automation",
    "PLC training case study",
    "EDWartens student stories",
    "automation engineer UK",
    "SCADA training results",
  ],
  alternates: { canonical: "https://edwartens.co.uk/case-studies" },
  openGraph: {
    title: "Case Studies - Real Success Stories | EDWartens UK",
    description: "From non-technical backgrounds to automation engineers in the UK. Read their stories.",
    url: "https://edwartens.co.uk/case-studies",
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
