"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  PoundSterling,
  TrendingUp,
  Search,
  Plus,
  MapPin,
  Briefcase,
  Loader2,
  X,
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
  isPublic: boolean;
  createdAt: string;
  student: {
    user: { name: string; email: string; avatar: string | null };
    batch: { name: string; course: string } | null;
    placements: { company: string; role: string; salary: number | null; status: string }[];
  };
}

interface Stats {
  totalAlumni: number;
  totalStudents: number;
  completedStudents: number;
  placedPercentage: number;
  avgSalary: number;
  topCompanies: { name: string; count: number }[];
}

interface JobForm {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  applyUrl: string;
}

export default function AdminAlumniNetworkPage() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobMsg, setJobMsg] = useState("");

  const [jobForm, setJobForm] = useState<JobForm>({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "FULL_TIME",
    description: "",
    applyUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/alumni-network")
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.profiles || []);
        setStats(data.stats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.student.user.name.toLowerCase().includes(q) ||
      (p.currentCompany || "").toLowerCase().includes(q) ||
      (p.currentRole || "").toLowerCase().includes(q) ||
      p.student.user.email.toLowerCase().includes(q)
    );
  });

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description) {
      setJobMsg("Title, company, location, and description are required");
      return;
    }
    setJobSaving(true);
    setJobMsg("");
    try {
      const res = await fetch("/api/admin/job-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setJobMsg(data.error || "Failed to post job");
        return;
      }
      setJobMsg("Job posted successfully!");
      setJobForm({ title: "", company: "", location: "", salary: "", type: "FULL_TIME", description: "", applyUrl: "" });
      setTimeout(() => {
        setJobMsg("");
        setShowJobForm(false);
      }, 2000);
    } catch {
      setJobMsg("Failed to post job");
    } finally {
      setJobSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/[0.06] rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/[0.04] rounded-xl" />
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
          <h1 className="text-2xl font-bold text-text-primary">Alumni Network</h1>
          <p className="text-sm text-text-muted mt-1">Manage alumni profiles and job postings</p>
        </div>
        <button
          onClick={() => setShowJobForm(!showJobForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors"
        >
          <Plus size={16} />
          Post Job
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neon-blue/10">
                <Users size={20} className="text-neon-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalAlumni}</p>
                <p className="text-xs text-text-muted">Alumni Profiles</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.placedPercentage}%</p>
                <p className="text-xs text-text-muted">Placed Rate</p>
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
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10">
                <Building2 size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.topCompanies.length}</p>
                <p className="text-xs text-text-muted">Top Companies</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Companies */}
      {stats && stats.topCompanies.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Top Hiring Companies</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topCompanies.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-text-secondary"
              >
                <Building2 size={14} />
                {c.name}
                <span className="text-xs text-text-muted">({c.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Post Job Form */}
      {showJobForm && (
        <div className="glass-card rounded-xl p-6 border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Post a Job</h2>
            <button onClick={() => setShowJobForm(false)} className="text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Job Title *"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Company *"
              value={jobForm.company}
              onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Location *"
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <input
              type="text"
              placeholder="Salary (e.g. \u00a330,000-\u00a340,000)"
              value={jobForm.salary}
              onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
            <select
              value={jobForm.type}
              onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
            <input
              type="url"
              placeholder="Apply URL"
              value={jobForm.applyUrl}
              onChange={(e) => setJobForm({ ...jobForm, applyUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
            />
          </div>
          <textarea
            placeholder="Job Description *"
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50 resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handlePostJob}
              disabled={jobSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
            >
              {jobSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Post Job
            </button>
            {jobMsg && (
              <p className={`text-sm ${jobMsg.includes("success") ? "text-emerald-400" : "text-red-400"}`}>
                {jobMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search alumni by name, email, company, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
        />
      </div>

      {/* Alumni Table */}
      <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-xs font-medium text-text-muted">Name</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Company</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Role</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Location</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Salary</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Skills</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Batch</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    No alumni profiles found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-text-primary">{p.student.user.name}</p>
                        <p className="text-xs text-text-muted">{p.student.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary">{p.currentCompany || "-"}</td>
                    <td className="p-4 text-text-secondary">{p.currentRole || "-"}</td>
                    <td className="p-4 text-text-secondary">
                      {p.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {p.location}
                        </span>
                      )}
                      {!p.location && "-"}
                    </td>
                    <td className="p-4 text-text-secondary">{p.salary || "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[11px] text-text-muted">
                            {s}
                          </span>
                        ))}
                        {p.skills.length > 3 && (
                          <span className="text-[11px] text-text-muted">+{p.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-text-muted text-xs">
                      {p.student.batch?.name || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
