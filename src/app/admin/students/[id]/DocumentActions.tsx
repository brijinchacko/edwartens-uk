"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";

interface DocumentActionsProps {
  documentId: string;
  currentStatus: string;
}

export default function DocumentActions({
  documentId,
  currentStatus,
}: DocumentActionsProps) {
  const router = useRouter();
  const [acting, setActing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState("");

  async function handleVerify() {
    setActing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to verify");
      } else {
        router.refresh();
      }
    } catch {
      setError("Failed to verify");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!reviewNote.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setActing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reviewNote: reviewNote.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to reject");
      } else {
        setShowRejectInput(false);
        setReviewNote("");
        router.refresh();
      }
    } catch {
      setError("Failed to reject");
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setActing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      } else {
        router.refresh();
      }
    } catch {
      setError("Failed to delete");
    } finally {
      setActing(false);
    }
  }

  if (acting) {
    return (
      <span className="text-text-muted">
        <Loader2 size={14} className="animate-spin" />
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {currentStatus !== "VERIFIED" && (
          <button
            onClick={handleVerify}
            title="Verify"
            className="p-1 rounded hover:bg-green-500/10 text-green-400 transition-colors"
          >
            <CheckCircle size={14} />
          </button>
        )}
        {currentStatus !== "REJECTED" && (
          <button
            onClick={() => setShowRejectInput(!showRejectInput)}
            title="Reject"
            className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <XCircle size={14} />
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete"
          className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {showRejectInput && (
        <div className="flex items-center gap-1 mt-1">
          <input
            type="text"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Rejection reason..."
            className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-text-secondary text-xs w-40 focus:outline-none focus:border-red-400/40"
          />
          <button
            onClick={handleReject}
            className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
    </div>
  );
}
