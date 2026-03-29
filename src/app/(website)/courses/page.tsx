import Link from "next/link";
import { Clock, Award, Cpu, Brain, ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { COURSE_SLUG_REVERSE } from "@/lib/course-config";

export const metadata: Metadata = {
  title: "PLC, SCADA & AI Automation Training Courses UK | EDWartens",
  description:
    "Explore CPD Accredited PLC, SCADA, and AI-powered Industrial Automation courses at EDWartens UK. Professional Module and AI Module. Online or classroom in Milton Keynes.",
  keywords: [
    "PLC course UK",
    "SCADA course UK",
    "automation course UK",
    "AI automation training UK",
    "PLC programming course",
    "industrial automation course",
    "CPD accredited PLC course",
    "TIA Portal course",
    "AI industrial automation",
    "machine learning automation",
  ],
  alternates: {
    canonical: "https://edwartens.co.uk/courses",
  },
  openGraph: {
    title: "PLC, SCADA & AI Automation Training Courses UK | EDWartens",
    description:
      "CPD Accredited Professional & AI automation courses. Online or classroom in Milton Keynes.",
    url: "https://edwartens.co.uk/courses",
  },
};

const courses = [
  {
    title: "Professional Module",
    subtitle: "Automation & PLC Engineering",
    duration: "5 Days + 12hrs Recorded Sessions",
    level: "Comprehensive",
    mode: "Classroom + Online",
    href: "/courses/professional",
    icon: Award,
    color: "purple",
    featured: true,
    price: "£2,140 + VAT",
    courseType: "PROFESSIONAL_MODULE",
    description:
      "Our flagship career-focused programme covering everything from basic electrical theory to Siemens PLC programming, HMI design, and WinCC SCADA. Includes CPD certification and dedicated career support.",
    topics: [
      "Basic Electrical & Electronics",
      "Pneumatics & Industrial Automation",
      "Siemens PLC & TIA Portal",
      "Advanced PLC Programming",
      "Siemens HMI Development",
      "WinCC SCADA Systems",
      "Factory-IO Simulation",
      "Career Preparation & Assessment",
    ],
  },
  {
    title: "AI Module",
    subtitle: "AI-Powered Industrial Automation",
    duration: "5 Days + 12hrs Recorded Sessions",
    level: "Comprehensive",
    mode: "Classroom + Online",
    href: "/courses/ai-module",
    icon: Brain,
    color: "neon-blue",
    featured: false,
    price: "£2,140 + VAT",
    courseType: "AI_MODULE",
    description:
      "Cutting-edge programme combining PLC fundamentals with AI and Machine Learning for industrial automation. Learn predictive maintenance, computer vision for quality control, and AI-powered SCADA optimisation.",
    topics: [
      "Basic Electrical & Electronics",
      "AI & Machine Learning in Industry",
      "Python for Automation Engineers",
      "Predictive Maintenance with ML",
      "Computer Vision for Quality Control",
      "AI-Powered SCADA & Process Optimisation",
      "Digital Twin Concepts",
      "Career Preparation & Assessment",
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is PLC SCADA training?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PLC SCADA training teaches you to program Programmable Logic Controllers (PLCs) and Supervisory Control and Data Acquisition (SCADA) systems used in industrial automation. At EDWartens UK, our CPD Accredited courses cover Siemens TIA Portal, HMI design, and WinCC SCADA with hands-on practice on real industrial hardware.",
      },
    },
    {
      "@type": "Question",
      name: "How long is the Professional Module course?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Professional Module is a 5-day intensive classroom course running from 9:00 AM to 5:00 PM (BST). It also includes 12+ hours of pre-recorded foundation sessions covering Basic Electrical, Electronics, Pneumatics, and PLC fundamentals that you complete before your classroom dates. Total learning time is approximately 52+ hours.",
      },
    },
    {
      "@type": "Question",
      name: "Do I get a certificate after completing the course?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, upon successful completion you receive a CPD Accredited certificate from EDWartens UK. Our certifications are recognised by employers across the UK. EDWartens is registered with the UK Register of Learning Providers (UKRLP). Certificates can be verified through our online verification portal.",
      },
    },
    {
      "@type": "Question",
      name: "Is the training available online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, EDWartens offers live online training sessions with remote lab access via FactoryIO for the Professional Module. Online students work on the same projects and assessments as classroom students, with real-time instructor support. Both modules also include 12+ hours of pre-recorded foundation content accessible from anywhere.",
      },
    },
    {
      "@type": "Question",
      name: "What career opportunities are available after PLC training?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After completing PLC training, career opportunities include PLC Programmer, Automation Engineer, Controls Engineer, SCADA Engineer, Commissioning Engineer, and Maintenance Engineer. The UK has a critical shortage of automation engineers with over 2.1 million engineering roles to fill by 2030. Average salaries for automation engineers in the UK start at £45,000+.",
      },
    },
    {
      "@type": "Question",
      name: "Does EDWartens provide job placement support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EDWartens provides career support including CV workshops, interview preparation, LinkedIn optimisation, and job search guidance. This is educational and advisory support. Wartens does not guarantee employment, job placement, or interview outcomes. Career outcomes depend entirely on individual effort, qualifications, and market conditions.",
      },
    },
  ],
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const upcomingBatches = await prisma.batch.findMany({
    where: { status: "UPCOMING", startDate: { gte: new Date() } },
    include: { _count: { select: { students: true } } },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">Our Courses</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Training <span className="gradient-text">Programs</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Choose from our comprehensive career-focused programmes in PLC automation engineering
            and AI-powered industrial automation. All courses include hands-on training, CPD
            certification, and career support.
          </p>
        </div>
      </section>

      {/* Course Schedule Info */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-neon-blue" />
              BST 9:00 AM - 5:00 PM (8 hours with breaks)
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-neon-green" />
              Milton Keynes, MK1 1EX
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} className="text-neon-blue" />
              Max 15 per batch
            </span>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 space-y-8">
          {courses.map((course) => {
            const Icon = course.icon;
            const courseBatches = upcomingBatches.filter(
              (b) => b.course === course.courseType
            );
            return (
              <div
                key={course.title}
                className={`glass-card rounded-2xl p-8 sm:p-10 ${course.featured ? "gradient-border" : ""}`}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-${course.color}/10 flex items-center justify-center`}>
                        <Icon size={24} className={`text-${course.color}`} />
                      </div>
                      {course.featured && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-green text-[11px] font-semibold text-dark-primary">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{course.title}</h2>
                    <p className="text-sm text-neon-blue mb-3">{course.subtitle}</p>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Clock size={14} /> {course.duration}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span className="text-sm text-text-muted">{course.level}</span>
                      <span className="text-text-muted">·</span>
                      <span className="text-sm text-text-muted">{course.mode}</span>
                      {course.price && (
                        <>
                          <span className="text-text-muted">·</span>
                          <span className="text-sm font-semibold text-neon-green">{course.price}</span>
                        </>
                      )}
                    </div>

                    <p className="text-text-secondary mb-6 leading-relaxed">{course.description}</p>

                    <Link
                      href={course.href}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-blue/80 text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
                    >
                      View Full Details <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="lg:w-80 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3">What You&apos;ll Learn</h3>
                      <ul className="space-y-2">
                        {course.topics.map((t) => (
                          <li key={t} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green/60 mt-1.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Upcoming Batches */}
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-neon-blue" />
                        Upcoming Batches
                      </h3>
                      <div className="space-y-2">
                        {courseBatches.length > 0 ? (
                          courseBatches.map((batch) => {
                            const seats = batch.capacity - batch._count.students;
                            const slug = COURSE_SLUG_REVERSE[course.courseType];
                            return (
                              <Link
                                key={batch.id}
                                href={`/courses/${slug}/batch/${batch.id}`}
                                className="flex items-center justify-between text-sm bg-white/[0.03] rounded-lg px-3 py-2 hover:bg-white/[0.06] transition-colors"
                              >
                                <span className="text-text-secondary">
                                  {new Intl.DateTimeFormat("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }).format(batch.startDate)}
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    seats <= 3
                                      ? "text-yellow-400"
                                      : "text-neon-green"
                                  }`}
                                >
                                  {seats <= 0 ? "Full" : seats <= 3 ? "Limited Seats" : `${seats} seats left`}
                                </span>
                              </Link>
                            );
                          })
                        ) : (
                          <p className="text-xs text-text-muted">No upcoming batches scheduled.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Course Times Info */}
      <section className="py-16 mesh-gradient-alt">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
            Daily <span className="gradient-text">Schedule</span>
          </h2>
          <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {[
                { time: "9:00-10:30", label: "Class", type: "class" },
                { time: "10:30-10:45", label: "Break", type: "break" },
                { time: "10:45-1:00", label: "Class", type: "class" },
                { time: "1:00-1:30", label: "Break", type: "break" },
                { time: "1:30-3:30", label: "Class", type: "class" },
                { time: "3:30-3:45", label: "Break", type: "break" },
                { time: "3:45-5:00", label: "Class", type: "class" },
              ].map((slot) => (
                <div
                  key={slot.time}
                  className={`rounded-lg py-3 px-2 ${
                    slot.type === "class"
                      ? "bg-neon-blue/10 border border-neon-blue/20"
                      : "bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs text-text-muted">{slot.time}</p>
                  <p
                    className={`font-medium ${
                      slot.type === "class" ? "text-neon-blue" : "text-text-muted"
                    }`}
                  >
                    {slot.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted text-center mt-4">
              All times in BST (British Summer Time). Classes run for 8 hours with 1 hour of breaks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
