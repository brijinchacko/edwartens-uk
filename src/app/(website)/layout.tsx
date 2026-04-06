import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrencyProvider>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </CurrencyProvider>
  );
}
