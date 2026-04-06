import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/rbac";
import { Shield } from "lucide-react";
import CreateUserButton from "./CreateUserButton";

export const metadata: Metadata = {
  title: "User Management | EDWartens Admin",
  description: "Manage CRM users and roles",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  SALES_LEAD: "bg-green-500/10 text-green-400 border-green-500/20",
  ADMISSION_COUNSELLOR: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  TRAINER: "bg-purple/10 text-purple border-purple/20",
};

async function getUsers() {
  try {
    return await prisma.user.findMany({
      where: { role: { not: "STUDENT" } },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        employeeProfile: {
          select: { department: true, specialization: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const currentUser = session.user as { role: string };
  if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(currentUser.role)) {
    redirect("/admin/dashboard");
  }

  const users = await getUsers();
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            User Management
          </h1>
          <p className="text-text-muted mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} ({activeCount}{" "}
            active)
          </p>
        </div>
        <CreateUserButton userRole={currentUser.role} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(ROLE_LABELS)
          .filter(([key]) => key !== "STUDENT")
          .map(([role, label]) => {
            const count = users.filter((u) => u.role === role).length;
            return (
              <div key={role} className="glass-card p-4">
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-xl font-bold text-text-primary mt-1">
                  {count}
                </p>
              </div>
            );
          })}
      </div>

      {users.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No CRM users found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">
                    Department
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden lg:table-cell">
                    Last Login
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider hidden xl:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-xs font-medium text-neon-blue shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${ROLE_COLORS[user.role] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-text-secondary">
                        {user.employeeProfile?.department || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-text-muted">
                        {user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : "Never"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <p className="text-xs text-text-muted">
                        {formatDate(user.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
