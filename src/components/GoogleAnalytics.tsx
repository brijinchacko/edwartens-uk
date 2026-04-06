"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = "G-3NJTPRY5QX";

export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const raw = localStorage.getItem("edw-cookie-consent");
        if (!raw) return;
        const consent = JSON.parse(raw);
        if (consent?.analytics === true) {
          setHasConsent(true);
        }
      } catch {
        // Legacy format: if the old value was just "accepted", treat as consent
        const raw = localStorage.getItem("edw-cookie-consent");
        if (raw === "accepted") {
          setHasConsent(true);
        }
      }
    };

    checkConsent();

    // Listen for consent changes from the CookieConsent component
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "edw-cookie-consent") checkConsent();
    };
    window.addEventListener("storage", handleStorage);

    // Also listen for custom event dispatched within the same tab
    const handleCustom = () => checkConsent();
    window.addEventListener("edw-consent-updated", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("edw-consent-updated", handleCustom);
    };
  }, []);

  if (!hasConsent) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
