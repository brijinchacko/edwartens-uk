import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { COURSE_LABELS, STUDENT_STATUS_LABELS, formatDate } from "@/lib/utils";
import { Search, X } from "lucide-react";
import StudentFilters from "./StudentFilters";

export const metadata: Metadata = {
  title: "Students | EDWartens Admin",
  description: "Manage enrolled students",
};

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  POST_TRAINING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CAREER_SUPPORT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  ALUMNI: "bg-neon-green/10 text-neon-green border-neon-green/20",
  DROPPED: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface Filters {
  search?: string;
  status?: string;
  course?: string;
  batch?: string;
  phase?: string;
  payment?: string;
  counsellor?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
}

async function getStudents(filters: Filters) {
  const perPage = 50;
  const skip = (filters.page - 1) * perPage;

  try {
    const where: any = {};
    const AND: any[] = [];

    if (filters.search) {
      AND.push({
        user: {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
            { phone: { contains: filters.search } },
          ],
        },
      });
    }

    if (filters.status && filters.status !== "ALL") where.status = filters.status;
    if (filters.course && filters.course !== "ALL") where.course = filters.course;

    if (filters.batch === "UNASSIGNED") where.batchId = null;
    else if (filters.batch && filters.batch !== "ALL") where.batchId = filters.batch;

    if (filters.phase && filters.phase !== "ALL") where.currentPhase = parseInt(filters.phase);
    if (filters.payment && filters.payment !== "ALL") where.paymentStatus = filters.payment;

    if (filters.counsellor === "UNASSIGNED") where.counsellorId = null;
    else if (filters.counsellor && filters.counsellor !== "ALL") where.counsellorId = filters.counsellor;

    if (filters.dateFrom || filters.dateTo) {
      where.enrollmentDate = {};
      if (filters.dateFrom) where.enrollmentDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        where.enrollmentDate.lte = end;
      }
    }

    if (AND.length > 0) where.AND = AND;

    const [students, total, statusCounts] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          batch: { select: { name: true } },
          counsellor: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.student.count({ where }),
      prisma.student.groupBy({ by: ["status"], _count: true }),
    ]);

    const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));

    return { students, total, page: filters.page, perPage, totalPages: Math.ceil(total / perPage), counts };
  } catch {
    return { students: [], total: 0, page: 1, perPage, totalPages: 0, counts: {} };
  }
}

