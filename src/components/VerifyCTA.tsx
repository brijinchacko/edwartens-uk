"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export default function VerifyCTA() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <ScrollReveal>
        <div className="glass-card gradient-border rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto relative overflow-hidden">
          {/* Background Image */}
          <Image
            src="/images/stock/uk-london.jpg"
            alt="UK professional certification"
            fill
            className="object-cover opacity-10"
            sizes="(max-width: 768px) 100vw, 768px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14]/60 to-[#0a0a14]/80" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-neon-green/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-neon-green" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Verify a <span className="gradient-text">Certificate</span>
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Employers and institutions can verify the authenticity of EDWartens certificates using the certificate number, student name, and date of birth.
            </p>
            <Link
              href="/verify"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-green to-neon-green/80 text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-green/25 transition-all"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
