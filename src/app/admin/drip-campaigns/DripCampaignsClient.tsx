"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Play,
  Plus,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Zap,
  X,
} from "lucide-react";
import { emailTemplates } from "@/lib/email-templates";

/* ─── Types ────────────────────────────────────────────────────────── */

interface Step {
  id: string;
  stepNumber: number;
  delayDays: number;
  templateId: string;
  subject: string | null;
  isActive: boolean;
}

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  trigger: string;
  createdAt: string;
  steps: Step[];
}

interface LogEntry {
  id: string;
  leadId: string;
  sequenceId: string;
  stepNumber: number;
  sentAt: string;
  status: string;
  error: string | null;
}

/* ─── Trigger labels ───────────────────────────────────────────────── */

const TRIGGER_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  POST_CONSULTATION: "Post-Consultation",
  ENROLLED: "Enrolled",
};

const TRIGGER_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  QUALIFIED: "bg-green-500/10 text-green-400 border-green-500/20",
  POST_CONSULTATION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ENROLLED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

/* ─── Template name lookup ─────────────────────────────────────────── */

function getTemplateName(templateId: string): string {
  const tmpl = emailTemplates.find((t) => t.id === templateId);
  return tmpl?.name || templateId;
}

/* ═══════════════════════════════════════════════════════════════════ */

