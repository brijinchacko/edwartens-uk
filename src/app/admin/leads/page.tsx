import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COURSE_LABELS, LEAD_STATUS_LABELS, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import AddLeadModal from "./AddLeadModal";

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

async function getLeads(search?: string) {
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    return await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const leads = await getLeads(search);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Lead Management
          </h1>
          <p className="text-text-muted mt-1">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <AddLeadModal />
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
            placeholder="Search leads by name, email, or phone..."
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
                  Email
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Course Interest
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden xl:table-cell">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden xl:table-cell">
                  Assigned To
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Follow-up
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
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
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {lead.courseInterest
                        ? COURSE_LABELS[lead.courseInterest] ||
                          lead.courseInterest
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden xl:table-cell capitalize">
                      {lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {LEAD_STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden xl:table-cell">
                      {lead.assignedTo?.user?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {lead.followUpDate
                        ? formatDate(lead.followUpDate)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                      {formatDate(lead.createdAt)}
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
