import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "EU Privacy Rights | GDPR Data Protection | EDWartens UK",
  description:
    "Your privacy rights under the EU General Data Protection Regulation (GDPR). Learn how EDWartens UK protects and handles personal data of EU residents, including your right of access, erasure, portability, and more.",
  alternates: {
    canonical: "https://edwartens.co.uk/eu-privacy",
  },
  openGraph: {
    title: "EU Privacy Rights | GDPR Data Protection | EDWartens UK",
    description:
      "Your privacy rights under the EU GDPR. Learn how EDWartens UK protects personal data of EU residents.",
    url: "https://edwartens.co.uk/eu-privacy",
    siteName: "EDWartens UK",
    type: "website",
  },
};

const sections = [
  {
    title: "Your Rights Under GDPR",
    content: `As an EU/EEA resident, the General Data Protection Regulation (GDPR, Regulation (EU) 2016/679) grants you specific rights regarding the collection and processing of your personal data. EDWartens UK, the trading name of Wartens Ltd (CRN: 15262249), is committed to upholding these rights. This page explains what those rights are and how to exercise them.

We process personal data on the following lawful bases: consent, performance of a contract (e.g. course enrolment), legitimate interests (e.g. improving our services), and compliance with legal obligations.`,
  },
  {
    title: "Right of Access (Article 15)",
    content: `You have the right to request confirmation of whether we process your personal data, and if so, to obtain a copy of that data. This includes information about:

The purposes of processing.
The categories of personal data concerned.
The recipients or categories of recipients to whom data has been disclosed.
The envisaged retention period.
The existence of your other rights (erasure, restriction, objection).

We will provide this information free of charge within one month of your request. If requests are manifestly unfounded or excessive, we may charge a reasonable fee or refuse to act.`,
  },
  {
    title: "Right to Erasure \u2014 Right to be Forgotten (Article 17)",
    content: `You have the right to request the deletion of your personal data where:

The data is no longer necessary for the purpose for which it was collected.
You withdraw consent and there is no other legal basis for processing.
You object to processing and there are no overriding legitimate grounds.
The data has been unlawfully processed.
Erasure is required to comply with a legal obligation.

Please note that we may need to retain certain data for legal, regulatory, or contractual reasons (e.g. CPD accreditation records, financial transactions for HMRC compliance). We will inform you if any exemptions apply.`,
  },
  {
    title: "Right to Data Portability (Article 20)",
    content: `Where processing is based on your consent or a contract, and is carried out by automated means, you have the right to receive your personal data in a structured, commonly used, and machine-readable format (e.g. CSV or JSON). You may also request that we transmit this data directly to another controller where technically feasible.

This applies to data you have provided to us, including course enrolment information, assessment results, and communication preferences.`,
  },
  {
    title: "Right to Restrict Processing (Article 18)",
    content: `You can request that we restrict the processing of your personal data in the following circumstances:

You contest the accuracy of the data (restriction applies while we verify accuracy).
The processing is unlawful and you prefer restriction over erasure.
We no longer need the data, but you require it for legal claims.
You have objected to processing pending verification of our legitimate grounds.

When processing is restricted, we will store the data but not process it further without your consent, except for legal claims, protection of another person's rights, or important public interest.`,
  },
  {
    title: "Right to Object (Article 21)",
    content: `You have the right to object to processing of your personal data where:

Processing is based on legitimate interests or public interest. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests.
Data is processed for direct marketing purposes. You have an absolute right to object to direct marketing at any time, including profiling related to direct marketing.

To opt out of marketing communications, use the unsubscribe link in our emails or contact us directly.`,
  },
  {
    title: "How to Exercise Your Rights",
    content: `To exercise any of the above rights, contact us at:

Email: info@wartens.com
Phone: +44 333 33 98 394
Post: EDWartens UK (Wartens Ltd), 8 Lyon Road, Milton Keynes, MK1 1EX, United Kingdom

Please include your full name, email address associated with your account, and a description of your request. We may need to verify your identity before processing the request. We will respond within one month. If your request is complex, we may extend this by a further two months, but we will notify you of any extension within the first month.`,
  },
  {
    title: "Data Protection Officer",
    content: `Wartens Ltd has designated a Data Protection Officer (DPO) responsible for overseeing data protection compliance. You can contact the DPO at:

Email: info@wartens.com (marked for the attention of the DPO)
Post: Data Protection Officer, Wartens Ltd, 8 Lyon Road, Milton Keynes, MK1 1EX, United Kingdom

The DPO is your first point of contact for any privacy-related concerns or complaints regarding how we handle your personal data.`,
  },
  {
    title: "Supervisory Authority",
    content: `If you are not satisfied with our response to your privacy request, you have the right to lodge a complaint with a supervisory authority.

For UK residents:
Information Commissioner's Office (ICO)
Website: ico.org.uk
Phone: 0303 123 1113
Post: Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF

For EU/EEA residents:
You may contact the Data Protection Authority (DPA) in your country of residence. A full list of EU DPAs is available at edpb.europa.eu. Common DPAs include:

Germany: BfDI (bfdi.bund.de)
France: CNIL (cnil.fr)
Netherlands: AP (autoriteitpersoonsgegevens.nl)
Ireland: DPC (dataprotection.ie)
Belgium: APD (autoriteprotectiondonnees.be)
Poland: UODO (uodo.gov.pl)

You have the right to lodge a complaint with your local DPA regardless of whether we are established in your country.`,
  },
  {
    title: "Data Retention",
    content: `We retain personal data only as long as necessary for the purposes for which it was collected. Our retention periods are as follows:

Student records and course enrolment data: 6 years after course completion (to support CPD accreditation verification and regulatory requirements).
Assessment results and certificates: 6 years (for verification purposes and UKRLP compliance).
Payment and financial records: 7 years (as required by HMRC for tax and accounting purposes).
Marketing consent records: Until consent is withdrawn, plus 1 year for record-keeping.
Website analytics data: 26 months (Google Analytics default retention).
Enquiry and contact form data: 2 years from last communication.
Career support and CV data: 1 year after last engagement, unless you request earlier deletion.

After the retention period expires, data is securely deleted or anonymised. You may request earlier deletion at any time, subject to legal and regulatory requirements outlined above.`,
  },
];

export default function EUPrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-neon-blue/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-neon-blue/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-blue/20 bg-neon-blue/5 text-neon-blue text-xs font-medium mb-6">
            <Shield size={14} />
            GDPR Compliant
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            EU Privacy Rights
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Your rights under the General Data Protection Regulation (GDPR) and
            how EDWartens UK protects your personal data.
          </p>
          <p className="text-xs text-text-muted mt-4">
            Last updated: April 2026
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          {sections.map((section, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.06]"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
