import Link from "next/link";
import { Clock, Award, Cpu, Zap } from "lucide-react";

const courses = [
  {
    title: "Professional Module",
    duration: "5 Days",
    level: "Comprehensive",
    href: "/courses/professional",
    icon: Award,
    color: "neon-blue",
    featured: true,
    points: [
      "Comprehensive program - £2,140 + VAT",
      "Siemens PLC, HMI, WinCC SCADA",
      "15 hours of recorded sessions",
      "CPD Accredited certification",
    ],
  },
  {
    title: "AI Module",
    duration: "5 Days",
    level: "Advanced",
    href: "/courses/ai-module",
    icon: Cpu,
    color: "neon-green",
    points: [
      "AI & ML in Industry",
      "Python for Engineers",
      "Predictive Maintenance",
      "Computer Vision, AI-SCADA, Digital Twins",
    ],
  },
];

export default function CoursesSection() {
  return (
    <section className="py-24 mesh-gradient-alt relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">Our Courses</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Industry-Leading <span className="gradient-text">Training Programs</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            From beginner modules to comprehensive career-focused programs, we have the right course for your automation career.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.title}
                className={`glass-card rounded-xl p-6 sm:p-8 flex flex-col relative ${
                  course.featured ? "gradient-border" : ""
                }`}
              >
                {course.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-green text-[11px] font-semibold text-dark-primary">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-${course.color}/10 flex items-center justify-center mb-4`}>
                  <Icon size={24} className={`text-${course.color}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>

                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-text-muted" />
                  <span className="text-sm text-text-muted">{course.duration}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-sm text-text-muted">{course.level}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {course.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green/60 mt-1.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                <Link
                  href={course.href}
                  className={`text-center px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                    course.featured
                      ? "bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white hover:shadow-lg hover:shadow-neon-blue/25"
                      : "border border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  Learn More
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
