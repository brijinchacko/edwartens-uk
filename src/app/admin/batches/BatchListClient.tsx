"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  X,
  Users,
  Calendar,
  Monitor,
  MapPin,
  Wifi,
  ChevronRight,
  CheckCircle2,
  ChevronLeft,
  Search,
  Filter,
} from "lucide-react";
import CreateBatchModal from "./CreateBatchModal";

const COURSE_LABELS: Record<string, string> = {
  PROFESSIONAL_MODULE: "PM",
  AI_MODULE: "AI",
};

const COURSE_FULL: Record<string, string> = {
  PROFESSIONAL_MODULE: "Professional Module",
  AI_MODULE: "AI Module",
};

const COURSE_BADGE: Record<string, string> = {
  PROFESSIONAL_MODULE:
    "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  AI_MODULE: "bg-purple/10 text-purple border-purple/20",
};

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const MODE_BADGE: Record<string, string> = {
  ONLINE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  OFFLINE: "bg-green-500/10 text-green-400 border-green-500/20",
  HYBRID: "bg-purple/10 text-purple border-purple/20",
};

const MODE_ICON: Record<string, typeof Monitor> = {
  ONLINE: Wifi,
  OFFLINE: MapPin,
  HYBRID: Monitor,
};

type FilterTab = "ALL" | "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "ACTIVE", label: "Active" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const ITEMS_PER_PAGE = 12;

function formatDateRange(start: string | Date, end?: string | Date | null) {
  const s = new Date(start);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
  const fmtYear = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/London",
    });

  if (!end) return fmtYear(s);
  const e = new Date(end);
  if (s.getFullYear() === e.getFullYear()) {
    return `${fmt(s)} - ${fmtYear(e)}`;
  }
  return `${fmtYear(s)} - ${fmtYear(e)}`;
}

