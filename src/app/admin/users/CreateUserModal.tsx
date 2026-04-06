"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, Eye, EyeOff, Copy, Check } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "SALES_LEAD", label: "Sales Lead" },
  { value: "ADMISSION_COUNSELLOR", label: "Admission Counsellor" },
  { value: "TRAINER", label: "Trainer" },
  { value: "HR_MANAGER", label: "HR Manager" },
];

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  userRole: string;
}

export default function CreateUserModal({ open, onClose, userRole }: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("SALES_LEAD");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  // Filter roles based on current user
  const availableRoles = userRole === "SUPER_ADMIN"
    ? [{ value: "SUPER_ADMIN", label: "Super Admin" }, ...ROLE_OPTIONS]
    : ROLE_OPTIONS.filter((r) => r.value !== "SUPER_ADMIN");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, department, specialization }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create user");
        return;
      }

      setResult({ email: data.user.email, tempPassword: data.tempPassword });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`Email: ${result.email}\nPassword: ${result.tempPassword}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("SALES_LEAD");
    setDepartment("");
    setSpecialization("");
    setError("");
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-secondary border border-white/10 rounded-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-neon-blue" />
            Create New User
          </h2>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-green-400 font-medium mb-2">User created successfully!</p>
              <p className="text-sm text-white/60">Share these credentials with the user:</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-xs text-white/40">Email</span>
                <p className="text-white font-mono text-sm">{result.email}</p>
              </div>
              <div>
                <span className="text-xs text-white/40">Temporary Password</span>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-sm">
                    {showPassword ? result.tempPassword : "••••••••"}
                  </p>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 transition-colors text-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </button>
              <button onClick={handleClose} className="px-4 py-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors text-sm">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 mb-1 block">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="john@wartens.com"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="+44 ..."
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                {availableRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Sales"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="PLC Training"
                />
              </div>
            </div>

            <p className="text-[10px] text-white/30">A temporary password will be auto-generated. Share it with the user so they can log in.</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
