import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { UserCog } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";
import EmployeeCard from "./EmployeeCard";

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
            <EmployeeCard
              key={emp.id}
              employee={{
                id: emp.id,
                name: emp.user.name,
                email: emp.user.email,
                role: emp.user.role,
                avatar: emp.user.avatar,
                isActive: emp.user.isActive,
                department: emp.department,
                specialization: emp.specialization,
                leads: emp._count.assignedLeads,
                batches: emp._count.batches,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
