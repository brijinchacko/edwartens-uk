import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Our Training Works - PLC & AI Automation | EDWartens UK",
  description:
    "Intensive hands-on PLC and AI automation training at Milton Keynes or online. Siemens TIA Portal, WinCC SCADA, Python ML. BST 9AM-5PM, max 15 per batch. CPD Accredited.",
  keywords: [
    "PLC training Milton Keynes",
    "automation training UK",
    "Siemens TIA Portal training",
    "SCADA training",
    "AI automation course",
  ],
  alternates: { canonical: "https://edwartens.co.uk/training" },
  openGraph: {
    title: "How Our Training Works | EDWartens UK",
    description:
      "Intensive hands-on PLC and AI automation training. Classroom or online.",
    url: "https://edwartens.co.uk/training",
  },
};

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
