import type { Metadata } from "next";
import { Mail, Phone, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility Statement - EDWartens UK",
  description:
    "EDWartens UK accessibility statement. Our commitment to WCAG 2.1 Level AA accessibility standards and how to report accessibility issues.",
  alternates: {
    canonical: "https://edwartens.co.uk/accessibility",
  },
  openGraph: {
    title: "Accessibility Statement | EDWartens UK",
    description:
      "Our commitment to making EDWartens UK accessible to everyone. WCAG 2.1 Level AA compliant.",
    url: "https://edwartens.co.uk/accessibility",
  },
};

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-dark-primary">
      {/* Hero */}
      <section className="relative py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            EDWartens UK (a trading name of Wartens Ltd, a company registered in England
            and Wales, CRN: 15262249) is committed to ensuring digital accessibility for
            people of all abilities. We continually improve the user experience for
            everyone and apply the relevant accessibility standards.
          </p>
          <p className="text-text-muted text-sm mt-4">
            Last updated: March 2026
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-10">
        {/* Our Commitment */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-neon-blue" size={20} />
            <h2 className="text-xl font-semibold text-white">Our Commitment</h2>
          </div>
          <p className="text-text-secondary leading-relaxed mb-4">
            We are committed to conforming with the{" "}
            <strong className="text-white">
              Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
            </strong>{" "}
            standard. These guidelines explain how to make web content more accessible to
            people with a wide range of disabilities, including visual, auditory, physical,
            speech, cognitive, language, learning, and neurological disabilities.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Accessibility is an ongoing effort. We are always working to improve the
            accessibility of our website and services to ensure we provide equal access to all
            users.
          </p>
        </section>

        {/* What We Do */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            What We Do to Ensure Accessibility
          </h2>
          <ul className="space-y-3 text-text-secondary">
            {[
              "Use semantic HTML to ensure proper document structure and navigation",
              "Provide sufficient colour contrast ratios between text and backgrounds",
              "Ensure all interactive elements are keyboard accessible",
              "Include alternative text for meaningful images",
              "Use ARIA labels and roles where appropriate to enhance screen reader compatibility",
              "Design responsive layouts that work across devices and screen sizes",
              "Provide clear and consistent navigation throughout the site",
              "Use readable font sizes and allow text resizing without loss of functionality",
              "Ensure forms have associated labels and clear error messaging",
              "Regularly test our site using accessibility evaluation tools",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Known Limitations */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-neon-blue" size={20} />
            <h2 className="text-xl font-semibold text-white">Known Limitations</h2>
          </div>
          <p className="text-text-secondary leading-relaxed mb-4">
            Despite our best efforts, some parts of the site may not yet be fully accessible.
            We are aware of the following limitations and are actively working to address them:
          </p>
          <ul className="space-y-3 text-text-secondary">
            {[
              "Some older PDF documents may not be fully accessible to screen readers. We are working to replace these with accessible versions.",
              "Third-party content and embedded services (such as payment processing or video players) may not fully conform to WCAG 2.1 standards.",
              "Some complex interactive features on the student portal may have limited keyboard navigation support. We are working to improve these.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Reporting Issues */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Reporting Accessibility Issues
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            We welcome your feedback on the accessibility of the EDWartens UK website. If you
            encounter any accessibility barriers or have suggestions for improvement, please
            contact us:
          </p>
          <div className="glass-card rounded-xl p-5 space-y-3 text-text-secondary">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-neon-blue flex-shrink-0" />
              <a
                href="mailto:info@wartens.com?subject=Accessibility%20Issue"
                className="text-neon-blue hover:underline"
              >
                info@wartens.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-neon-blue flex-shrink-0" />
              <a href="tel:+443333398394" className="hover:text-neon-blue transition-colors">
                +44 333 33 98 394
              </a>
            </div>
          </div>
          <p className="text-text-secondary leading-relaxed mt-4">
            When reporting an issue, please include:
          </p>
          <ul className="space-y-2 ml-4 mt-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-neon-blue mt-0.5">-</span>
              <span>The web address (URL) of the page where you found the issue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-blue mt-0.5">-</span>
              <span>A description of the problem you encountered</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-blue mt-0.5">-</span>
              <span>
                The device, browser, and assistive technology you were using (if applicable)
              </span>
            </li>
          </ul>
          <p className="text-text-secondary leading-relaxed mt-4">
            We aim to respond to accessibility feedback within{" "}
            <strong className="text-white">5 business days</strong> and will work to resolve
            issues as quickly as possible.
          </p>
        </section>

        {/* Contact for Assistance */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Contact Us for Assistance
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            If you need information from our website in a different format (for example, large
            print, audio, or easy read), or if you need assistance accessing our services,
            please get in touch with us. We will do our best to accommodate your needs.
          </p>
          <div className="glass-card rounded-xl p-5 space-y-3 text-text-secondary">
            <p className="text-sm">
              EDWartens UK (Wartens Ltd) &mdash; Company registered in England and Wales
              <br />
              CRN: 15262249 | VAT: 473020522 | D-U-N-S&reg;: 231167762
              <br />
              Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX
            </p>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-neon-blue flex-shrink-0" />
              <a
                href="mailto:info@wartens.com"
                className="text-neon-blue hover:underline"
              >
                info@wartens.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-neon-blue flex-shrink-0" />
              <a href="tel:+443333398394" className="hover:text-neon-blue transition-colors">
                +44 333 33 98 394
              </a>
            </div>
          </div>
        </section>

        {/* Enforcement */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <ExternalLink className="text-neon-blue" size={20} />
            <h2 className="text-xl font-semibold text-white">Enforcement</h2>
          </div>
          <p className="text-text-secondary leading-relaxed mb-4">
            The{" "}
            <strong className="text-white">Equality Act 2010</strong> (and the Equality Act
            2010 (Specific Duties and Public Authorities) Regulations 2017) require public
            sector and service providers to ensure that their websites and services are
            accessible.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            If you are not satisfied with our response to your accessibility concern, you may
            contact the{" "}
            <strong className="text-white">
              Equality and Human Rights Commission (EHRC)
            </strong>
            :
          </p>
          <div className="glass-card rounded-xl p-5">
            <a
              href="https://www.equalityhumanrights.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue hover:underline text-sm"
            >
              www.equalityhumanrights.com
            </a>
            <p className="text-text-muted text-sm mt-2">
              The EHRC is responsible for enforcing the Equality Act 2010 and can advise on
              your rights regarding accessibility.
            </p>
          </div>
        </section>

        {/* Technical Info */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Technical Information
          </h2>
          <p className="text-text-secondary leading-relaxed">
            This website is built using Next.js, React, and Tailwind CSS. We aim to conform
            with WCAG 2.1 Level AA. This statement was prepared based on a self-assessment of
            the website. We plan to commission an independent accessibility audit in the
            future to further verify our compliance.
          </p>
        </section>
      </div>
    </main>
  );
}