export default function BatchListClient({
  initialBatches,
  trainerNames = [],
}: {
  initialBatches: any[];
  trainerNames?: string[];
}) {
  const [batches, setBatches] = useState<any[]>(initialBatches);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [generating, setGenerating] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Additional filters
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [trainerFilter, setTrainerFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) {
      console.error("Failed to fetch batches:", e);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/batches/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBatches();
      } else {
        alert(data.error || "Failed to generate batches");
      }
    } catch {
      alert("Failed to generate batches");
    } finally {
      setGenerating(false);
    }
  };

  const handleCancel = async (batchId: string) => {
    if (!confirm("Are you sure you want to cancel/delete this batch?")) return;
    setCancellingId(batchId);
    try {
      const res = await fetch(`/api/admin/batches?id=${batchId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBatches();
      } else {
        alert(data.error || "Failed to cancel batch");
      }
    } catch {
      alert("Failed to cancel batch");
    } finally {
      setCancellingId(null);
    }
  };

  // Counts per status
  const counts: Record<FilterTab, number> = {
    ALL: batches.length,
    UPCOMING: batches.filter((b) => b.status === "UPCOMING").length,
    ACTIVE: batches.filter((b) => b.status === "ACTIVE").length,
    COMPLETED: batches.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: batches.filter((b) => b.status === "CANCELLED").length,
  };

  const filtered = batches.filter((b) => {
    // Status filter
    if (activeTab !== "ALL" && b.status !== activeTab) return false;
    // Course filter
    if (courseFilter !== "ALL" && b.course !== courseFilter) return false;
    // Trainer filter
    if (trainerFilter !== "ALL") {
      const tName = b.instructor?.user?.name || "";
      if (trainerFilter === "UNASSIGNED") {
        if (tName) return false;
      } else if (tName !== trainerFilter) {
        return false;
      }
    }
    // Date range filter
    if (dateFrom) {
      const batchStart = new Date(b.startDate);
      if (batchStart < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const batchStart = new Date(b.startDate);
      if (batchStart > new Date(dateTo + "T23:59:59")) return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (b.name || "").toLowerCase();
      const trainer = (b.instructor?.user?.name || "").toLowerCase();
      if (!name.includes(q) && !trainer.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Batches</h1>
          <p className="text-text-muted mt-1">
            {batches.length} batch{batches.length !== 1 ? "es" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Zap size={16} />
            {generating ? "Generating..." : "Generate Weekly Batches"}
          </button>
          <CreateBatchModal onSuccess={fetchBatches} />
        </div>
      </div>

      {/* Filter Tabs + Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/[0.06] w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-white/[0.08] text-text-primary"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    activeTab === tab.key
                      ? "bg-neon-blue/10 text-neon-blue"
                      : "bg-white/[0.04] text-text-muted"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search batches..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/40 transition-colors"
            />
          </div>

          {/* Toggle more filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showFilters || courseFilter !== "ALL" || trainerFilter !== "ALL" || dateFrom || dateTo
                ? "bg-neon-blue/10 text-neon-blue border-neon-blue/20"
                : "bg-white/[0.04] text-text-muted border-white/[0.08] hover:text-text-secondary"
            }`}
          >
            <Filter size={12} />
            Filters
            {(courseFilter !== "ALL" || trainerFilter !== "ALL" || dateFrom || dateTo) && (
              <span className="inline-flex w-4 h-4 rounded-full bg-neon-blue/20 text-neon-blue text-[10px] font-bold items-center justify-center">
                {[courseFilter !== "ALL", trainerFilter !== "ALL", !!dateFrom || !!dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            {/* Course */}
            <div>
              <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
              >
                <option value="ALL" className="bg-dark-secondary">All Courses</option>
                <option value="PROFESSIONAL_MODULE" className="bg-dark-secondary">Professional Module</option>
                <option value="AI_MODULE" className="bg-dark-secondary">AI Module</option>
              </select>
            </div>

            {/* Trainer */}
            <div>
              <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Trainer</label>
              <select
                value={trainerFilter}
                onChange={(e) => { setTrainerFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
              >
                <option value="ALL" className="bg-dark-secondary">All Trainers</option>
                <option value="UNASSIGNED" className="bg-dark-secondary">Unassigned</option>
                {trainerNames.map((name) => (
                  <option key={name} value={name} className="bg-dark-secondary">{name}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Start Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Start Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
              />
            </div>

            {/* Clear filters */}
            {(courseFilter !== "ALL" || trainerFilter !== "ALL" || dateFrom || dateTo || searchQuery) && (
              <button
                onClick={() => {
                  setCourseFilter("ALL");
                  setTrainerFilter("ALL");
                  setDateFrom("");
                  setDateTo("");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Batch Cards Grid */}
      {paginated.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-muted">
          No batches found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((batch: any) => {
            const ModeIcon = MODE_ICON[batch.mode] || Monitor;
            const readyCount = batch.readiness?.length || 0;
            const totalStudents = batch._count?.students || 0;
            const totalReadiness = batch._count?.readiness || 0;

            return (
              <div
                key={batch.id}
                className="glass-card p-4 hover:border-white/[0.1] transition-all group"
              >
                {/* Top row: name + badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {batch.name}
                      </h3>
                      {batch.isAutoGenerated && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple/10 text-purple border border-purple/20 shrink-0">
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                          COURSE_BADGE[batch.course] ||
                          "bg-white/[0.05] text-text-muted"
                        }`}
                      >
                        {COURSE_FULL[batch.course] || batch.course}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          MODE_BADGE[batch.mode] ||
                          "bg-white/[0.05] text-text-muted"
                        }`}
                      >
                        <ModeIcon size={10} />
                        {batch.mode
                          ? batch.mode.charAt(0) +
                            batch.mode.slice(1).toLowerCase()
                          : "Online"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
                      STATUS_COLORS[batch.status] ||
                      "bg-white/[0.05] text-text-muted"
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-text-muted shrink-0" />
                    <span>
                      {formatDateRange(batch.startDate, batch.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-text-muted shrink-0" />
                    <span>
                      {batch.instructor?.user?.name || (
                        <span className="text-text-muted italic">
                          Not Assigned
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} className="text-text-muted" />
                        <span className="text-text-primary font-medium">
                          {totalStudents}
                        </span>
                        /{batch.capacity} enrolled
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2
                          size={12}
                          className={
                            readyCount > 0 ? "text-green-400" : "text-text-muted"
                          }
                        />
                        {totalReadiness > 0 ? (
                          <>
                            <span className="text-text-primary font-medium">
                              {readyCount}
                            </span>
                            /{totalReadiness} ready
                          </>
                        ) : (
                          <span className="text-text-muted italic">
                            Not checked
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                  {batch.status !== "CANCELLED" &&
                    batch.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleCancel(batch.id)}
                        disabled={cancellingId === batch.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <X size={12} />
                        {cancellingId === batch.id ? "..." : "Cancel"}
                      </button>
                    )}
                  <Link
                    href={`/admin/batches/${batch.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-neon-blue hover:bg-neon-blue/10 transition-colors ml-auto"
                  >
                    View Details
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:bg-white/[0.04] transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-xs text-text-muted px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:bg-white/[0.04] transition-colors disabled:opacity-30"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
