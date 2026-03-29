"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";

const COURSES = [
  { value: "PROFESSIONAL_MODULE", label: "Professional Module" },
  { value: "AI_MODULE", label: "AI Module" },
];

export default function CreateBatchModal({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    course: "PROFESSIONAL_MODULE",
    startDate: "",
    endDate: "",
    capacity: 6,
    location: "Milton Keynes",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create batch");
      }

      setSuccess("Batch created successfully!");
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        setForm({
          name: "",
          course: "PROFESSIONAL_MODULE",
          startDate: "",
          endDate: "",
          capacity: 6,
          location: "Milton Keynes",
        });
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
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
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Batch Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. PM-2026-W14"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

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
                    <option key={c.value} value={c.value} className="bg-[#0a0a14] text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

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
                    required
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

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
