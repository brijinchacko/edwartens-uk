"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Phone, Mail, Loader2, ChevronDown } from "lucide-react";
import { LEAD_STATUS_LABELS } from "@/lib/utils";

interface NewLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  courseInterest: string | null;
  createdAt: string;
  assignedToId: string | null;
  assignedToName: string | null;
}

interface Employee {
  id: string;
  name: string;
}

interface NewLeadPopupProps {
  userRole: string;
}

export function NewLeadPopup({ userRole }: NewLeadPopupProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<NewLead[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAssignFor, setShowAssignFor] = useState<string | null>(null);
  const lastCheckRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const canAssign = ["SUPER_ADMIN", "ADMIN", "SALES_LEAD"].includes(userRole);

  // Fetch employees once (for assign dropdown)
  useEffect(() => {
    if (!canAssign) return;
    fetch("/api/admin/search?q=")
      .then(() => {})
      .catch(() => {});
    // Fetch employee list
    fetch("/api/admin/work-session/team")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.team) {
          setEmployees(data.team.map((m: any) => ({ id: m.id, name: m.name })));
        }
      })
      .catch(() => {});
  }, [canAssign]);

  // Poll for new unassigned leads
  const checkNewLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads/new-available");
      if (!res.ok) return;
      const data = await res.json();
      const newLeads: NewLead[] = data.leads || [];

      // Find truly NEW leads (not previously seen)
      const currentIds = new Set(newLeads.map((l) => l.id));
      const prevIds = lastCheckRef.current;

      if (prevIds && newLeads.length > 0) {
        const newOnes = newLeads.filter((l) => !prevIds.includes(l.id) && !dismissed.has(l.id));
        if (newOnes.length > 0) {
          // Play notification sound
          try {
            if (!audioRef.current) {
              audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+Jj4+NiYB0aWRne4aMkI+Nh3ltY2BqeIaSk5GKgHNoXmFvgI2Wl5WNgndpXmJxgpCZm5iPhXVoXWFxg5GbnZmRh3lqXmNzhZOdn5uTiXtrYGV1h5WfoJyVjH5uYmd3iZehouCelI+Bb2ZpepGZo6KemZKEcWpte4+YpKSgnJSHc21wfJKapqeknpiLd3FzfpacrKmnoZyPfHV2gJmesauqpp+Tf3h5g5yhtK2sqaKXhHx7hZ6kt6+urKWbh398iKCmuLGwrqmfjoOBi6Oov7O0sq2mkoiFjKapwLa2tLCqmIyJj6mvwri5trSvnpGOkq+yw7u7uba0opaSlbK0xb2+u7m2pZqWmLa3x8C/v7u6qJ6ZnLq6yMLBwb69rKOdoL68zcTDw8HAtainpMHAz8bGxsO/t6yrqcPD0snIycXCu7CursfG08zKy8jFvLSwscnJ1s7Mz8vJv7eztM3M2NDO0c3Mwrq2t9DO29LQ1M/Pxr24utPR3tTT1tHS0L+7u9fT4NbU2NTV0sK+v9rV4tfX2tbX1cXBwdzX5drZ3NnZ2MjFxN/Z59zc39zc28vIx+Lb6d/e4d/e3s7Lyu7d");
            }
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => {});
          } catch {}
        }
      }

      // Update state with unassigned leads not dismissed
      const visible = newLeads.filter((l) => !l.assignedToId && !dismissed.has(l.id));
      setLeads(visible);
      lastCheckRef.current = JSON.stringify([...currentIds]);
    } catch {}
  }, [dismissed]);

  useEffect(() => {
    checkNewLeads();
    const interval = setInterval(checkNewLeads, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [checkNewLeads]);

  // Claim lead
  const handleClaim = async (leadId: string) => {
    setClaiming(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/claim`, { method: "POST" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to claim");
      }
    } catch {}
    setClaiming(null);
  };

  // Assign lead
  const handleAssign = async (leadId: string, employeeId: string) => {
    setAssigning(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: employeeId }),
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        setShowAssignFor(null);
        router.refresh();
      }
    } catch {}
    setAssigning(null);
  };

  // Dismiss
  const handleDismiss = (leadId: string) => {
    setDismissed((prev) => new Set([...prev, leadId]));
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  if (leads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-h-[60vh] overflow-y-auto" style={{ maxWidth: 380 }}>
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="bg-[#111921] border border-[#7BC142]/30 rounded-xl shadow-2xl p-4 animate-slideUp"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7BC142]/10 flex items-center justify-center">
                <UserPlus size={16} className="text-[#7BC142]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#7BC142]">New Lead!</p>
                <p className="text-[10px] text-text-muted">{new Date(lead.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })} · {lead.source}</p>
              </div>
            </div>
            <button onClick={() => handleDismiss(lead.id)} className="text-text-muted hover:text-text-primary p-1">
              <X size={14} />
            </button>
          </div>

          {/* Lead Info */}
          <div className="mb-3">
            <p className="text-sm font-semibold text-text-primary">{lead.name}</p>
            <div className="flex items-center gap-3 mt-1">
              {lead.phone && (
                <span className="flex items-center gap-1 text-[11px] text-text-muted">
                  <Phone size={10} /> {lead.phone}
                </span>
              )}
              {lead.email && (
                <span className="flex items-center gap-1 text-[11px] text-text-muted">
                  <Mail size={10} /> {lead.email}
                </span>
              )}
            </div>
            {lead.courseInterest && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                {lead.courseInterest === "PROFESSIONAL_MODULE" ? "Professional" : "AI Module"}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleClaim(lead.id)}
              disabled={claiming === lead.id}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#7BC142]/15 border border-[#7BC142]/25 text-[#7BC142] text-xs font-medium hover:bg-[#7BC142]/25 transition-colors disabled:opacity-50"
            >
              {claiming === lead.id ? <Loader2 size={12} className="animate-spin" /> : "🤚"} Claim
            </button>

            {canAssign && (
              <div className="relative">
                <button
                  onClick={() => setShowAssignFor(showAssignFor === lead.id ? null : lead.id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-xs hover:bg-white/[0.06] transition-colors"
                >
                  Assign <ChevronDown size={10} />
                </button>

                {showAssignFor === lead.id && (
                  <div className="absolute bottom-full right-0 mb-1 w-48 max-h-40 overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0c1018] shadow-2xl z-50">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleAssign(lead.id, emp.id)}
                        disabled={assigning === lead.id}
                        className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-white/[0.04] transition-colors"
                      >
                        {emp.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <a
              href={`/admin/leads/${lead.id}`}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-muted text-xs hover:bg-white/[0.06] transition-colors"
            >
              View
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
