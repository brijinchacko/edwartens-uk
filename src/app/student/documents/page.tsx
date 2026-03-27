"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  File,
  Image as ImageIcon,
} from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  reviewNote: string | null;
  uploadedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  UPLOADED: {
    label: "Pending Review",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    icon: Clock,
  },
  VERIFIED: {
    label: "Verified",
    color: "text-neon-green",
    bg: "bg-neon-green/10",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-500/10",
    icon: XCircle,
  },
};

const DOC_TYPES = [
  "All",
  "ID Proof",
  "Qualification",
  "CV",
  "Other",
];

function getFileIcon(mimeType: string | null) {
  if (mimeType?.startsWith("image/")) return ImageIcon;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("All");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/student/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds 10MB limit`);
          setUploading(false);
          return;
        }
        formData.append("files", file);
      }

      const res = await fetch("/api/student/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(`${files.length} file(s) uploaded successfully`);
      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload files"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const filteredDocs =
    filter === "All"
      ? documents
      : documents.filter((d) =>
          d.type.toLowerCase().includes(filter.toLowerCase())
        );

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
        <h1 className="text-xl font-bold text-text-primary">Documents</h1>
        <p className="text-sm text-text-muted mt-1">
          Upload and manage your documents
        </p>
      </div>

      {/* Info Note */}
      <div className="p-3 bg-neon-blue/5 border border-neon-blue/10 rounded-lg text-xs text-text-secondary">
        Documents cannot be deleted by students. Contact your admission counsellor
        if you need to update a document.
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-neon-blue/50 bg-neon-blue/5"
            : "border-border hover:border-neon-blue/30 hover:bg-white/[0.01]"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-neon-blue" />
            <p className="text-sm text-text-secondary">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-sm text-text-primary font-medium">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-text-muted mt-1">
              PDF, JPG, PNG (max 10MB per file)
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
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

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={14} className="text-text-muted shrink-0" />
        {DOC_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === type
                ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                : "bg-dark-tertiary text-text-muted hover:text-text-secondary border border-transparent"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">
            {documents.length === 0
              ? "No documents uploaded yet."
              : "No documents match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.UPLOADED;
            const StatusIcon = statusConfig.icon;
            const FileIcon = getFileIcon(doc.mimeType);

            return (
              <div
                key={doc.id}
                className="glass-card p-4 flex items-center gap-4"
              >
                {/* File Icon */}
                <div className="w-10 h-10 rounded-lg bg-dark-primary flex items-center justify-center shrink-0">
                  <FileIcon size={18} className="text-neon-blue" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-text-muted">{doc.type}</span>
                    <span className="text-xs text-text-muted">
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {doc.reviewNote && (
                    <p className="text-xs text-text-muted mt-1">
                      Note: {doc.reviewNote}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded shrink-0 ${statusConfig.color} ${statusConfig.bg}`}
                >
                  <StatusIcon size={12} />
                  {statusConfig.label}
                </span>

                {/* View Link */}
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neon-blue hover:underline shrink-0"
                >
                  View
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
