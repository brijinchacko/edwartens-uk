"use client";

import { useState } from "react";
import { Loader2, Heart, Send, CheckCircle2 } from "lucide-react";

interface JobActionButtonsProps {
  jobId: string;
  currentStatus: string | null;
}

export function JobActionButtons({ jobId, currentStatus }: JobActionButtonsProps) {
  const [status, setStatus] = useState<string | null>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleAction = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  if (status === "APPLIED") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-neon-green/10 border border-neon-green/20 rounded-lg text-neon-green font-medium">
          <CheckCircle2 size={14} />
          Applied
        </span>
      </div>
    );
  }

  if (status === "INTERESTED") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-lg text-neon-blue font-medium">
          <Heart size={14} />
          Interested
        </span>
        <button
          onClick={() => handleAction("APPLIED")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-neon-green/10 border border-neon-green/20 rounded-lg text-neon-green hover:bg-neon-green/20 transition-colors font-medium"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Mark as Applied
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("INTERESTED")}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-colors text-xs font-medium"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Heart size={14} />
        )}
        Interested
      </button>
      <button
        onClick={() => handleAction("APPLIED")}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-neon-green/10 border border-neon-green/20 rounded-lg text-neon-green hover:bg-neon-green/20 transition-colors text-xs font-medium"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        Applied
      </button>
    </div>
  );
}
