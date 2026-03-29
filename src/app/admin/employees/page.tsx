import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { UserCog } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";

export const metadata: Metadata = {
  title: "Employees | EDWartens Admin",
  description: "Manage staff and instructors",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  STAFF: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  INSTRUCTOR: "bg-purple/10 text-purple border-purple/20",
};

async function getEmployees() {
  try {
    return await prisma.employee.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            isActive: true,
            avatar: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            assignedLeads: true,
            batches: true,
          },
        },
      },
      orderBy: { hireDate: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Employees</h1>
          <p className="text-text-muted mt-1">
            {employees.length} team member{employees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddEmployeeModal />
      </div>

      {employees.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <UserCog size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp: any) => (
            <div key={emp.id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                {emp.user.avatar ? (
                  <img
                    src={emp.user.avatar}
                    alt={emp.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-sm font-medium text-neon-blue shrink-0">
                    {getInitials(emp.user.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-semibold truncate">
                    {emp.user.name}
                  </h3>
                  <p className="text-xs text-text-muted truncate">
                    {emp.user.email}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${ROLE_COLORS[emp.user.role] || "bg-white/[0.05] text-text-muted"}`}
                >
                  {emp.user.role}
                </span>
              </div>

              {(emp.department || emp.specialization) && (
                <div className="mt-3 space-y-1">
                  {emp.department && (
                    <p className="text-xs text-text-muted">
                      Dept: {emp.department}
                    </p>
                  )}
                  {emp.specialization && (
                    <p className="text-xs text-text-muted">
                      Spec: {emp.specialization}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-text-muted">
                <span>{emp._count.assignedLeads} leads</span>
                <span>{emp._count.batches} batches</span>
                <span>
                  {emp.user.isActive ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
