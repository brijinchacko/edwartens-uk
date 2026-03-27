"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Zap, X } from "lucide-react";

const COURSE_LABELS: Record<string, string> = {
  DATA_ENGINEERING: "Data Engineering",
  DATA_ANALYTICS: "Data Analytics",
  DEVOPS: "DevOps",
  SOFTWARE_TESTING: "Software Testing",
  BUSINESS_ANALYST: "Business Analyst",
  SCRUM_MASTER: "Scrum Master",
};

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-cyan/10 text-cyan border-cyan/20",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  COMPLETED: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) {
      console.error("Failed to fetch batches:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/batches/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBatches();
      } else {
        alert(data.error || "Failed to generate batches");
      }
    } catch (e) {
      alert("Failed to generate batches");
    } finally {
      setGenerating(false);
    }
  };

  const handleCancel = async (batchId: string) => {
    if (!confirm("Are you sure you want to cancel/delete this batch?")) return;
    setCancellingId(batchId);
    try {
      const res = await fetch(`/api/admin/batches?id=${batchId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBatches();
      } else {
        alert(data.error || "Failed to cancel batch");
      }
    } catch (e) {
      alert("Failed to cancel batch");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Batches</h1>
          <p className="text-text-muted mt-1">
            {batches.length} batch{batches.length !== 1 ? "es" : ""}
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
          <Link
            href="/admin/batches?action=create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium w-fit"
          >
            <Plus size={16} />
            Create Batch
          </Link>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Course
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Start Date
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  End Date
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Students
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                  Instructor
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-muted">
                    Loading batches...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-text-muted"
                  >
                    No batches found
                  </td>
                </tr>
              ) : (
                batches.map((batch: any) => (
                  <tr
                    key={batch.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      <div className="flex items-center gap-2">
                        {batch.name}
                        {batch.isAutoGenerated && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple/10 text-purple border border-purple/20">
                            Auto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {COURSE_LABELS[batch.course] || batch.course}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {formatDate(batch.startDate)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {batch.endDate ? formatDate(batch.endDate) : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {batch._count?.students || 0}/6
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[batch.status] || "bg-white/[0.05] text-text-muted"}`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                      {batch.instructor?.user?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {batch.status !== "CANCELLED" && batch.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleCancel(batch.id)}
                          disabled={cancellingId === batch.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <X size={12} />
                          {cancellingId === batch.id ? "..." : "Cancel"}
                        </button>
                      )}
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
