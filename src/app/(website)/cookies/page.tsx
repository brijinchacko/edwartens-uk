import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - EDWartens UK",
  description:
    "EDWartens UK cookie policy. Learn about the cookies we use, why we use them, and how to manage your cookie preferences.",
  alternates: {
    canonical: "https://edwartens.co.uk/cookies",
  },
};

const cookieTypes = [
  {
    category: "Strictly Necessary Cookies",
    description:
      "These cookies are essential for the website to function correctly. They enable core functionality such as page navigation, secure areas, and session management. The website cannot function properly without these cookies, and they cannot be disabled.",
    cookies: [
      {
        name: "next-auth.session-token",
        purpose: "Maintains your login session when you are signed in to the student or admin portal.",
        duration: "Session / 30 days",
        type: "First-party",
      },
      {
        name: "next-auth.csrf-token",
        purpose: "Protects against cross-site request forgery (CSRF) attacks on login forms.",
        duration: "Session",
        type: "First-party",
      },
      {
        name: "next-auth.callback-url",
        purpose: "Stores the redirect URL after successful authentication.",
        duration: "Session",
        type: "First-party",
      },
      {
        name: "cookie-consent",
        purpose: "Records your cookie preference choice so we do not ask you repeatedly.",
        duration: "1 year",
        type: "First-party",
      },
    ],
  },
  {
    category: "Analytics Cookies",
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve the website experience for all users.",
    cookies: [
      {
        name: "_ga",
        purpose: "Google Analytics: Distinguishes unique users by assigning a randomly generated number.",
        duration: "2 years",
        type: "Third-party (Google)",
      },
      {
        name: "_ga_*",
        purpose: "Google Analytics: Maintains session state and tracks page views.",
        duration: "2 years",
        type: "Third-party (Google)",
      },
    ],
  },
  {
    category: "Marketing Cookies",
    description:
      "These cookies are used to deliver advertisements that are relevant to you and your interests. They are also used to limit the number of times you see an advertisement and to measure the effectiveness of advertising campaigns.",
    cookies: [
      {
        name: "_fbp",
        purpose: "Facebook Pixel: Tracks visits across websites to deliver relevant advertising on Facebook.",
        duration: "3 months",
        type: "Third-party (Meta)",
      },
      {
        name: "_gcl_au",
        purpose: "Google Ads: Stores conversion data for ad clicks to measure advertising effectiveness.",
        duration: "3 months",
        type: "Third-party (Google)",
      },
    ],
  },
  {
    category: "Functional Cookies",
    description:
      "These cookies enable enhanced functionality and personalisation, such as remembering your preferences and settings. If you do not allow these cookies, some features may not function as expected.",
    cookies: [
      {
        name: "preferred-region",
        purpose: "Remembers your selected region (UK, India, UAE, US) for a consistent browsing experience.",
        duration: "1 year",
        type: "First-party",
      },
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Legal
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Cookie <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Last updated: 1 January 2025. This policy explains what cookies are,
            how we use them, and how you can manage your preferences.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="space-y-10">
            {/* What Are Cookies */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                1. What Are Cookies
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Cookies are small text files that are placed on your device when
                you visit a website. They are widely used to make websites work
                efficiently, provide a better user experience, and supply
                information to site owners. Cookies can be &quot;persistent&quot;
                (remaining on your device until they expire or you delete them)
                or &quot;session&quot; cookies (deleted when you close your
                browser).
              </p>
            </div>

            {/* Why We Use Cookies */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                2. Why We Use Cookies
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                We use cookies on edwartens.co.uk to ensure the website
                functions correctly, to understand how visitors use our site, to
                remember your preferences, and to deliver relevant marketing
                content. Some cookies are placed by third-party services that
                appear on our pages.
              </p>
            </div>

            {/* Cookie Categories */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                3. Types of Cookies We Use
              </h2>

              <div className="space-y-8">
                {cookieTypes.map((type) => (
                  <div key={type.category}>
                    <h3 className="text-base font-semibold text-white mb-2">
                      {type.category}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                      {type.description}
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.06]">
                            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                              Cookie
                            </th>
                            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                              Purpose
                            </th>
                            <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="text-left py-2 text-text-muted font-medium text-xs uppercase tracking-wider">
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {type.cookies.map((cookie) => (
                            <tr
                              key={cookie.name}
                              className="border-b border-white/[0.03]"
                            >
                              <td className="py-3 pr-4 text-white font-mono text-xs">
                                {cookie.name}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">
                                {cookie.purpose}
                              </td>
                              <td className="py-3 pr-4 text-text-muted whitespace-nowrap">
                                {cookie.duration}
                              </td>
                              <td className="py-3 text-text-muted whitespace-nowrap">
                                {cookie.type}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Manage Cookies */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                4. How to Manage Cookies
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed space-y-3">
                <p>
                  When you first visit our website, a cookie consent banner will
                  appear allowing you to accept or decline non-essential cookies.
                  You can change your preferences at any time by clearing your
                  browser cookies and revisiting the site.
                </p>
                <p>
                  Most web browsers allow you to control cookies through their
                  settings. You can set your browser to block or alert you about
                  cookies, or delete cookies that have already been set. Please
                  note that if you disable cookies, some parts of the website may
                  not function correctly.
                </p>
                <p>
                  To manage cookies in your browser, refer to your browser&apos;s
                  help documentation:
                </p>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  <li>Google Chrome: Settings &gt; Privacy and Security &gt; Cookies</li>
                  <li>Mozilla Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies</li>
                  <li>Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
                  <li>Microsoft Edge: Settings &gt; Privacy, Search, and Services &gt; Cookies</li>
                </ul>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                5. Third-Party Cookies
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Some cookies are placed by third-party services that appear on
                our pages. We do not control these cookies. Third-party providers
                include Google (Analytics and Ads) and Meta (Facebook Pixel).
                These providers have their own privacy policies governing their
                use of cookies.
              </p>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                6. Changes to This Policy
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes
                will be posted on this page with a revised effective date. We
                encourage you to review this policy periodically to stay informed
                about our use of cookies.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">
                7. Contact Us
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed">
                <p>
                  If you have any questions about our use of cookies, please
                  contact us:
                </p>
                <p className="mt-3">
                  EDWartens UK (Wartens Ltd)
                  <br />
                  Company registered in England and Wales
                  <br />
                  CRN: 15262249 | VAT: 473020522 | D-U-N-S&reg;: 231167762
                  <br />
                  Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX
                  <br />
                  Email: info@wartens.com
                  <br />
                  Phone: +44 333 33 98 394
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
