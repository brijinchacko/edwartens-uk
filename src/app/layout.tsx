import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EDWartens UK - Best PLC & SCADA Training in UK | CPD Accredited",
    template: "%s | EDWartens UK",
  },
  manifest: "/manifest.json",
  themeColor: "#2891FF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EDWartens",
  },
  description:
    "EDWartens UK offers industry-leading PLC, SCADA, and Industrial Automation training in Milton Keynes. CPD Accredited courses with Siemens, Allen Bradley, HMI & WinCC SCADA. Dedicated career support. Training Division of Wartens.",
  keywords: [
    // Core Training Keywords
    "PLC training UK",
    "SCADA training UK",
    "PLC course UK",
    "SCADA course UK",
    "PLC programming course",
    "industrial automation training UK",
    "automation engineer course",
    "Siemens PLC training",
    "Allen Bradley training UK",
    "TIA Portal course UK",
    "Studio 5000 training",
    "HMI training UK",
    "WinCC SCADA training",
    // Career/Job Keywords
    "automation engineer jobs UK",
    "PLC programmer jobs UK",
    "SCADA engineer jobs",
    "controls engineer UK",
    "sponsorship visa jobs UK",
    "skilled worker visa engineering",
    "engineering jobs with sponsorship UK",
    "PLC engineer salary UK",
    "automation career UK",
    // Location Keywords
    "PLC training Milton Keynes",
    "automation training Milton Keynes",
    "engineering training UK",
    "CPD accredited PLC course",
    "CPD certified training UK",
    // Industry Keywords
    "Industry 4.0 training",
    "IIoT training UK",
    "factory automation course",
    "industrial controls training",
    "VFD training",
    "DCS training",
    "robotics training UK",
    "pneumatics training",
    // Brand Keywords
    "EDWartens",
    "EDWartens UK",
    "Wartens training",
    "edwartens.co.uk",
  ],
  authors: [{ name: "EDWartens UK" }],
  creator: "EDWartens UK",
  publisher: "EDWartens UK",
  metadataBase: new URL("https://edwartens.co.uk"),
  alternates: {
    canonical: "https://edwartens.co.uk",
    languages: {
      "en-gb": "https://edwartens.co.uk",
      "en-ae": "https://edwartens.com/uae",
      "en-us": "https://edwartens.com/us",
      "x-default": "https://edwartens.co.uk",
    },
  },
  openGraph: {
    title: "EDWartens UK - Best PLC & SCADA Training in UK | CPD Accredited",
    description:
      "Industry-leading PLC, SCADA, and Industrial Automation training in Milton Keynes. CPD Accredited with Siemens, Allen Bradley, HMI & WinCC SCADA courses. Dedicated career support.",
    url: "https://edwartens.co.uk",
    siteName: "EDWartens UK",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "https://edwartens.co.uk/images/EDWARTENS LOGO UK.png",
        width: 1200,
        height: 630,
        alt: "EDWartens UK - PLC & SCADA Training",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EDWartens UK - Best PLC & SCADA Training in UK | CPD Accredited",
    description:
      "Industry-leading PLC, SCADA, and Industrial Automation training. CPD Accredited with dedicated career support. Training Division of Wartens.",
    site: "@WartensUK",
    creator: "@WartensUK",
    images: ["https://edwartens.co.uk/images/EDWARTENS LOGO UK.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-placeholder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="alternate" hrefLang="en-gb" href="https://edwartens.co.uk" />
        <link rel="alternate" hrefLang="en-ae" href="https://edwartens.com/uae" />
        <link rel="alternate" hrefLang="en-us" href="https://edwartens.com/us" />
        <link rel="alternate" hrefLang="x-default" href="https://edwartens.co.uk" />
        {/* Google Analytics - loaded conditionally by GoogleAnalytics component based on cookie consent */}
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["EducationalOrganization", "LocalBusiness"],
              "@id": "https://edwartens.co.uk/#organization",
              name: "EDWartens UK",
              alternateName: ["EDWartens", "ED Wartens", "Edwartens PLC Training"],
              description: "EDWartens UK is a CPD Accredited industrial automation training provider offering PLC, SCADA, HMI, and AI courses. Part of the Wartens group, our trainers are practicing automation engineers. Voted UK Startup National Winner 2025 and Best PLC Training Provider UK 2025.",
              url: "https://edwartens.co.uk",
              logo: { "@type": "ImageObject", url: "https://edwartens.co.uk/images/EDWARTENS LOGO UK.png" },
              image: "https://edwartens.co.uk/images/stock/hero-automation.jpg",
              telephone: "+443333398394",
              email: "info@wartens.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "8 Lyon Road",
                addressLocality: "Milton Keynes",
                addressRegion: "England",
                postalCode: "MK1 1EX",
                addressCountry: "GB",
              },
              geo: { "@type": "GeoCoordinates", latitude: "52.0406", longitude: "-0.7594" },
              areaServed: [
                { "@type": "Country", name: "United Kingdom" },
                { "@type": "Country", name: "Germany" },
                { "@type": "Country", name: "Netherlands" },
                { "@type": "Country", name: "Poland" },
                { "@type": "Country", name: "Ireland" },
                { "@type": "Country", name: "Belgium" },
                { "@type": "Country", name: "Sweden" },
                { "@type": "Country", name: "France" },
                { "@type": "Country", name: "Italy" },
                { "@type": "Country", name: "Spain" },
                { "@type": "Country", name: "Czech Republic" },
                { "@type": "Country", name: "Austria" },
                { "@type": "Country", name: "Denmark" },
                { "@type": "Country", name: "Norway" },
                { "@type": "Country", name: "Finland" },
                { "@type": "Country", name: "Portugal" },
                { "@type": "Country", name: "Switzerland" },
              ],
              hasCredential: [{ "@type": "EducationalOccupationalCredential", name: "CPD Accredited", credentialCategory: "Professional Development" }],
              award: [
                "UK Startup Awards 2025 - National Winner",
                "UK Startup Awards 2025 - Midlands Winner",
                "Radio Lemon Live 2025 - Best PLC Training Provider UK",
                "Great British Entrepreneur Awards 2025 - Finalist",
                "Independent Education Awards - Finalist",
                "Atal Achievement Award 2024",
              ],
              foundingDate: "2023",
              parentOrganization: { "@type": "Organization", name: "Wartens Ltd", url: "https://wartens.com" },
              sameAs: ["https://www.linkedin.com/company/edwartens", "https://wartens.com", "https://traininginplc.com"],
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "08:30",
                closes: "17:00",
              },
              priceRange: "££",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EDWartens UK",
              url: "https://edwartens.co.uk",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://edwartens.co.uk/blog?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: [
                {
                  "@type": "Course",
                  name: "Professional Automation Engineering Module",
                  description:
                    "Comprehensive 5-day career-focused programme covering Siemens PLC, HMI, WinCC SCADA with 15 hours of recorded sessions. CPD Accredited.",
                  provider: {
                    "@type": "Organization",
                    name: "EDWartens UK",
                  },
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: ["online", "onsite"],
                    duration: "P5D",
                    location: {
                      "@type": "Place",
                      name: "Milton Keynes, UK",
                    },
                  },
                  offers: {
                    "@type": "Offer",
                    price: "2140",
                    priceCurrency: "GBP",
                    availability: "https://schema.org/InStock",
                  },
                },
                {
                  "@type": "Course",
                  name: "AI & Machine Learning in Industrial Automation Module",
                  description:
                    "5-day advanced programme covering AI and ML in industry, Python for engineers, predictive maintenance, computer vision, AI-SCADA, and digital twins. CPD Accredited.",
                  provider: {
                    "@type": "Organization",
                    name: "EDWartens UK",
                  },
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: ["online", "onsite"],
                    duration: "P5D",
                    location: {
                      "@type": "Place",
                      name: "Milton Keynes, UK",
                    },
                  },
                  offers: {
                    "@type": "Offer",
                    price: "2140",
                    priceCurrency: "GBP",
                    availability: "https://schema.org/InStock",
                  },
                },
              ],
            }),
          }}
        />
        {/* LocalBusiness merged into Organization schema above */}
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
