"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  BookOpen,
  BarChart3,
  Cpu,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import type { Metadata } from "next";

const resources = [
  {
    id: "plc-beginners-guide",
    title: "PLC Programming Beginner's Guide",
    description:
      "A comprehensive 30-page PDF covering PLC fundamentals, ladder logic basics, hardware architecture, and your first programme. Perfect for engineers starting their automation journey.",
    icon: BookOpen,
    format: "PDF Guide",
    pages: "30 pages",
  },
  {
    id: "automation-career-infographic",
    title: "Industrial Automation Career Path Infographic",
    description:
      "A visual roadmap showing career progression from junior engineer to lead consultant, including salary ranges, required skills at each level, and recommended certifications.",
    icon: BarChart3,
    format: "Infographic",
    pages: "1 page",
  },
  {
    id: "siemens-s7-1200-reference",
    title: "Siemens S7-1200 Quick Reference Card",
    description:
      "A printable quick reference covering S7-1200 instruction set, data types, addressing modes, and common TIA Portal shortcuts. Keep it next to your workstation.",
    icon: Cpu,
    format: "Reference Card",
    pages: "4 pages",
  },
  {
    id: "plc-interview-questions",
    title: "Top 50 PLC Interview Questions",
    description:
      "Fifty real interview questions with detailed answers covering PLC theory, practical scenarios, SCADA, safety systems, and industrial networking. Prepare with confidence.",
    icon: HelpCircle,
    format: "PDF Guide",
    pages: "25 pages",
  },
  {
    id: "automation-cv-template",
    title: "Automation Engineer CV Template",
    description:
      "A professionally designed CV template tailored for automation and PLC engineers. Includes sections for technical skills, vendor experience, and project highlights.",
    icon: FileSpreadsheet,
    format: "Word Template",
    pages: "2 pages",
  },
];

export default function ResourcesPage() {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    resourceId: string
  ) {
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
          phone: data.get("phone") || "",
          message: `Resource download request: ${resourceId}`,
          courseInterest: `resource-download-${resourceId}`,
        }),
      });

      if (res.ok) {
        setSubmitted((prev) => new Set(prev).add(resourceId));
        setActiveForm(null);
        form.reset();
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Free Resources
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Free PLC &amp; Automation{" "}
            <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Download free guides, reference cards, interview preparation
            materials, and CV templates to accelerate your automation engineering
            career. No cost, no commitment — just valuable resources from
            industry professionals.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              const isSubmitted = submitted.has(resource.id);
              const isFormActive = activeForm === resource.id;

              return (
                <div
                  key={resource.id}
                  className="glass-card rounded-2xl p-6 flex flex-col"
                >
                  {/* Icon and format badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                      <Icon size={24} className="text-neon-blue" />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-text-muted bg-white/[0.04] px-2 py-1 rounded">
                        {resource.format}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-text-muted bg-white/[0.04] px-2 py-1 rounded">
                        {resource.pages}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-6 flex-grow">
                    {resource.description}
                  </p>

                  {/* Action */}
                  {isSubmitted ? (
                    <div className="flex items-center gap-2 text-neon-green">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">
                        Thank you! We will email your download link shortly.
                      </span>
                    </div>
                  ) : isFormActive ? (
                    <form
                      onSubmit={(e) => handleSubmit(e, resource.id)}
                      className="space-y-3"
                    >
                      <input
                        name="name"
                        required
                        placeholder="Full name"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email address"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                      />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Phone (optional)"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-text-muted"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
                        >
                          <Download size={16} />
                          {loading ? "Submitting..." : "Get Free Download"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveForm(null)}
                          className="px-3 py-2.5 rounded-lg border border-white/[0.06] text-text-muted text-sm hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setActiveForm(resource.id)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
                    >
                      <Download size={16} />
                      Download Free
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="glass-card rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto">
              <FileText
                size={40}
                className="text-neon-blue mx-auto mb-4"
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Want More Than Free Resources?
              </h2>
              <p className="text-text-secondary mb-6 max-w-xl mx-auto">
                Our CPD-accredited PLC and automation courses provide hands-on
                training with real industrial hardware, expert instructors, and
                industry-recognised certification.
              </p>
              <a
                href="/courses/professional"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-neon-blue text-white font-medium hover:bg-neon-blue/90 transition-colors"
              >
                Explore Our Courses
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
