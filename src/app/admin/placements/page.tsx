import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { MapPin, Building, Banknote } from "lucide-react";

export const metadata: Metadata = {
  title: "Career Tracking | EDWartens Admin",
  description: "Track student career progress",
};

const STATUS_COLORS: Record<string, string> = {
  PREPARING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  INTERVIEW: "bg-cyan/10 text-cyan border-cyan/20",
  OFFERED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

async function getPlacements() {
  try {
    return await prisma.placement.findMany({
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function PlacementsPage() {
  const placements = await getPlacements();

  // Group by status for pipeline view
  const pipeline = {
    PREPARING: placements.filter((p: any) => p.status === "PREPARING"),
    INTERVIEW: placements.filter((p: any) => p.status === "INTERVIEW"),
    OFFERED: placements.filter((p: any) => p.status === "OFFERED"),
    CONFIRMED: placements.filter((p: any) => p.status === "CONFIRMED"),
    REJECTED: placements.filter((p: any) => p.status === "REJECTED"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Career Tracking</h1>
        <p className="text-text-muted mt-1">
          {placements.length} career record
          {placements.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(pipeline).map(([status, items]) => (
          <div key={status} className="glass-card p-4 text-center">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
            >
              {status}
            </span>
            <p className="text-2xl font-bold text-text-primary mt-2">
              {items.length}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Student
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Company
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Salary
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {placements.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No career records found
                  </td>
                </tr>
              ) : (
                placements.map((p: any) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {p.student.user.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Building size={14} className="text-text-muted" />
                        {p.company}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {p.role}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {p.salary ? (
                        <div className="flex items-center gap-1.5">
                          <Banknote size={14} className="text-text-muted" />
                          {formatCurrency(p.salary)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {p.location ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-text-muted" />
                          {p.location}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                      {formatDate(p.createdAt)}
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
