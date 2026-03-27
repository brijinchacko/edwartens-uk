import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  COURSE_LABELS,
  STUDENT_STATUS_LABELS,
  formatDate,
} from "@/lib/utils";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Students | EDWartens Admin",
  description: "Manage enrolled students",
};

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  DROPPED: "bg-red-500/10 text-red-400 border-red-500/20",
};

async function getStudents(search?: string) {
  try {
    const where = search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {};

    return await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        batch: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const students = await getStudents(search);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Students</h1>
        <p className="text-text-muted mt-1">
          {students.length} student{students.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Search */}
      <form className="glass-card p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search students by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20"
          />
        </div>
      </form>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Batch
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Course
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Phase
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr
                    key={student.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-text-primary hover:text-neon-blue transition-colors font-medium"
                      >
                        {student.user.name}
                      </Link>
                      <p className="text-xs text-text-muted md:hidden">
                        {student.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {student.batch?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {COURSE_LABELS[student.course] || student.course}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      Phase {student.currentPhase}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[student.status] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {STUDENT_STATUS_LABELS[student.status] ||
                          student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                      {formatDate(student.enrollmentDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