export default function DripCampaignsClient() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ sent: number; skipped: number; failed: number } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTrigger, setNewTrigger] = useState("NEW_LEAD");
  const [newSteps, setNewSteps] = useState<{ stepNumber: number; delayDays: number; templateId: string; subject: string }[]>([
    { stepNumber: 1, delayDays: 0, templateId: "", subject: "" },
  ]);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/drip-campaigns");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSequences(data.sequences || []);
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Error loading drip campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRunNow = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/admin/drip-campaigns/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setRunResult({ sent: data.sent, skipped: data.skipped, failed: data.failed });
        await fetchData();
      } else {
        alert(data.error || "Failed to run campaigns");
      }
    } catch {
      alert("Network error running campaigns");
    } finally {
      setRunning(false);
    }
  };

  const handleToggle = async (seq: Sequence) => {
    setToggling(seq.id);
    try {
      const res = await fetch("/api/admin/drip-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: seq.id, isActive: !seq.isActive }),
      });
      if (res.ok) {
        setSequences((prev) =>
          prev.map((s) => (s.id === seq.id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sequence? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/drip-campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSequences((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      alert("Failed to delete sequence");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return alert("Name is required");
    if (newSteps.some((s) => !s.templateId)) return alert("All steps need a template");

    setCreating(true);
    try {
      const res = await fetch("/api/admin/drip-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDescription || null,
          trigger: newTrigger,
          steps: newSteps.map((s) => ({
            ...s,
            subject: s.subject || null,
            isActive: true,
          })),
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewName("");
        setNewDescription("");
        setNewTrigger("NEW_LEAD");
        setNewSteps([{ stepNumber: 1, delayDays: 0, templateId: "", subject: "" }]);
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create sequence");
      }
    } catch {
      alert("Network error");
    } finally {
      setCreating(false);
    }
  };

  const addStep = () => {
    setNewSteps((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, delayDays: prev.length * 3, templateId: "", subject: "" },
    ]);
  };

  const removeStep = (idx: number) => {
    setNewSteps((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const updateStep = (idx: number, field: string, value: string | number) => {
    setNewSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Drip Campaigns</h1>
          <p className="text-text-muted mt-1">
            {sequences.length} sequence{sequences.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunNow}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 text-sm font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? "Running..." : "Run Now"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium hover:bg-green-500/20 transition-colors"
          >
            <Plus size={16} />
            Create Sequence
          </button>
        </div>
      </div>

      {/* Run Result */}
      {runResult && (
        <div className="glass-card p-4 border-l-4 border-neon-blue">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-sm font-medium text-text-primary">Campaign Run Complete</span>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-green-400">{runResult.sent} sent</span>
            <span className="text-yellow-400">{runResult.skipped} skipped</span>
            <span className="text-red-400">{runResult.failed} failed</span>
          </div>
        </div>
      )}

      {/* Sequences List */}
      <div className="space-y-3">
        {sequences.map((seq) => {
          const isExpanded = expandedId === seq.id;
          const seqLogs = logs.filter((l) => l.sequenceId === seq.id);
          return (
            <div key={seq.id} className="glass-card overflow-hidden">
              {/* Sequence Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : seq.id)}
              >
                {isExpanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-neon-blue" />
                    <span className="text-sm font-medium text-text-primary">{seq.name}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${TRIGGER_COLORS[seq.trigger] || "bg-white/[0.05] text-text-muted border-white/[0.08]"}`}>
                      {TRIGGER_LABELS[seq.trigger] || seq.trigger}
                    </span>
                  </div>
                  {seq.description && <p className="text-xs text-text-muted mt-0.5">{seq.description}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">{seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}</span>

                  {/* Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(seq);
                    }}
                    disabled={toggling === seq.id}
                    className="flex items-center"
                    title={seq.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                  >
                    {seq.isActive ? (
                      <ToggleRight size={24} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={24} className="text-text-muted" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(seq.id);
                    }}
                    className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete sequence"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded — Steps */}
              {isExpanded && (
                <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
                  {/* Steps */}
                  <div className="space-y-2">
                    {seq.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                          step.isActive
                            ? "bg-white/[0.02] border-white/[0.06]"
                            : "bg-white/[0.01] border-white/[0.03] opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-blue/10 text-neon-blue text-xs font-bold flex-shrink-0">
                          {step.stepNumber}
                        </div>
                        <Clock size={14} className="text-text-muted flex-shrink-0" />
                        <span className="text-xs text-text-muted w-16 flex-shrink-0">
                          Day {step.delayDays}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-text-primary truncate block">{getTemplateName(step.templateId)}</span>
                          {step.subject && <span className="text-xs text-text-muted truncate block">{step.subject}</span>}
                        </div>
                        {step.isActive ? (
                          <Zap size={12} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] text-text-muted">off</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Logs for this sequence */}
                  {seqLogs.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-text-muted mb-2">Recent Activity</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {seqLogs.slice(0, 10).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-white/[0.02]"
                          >
                            {log.status === "SENT" ? (
                              <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                            ) : (
                              <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                            )}
                            <span className="text-text-muted">Step {log.stepNumber}</span>
                            <span className="text-text-secondary truncate">{log.leadId.slice(0, 8)}...</span>
                            <span className="text-text-muted ml-auto">
                              {new Date(log.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                            {log.error && <span className="text-red-400 truncate max-w-[120px]">{log.error}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sequences.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Mail size={32} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">No sequences configured yet</p>
            <p className="text-xs text-text-muted mt-1">Create a sequence or reload to seed defaults</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Create Sequence</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-white/[0.05]">
                <X size={18} className="text-text-muted" />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs text-text-muted block mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted"
                placeholder="e.g. Re-engagement Campaign"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-text-muted block mb-1">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted"
                placeholder="Optional description"
              />
            </div>

            {/* Trigger */}
            <div>
              <label className="text-xs text-text-muted block mb-1">Trigger</label>
              <select
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary"
              >
                {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-dark-secondary">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-text-muted">Steps</label>
                <button onClick={addStep} className="text-xs text-neon-blue hover:text-neon-blue/80 flex items-center gap-1">
                  <Plus size={12} /> Add Step
                </button>
              </div>
              <div className="space-y-3">
                {newSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-blue/10 text-neon-blue text-xs font-bold flex-shrink-0 mt-1">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <div className="w-20">
                          <label className="text-[10px] text-text-muted">Delay (days)</label>
                          <input
                            type="number"
                            min={0}
                            value={step.delayDays}
                            onChange={(e) => updateStep(idx, "delayDays", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded text-xs text-text-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-text-muted">Template</label>
                          <select
                            value={step.templateId}
                            onChange={(e) => updateStep(idx, "templateId", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded text-xs text-text-primary"
                          >
                            <option value="" className="bg-dark-secondary">Select template...</option>
                            {emailTemplates.map((t) => (
                              <option key={t.id} value={t.id} className="bg-dark-secondary">
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted">Subject override (optional)</label>
                        <input
                          type="text"
                          value={step.subject}
                          onChange={(e) => updateStep(idx, "subject", e.target.value)}
                          className="w-full px-2 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded text-xs text-text-primary placeholder:text-text-muted"
                          placeholder="Leave blank to use template subject"
                        />
                      </div>
                    </div>
                    {newSteps.length > 1 && (
                      <button onClick={() => removeStep(idx)} className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 mt-1">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 text-sm font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
