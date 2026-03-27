import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact EDWartens UK - Book a Free Consultation",
  description:
    "Get in touch with EDWartens UK for PLC training enquiries, career support, or engineering services. Book a free consultation. Based at 8 Lyon Road, Milton Keynes MK1 1EX. Call +44 333 33 98 394.",
  keywords: [
    "contact EDWartens",
    "PLC training enquiry",
    "book consultation",
    "EDWartens Milton Keynes",
    "automation training contact",
    "PLC course booking",
    "EDWartens phone number",
    "EDWartens email",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/contact",
  },
  openGraph: {
    title: "Contact EDWartens UK - Book a Free Consultation",
    description:
      "Get in touch for PLC training enquiries and career support. Milton Keynes office. Call +44 333 33 98 394.",
    url: "https://edwartens.co.uk/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
