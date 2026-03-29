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
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const fmtYear = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
}: {
  initialBatches: any[];
}) {
  const [batches, setBatches] = useState<any[]>(initialBatches);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [generating, setGenerating] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  const filtered =
    activeTab === "ALL"
      ? batches
      : batches.filter((b) => b.status === activeTab);

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

      {/* Filter Tabs */}
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
