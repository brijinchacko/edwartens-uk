import Link from "next/link";
import { Users, Wrench, Award, TrendingUp, Glasses, Briefcase } from "lucide-react";

const reasons = [
  {
    icon: Users,
    title: "Expert Instructors",
    description: "Learn from working engineers with real-world industrial automation experience.",
    color: "neon-blue",
  },
  {
    icon: Wrench,
    title: "Hands-on Training",
    description: "Practice on real PLCs and simulation tools like FactoryIO from day one.",
    color: "neon-green",
  },
  {
    icon: Award,
    title: "CPD Certification",
    description: "Receive CPD Accredited qualifications recognised by employers across the UK.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Career Advancement",
    description: "Career support connecting you with top UK employers like Siemens, ABB, and Shell.",
    color: "cyan",
  },
  {
    icon: Glasses,
    title: "VR Training",
    description: "Immersive virtual reality training experiences using Meta VR headsets.",
    color: "neon-blue",
  },
  {
    icon: Briefcase,
    title: "Job Support",
    description: "Interview preparation, CV writing, and career guidance.",
    color: "neon-green",
  },
];

export default function WhyEdwartens() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-widest text-neon-green mb-3">Why EDWartens</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Not a Training Institute - <span className="gradient-text">An Engineering Company</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            EDWartens is the training division of Wartens, a global engineering company. Our trainers are practicing engineers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="glass-card rounded-xl p-6 group hover:glow-blue transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-${r.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={`text-${r.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{r.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{r.description}</p>
              </div>
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
