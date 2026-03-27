import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - PLC, SCADA & Automation Insights | EDWartens UK",
  description:
    "Expert articles on PLC programming, SCADA systems, industrial automation, and AI in manufacturing. Career advice and industry insights from EDWartens UK.",
  keywords: [
    "PLC blog",
    "automation articles UK",
    "SCADA insights",
    "industrial automation blog",
  ],
  alternates: { canonical: "https://edwartens.co.uk/blog" },
  openGraph: {
    title: "Blog | EDWartens UK",
    description:
      "Expert articles on PLC, SCADA, and industrial automation.",
    url: "https://edwartens.co.uk/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
