"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Send,
  Loader2,
  X,
  Phone,
  User,
} from "lucide-react";

interface WhatsAppTask {
  id: string;
  leadId: string;
  message: string;
  phoneNumber: string;
  status: string;
  sentAt: string | null;
  lead: {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
  };
  createdAt: string;
}

export function WhatsAppTaskPopup() {
  const [tasks, setTasks] = useState<WhatsAppTask[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  const [ackNote, setAckNote] = useState("");
  const [showAckForm, setShowAckForm] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp-tasks");
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      // silently fail - non-critical UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const openWhatsApp = (phone: string, message: string) => {
    // Clean phone number - remove spaces, ensure starts with country code
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  const markAsSent = async (taskId: string) => {
    try {
      const res = await fetch("/api/admin/whatsapp-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, action: "mark_sent" }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: "SENT", sentAt: new Date().toISOString() } : t
          )
        );
      }
    } catch {
      // silently fail
    }
  };

  const acknowledge = async (taskId: string) => {
    setAcknowledging(taskId);
    try {
      const res = await fetch("/api/admin/whatsapp-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, note: ackNote }),
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setShowAckForm(null);
        setAckNote("");
      }
    } catch {
      // silently fail
    } finally {
      setAcknowledging(null);
    }
  };

  if (loading || tasks.length === 0) return null;

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const sentCount = tasks.filter((t) => t.status === "SENT").length;

  return (
    <div className="mb-4">
      <div className="glass-card rounded-xl border border-emerald-500/20 overflow-hidden">
        {/* Header bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 px-4 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MessageCircle size={16} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">
                You have {tasks.length} WhatsApp message{tasks.length !== 1 ? "s" : ""} to send
              </p>
              <p className="text-[11px] text-text-muted">
                {pendingCount > 0 && `${pendingCount} pending`}
                {pendingCount > 0 && sentCount > 0 && " · "}
                {sentCount > 0 && `${sentCount} sent (awaiting acknowledgement)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
              {tasks.length}
            </span>
            {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
          </div>
        </button>

        {/* Expanded task list */}
        {expanded && (
          <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 space-y-3">
                {/* Lead info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center">
                      <User size={14} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {task.lead.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        <Phone size={10} />
                        {task.phoneNumber}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      task.status === "SENT"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Message preview */}
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {task.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {task.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => {
                          openWhatsApp(task.phoneNumber, task.message);
                          // Auto-mark as sent after opening WhatsApp
                          setTimeout(() => markAsSent(task.id), 1000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs font-medium"
                      >
                        <ExternalLink size={12} />
                        Send via WhatsApp
                      </button>
                      <button
                        onClick={() => markAsSent(task.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] text-text-secondary hover:text-text-primary transition-colors text-xs"
                      >
                        <Send size={12} />
                        Mark as Sent
                      </button>
                    </>
                  )}

                  {task.status === "SENT" && showAckForm !== task.id && (
                    <button
                      onClick={() => {
                        setShowAckForm(task.id);
                        setAckNote("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors text-xs font-medium"
                    >
                      <CheckCircle2 size={12} />
                      Acknowledge
                    </button>
                  )}

                  {task.status === "PENDING" && (
                    <button
                      onClick={() => {
                        setShowAckForm(task.id);
                        setAckNote("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] text-text-muted hover:text-text-primary transition-colors text-xs"
                    >
                      <CheckCircle2 size={12} />
                      Quick Acknowledge
                    </button>
                  )}
                </div>

                {/* Acknowledge form */}
                {showAckForm === task.id && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={ackNote}
                      onChange={(e) => setAckNote(e.target.value)}
                      placeholder="Add a note (optional)..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-xs focus:outline-none focus:border-neon-blue/50"
                    />
                    <button
                      onClick={() => acknowledge(task.id)}
                      disabled={acknowledging === task.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {acknowledging === task.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowAckForm(null)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
