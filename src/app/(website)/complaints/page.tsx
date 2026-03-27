import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, AlertCircle, FileText, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Complaints Procedure - EDWartens UK",
  description:
    "EDWartens UK complaints procedure. How to raise a complaint about our PLC training, services, or staff. Three-stage process with clear timelines. Operated by Wartens Ltd.",
  alternates: {
    canonical: "https://edwartens.co.uk/complaints",
  },
  openGraph: {
    title: "Complaints Procedure | EDWartens UK",
    description:
      "How to raise a complaint about EDWartens UK training or services. Clear three-stage process.",
    url: "https://edwartens.co.uk/complaints",
  },
};

export default function ComplaintsPage() {
  return (
    <main className="min-h-screen bg-dark-primary">
      {/* Hero */}
      <section className="relative py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Complaints Procedure
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            EDWartens UK (a trading name of Wartens Ltd) is committed to providing excellent
            training and services. If something has gone wrong, we want to hear about it so we
            can put it right.
          </p>
          <p className="text-text-muted text-sm mt-4">
            Last updated: March 2026
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-10">
        {/* Our Commitment */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Our Commitment</h2>
          <p className="text-text-secondary leading-relaxed">
            We take all complaints seriously and aim to resolve them fairly, promptly, and
            transparently. All complaints are treated confidentially and will not affect your
            access to our services or training programmes. We use feedback from complaints to
            improve our services continuously.
          </p>
        </section>

        {/* Timeline Summary */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-neon-blue" size={20} />
            <h2 className="text-xl font-semibold text-white">Response Timelines</h2>
          </div>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
              <span>
                <strong className="text-white">Acknowledgement:</strong> Within{" "}
                <strong className="text-neon-blue">2 business days</strong> of receiving your complaint
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
              <span>
                <strong className="text-white">Full Response:</strong> Within{" "}
                <strong className="text-neon-blue">10 business days</strong> of receiving your complaint
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
              <span>
                If we need more time, we will notify you of the revised timeline and keep you
                updated throughout
              </span>
            </li>
          </ul>
        </section>

        {/* Stage 1 */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm font-bold">
              1
            </span>
            <h2 className="text-xl font-semibold text-white">
              Stage 1: Informal Resolution
            </h2>
          </div>
          <div className="text-text-secondary space-y-4 leading-relaxed">
            <p>
              We encourage you to raise any concerns informally in the first instance.
              Many issues can be resolved quickly this way.
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>
                  Speak directly to your instructor, trainer, or the relevant staff member
                  involved
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>
                  Explain the issue and what outcome you are looking for
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>
                  The staff member will try to resolve your concern on the spot or within 2
                  business days
                </span>
              </li>
            </ul>
            <p>
              If you are not satisfied with the outcome of Stage 1, or if you prefer not to
              raise the matter informally, you may proceed directly to Stage 2.
            </p>
          </div>
        </section>

        {/* Stage 2 */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm font-bold">
              2
            </span>
            <h2 className="text-xl font-semibold text-white">
              Stage 2: Formal Written Complaint
            </h2>
          </div>
          <div className="text-text-secondary space-y-4 leading-relaxed">
            <p>
              If your concern has not been resolved informally, you can submit a formal
              written complaint to management. Please include:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>Your full name and contact details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>A clear description of your complaint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>
                  Relevant dates, names of staff involved, and any supporting evidence
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>The outcome you are seeking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-blue mt-0.5">-</span>
                <span>Details of any informal resolution attempts (if applicable)</span>
              </li>
            </ul>

            <div className="glass-card rounded-xl p-5 mt-4 space-y-3">
              <p className="text-white font-medium">
                Send your formal complaint to:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-neon-blue flex-shrink-0" />
                  <a
                    href="mailto:info@wartens.com?subject=Formal%20Complaint"
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
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-neon-blue mt-0.5 flex-shrink-0" />
                  <span>
                    Complaints Manager, Wartens Ltd, 8 Lyon Road, Milton Keynes, MK1 1EX
                  </span>
                </div>
              </div>
            </div>

            <p>
              We will acknowledge your complaint within <strong className="text-white">2 business days</strong> and
              provide a full written response within <strong className="text-white">10 business days</strong>.
              Our response will include the findings of our investigation and any actions we
              propose to take.
            </p>
          </div>
        </section>

        {/* Stage 3 */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm font-bold">
              3
            </span>
            <h2 className="text-xl font-semibold text-white">
              Stage 3: External Escalation
            </h2>
          </div>
          <div className="text-text-secondary space-y-4 leading-relaxed">
            <p>
              If you remain dissatisfied after completing Stage 2, you have the right to
              escalate your complaint to an external body. You may contact:
            </p>

            <div className="space-y-4">
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink size={16} className="text-neon-blue" />
                  <h3 className="text-white font-medium">Citizens Advice</h3>
                </div>
                <p className="text-sm mb-2">
                  Free, independent advice on consumer rights and how to take a complaint further.
                </p>
                <a
                  href="https://www.citizensadvice.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-blue text-sm hover:underline"
                >
                  www.citizensadvice.org.uk
                </a>
              </div>

              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink size={16} className="text-neon-blue" />
                  <h3 className="text-white font-medium">Trading Standards</h3>
                </div>
                <p className="text-sm mb-2">
                  You can report concerns about trading practices to your local Trading
                  Standards office via Citizens Advice Consumer Service.
                </p>
                <p className="text-sm">
                  Helpline:{" "}
                  <a href="tel:08082231133" className="text-neon-blue hover:underline">
                    0808 223 1133
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-neon-blue" size={20} />
            <h2 className="text-xl font-semibold text-white">Additional Information</h2>
          </div>
          <div className="text-text-secondary space-y-4 leading-relaxed">
            <div>
              <h3 className="text-white font-medium mb-1">Confidentiality</h3>
              <p>
                All complaints are handled in strict confidence. Information is only shared
                with those who need to know in order to investigate and resolve the complaint.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Record Keeping</h3>
              <p>
                We maintain records of all formal complaints and their outcomes. These records
                are kept securely and used to identify trends and improve our services.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Accessibility</h3>
              <p>
                If you need help making a complaint or require this procedure in an alternative
                format, please contact us and we will do our best to accommodate your needs.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Legal Entity</h3>
              <p>
                EDWartens UK is a trading name of Wartens Ltd, a company registered in England and Wales.
                CRN: 15262249 | VAT: 473020522 | D-U-N-S&reg;: 231167762.
                Registered Office: 8, Lyon Road, Milton Keynes, MK1 1EX.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Summary */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-neon-blue" size={20} />
            <h2 className="text-xl font-semibold text-white">Contact Us About a Complaint</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-text-secondary">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-neon-blue mt-0.5 flex-shrink-0" />
                <span>8 Lyon Road, Milton Keynes, MK1 1EX</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-neon-blue flex-shrink-0" />
                <span>Mon - Fri, 08:30 - 17:00</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
