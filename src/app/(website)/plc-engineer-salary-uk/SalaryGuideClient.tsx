"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function SalaryGuideClient() {
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
          courseInterest: data.get("courseInterest"),
          message: data.get("message"),
          source: "salary-guide",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-neon-green" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-text-secondary">
          We&apos;ve received your enquiry. Our team will contact you within 24 hours with course
          details and pricing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
            Full Name *
          </label>
          <input
            name="name"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted focus:border-neon-blue/50 focus:outline-none transition-colors"
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
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted focus:border-neon-blue/50 focus:outline-none transition-colors"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
            Phone *
          </label>
          <input
            name="phone"
            type="tel"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted focus:border-neon-blue/50 focus:outline-none transition-colors"
            placeholder="+44 7XXX XXX XXX"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
            Course Interest
          </label>
          <select
            name="courseInterest"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm appearance-none cursor-pointer focus:border-neon-blue/50 focus:outline-none transition-colors"
          >
            <option value="" className="bg-dark-secondary">Select a course...</option>
            <option value="PROFESSIONAL_MODULE" className="bg-dark-secondary">Professional Module</option>
            <option value="AI_MODULE" className="bg-dark-secondary">AI Module</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
          Message
        </label>
        <textarea
          name="message"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted resize-none focus:border-neon-blue/50 focus:outline-none transition-colors"
          placeholder="Tell us about your goals..."
        />
      </div>

      <input type="hidden" name="source" value="salary-guide" />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        <Send size={16} />
        {loading ? "Submitting..." : "Enquire About Training"}
      </button>
    </form>
  );
}
