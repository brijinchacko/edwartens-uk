import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Student & Employee Portal | EDWartens UK",
  description:
    "Login to your EDWartens UK student portal or employee dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
