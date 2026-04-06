"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import EmployeeDocuments from "./EmployeeDocuments";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
  STAFF: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  INSTRUCTOR: "bg-purple/10 text-purple border-purple/20",
  SUPER_ADMIN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SALES_LEAD: "bg-green-500/10 text-green-400 border-green-500/20",
  ADMISSION_COUNSELLOR: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  TRAINER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  HR_MANAGER: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

interface Props {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    isActive: boolean;
    department: string | null;
    specialization: string | null;
    leads: number;
    batches: number;
  };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function EmployeeCard({ employee }: Props) {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="glass-card p-5">
      <Link href={`/admin/employees/${employee.id}`} className="flex items-start gap-3 group">
        {employee.avatar ? (
          <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-sm font-medium text-neon-blue shrink-0">
            {getInitials(employee.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold truncate group-hover:text-neon-blue transition-colors">{employee.name}</h3>
          <p className="text-xs text-text-muted truncate">{employee.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${ROLE_COLORS[employee.role] || "bg-white/[0.05] text-text-muted"}`}>
            {employee.role.replace(/_/g, " ")}
          </span>
          <ExternalLink size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      {(employee.department || employee.specialization) && (
        <div className="mt-3 space-y-1">
          {employee.department && <p className="text-xs text-text-muted">Dept: {employee.department}</p>}
          {employee.specialization && <p className="text-xs text-text-muted">Spec: {employee.specialization}</p>}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-text-muted">
        <span>{employee.leads} leads</span>
        <span>{employee.batches} batches</span>
        <span>{employee.isActive ? <span className="text-green-400">Active</span> : <span className="text-red-400">Inactive</span>}</span>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="flex items-center gap-1 text-neon-blue hover:text-neon-blue/80 transition-colors"
        >
          <FolderOpen className="w-3 h-3" />
          Docs
          {showDocs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {showDocs && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <EmployeeDocuments employeeId={employee.id} employeeName={employee.name} />
        </div>
      )}
    </div>
  );
}
