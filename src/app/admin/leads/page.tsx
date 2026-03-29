import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { COURSE_LABELS, LEAD_STATUS_LABELS, formatDate } from "@/lib/utils";
import { Search, X } from "lucide-react";
import AddLeadModal from "./AddLeadModal";
import LeadFilters from "./LeadFilters";

export const metadata: Metadata = {
  title: "Lead Management | EDWartens Admin",
  description: "Manage leads and prospects",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  QUALIFIED: "bg-green-500/10 text-green-400 border-green-500/20",
  ENROLLED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface FilterParams {
  search?: string;
  status?: string;
  source?: string;
  course?: string;
  assignedTo?: string;
  followUp?: string; // overdue, today, this_week, no_followup
  dateFrom?: string;
  dateTo?: string;
  hasNotes?: string; // true/false
  converted?: string; // true/false
  page: number;
}

async function getLeads(filters: FilterParams) {
  const perPage = 50;
  const skip = (filters.page - 1) * perPage;

  try {
    const where: any = {};
    const AND: any[] = [];

    // Text search
    if (filters.search) {
      AND.push({
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
          { phone: { contains: filters.search } },
        ],
      });
    }

    // Status filter
    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    // Source filter
    if (filters.source && filters.source !== "ALL") {
      where.source = { contains: filters.source, mode: "insensitive" };
    }

    // Course interest filter
    if (filters.course && filters.course !== "ALL") {
      where.courseInterest = filters.course;
    }

    // Assigned to filter
    if (filters.assignedTo === "UNASSIGNED") {
      where.assignedToId = null;
    } else if (filters.assignedTo && filters.assignedTo !== "ALL") {
      where.assignedToId = filters.assignedTo;
    }

    // Follow-up filter
    const now = new Date();
    if (filters.followUp === "overdue") {
      where.followUpDate = { lt: now };
      where.status = { notIn: ["ENROLLED", "LOST"] };
    } else if (filters.followUp === "today") {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      where.followUpDate = { gte: todayStart, lte: todayEnd };
    } else if (filters.followUp === "this_week") {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      where.followUpDate = { gte: now, lte: weekEnd };
    } else if (filters.followUp === "no_followup") {
      where.followUpDate = null;
      where.status = { notIn: ["ENROLLED", "LOST"] };
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Converted filter
    if (filters.converted === "true") {
      where.convertedToStudentId = { not: null };
    } else if (filters.converted === "false") {
      where.convertedToStudentId = null;
    }

    if (AND.length > 0) where.AND = AND;

    const [leads, total, statusCounts] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { include: { user: { select: { name: true } } } },
          _count: { select: { notes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.lead.count({ where }),
      // Get counts per status for the filter badges
      prisma.lead.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const counts = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count])
    );

    return { leads, total, page: filters.page, perPage, totalPages: Math.ceil(total / perPage), counts };
  } catch {
    return { leads: [], total: 0, page: 1, perPage, totalPages: 0, counts: {} };
  }
}

async function getFilterOptions() {
  const [employees, sources] = await Promise.all([
    prisma.employee.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      _count: true,
      orderBy: { _count: { source: "desc" } },
    }),
  ]);

  return {
    employees: employees.map((e) => ({ id: e.id, name: e.user.name })),
    sources: sources.map((s) => ({ value: s.source, count: s._count })),
  };
}

