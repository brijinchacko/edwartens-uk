"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Wrench, Award, TrendingUp, Glasses, Briefcase } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const reasons = [
  {
    icon: Users,
    title: "Expert Instructors",
    description: "Learn from working engineers with real-world industrial automation experience.",
    color: "neon-blue",
    image: "/images/stock/classroom-training.jpg",
    imageAlt: "Expert instructors in a training classroom",
  },
  {
    icon: Wrench,
    title: "Hands-on Training",
    description: "Practice on real PLCs and simulation tools like FactoryIO from day one.",
    color: "neon-green",
    image: "/images/stock/hands-on-training.jpg",
    imageAlt: "Hands-on PLC and industrial training",
  },
  {
    icon: Award,
    title: "CPD Certification",
    description: "Receive CPD Accredited qualifications recognised by employers across the UK.",
    color: "purple",
    image: "/images/stock/uk-business.jpg",
    imageAlt: "CPD accredited professional certification",
  },
  {
    icon: TrendingUp,
    title: "Career Advancement",
    description: "Career support connecting you with top UK employers like Siemens, ABB, and Shell.",
    color: "cyan",
    image: "/images/stock/career-success.jpg",
    imageAlt: "Career advancement and professional growth",
  },
  {
    icon: Glasses,
    title: "VR Training",
    description: "Immersive virtual reality training experiences using Meta VR headsets.",
    color: "neon-blue",
    image: "/images/stock/vr-training.jpg",
    imageAlt: "VR headset training for industrial automation",
  },
  {
    icon: Briefcase,
    title: "Job Support",
    description: "Interview preparation, CV writing, and career guidance.",
    color: "neon-green",
    image: "/images/stock/job-support.jpg",
    imageAlt: "Job interview and career guidance support",
  },
];

export default function WhyEdwartens() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Why EDWartens</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Not a Training Institute - <span className="gradient-text gradient-text-animated">An Engineering Company</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              EDWartens is the training division of Wartens, a global engineering company. Our trainers are practicing engineers.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, idx) => {
            const Icon = r.icon;
            return (
              <ScrollReveal key={r.title} delay={idx * 100}>
              <div className="glass-card-neon rounded-xl overflow-hidden group hover:glow-blue transition-all duration-300 card-hover-glow h-full">
                {/* Card Image */}
                <div className="relative w-full h-32 overflow-hidden">
                  <Image
                    src={r.image}
                    alt={r.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-transparent" />
                </div>
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-${r.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className={`text-${r.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{r.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{r.description}</p>
                </div>
              </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Link
            href="/courses"
            className="inline-flex items-center px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
          >
            View Our Courses
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center px-8 py-3.5 rounded-lg border border-white/10 text-text-secondary font-semibold text-sm hover:border-white/20 hover:bg-white/[0.03] transition-colors"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  );
}
