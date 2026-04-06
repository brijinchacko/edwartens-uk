import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PLC & Automation Resources | Downloads | EDWartens UK",
  description:
    "Download free PLC programming guides, interview questions, CV templates, and career resources for automation engineers.",
  keywords: [
    "free PLC tutorial",
    "PLC interview questions",
    "automation engineer CV template",
    "PLC programming guide",
    "Siemens S7-1200 reference",
    "free automation resources",
    "PLC beginner guide",
    "industrial automation career",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/resources",
  },
  openGraph: {
    title: "Free PLC & Automation Resources | EDWartens UK",
    description:
      "Download free PLC programming guides, interview questions, CV templates, and career resources for automation engineers.",
    url: "https://edwartens.co.uk/resources",
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
