"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  PoundSterling,
  Search,
  MapPin,
  Briefcase,
  Heart,
  ChevronDown,
  User,
  Loader2,
  Save,
  Globe,
} from "lucide-react";

interface AlumniProfile {
  id: string;
  headline: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  location: string | null;
  linkedInUrl: string | null;
  bio: string | null;
  skills: string[];
  salary: string | null;
  willingToMentor: boolean;
  student: {
    user: { name: string; avatar: string | null };
    batch: { name: string; course: string } | null;
  };
}

interface Stats {
  totalAlumni: number;
  companyCount: number;
  avgSalary: number;
}

export default function StudentAlumniPage() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Profile form state
  const [form, setForm] = useState({
    headline: "",
    currentCompany: "",
    currentRole: "",
    location: "",
    linkedInUrl: "",
    bio: "",
    skills: "",
    salary: "",
    willingToMentor: false,
    isPublic: true,
  });

  useEffect(() => {
    fetch("/api/student/alumni")
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.profiles || []);
        setStats(data.stats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allSkills = [...new Set(profiles.flatMap((p) => p.skills))].sort();

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.student.user.name.toLowerCase().includes(q) ||
      (p.currentCompany || "").toLowerCase().includes(q) ||
      (p.currentRole || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q);
    const matchSkill = !filterSkill || p.skills.includes(filterSkill);
    return matchSearch && matchSkill;
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/student/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveMsg(data.error || "Failed to save");
        return;
      }
      setSaveMsg("Profile saved successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/[0.06] rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Our Alumni Network</h1>
          <p className="text-sm text-text-muted mt-1">
            Connect with graduates who have built successful careers
          </p>
        </div>
        <button
          onClick={() => setShowProfileForm(!showProfileForm)}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors"
        >
          <User size={16} />
          {showProfileForm ? "Hide Profile Form" : "Update Your Profile"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neon-blue/10">
                <Users size={20} className="text-neon-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalAlumni}</p>
                <p className="text-xs text-text-muted">Total Alumni</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <Building2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.companyCount}</p>
                <p className="text-xs text-text-muted">Companies</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <PoundSterling size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.avgSalary > 0 ? `\u00a3${stats.avgSalary.toLocaleString()}` : "N/A"}
                </p>
                <p className="text-xs text-text-muted">Avg Salary</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Update Form */}
      {showProfileForm && (
        <div className="glass-card rounded-xl p-6 border border-white/[0.06] space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Update Your Alumni Profile</h2>
          <p className="text-sm text-text-muted">
            Only available for students with COMPLETED or Alumni status.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Headline (e.g. PLC Engineer at Siemens)"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Current Company"
              value={form.currentCompany}
              onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Current Role"
              value={form.currentRole}
              onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={form.linkedInUrl}
              onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Salary Range (e.g. \u00a335,000-\u00a345,000)"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
          </div>
          <input
            type="text"
            placeholder="Skills (comma separated: PLC, SCADA, TIA Portal)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
          />
          <textarea
            placeholder="Short bio about your career journey..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50 resize-none"
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.willingToMentor}
                onChange={(e) => setForm({ ...form, willingToMentor: e.target.checked })}
                className="rounded border-white/20 bg-white/[0.04]"
              />
              Willing to mentor
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="rounded border-white/20 bg-white/[0.04]"
              />
              Public profile
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
            {saveMsg && (
              <p className={`text-sm ${saveMsg.includes("success") ? "text-emerald-400" : "text-red-400"}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search alumni by name, company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
          />
        </div>
        <div className="relative">
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="appearance-none w-full sm:w-48 px-4 py-2.5 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Alumni Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-text-muted/30 mb-3" />
          <p className="text-text-muted">No alumni profiles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((profile) => (
            <div
              key={profile.id}
              className="glass-card rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-sm font-medium text-neon-blue shrink-0">
                  {profile.student.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {profile.student.user.name}
                  </h3>
                  {profile.headline && (
                    <p className="text-xs text-text-secondary truncate">{profile.headline}</p>
                  )}
                </div>
                {profile.willingToMentor && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-medium">
                    <Heart size={10} className="inline mr-0.5" /> Mentor
                  </span>
                )}
              </div>

              {(profile.currentCompany || profile.currentRole) && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1.5">
                  <Briefcase size={12} />
                  <span className="truncate">
                    {profile.currentRole}
                    {profile.currentRole && profile.currentCompany ? " at " : ""}
                    {profile.currentCompany}
                  </span>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                  <MapPin size={12} />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {profile.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-full bg-white/[0.06] text-text-secondary text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 5 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-text-muted text-[11px]">
                      +{profile.skills.length - 5}
                    </span>
                  )}
                </div>
              )}

              {profile.linkedInUrl && (
                <a
                  href={profile.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-neon-blue hover:text-neon-blue/80 transition-colors"
                >
                  <Globe size={12} />
                  View LinkedIn
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
