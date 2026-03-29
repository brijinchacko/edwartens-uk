"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Camera,
  Pencil,
  X,
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
  const [savedProfile, setSavedProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    qualification: "",
  });
  const [editing, setEditing] = useState(false);
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

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) {
          const data = await res.json();
          const loaded: ProfileData = {
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
          };
          setProfile(loaded);
          setSavedProfile(loaded);
          if (data.avatar) {
            setAvatarUrl(data.avatar);
          }
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleEnterEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setProfile({ ...savedProfile });
    setEditing(false);
    setError("");
    setSuccess("");
  };

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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth || null,
          address: profile.address,
          emergencyName: profile.emergencyName,
          emergencyPhone: profile.emergencyPhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      setSavedProfile({ ...profile });
      setEditing(false);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/student/profile/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload photo");
      }
      const data = await res.json();
      setAvatarUrl(data.avatar);
      setSuccess("Profile photo updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setAvatarUploading(false);
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

  const inputClasses = editing
    ? "w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
    : "w-full px-3 py-2 bg-dark-tertiary border border-border rounded-lg text-sm text-text-muted cursor-default";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Profile</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your personal information
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleEnterEdit}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors text-sm font-medium"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Form */}
      <div className="glass-card p-6 space-y-5">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-3 pb-5 border-b border-border">
          <div
            onClick={() => avatarRef.current?.click()}
            className="relative w-24 h-24 rounded-full cursor-pointer group"
          >
            {avatarUploading ? (
              <div className="w-24 h-24 rounded-full bg-white/[0.03] border-2 border-neon-blue/30 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-neon-blue" />
              </div>
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile photo"
                className="w-24 h-24 rounded-full object-cover border-2 border-neon-blue/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/[0.03] border-2 border-dashed border-border flex items-center justify-center">
                <User size={28} className="text-text-muted" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">
              Profile Photo
            </p>
            <p className="text-xs text-text-muted">
              Click to change your photo
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
              readOnly={!editing}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className={inputClasses}
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
              readOnly={!editing}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className={inputClasses}
              placeholder="+44 7XXX XXXXXX"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Date of Birth</label>
            <input
              type="date"
              value={profile.dateOfBirth}
              readOnly={!editing}
              onChange={(e) =>
                setProfile({ ...profile, dateOfBirth: e.target.value })
              }
              className={inputClasses}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm text-text-secondary">Address</label>
            <textarea
              value={profile.address}
              readOnly={!editing}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              rows={2}
              className={`${inputClasses} resize-none`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={profile.emergencyName}
              readOnly={!editing}
              onChange={(e) =>
                setProfile({ ...profile, emergencyName: e.target.value })
              }
              className={inputClasses}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={profile.emergencyPhone}
              readOnly={!editing}
              onChange={(e) =>
                setProfile({ ...profile, emergencyPhone: e.target.value })
              }
              className={inputClasses}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Qualification</label>
            <select
              value={profile.qualification}
              disabled={!editing}
              onChange={(e) =>
                setProfile({ ...profile, qualification: e.target.value })
              }
              className={
                editing
                  ? "w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary"
                  : "w-full px-3 py-2 bg-dark-tertiary border border-border rounded-lg text-sm text-text-muted cursor-default"
              }
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

        {editing && (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-white/[0.03] border border-border text-text-secondary rounded-lg hover:bg-white/[0.06] transition-colors font-medium text-sm disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        )}
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