async function getFilterOptions() {
  const [batches, counsellors] = await Promise.all([
    prisma.batch.findMany({
      select: { id: true, name: true },
      orderBy: { startDate: "desc" },
      take: 50,
    }),
    prisma.employee.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return {
    batches: batches.map((b) => ({ id: b.id, name: b.name })),
    counsellors: counsellors.map((c) => ({ id: c.id, name: c.user.name })),
  };
}

function buildUrl(current: Record<string, string | undefined>, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...updates, page: undefined };
  for (const [key, val] of Object.entries(merged)) {
    if (val && val !== "ALL") params.set(key, val);
  }
  return `/admin/students?${params.toString()}`;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const getParam = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;

  const filters: Filters = {
    search: getParam("search"),
    status: getParam("status"),
    course: getParam("course"),
    batch: getParam("batch"),
    phase: getParam("phase"),
    payment: getParam("payment"),
    counsellor: getParam("counsellor"),
    dateFrom: getParam("dateFrom"),
    dateTo: getParam("dateTo"),
    page: parseInt(getParam("page") || "1") || 1,
  };

  const [{ students, total, totalPages, counts }, filterOptions] = await Promise.all([
    getStudents(filters),
    getFilterOptions(),
  ]);

  const activeFilterCount = [
    filters.status, filters.course, filters.batch, filters.phase,
    filters.payment, filters.counsellor, filters.dateFrom, filters.dateTo,
  ].filter((f) => f && f !== "ALL").length;

  const currentParams: Record<string, string | undefined> = {
    search: filters.search, status: filters.status, course: filters.course,
    batch: filters.batch, phase: filters.phase, payment: filters.payment,
    counsellor: filters.counsellor, dateFrom: filters.dateFrom, dateTo: filters.dateTo,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Students</h1>
        <p className="text-text-muted mt-1">
          {total.toLocaleString()} student{total !== 1 ? "s" : ""} found
          {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active)`}
        </p>
      </div>

      {/* Status Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: undefined, label: "All", count: Object.values(counts).reduce((a: number, b: any) => a + b, 0) },
          { value: "ACTIVE", label: "Active", count: counts.ACTIVE || 0 },
          { value: "ONBOARDING", label: "Onboarding", count: counts.ONBOARDING || 0 },
          { value: "POST_TRAINING", label: "Post-Training", count: counts.POST_TRAINING || 0 },
          { value: "CAREER_SUPPORT", label: "Career Support", count: counts.CAREER_SUPPORT || 0 },
          { value: "COMPLETED", label: "Completed", count: counts.COMPLETED || 0 },
          { value: "ALUMNI", label: "Alumni", count: counts.ALUMNI || 0 },
          { value: "ON_HOLD", label: "On Hold", count: counts.ON_HOLD || 0 },
          { value: "DROPPED", label: "Dropped", count: counts.DROPPED || 0 },
        ].map((s) => (
          <Link
            key={s.label}
            href={buildUrl(currentParams, { status: s.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (filters.status || undefined) === s.value
                ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                : "bg-white/[0.03] text-text-muted border border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            {s.label} <span className="opacity-60">({s.count})</span>
          </Link>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="glass-card p-4 space-y-3">
        <form className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={filters.search}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-neon-blue/50"
          />
          {filters.status && <input type="hidden" name="status" value={filters.status} />}
          {filters.course && <input type="hidden" name="course" value={filters.course} />}
          {filters.batch && <input type="hidden" name="batch" value={filters.batch} />}
          {filters.phase && <input type="hidden" name="phase" value={filters.phase} />}
          {filters.payment && <input type="hidden" name="payment" value={filters.payment} />}
          {filters.counsellor && <input type="hidden" name="counsellor" value={filters.counsellor} />}
        </form>

        <Suspense fallback={<div className="h-8" />}>
          <StudentFilters options={{ ...filterOptions, statusCounts: counts }} />
        </Suspense>

        {activeFilterCount > 0 && (
          <div>
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs hover:bg-red-500/20 transition-colors"
            >
              <X size={12} />
              Clear All Filters ({activeFilterCount})
            </Link>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Batch</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Course</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">Phase</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden xl:table-cell">Payment</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden xl:table-cell">Counsellor</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-text-muted">
                    No students found matching your filters
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
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell text-xs">
                      {student.user.email}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell text-xs">
                      {student.user.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell text-xs">
                      {student.batch?.name || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {COURSE_LABELS[student.course] || student.course}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell text-xs">
                      Phase {student.currentPhase}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[student.status] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {STUDENT_STATUS_LABELS[student.status] || student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className={`text-xs ${
                        student.paymentStatus === "PAID" ? "text-neon-green" :
                        student.paymentStatus === "PARTIAL" ? "text-yellow-400" :
                        student.paymentStatus === "PENDING" ? "text-red-400" : "text-text-muted"
                      }`}>
                        {student.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden xl:table-cell text-xs">
                      {student.counsellor?.user?.name || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell text-xs">
                      {formatDate(student.enrollmentDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing {(filters.page - 1) * 50 + 1}–{Math.min(filters.page * 50, total)} of {total.toLocaleString()}
          </p>
          <div className="flex gap-2">
            {filters.page > 1 && (
              <Link
                href={buildUrl(currentParams, { page: String(filters.page - 1) })}
                className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs hover:bg-white/[0.06] transition-colors"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = filters.page <= 3 ? i + 1 : filters.page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <Link
                  key={p}
                  href={buildUrl(currentParams, { page: String(p) })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    p === filters.page
                      ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                      : "bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06]"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
            {filters.page < totalPages && (
              <Link
                href={buildUrl(currentParams, { page: String(filters.page + 1) })}
                className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs hover:bg-white/[0.06] transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
