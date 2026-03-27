"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

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
          qualification: data.get("qualification"),
          courseInterest: data.get("courseInterest"),
          message: data.get("message"),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch {
      // Silent fail - form will remain
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section id="consultation" className="py-24 mesh-gradient-alt relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-text-secondary">
              We&apos;ve received your enquiry. Our team will contact you within 24 hours.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="consultation" className="py-24 mesh-gradient-alt relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">Get Started</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Book a Free <span className="gradient-text">Consultation</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Fill in the form below and our team will reach out to help you choose the right program.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">Full Name *</label>
              <input
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">Email *</label>
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
              <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">Phone *</label>
              <input
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                placeholder="+44 7XXX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">Qualification</label>
              <input
                name="qualification"
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                placeholder="e.g., B.Eng Electrical"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">Interested Course</label>
            <select
              name="courseInterest"
              className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm appearance-none cursor-pointer"
            >
              <option value="" className="bg-dark-secondary">Select a course...</option>
              <option value="PROFESSIONAL_MODULE" className="bg-dark-secondary">Professional Module (5 Days)</option>
              <option value="AI_MODULE" className="bg-dark-secondary">AI Module (5 Days)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">Message</label>
            <textarea
              name="message"
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted resize-none"
              placeholder="Tell us about your goals..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Submitting..." : "Book Free Consultation"}
          </button>
        </form>
      </div>
    </section>
  );
}
