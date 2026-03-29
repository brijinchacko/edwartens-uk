"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

const SOURCES = [
  { value: "website", label: "Website" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "phone_inquiry", label: "Phone Inquiry" },
  { value: "zoho_import", label: "Zoho Import" },
  { value: "manual", label: "Manual" },
  { value: "other", label: "Other" },
];

const COURSES = [
  { value: "PROFESSIONAL_MODULE", label: "Professional Module" },
  { value: "AI_MODULE", label: "AI Module" },
];

interface StaffOption {
  id: string;
  name: string;
  employeeId: string;
}

export default function AddLeadModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [staff, setStaff] = useState<StaffOption[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    courseInterest: "",
    qualification: "",
    source: "manual",
    assignedToId: "",
    followUpDate: "",
    note: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/admin/users")
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            const staffList = data.users
              .filter((u: any) => u.isActive && u.employeeProfile)
              .map((u: any) => ({
                id: u.id,
                name: u.name,
                employeeId: u.employeeProfile?.id || u.id,
              }));
            setStaff(staffList);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: form.source,
      };
      if (form.courseInterest) payload.courseInterest = form.courseInterest;
      if (form.qualification) payload.qualification = form.qualification;
      if (form.assignedToId) payload.assignedToId = form.assignedToId;
      if (form.followUpDate) payload.followUpDate = form.followUpDate;
      if (form.note) payload.note = form.note;

      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add lead");
      }

      setSuccess("Lead added successfully!");
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        setForm({
          name: "",
          email: "",
          phone: "",
          courseInterest: "",
          qualification: "",
          source: "manual",
          assignedToId: "",
          followUpDate: "",
          note: "",
        });
        router.refresh();
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
        Add Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] sticky top-0 bg-[#0a0a14]/95 backdrop-blur-xl z-10">
              <h2 className="text-lg font-semibold text-white">Add Lead</h2>
              <button
                onClick={() => !loading && setOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+44 7XXX XXXXXX"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              {/* Course Interest */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Course Interest
                </label>
                <select
                  name="courseInterest"
                  value={form.courseInterest}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  <option value="" className="bg-[#0a0a14] text-white">
                    Select course...
                  </option>
                  {COURSES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#0a0a14] text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Source
                </label>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  {SOURCES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#0a0a14] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Assigned To
                </label>
                <select
                  name="assignedToId"
                  value={form.assignedToId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  <option value="" className="bg-[#0a0a14] text-white">
                    Unassigned
                  </option>
                  {staff.map((s) => (
                    <option key={s.employeeId} value={s.employeeId} className="bg-[#0a0a14] text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Follow Up Date */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Follow Up Date
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              {/* Initial Note */}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Initial Note
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional notes about this lead..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors resize-none"
                />
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
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Lead
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
