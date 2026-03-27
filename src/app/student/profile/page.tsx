"use client";

import { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  qualification: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    qualification: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            dateOfBirth: data.dateOfBirth
              ? data.dateOfBirth.split("T")[0]
              : "",
            address: data.address || "",
            emergencyName: data.emergencyName || "",
            emergencyPhone: data.emergencyPhone || "",
            qualification: data.qualification || "",
          });
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!profile.name || !profile.phone) {
        setError("Name and phone are required.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth || null,
          address: profile.address,
          emergencyName: profile.emergencyName,
          emergencyPhone: profile.emergencyPhone,
          qualification: profile.qualification,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/student/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Form */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center">
            <User size={20} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Personal Information
            </p>
            <p className="text-xs text-text-muted">
              Update your details below
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 bg-dark-tertiary border border-border rounded-lg text-sm text-text-muted cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
              placeholder="+44 7XXX XXXXXX"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Date of Birth</label>
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) =>
                setProfile({ ...profile, dateOfBirth: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm text-text-secondary">Address</label>
            <textarea
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={profile.emergencyName}
              onChange={(e) =>
                setProfile({ ...profile, emergencyName: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={profile.emergencyPhone}
              onChange={(e) =>
                setProfile({ ...profile, emergencyPhone: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Qualification</label>
            <select
              value={profile.qualification}
              onChange={(e) =>
                setProfile({ ...profile, qualification: e.target.value })
              }
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
            >
              <option value="">Select qualification</option>
              <option value="GCSE">GCSE</option>
              <option value="A-Level">A-Level</option>
              <option value="BTEC">BTEC</option>
              <option value="HND">HND</option>
              <option value="Bachelors">Bachelors Degree</option>
              <option value="Masters">Masters Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg text-sm text-neon-green flex items-center gap-2">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors font-medium text-sm disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </button>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
            <Lock size={20} className="text-purple" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Change Password
            </p>
            <p className="text-xs text-text-muted">
              Update your account password
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-text-secondary">
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-text-secondary">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Password Messages */}
        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg text-sm text-neon-green flex items-center gap-2">
            <CheckCircle2 size={16} />
            {passwordSuccess}
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={passwordSaving}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple/10 border border-purple/30 text-purple rounded-lg hover:bg-purple/20 transition-colors font-medium text-sm disabled:opacity-50"
        >
          {passwordSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Lock size={16} />
          )}
          Change Password
        </button>
      </div>
    </div>
  );
}
