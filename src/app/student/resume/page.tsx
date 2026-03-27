"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Loader2,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface ResumeReview {
  id: string;
  sessionNumber: number;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
  status: string;
}

interface ResumeData {
  cvUrl: string | null;
  cvName: string | null;
  reviews: ResumeReview[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  SCHEDULED: { label: "Scheduled", color: "text-neon-blue", bg: "bg-neon-blue/10" },
  COMPLETED: { label: "Completed", color: "text-neon-green", bg: "bg-neon-green/10" },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10" },
};

export default function ResumePage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/student/resume");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadCV = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "upload_cv");

      const res = await fetch("/api/student/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Upload failed");
      }

      setSuccess("CV uploaded successfully!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRequestReview = async () => {
    setError("");
    setSuccess("");
    setRequesting(true);

    try {
      const formData = new FormData();
      formData.append("action", "request_review");

      const res = await fetch("/api/student/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Request failed");
      }

      setSuccess("Review session requested successfully!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  const reviewCount = data?.reviews?.length || 0;
  const canRequestReview = reviewCount < 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Resume & CV</h1>
        <p className="text-sm text-text-muted mt-1">
          Download the resume template, upload your CV, and request review sessions.
        </p>
      </div>

      {/* Template Download */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Download size={16} className="text-neon-blue" />
          Resume Template
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Download the EDWartens resume template to get started. Fill in your details and upload it below.
        </p>
        <a
          href="/templates/resume-template.docx"
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors"
        >
          <Download size={16} />
          Download Template
        </a>
      </div>

      {/* Upload CV */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Upload size={16} className="text-neon-blue" />
          Your CV
        </h3>

        {data?.cvUrl ? (
          <div className="mb-4 p-3 bg-dark-primary/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-neon-green" />
              <div>
                <p className="text-sm text-text-primary">{data.cvName || "CV"}</p>
                <p className="text-xs text-text-muted">Currently uploaded</p>
              </div>
            </div>
            <a
              href={data.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neon-blue hover:underline"
            >
              View
            </a>
          </div>
        ) : (
          <p className="text-xs text-text-muted mb-4">No CV uploaded yet.</p>
        )}

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-neon-blue/10 file:text-neon-blue hover:file:bg-neon-blue/20"
            onChange={(e) => handleUploadCV(e.target.files)}
          />
          {uploading && <Loader2 size={16} className="animate-spin text-neon-blue" />}
        </div>
      </div>

      {/* Messages */}
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

      {/* Review Sessions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare size={16} className="text-purple" />
            Resume Review Sessions ({reviewCount}/3)
          </h3>
          {canRequestReview && (
            <button
              onClick={handleRequestReview}
              disabled={requesting}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-xs font-medium hover:bg-neon-blue/20 transition-colors disabled:opacity-50"
            >
              {requesting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Calendar size={14} />
              )}
              Request Review
            </button>
          )}
        </div>

        {data?.reviews && data.reviews.length > 0 ? (
          <div className="space-y-3">
            {data.reviews.map((review) => {
              const statusCfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.PENDING;
              return (
                <div
                  key={review.id}
                  className="p-3 bg-dark-primary/50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-text-primary">
                      Session {review.sessionNumber}
                    </p>
                    {review.scheduledAt && (
                      <p className="text-xs text-text-muted">
                        Scheduled:{" "}
                        {new Date(review.scheduledAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {review.notes && (
                      <p className="text-xs text-text-secondary mt-1">
                        {review.notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${statusCfg.color} ${statusCfg.bg}`}>
                    {statusCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No review sessions yet. Request one to get feedback on your CV.
          </p>
        )}

        {!canRequestReview && (
          <p className="text-xs text-text-muted mt-3">
            You have reached the maximum of 3 review sessions.
          </p>
        )}
      </div>
    </div>
  );
}