function buildFilterUrl(current: Record<string, string | undefined>, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...updates, page: undefined }; // Reset page on filter change
  for (const [key, val] of Object.entries(merged)) {
    if (val && val !== "ALL") params.set(key, val);
  }
  return `/admin/leads?${params.toString()}`;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const getParam = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;

  const filters: FilterParams = {
    search: getParam("search"),
    status: getParam("status"),
    source: getParam("source"),
    course: getParam("course"),
    assignedTo: getParam("assignedTo"),
    followUp: getParam("followUp"),
    dateFrom: getParam("dateFrom"),
    dateTo: getParam("dateTo"),
    converted: getParam("converted"),
    page: parseInt(getParam("page") || "1") || 1,
  };

  const [{ leads, total, totalPages, counts }, filterOptions] = await Promise.all([
    getLeads(filters),
    getFilterOptions(),
  ]);

  const activeFilterCount = [
    filters.status, filters.source, filters.course, filters.assignedTo,
    filters.followUp, filters.dateFrom, filters.dateTo, filters.converted,
  ].filter((f) => f && f !== "ALL").length;

  const currentParams: Record<string, string | undefined> = {
    search: filters.search, status: filters.status, source: filters.source,
    course: filters.course, assignedTo: filters.assignedTo, followUp: filters.followUp,
    dateFrom: filters.dateFrom, dateTo: filters.dateTo, converted: filters.converted,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Lead Management</h1>
          <p className="text-text-muted mt-1">
            {total.toLocaleString()} lead{total !== 1 ? "s" : ""} found
            {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active)`}
          </p>
        </div>
        <AddLeadModal />
      </div>

      {/* Status Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: undefined, label: "All", count: Object.values(counts).reduce((a: number, b: any) => a + b, 0) },
          { value: "NEW", label: "New", count: counts.NEW || 0 },
          { value: "CONTACTED", label: "Contacted", count: counts.CONTACTED || 0 },
          { value: "QUALIFIED", label: "Qualified", count: counts.QUALIFIED || 0 },
          { value: "ENROLLED", label: "Enrolled", count: counts.ENROLLED || 0 },
          { value: "LOST", label: "Lost", count: counts.LOST || 0 },
        ].map((s) => (
          <Link
            key={s.label}
            href={buildFilterUrl(currentParams, { status: s.value })}
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

      {/* Search + Filters Row */}
      <div className="glass-card p-4 space-y-3">
        {/* Search */}
        <form className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={filters.search}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-neon-blue/50"
          />
          {/* Preserve other filters in search form */}
          {filters.status && <input type="hidden" name="status" value={filters.status} />}
          {filters.source && <input type="hidden" name="source" value={filters.source} />}
          {filters.course && <input type="hidden" name="course" value={filters.course} />}
          {filters.assignedTo && <input type="hidden" name="assignedTo" value={filters.assignedTo} />}
          {filters.followUp && <input type="hidden" name="followUp" value={filters.followUp} />}
          {filters.dateFrom && <input type="hidden" name="dateFrom" value={filters.dateFrom} />}
          {filters.dateTo && <input type="hidden" name="dateTo" value={filters.dateTo} />}
          {filters.converted && <input type="hidden" name="converted" value={filters.converted} />}
        </form>

        {/* Filter Dropdowns (Client Component) */}
        <Suspense fallback={<div className="h-8" />}>
          <LeadFilters options={filterOptions} />
        </Suspense>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <div>
            <Link
              href="/admin/leads"
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
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">Course</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden xl:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden xl:table-cell">Assigned</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">Follow-up</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Notes</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-text-muted">
                    No leads found matching your filters
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => {
                  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date() && !["ENROLLED", "LOST"].includes(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-text-primary hover:text-neon-blue transition-colors font-medium"
                        >
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell text-xs">
                        {lead.email}
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden lg:table-cell text-xs">
                        {lead.phone}
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden lg:table-cell text-xs">
                        {lead.courseInterest ? COURSE_LABELS[lead.courseInterest] || lead.courseInterest : "-"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden xl:table-cell capitalize text-xs">
                        {lead.source}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[lead.status] || "bg-white/[0.05] text-text-muted"}`}>
                          {LEAD_STATUS_LABELS[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden xl:table-cell text-xs">
                        {lead.assignedTo?.user?.name || <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.followUpDate ? (
                          <span className={`text-xs ${isOverdue ? "text-red-400 font-medium" : "text-text-secondary"}`}>
                            {isOverdue && "⚠ "}
                            {formatDate(lead.followUpDate)}
                          </span>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden md:table-cell text-xs">
                        {lead._count?.notes > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-text-secondary">{lead._count.notes}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden md:table-cell text-xs">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  );
                })
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
                href={buildFilterUrl(currentParams, { page: String(filters.page - 1) })}
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
                  href={buildFilterUrl(currentParams, { page: String(p) })}
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
                href={buildFilterUrl(currentParams, { page: String(filters.page + 1) })}
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
