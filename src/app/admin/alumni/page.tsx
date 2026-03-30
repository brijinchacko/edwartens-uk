import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  getInitials,
  COURSE_LABELS,
  STUDENT_STATUS_LABELS,
} from "@/lib/utils";
import { Users, GraduationCap, Briefcase, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Alumni | EDWartens Admin",
  description: "View alumni and completed students",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
  ALUMNI_PLACED: "bg-neon-green/10 text-neon-green border-neon-green/20",
  ALUMNI_NOT_PLACED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
};

async function getAlumni(search?: string, course?: string, status?: string) {
  try {
    const where: Record<string, unknown> = {
      status: { in: status ? [status] : ["COMPLETED", "ALUMNI_PLACED", "ALUMNI_NOT_PLACED"] },
    };

    if (course) {
      where.course = course;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    return await prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
        batch: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            certificates: true,
            placements: true,
            assessments: true,
          },
        },
        placements: {
          where: { status: { in: ["OFFERED", "CONFIRMED"] } },
          select: { company: true, role: true, status: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        certificates: {
          select: { type: true, certificateNo: true },
          orderBy: { issuedDate: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; course?: string; status?: string }>;
}) {
  const params = await searchParams;
  const alumni = await getAlumni(params.search, params.course, params.status);

  const completedCount = alumni.filter((a) => a.status === "COMPLETED").length;
  const alumniCount = alumni.filter((a) => a.status === "ALUMNI_PLACED" || a.status === "ALUMNI_NOT_PLACED").length;
  const placedCount = alumni.filter((a) => a.placements.length > 0).length;
  const certifiedCount = alumni.filter((a) => a._count.certificates > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Alumni</h1>
        <p className="text-text-muted mt-1">
          {alumni.length} alumni and completed students
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={16} className="text-green-400" />
            <span className="text-xs text-text-muted">Completed</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{completedCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-neon-blue" />
            <span className="text-xs text-text-muted">Alumni</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{alumniCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-purple" />
            <span className="text-xs text-text-muted">Placed</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{placedCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-amber-400" />
            <span className="text-xs text-text-muted">Certified</span>
          </div>
          <p className="text-xl font-bold text-text-primary">{certifiedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            name="search"
            placeholder="Search by name or email..."
            defaultValue={params.search || ""}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 w-64"
          />
          <select
            name="course"
            defaultValue={params.course || ""}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-secondary focus:outline-none focus:border-neon-blue/40"
          >
            <option value="">All Courses</option>
            <option value="PROFESSIONAL_MODULE">Professional Module</option>
            <option value="AI_MODULE">AI Module</option>
          </select>
          <select
            name="status"
            defaultValue={params.status || ""}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-secondary focus:outline-none focus:border-neon-blue/40"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="ALUMNI_PLACED">Alumni (Placed)</option>
            <option value="ALUMNI_NOT_PLACED">Alumni (Not Placed)</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
          >
            Filter
          </button>
        </form>
      </div>

      {alumni.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No alumni found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {alumni.map((student: any) => (
            <div key={student.id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                {student.user.avatar ? (
                  <img
                    src={student.user.avatar}
                    alt={student.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-sm font-medium text-neon-blue shrink-0">
                    {getInitials(student.user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-semibold truncate">
                    {student.user.name}
                  </h3>
                  <p className="text-xs text-text-muted truncate">
                    {student.user.email}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${STATUS_COLORS[student.status] || "bg-white/[0.05] text-text-muted"}`}
                >
                  {STUDENT_STATUS_LABELS[student.status] || student.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-text-muted">
                  Course:{" "}
                  <span className="text-text-secondary">
                    {COURSE_LABELS[student.course] || student.course}
                  </span>
                </p>
                {student.batch && (
                  <p className="text-xs text-text-muted">
                    Batch:{" "}
                    <span className="text-text-secondary">
                      {student.batch.name}
                    </span>
                  </p>
                )}
                {student.placements.length > 0 && (
                  <p className="text-xs text-text-muted">
                    Placement:{" "}
                    <span className="text-green-400">
                      {student.placements[0].role} at{" "}
                      {student.placements[0].company}
                    </span>
                  </p>
                )}
              </div>

              {/* Journey summary */}
              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-text-muted">
                <span>{student._count.assessments} assessments</span>
                <span>{student._count.certificates} certs</span>
                <span>{student._count.placements} placements</span>
              </div>

              {/* Certificates */}
              {student.certificates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {student.certificates.slice(0, 3).map((cert: any) => (
                    <span
                      key={cert.certificateNo}
                      className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      {cert.type}
                    </span>
                  ))}
                  {student.certificates.length > 3 && (
                    <span className="text-[9px] text-text-muted">
                      +{student.certificates.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
