"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  PoundSterling,
  ExternalLink,
  Search,
  ChevronDown,
  Clock,
  Building2,
  BadgeCheck,
} from "lucide-react";

interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  type: string;
  description: string;
  applyUrl: string | null;
  postedById: string | null;
  isActive: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
};

const TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-emerald-500/10 text-emerald-400",
  PART_TIME: "bg-amber-500/10 text-amber-400",
  CONTRACT: "bg-purple-500/10 text-purple-400",
};

export default function StudentJobBoardPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetch("/api/admin/job-board")
      .then((res) => res.json())
      .then((data) => setJobs((data.jobs || []).filter((j: JobPost) => j.isActive)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const locations = [...new Set(jobs.map((j) => j.location))].sort();

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q);
    const matchType = !filterType || j.type === filterType;
    const matchLocation = !filterLocation || j.location === filterLocation;
    return matchSearch && matchType && matchLocation;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/[0.06] rounded w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Job Board</h1>
        <p className="text-sm text-text-muted mt-1">
          Explore job opportunities curated for EDWartens graduates
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
          />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none w-full sm:w-40 px-4 py-2.5 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="appearance-none w-full sm:w-44 px-4 py-2.5 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Job Count */}
      <p className="text-sm text-text-muted">
        {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Job Listings */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-text-muted/30 mb-3" />
          <p className="text-text-muted">No jobs available at the moment</p>
          <p className="text-xs text-text-muted mt-1">Check back soon for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-text-primary">{job.title}</h3>
                    {job.postedById && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-medium">
                        <BadgeCheck size={10} />
                        EDWartens
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary mb-3">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={14} />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1.5">
                        <PoundSterling size={14} />
                        {job.salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatDate(job.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted line-clamp-2 mb-3">{job.description}</p>

                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[job.type] || "bg-white/[0.06] text-text-secondary"}`}>
                    {TYPE_LABELS[job.type] || job.type}
                  </span>
                </div>

                {job.applyUrl && (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors"
                  >
                    Apply
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
