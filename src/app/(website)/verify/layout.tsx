import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate - EDWartens UK",
  description:
    "Verify the authenticity of an EDWartens UK CPD Accredited certificate. Enter the certificate number to check validity.",
  alternates: { canonical: "https://edwartens.co.uk/verify" },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
