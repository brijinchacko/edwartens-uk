"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, User, Briefcase, Phone as PhoneIcon } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";

interface ProfileFormProps {
  userId: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  department: string;
  specialization: string;
  designation: string;
  zadarmaNumber: string;
}

export default function ProfileForm({
  userId,
  name: initialName,
  email,
  phone: initialPhone,
  bio: initialBio,
  department: initialDepartment,
  specialization: initialSpecialization,
  designation: initialDesignation,
  zadarmaNumber: initialZadarmaNumber,
}: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialName,
    phone: initialPhone,
    bio: initialBio,
    department: initialDepartment,
    specialization: initialSpecialization,
    designation: initialDesignation,
    zadarmaNumber: initialZadarmaNumber,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <User size={16} className="text-neon-blue" />
          Personal Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-text-muted text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Phone</label>
          <PhoneInput
            name="phone"
            value={form.phone}
            onChange={(val) => setForm({ ...form, phone: val })}
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Bio / About Me</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            placeholder="Tell us about yourself, your experience, and expertise..."
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 resize-none"
          />
        </div>
      </div>

      {/* Professional Info */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <Briefcase size={16} className="text-neon-green" />
          Professional Details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Sales, Training, Admissions"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Designation</label>
            <input
              type="text"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="e.g. Senior Trainer, Sales Lead"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">Specialization</label>
          <input
            type="text"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            placeholder="e.g. PLC Programming, Industrial AI"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40"
          />
        </div>
      </div>

      {/* Zadarma / Phone Settings */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <PhoneIcon size={16} className="text-purple" />
          Phone Integration
        </h2>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Zadarma Number</label>
          <PhoneInput
            name="zadarmaNumber"
            value={form.zadarmaNumber}
            onChange={(val) => setForm({ ...form, zadarmaNumber: val })}
            placeholder="Your Zadarma virtual number"
          />
          <p className="text-[10px] text-text-muted mt-1">This number is used for click-to-call and automatic call logging in the CRM.</p>
        </div>
      </div>

      {/* Submit */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">Profile updated successfully!</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Changes
      </button>
    </form>
  );
}
