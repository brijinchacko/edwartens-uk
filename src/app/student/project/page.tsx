"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileCode,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  File,
} from "lucide-react";

interface ProjectSubmission {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  status: string;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
  gradedBy: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  SUBMITTED: { label: "Submitted", color: "text-neon-blue", bg: "bg-neon-blue/10", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Eye },
  APPROVED: { label: "Approved", color: "text-neon-green", bg: "bg-neon-green/10", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
};

export default function ProjectPage() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/student/project");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("file", file);

      const res = await fetch("/api/student/project", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess("Project submitted successfully!");
      setTitle("");
      setDescription("");
      if (inputRef.current) inputRef.current.value = "";
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit project");
    } finally {
      setSubmitting(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          Project Submission
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Submit your project within 1 week of training completion.
        </p>
      </div>

      {/* Requirements */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          Project Requirements
        </h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>- Submit within 1 week of training completion</li>
          <li>- Include all source files and documentation</li>
          <li>- Provide a clear project title and description</li>
          <li>- Accepted formats: ZIP, RAR, PDF, or individual project files</li>
          <li>- Maximum file size: 50MB</li>
        </ul>
      </div>

      {/* Submission Form */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FileCode size={16} className="text-neon-blue" />
          Submit Project
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your project title"
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/50"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, approach, and key features"
              rows={4}
              className="w-full px-3 py-2 bg-dark-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">
              Project File *
            </label>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,.rar,.pdf,.py,.ipynb,.doc,.docx,.pptx"
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-neon-blue/10 file:text-neon-blue hover:file:bg-neon-blue/20"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg text-sm text-neon-green">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {submitting ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      </div>

      {/* Previous Submissions */}
      {submissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Your Submissions
          </h3>
          {submissions.map((sub) => {
            const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.SUBMITTED;
            const StatusIcon = statusCfg.icon;
            return (
              <div key={sub.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File size={18} className="text-neon-blue" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {sub.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        Submitted{" "}
                        {new Date(sub.submittedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Europe/London",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${statusCfg.color} ${statusCfg.bg}`}>
                    <StatusIcon size={12} />
                    {statusCfg.label}
                  </span>
                </div>

                {sub.description && (
                  <p className="text-xs text-text-secondary">{sub.description}</p>
                )}

                {sub.grade && (
                  <div className="p-3 bg-dark-primary/50 rounded-lg">
                    <p className="text-xs text-text-muted">
                      Grade: <span className="text-neon-green font-medium">{sub.grade}</span>
                    </p>
                  </div>
                )}

                {sub.feedback && (
                  <div className="p-3 bg-dark-primary/50 rounded-lg">
                    <p className="text-xs text-text-muted">Feedback:</p>
                    <p className="text-sm text-text-secondary mt-1">{sub.feedback}</p>
                  </div>
                )}

                {sub.fileUrl && (
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neon-blue hover:underline"
                  >
                    View Submitted File
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
