import Link from "next/link";
import FuturisticGrid from "./FuturisticGrid";

export default function Hero() {
  return (
    <section className="px-3 sm:px-5 lg:px-6 pt-3">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.06] mesh-gradient-hero min-h-[85vh] flex items-center">
        <FuturisticGrid />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-32 sm:py-40 w-full text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/[0.08] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
            </span>
            <span className="text-[11px] text-text-muted tracking-wide">Training Division of Wartens</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="text-white">Launch Your Career in</span>
            <br />
            <span className="gradient-text">Industrial Automation</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-8 leading-relaxed">
            Industry-leading training in Physical AI (Automation) and Digital AI.
            CPD Accredited courses with hands-on experience and dedicated career support.
          </p>

          {/* Pillar Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-blue/10 border border-neon-blue/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
              </span>
              <span className="text-sm text-neon-blue font-medium">Physical AI</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
              </span>
              <span className="text-sm text-neon-green font-medium">Digital AI</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Explore Courses
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
