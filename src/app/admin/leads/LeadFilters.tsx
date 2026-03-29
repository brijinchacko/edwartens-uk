"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

interface FilterOption {
  employees: { id: string; name: string }[];
  sources: { value: string; count: number }[];
}

export default function LeadFilters({ options }: { options: FilterOption }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/admin/leads?${params.toString()}`);
  };

  const current = (key: string) => searchParams.get(key) || "ALL";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <SlidersHorizontal size={14} className="text-text-muted" />

      {/* Source */}
      <select
        value={current("source")}
        onChange={(e) => updateFilter("source", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Sources</option>
        {options.sources.map((s) => (
          <option key={s.value} value={s.value}>
            {s.value} ({s.count})
          </option>
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

      {/* Assigned To */}
      <select
        value={current("assignedTo")}
        onChange={(e) => updateFilter("assignedTo", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Counsellors</option>
        <option value="UNASSIGNED">Unassigned</option>
        {options.employees.map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      {/* Follow-up */}
      <select
        value={current("followUp")}
        onChange={(e) => updateFilter("followUp", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Follow-ups</option>
        <option value="overdue">Overdue</option>
        <option value="today">Due Today</option>
        <option value="this_week">This Week</option>
        <option value="no_followup">No Follow-up Set</option>
      </select>

      {/* Converted */}
      <select
        value={current("converted")}
        onChange={(e) => updateFilter("converted", e.target.value)}
        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs focus:border-neon-blue/40"
      >
        <option value="ALL">All Leads</option>
        <option value="false">Not Converted</option>
        <option value="true">Converted to Student</option>
      </select>

      {/* Date Range */}
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={searchParams.get("dateFrom") || ""}
          onChange={(e) => updateFilter("dateFrom", e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs [color-scheme:dark]"
          title="From date"
        />
        <span className="text-text-muted text-xs">—</span>
        <input
          type="date"
          value={searchParams.get("dateTo") || ""}
          onChange={(e) => updateFilter("dateTo", e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted text-xs [color-scheme:dark]"
          title="To date"
        />
      </div>
    </div>
  );
}
