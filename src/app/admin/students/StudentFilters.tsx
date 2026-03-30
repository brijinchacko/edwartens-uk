"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

interface FilterOptions {
  batches: { id: string; name: string }[];
  counsellors: { id: string; name: string }[];
  statusCounts: Record<string, number>;
}

export default function StudentFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || !value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/admin/students?${params.toString()}`);
  };

  const current = (key: string) => searchParams.get(key) || "ALL";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <SlidersHorizontal size={14} className="text-text-muted" />

      {/* Status */}
      <select
        value={current("status")}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Statuses</option>
        {["ONBOARDING", "ACTIVE", "ON_HOLD", "POST_TRAINING", "CAREER_SUPPORT", "COMPLETED", "ALUMNI", "DROPPED"].map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")} ({options.statusCounts[s] || 0})</option>
        ))}
      </select>

      {/* Course */}
      <select
        value={current("course")}
        onChange={(e) => updateFilter("course", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Courses</option>
        <option value="PROFESSIONAL_MODULE">Professional Module</option>
        <option value="AI_MODULE">AI Module</option>
      </select>

      {/* Batch */}
      <select
        value={current("batch")}
        onChange={(e) => updateFilter("batch", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Batches</option>
        <option value="UNASSIGNED">No Batch</option>
        {options.batches.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      {/* Phase */}
      <select
        value={current("phase")}
        onChange={(e) => updateFilter("phase", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Phases</option>
        {[0, 1, 2, 3, 4, 5].map((p) => (
          <option key={p} value={String(p)}>Phase {p}</option>
        ))}
      </select>

      {/* Payment */}
      <select
        value={current("payment")}
        onChange={(e) => updateFilter("payment", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Payments</option>
        <option value="PAID">Paid</option>
        <option value="PARTIAL">Partial</option>
        <option value="PENDING">Pending</option>
        <option value="REFUNDED">Refunded</option>
      </select>

      {/* Counsellor */}
      <select
        value={current("counsellor")}
        onChange={(e) => updateFilter("counsellor", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Counsellors</option>
        <option value="UNASSIGNED">No Counsellor</option>
        {options.counsellors.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Date Range */}
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={searchParams.get("dateFrom") || ""}
          onChange={(e) => updateFilter("dateFrom", e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs [color-scheme:dark]"
          title="Enrolled from"
        />
        <span className="text-text-muted text-xs">—</span>
        <input
          type="date"
          value={searchParams.get("dateTo") || ""}
          onChange={(e) => updateFilter("dateTo", e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs [color-scheme:dark]"
          title="Enrolled to"
        />
      </div>
    </div>
  );
}
