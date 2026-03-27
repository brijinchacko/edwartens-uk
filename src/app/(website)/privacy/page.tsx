import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - EDWartens UK",
  description:
    "EDWartens UK privacy policy. How we collect, use, and protect your personal data in compliance with UK GDPR and the Data Protection Act 2018.",
  alternates: {
    canonical: "https://edwartens.co.uk/privacy",
  },
};

const sections = [
  {
    title: "1. Introduction",
    content: `This Privacy Policy explains how EDWartens UK ("we", "us", "our"), the trading name of Wartens Ltd, collects, uses, stores, and protects your personal data when you visit our website (edwartens.co.uk), use our services, or interact with us. We are committed to protecting your privacy and handling your data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.`,
  },
  {
    title: "2. Data Controller",
    content: `The data controller responsible for your personal data is Wartens Ltd, a company registered in England and Wales (CRN: 15262249, VAT: 473020522, D-U-N-S\u00AE: 231167762), trading as EDWartens UK. Our registered office is at 8, Lyon Road, Milton Keynes, MK1 1EX, United Kingdom. If you have any questions about this policy or our data practices, you can contact us at info@wartens.com or call +44 333 33 98 394.`,
  },
  {
    title: "3. What Data We Collect",
    content: `We may collect and process the following categories of personal data:

Identity Data: Full name, title, date of birth.
Contact Data: Email address, telephone number, postal address.
Technical Data: IP address, browser type and version, time zone setting, operating system, and platform.
Usage Data: Information about how you use our website and services.
Education Data: Qualifications, course enrolment details, assessment results, and certification records.
Financial Data: Payment card details (processed securely by our third-party payment provider Stripe).
Communication Data: Your preferences in receiving marketing from us and your communication preferences.
Employment Data: CV, work history, and career support-related information if you use our recruitment services.`,
  },
  {
    title: "4. How We Collect Your Data",
    content: `We collect personal data through the following means:

Direct interactions: When you fill in forms on our website, enrol on a course, contact us by phone, email, or post, create an account, subscribe to our newsletter, or request a consultation.
Automated technologies: As you interact with our website, we may automatically collect Technical Data about your equipment, browsing actions, and patterns using cookies and similar technologies. Please see our Cookie Policy for further details.
Third parties: We may receive personal data about you from third-party sources such as analytics providers, advertising networks, and recruitment partners.`,
  },
  {
    title: "5. How We Use Your Data",
    content: `We use your personal data for the following purposes, relying on the lawful bases indicated:

To register you as a student and manage your training enrolment (Performance of a contract).
To deliver training services, issue certificates, and manage your student account (Performance of a contract).
To process your payments and manage billing (Performance of a contract).
To provide career support and recruitment services through our partner Oscabe (Legitimate interests).
To communicate with you about your training, account, and services (Performance of a contract).
To send you marketing communications where you have consented (Consent).
To improve our website, services, and customer experience (Legitimate interests).
To comply with legal and regulatory obligations (Legal obligation).
To prevent fraud and protect our business (Legitimate interests).`,
  },
  {
    title: "6. Data Sharing",
    content: `We may share your personal data with the following categories of recipients:

Oscabe: Our recruitment partner, for career support and employment services. Data is shared only with your consent.
Wartens Ltd: Our parent company, for administrative and business purposes.
Payment Processors: Stripe, for secure payment processing. We do not store your full card details on our servers.
Email Service Providers: For sending transactional and marketing communications.
Analytics Providers: For website analytics and performance monitoring.
Legal and Regulatory Bodies: Where we are required to do so by law.

We do not sell your personal data to third parties. All third-party service providers are required to process your data in accordance with UK GDPR.`,
  },
  {
    title: "7. International Transfers",
    content: `Some of our third-party service providers may be based outside the United Kingdom. Where we transfer your personal data outside the UK, we ensure that appropriate safeguards are in place, including Standard Contractual Clauses approved by the Information Commissioner's Office (ICO) or transfers to countries with an adequacy decision.`,
  },
  {
    title: "8. Data Retention",
    content: `We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected. Specific retention periods:

Student records and certificates: Retained indefinitely for verification purposes.
Financial records: Retained for 7 years as required by HMRC regulations.
Marketing consent records: Retained until you withdraw consent.
Website analytics data: Retained for 26 months.
Contact form submissions: Retained for 2 years.

After the retention period expires, your data will be securely deleted or anonymised.`,
  },
  {
    title: "9. Your Rights",
    content: `Under UK GDPR, you have the following rights regarding your personal data:

Right of Access: You can request a copy of the personal data we hold about you.
Right to Rectification: You can request correction of inaccurate or incomplete data.
Right to Erasure: You can request deletion of your data in certain circumstances.
Right to Restrict Processing: You can request that we limit how we use your data.
Right to Data Portability: You can request a copy of your data in a machine-readable format.
Right to Object: You can object to processing based on legitimate interests or direct marketing.
Right to Withdraw Consent: Where processing is based on consent, you can withdraw it at any time.

To exercise any of these rights, contact us at info@wartens.com. We will respond within one month. If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.`,
  },
  {
    title: "10. Data Security",
    content: `We have implemented appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, access controls, regular security assessments, and staff training on data protection.`,
  },
  {
    title: "11. Cookies",
    content: `Our website uses cookies and similar tracking technologies. For detailed information about the cookies we use and how to manage them, please see our Cookie Policy.`,
  },
  {
    title: "12. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website with a revised effective date. We encourage you to review this policy periodically.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

EDWartens UK (Wartens Ltd)
Company registered in England and Wales
CRN: 15262249 | VAT: 473020522 | D-U-N-S\u00AE: 231167762
Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX
Email: info@wartens.com
Phone: +44 333 33 98 394

ICO Registration Number: Available upon request.`,
  },
];

export default function PrivacyPage() {
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
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Last updated: 1 January 2025. This policy explains how EDWartens UK
            handles your personal data in compliance with UK GDPR.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-white mb-4">
                  {section.title}
                </h2>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
