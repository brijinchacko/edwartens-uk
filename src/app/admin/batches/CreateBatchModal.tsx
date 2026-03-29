"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Loader2, Wifi, MapPin, Monitor } from "lucide-react";

const COURSES = [
  { value: "PROFESSIONAL_MODULE", label: "Professional Module", prefix: "UK-PROF" },
  { value: "AI_MODULE", label: "AI Module", prefix: "UK-AI" },
];

const MODES = [
  { value: "ONLINE", label: "Online", icon: Wifi, color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  { value: "OFFLINE", label: "Offline", icon: MapPin, color: "text-green-400 border-green-500/20 bg-green-500/10" },
  { value: "HYBRID", label: "Hybrid", icon: Monitor, color: "text-purple border-purple/20 bg-purple/10" },
];

function getISOWeek(dateStr: string): number {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function generateBatchName(course: string, startDate: string): string {
  if (!startDate) return "";
  const courseObj = COURSES.find((c) => c.value === course);
  const prefix = courseObj?.prefix || "UK";
  const week = getISOWeek(startDate);
  const year = new Date(startDate).getFullYear();
  return `${prefix}-W${String(week).padStart(2, "0")}-${year}`;
}

interface Trainer {
  id: string;
  name: string;
  email: string;
}

export default function CreateBatchModal({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  const [form, setForm] = useState({
    name: "",
    course: "PROFESSIONAL_MODULE",
    startDate: "",
    endDate: "",
    capacity: 6,
    location: "Milton Keynes",
    mode: "ONLINE",
    teamsLink: "",
    instructorId: "",
  });

  // Fetch trainers when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingTrainers(true);
    fetch("/api/admin/employees?role=TRAINER,ADMIN")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.employees || data || []).map((emp: any) => ({
          id: emp.id,
          name: emp.user?.name || emp.name || "Unknown",
          email: emp.user?.email || emp.email || "",
        }));
        setTrainers(list);
      })
      .catch(() => setTrainers([]))
      .finally(() => setLoadingTrainers(false));
  }, [open]);

  // Auto-suggest batch name
  const autoName = useCallback(() => {
    if (form.course && form.startDate && !nameManuallyEdited) {
      const suggested = generateBatchName(form.course, form.startDate);
      setForm((prev) => ({ ...prev, name: suggested }));
    }
  }, [form.course, form.startDate, nameManuallyEdited]);

  useEffect(() => {
    autoName();
  }, [autoName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (name === "name") {
      setNameManuallyEdited(value !== "");
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleModeChange = (mode: string) => {
    setForm((prev) => ({
      ...prev,
      mode,
      teamsLink: mode === "OFFLINE" ? "" : prev.teamsLink,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        course: form.course,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        capacity: form.capacity,
        location: form.location,
        mode: form.mode,
        teamsLink: form.teamsLink || undefined,
        instructorId: form.instructorId || undefined,
      };

      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create batch");
      }

      // Auto-generate batch days
      const batchId = data.id;
      if (batchId) {
        try {
          await fetch(`/api/admin/batches/${batchId}/days`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          // Non-critical: days can be generated later
          console.warn("Could not auto-generate batch days");
        }
      }

      setSuccess("Batch created successfully!");
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        setNameManuallyEdited(false);
        setForm({
          name: "",
          course: "PROFESSIONAL_MODULE",
          startDate: "",
          endDate: "",
          capacity: 6,
          location: "Milton Keynes",
          mode: "ONLINE",
          teamsLink: "",
          instructorId: "",
        });
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const showTeamsLink = form.mode === "ONLINE" || form.mode === "HYBRID";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium w-fit"
      >
        <Plus size={16} />
        Create Batch
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] sticky top-0 bg-[#0a0a14]/95 backdrop-blur-xl z-10">
              <h2 className="text-lg font-semibold text-white">
                Create New Batch
              </h2>
              <button
                onClick={() => !loading && setOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Course */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Course
                </label>
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  {COURSES.map((c) => (
                    <option
                      key={c.value}
                      value={c.value}
                      className="bg-[#0a0a14] text-white"
                    >
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Batch Name (auto-suggested) */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Batch Name
                  {form.name && !nameManuallyEdited && (
                    <span className="ml-2 text-[10px] text-neon-green/70">
                      auto-generated
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setNameManuallyEdited(true);
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  onBlur={() => {
                    if (!form.name) setNameManuallyEdited(false);
                  }}
                  placeholder="e.g. UK-PROF-W14-2026"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-sm text-text-muted mb-2">
                  Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    const isSelected = form.mode === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => handleModeChange(m.value)}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? m.color
                            : "border-white/[0.06] text-text-muted bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <Icon size={14} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teams Link (conditional) */}
              {showTeamsLink && (
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Microsoft Teams Link
                  </label>
                  <input
                    type="url"
                    name="teamsLink"
                    value={form.teamsLink}
                    onChange={handleChange}
                    placeholder="https://teams.microsoft.com/l/meetup-join/..."
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                  />
                </div>
              )}

              {/* Trainer Assignment */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Assign Trainer
                </label>
                <select
                  name="instructorId"
                  value={form.instructorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  <option value="" className="bg-[#0a0a14] text-white">
                    {loadingTrainers ? "Loading trainers..." : "-- No trainer --"}
                  </option>
                  {trainers.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      className="bg-[#0a0a14] text-white"
                    >
                      {t.name} {t.email ? `(${t.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    min={1}
                    max={50}
                    value={form.capacity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Batch
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
