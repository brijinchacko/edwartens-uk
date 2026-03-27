"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        setError("Something went wrong. Please try again or email us directly.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Contact
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Have questions about our training programmes, career support, or
            engineering services? Fill in the form below or contact us directly.
            Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Contact Information
                </h2>
              </div>

              <div className="glass-card rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-neon-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    UK Office
                  </p>
                  <a
                    href="https://maps.app.goo.gl/rtnU2t8Wr68HZQmC6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary hover:text-neon-blue transition-colors"
                  >
                    8, Lyon Road
                    <br />
                    Milton Keynes
                    <br />
                    MK1 1EX
                  </a>
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-neon-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Phone</p>
                  <a
                    href="tel:+443333398394"
                    className="text-sm text-text-secondary hover:text-neon-blue transition-colors block"
                  >
                    +44 333 33 98 394
                  </a>
                  <a
                    href="tel:+447442875787"
                    className="text-sm text-text-secondary hover:text-neon-blue transition-colors block"
                  >
                    +44 7442 87 57 87
                  </a>
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-neon-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Email</p>
                  <a
                    href="mailto:info@wartens.com"
                    className="text-sm text-text-secondary hover:text-neon-blue transition-colors"
                  >
                    info@wartens.com
                  </a>
                </div>
              </div>

              <div className="glass-card rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-neon-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Office Hours
                  </p>
                  <p className="text-sm text-text-secondary">
                    Monday -Friday
                    <br />
                    08:30 -17:00
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-neon-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Thank You!
                  </h3>
                  <p className="text-text-secondary mb-6">
                    We&apos;ve received your message. Our team will get back to
                    you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 text-sm text-neon-blue hover:underline"
                  >
                    <ArrowLeft size={14} /> Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="glass-card rounded-2xl p-6 sm:p-10"
                >
                  <h3 className="text-lg font-semibold text-white mb-6">
                    Send Us a Message
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                        Full Name *
                      </label>
                      <input
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                        Email *
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                        Phone
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                        placeholder="+44 7XXX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-dark-secondary">
                          Select a subject...
                        </option>
                        <option
                          value="Training Enquiry"
                          className="bg-dark-secondary"
                        >
                          Training Enquiry
                        </option>
                        <option
                          value="Career Support"
                          className="bg-dark-secondary"
                        >
                          Career Support
                        </option>
                        <option
                          value="Engineering Services"
                          className="bg-dark-secondary"
                        >
                          Engineering Services
                        </option>
                        <option
                          value="Partnership"
                          className="bg-dark-secondary"
                        >
                          Partnership
                        </option>
                        <option value="Other" className="bg-dark-secondary">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 mb-4">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <Send size={16} />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map / Directions */}
      <section className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Location
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Visit Our <span className="gradient-text">Milton Keynes</span>{" "}
            Office
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Our training facility is located at 8 Lyon Road, Milton Keynes, MK1
            1EX. Easily accessible by road and rail, with Milton Keynes Central
            station a short drive away.
          </p>
          <div className="glass-card rounded-2xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2455.7!2d-0.7597!3d52.0352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4877b5f3c9e6c36f%3A0x3c0a0f5c3e0c8a0a!2s8%20Lyon%20Rd%2C%20Milton%20Keynes%20MK1%201EX!5e0!3m2!1sen!2suk!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="opacity-80"
              title="EDWartens UK Office Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
