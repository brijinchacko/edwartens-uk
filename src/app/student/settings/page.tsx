"use client";

import { useState, useEffect } from "react";
import { Settings, User, Lock, Bell, Moon, Sun, LogOut, Loader2, CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  dateOfBirth: string | null;
  address: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
}

export default function StudentSettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "password" | "notifications" | "appearance">("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    sessionReminders: true,
    assessmentAlerts: true,
    jobAlerts: true,
    batchUpdates: true,
  });

  // Theme
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load theme from localStorage
    const saved = localStorage.getItem("edw-theme");
    if (saved) setTheme(saved);
  }, []);

  const handleProfileSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/student/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (t: string) => {
    setTheme(t);
    localStorage.setItem("edw-theme", t);
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${t}`);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "password" as const, label: "Password", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "appearance" as const, label: "Appearance", icon: Moon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
          <Settings size={20} className="text-neon-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Settings</h1>
          <p className="text-xs text-text-muted">Manage your account preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(""); setSuccess(""); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-neon-blue/10 text-neon-blue"
                : "text-text-muted hover:text-text-primary hover:bg-white/[0.03]"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          <CheckCircle2 size={14} />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Profile Tab */}
      {tab === "profile" && profile && (
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Email</label>
              <input type="email" value={profile.email} disabled
                className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-text-muted text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Phone</label>
              <input type="tel" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Date of Birth</label>
              <input type="date" value={profile.dateOfBirth?.split("T")[0] || ""} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40 [color-scheme:dark]" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Address</label>
            <textarea value={profile.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40 resize-none" />
          </div>

          <h2 className="text-sm font-semibold text-text-primary pt-2">Emergency Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Emergency Contact Name</label>
              <input type="text" value={profile.emergencyName || ""} onChange={(e) => setProfile({ ...profile, emergencyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Emergency Contact Phone</label>
              <input type="tel" value={profile.emergencyPhone || ""} onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
            </div>
          </div>

          <button onClick={handleProfileSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Save Changes
          </button>
        </div>
      )}

      {/* Password Tab */}
      {tab === "password" && (
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Shield size={16} className="text-neon-blue" /> Change Password
          </h2>
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs text-text-muted mb-1">Current Password</label>
              <div className="relative">
                <input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
                <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                  {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">New Password</label>
              <input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Confirm New Password</label>
              <input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:border-neon-blue/40" />
            </div>
            <p className="text-[10px] text-text-muted">Password must be at least 8 characters</p>
            <button onClick={handlePasswordChange} disabled={saving || !currentPassword || !newPassword}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              Change Password
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Receive important updates via email" },
              { key: "sessionReminders", label: "Session Reminders", desc: "Get reminded before your training sessions" },
              { key: "assessmentAlerts", label: "Assessment Alerts", desc: "Notifications about assessments and results" },
              { key: "jobAlerts", label: "Job Alerts", desc: "New job opportunities matching your skills" },
              { key: "batchUpdates", label: "Batch Updates", desc: "Changes to your batch schedule or details" },
            ].map((pref) => (
              <label key={pref.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.03] transition-colors cursor-pointer">
                <div>
                  <p className="text-sm text-text-primary">{pref.label}</p>
                  <p className="text-[10px] text-text-muted">{pref.desc}</p>
                </div>
                <div className={`relative w-10 h-5 rounded-full transition-colors ${notifPrefs[pref.key as keyof typeof notifPrefs] ? "bg-neon-blue" : "bg-white/[0.1]"}`}
                  onClick={() => setNotifPrefs((prev) => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifPrefs[pref.key as keyof typeof notifPrefs] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {tab === "appearance" && (
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
          <div className="flex gap-3">
            <button onClick={() => handleThemeChange("dark")}
              className={`flex-1 p-4 rounded-lg border transition-colors ${theme === "dark" ? "border-neon-blue/30 bg-neon-blue/[0.05]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <Moon size={20} className={theme === "dark" ? "text-neon-blue mx-auto" : "text-text-muted mx-auto"} />
              <p className="text-xs text-text-primary mt-2 text-center">Dark Mode</p>
            </button>
            <button onClick={() => handleThemeChange("light")}
              className={`flex-1 p-4 rounded-lg border transition-colors ${theme === "light" ? "border-neon-blue/30 bg-neon-blue/[0.05]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <Sun size={20} className={theme === "light" ? "text-neon-blue mx-auto" : "text-text-muted mx-auto"} />
              <p className="text-xs text-text-primary mt-2 text-center">Light Mode</p>
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Sign Out</h2>
            <p className="text-xs text-text-muted">Sign out of your EDWartens account</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
