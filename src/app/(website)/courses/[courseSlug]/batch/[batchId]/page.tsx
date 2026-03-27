import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COURSE_SLUGS, COURSE_CONFIG, COURSE_FEE_TOTAL, DEPOSIT_AMOUNT } from "@/lib/course-config";
import { formatDate } from "@/lib/utils";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Shield,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import type { Metadata } from "next";
import BatchRegistrationCard from "@/components/BatchRegistrationCard";

interface Props {
  params: Promise<{ courseSlug: string; batchId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, batchId } = await params;
  const courseType = COURSE_SLUGS[courseSlug];
  const config = courseType ? COURSE_CONFIG[courseType] : null;

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });

  return {
    title: batch && config
      ? `${config.title} - ${formatDate(batch.startDate)} | EDWartens UK`
      : "Batch Details | EDWartens UK",
    description: config?.description || "View batch details and register for training.",
  };
}

export default async function BatchDetailPage({ params }: Props) {
  const { courseSlug, batchId } = await params;
  const courseType = COURSE_SLUGS[courseSlug];

  if (!courseType) notFound();

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      instructor: { include: { user: { select: { name: true } } } },
      _count: { select: { students: true } },
    },
  });

  if (!batch || batch.course !== courseType) notFound();

  const config = COURSE_CONFIG[courseType];
  const availableSeats = batch.capacity - batch._count.students;

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-16 sm:py-20 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-neon-blue transition-colors mb-6"
          >
            <ArrowRight size={14} className="rotate-180" />
            Back to {config.title}
          </Link>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            {config.title} — <span className="gradient-text">{batch.name}</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mb-6">
            {config.description}
          </p>

          {/* Quick info badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Calendar size={14} className="text-neon-blue" />
              {formatDate(batch.startDate)}
              {batch.endDate && ` – ${formatDate(batch.endDate)}`}
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <Clock size={14} className="text-neon-green" />
              BST 9:00 AM – 5:00 PM
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
              <MapPin size={14} className="text-neon-blue" />
              {batch.location || "Milton Keynes"}
            </span>
            {batch.instructor?.user?.name && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-text-secondary">
                <GraduationCap size={14} className="text-neon-green" />
                Instructor: {batch.instructor.user.name}
              </span>
            )}
            <span
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${
                availableSeats <= 3
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                  : "bg-neon-green/10 text-neon-green border border-neon-green/20"
              }`}
            >
              <Users size={14} />
              {availableSeats} of {batch.capacity} seats available
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Schedule */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Daily <span className="gradient-text">Schedule</span>
                </h2>
                <div className="glass-card rounded-xl p-5">
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {[
                      { time: "9:00–10:30", label: "Class", type: "class" },
                      { time: "10:30–10:45", label: "Break", type: "break" },
                      { time: "10:45–1:00", label: "Class", type: "class" },
                      { time: "1:00–1:30", label: "Break", type: "break" },
                      { time: "1:30–3:30", label: "Class", type: "class" },
                      { time: "3:30–3:45", label: "Break", type: "break" },
                      { time: "3:45–5:00", label: "Class", type: "class" },
                    ].map((slot) => (
                      <div
                        key={slot.time}
                        className={`rounded-lg py-3 px-1 ${
                          slot.type === "class"
                            ? "bg-neon-blue/10 border border-neon-blue/20"
                            : "bg-white/[0.03]"
                        }`}
                      >
                        <p className="text-[10px] text-text-muted">{slot.time}</p>
                        <p className={`font-medium text-xs ${slot.type === "class" ? "text-neon-blue" : "text-text-muted"}`}>
                          {slot.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Syllabus */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Course <span className="gradient-text">Syllabus</span>
                </h2>
                <div className="space-y-3">
                  {config.phases.map((phase) => (
                    <div key={phase.phase} className="glass-card rounded-xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-neon-blue">
                          {phase.phase.replace("Phase ", "")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{phase.title}</p>
                        <p className="text-xs text-text-muted">{phase.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What You'll Learn */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  What You&apos;ll <span className="gradient-text">Learn</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {config.topics.map((topic) => (
                    <div key={topic} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <CheckCircle2 size={16} className="text-neon-green/60 mt-0.5 flex-shrink-0" />
                      {topic}
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  What&apos;s <span className="gradient-text">Included</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: GraduationCap, text: "CPD Accredited Certificate" },
                    { icon: Clock, text: "12+ Hours Pre-recorded Foundation" },
                    { icon: Shield, text: "6 Months Career Support" },
                    { icon: CreditCard, text: "All Software Licences Included" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="glass-card rounded-lg p-4 flex items-center gap-3">
                        <Icon size={18} className="text-neon-green flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Registration Card (sticky) */}
            <div className="lg:sticky lg:top-24 h-fit">
              <BatchRegistrationCard
                batchId={batch.id}
                courseSlug={courseSlug}
                courseName={config.title}
                batchName={batch.name}
                startDate={formatDate(batch.startDate)}
                availableSeats={availableSeats}
                capacity={batch.capacity}
                location={batch.location || "Milton Keynes"}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
