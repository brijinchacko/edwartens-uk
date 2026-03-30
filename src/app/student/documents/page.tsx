"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  File,
  Image as ImageIcon,
  Shield,
  GraduationCap,
  FileCheck,
  Download,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  UPLOADED: { label: "Pending Review", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock },
  VERIFIED: { label: "Verified", color: "text-neon-green", bg: "bg-neon-green/10", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
};

const UPLOAD_CATEGORIES = [
  {
    type: "ID_PROOF",
    label: "ID Proof",
    description: "Passport, Driving Licence, or National ID",
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    required: true,
    matchTypes: ["ID Proof", "ID_PROOF", "PASSPORT", "DRIVING_LICENCE"],
  },
  {
    type: "QUALIFICATION",
    label: "Qualification Certificate",
    description: "Degree, Diploma, or equivalent certificate",
    icon: GraduationCap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    required: true,
    matchTypes: ["Qualification", "QUALIFICATION", "DEGREE", "DIPLOMA"],
  },
  {
    type: "CV",
    label: "CV / Resume",
    description: "Your latest CV or Resume (PDF preferred)",
    icon: FileCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    required: true,
    matchTypes: ["CV", "RESUME", "Resume"],
  },
  {
    type: "OTHER",
    label: "Other Documents",
    description: "Any additional supporting documents",
    icon: FileText,
    color: "text-text-muted",
    bg: "bg-white/[0.05]",
    required: false,
    matchTypes: ["OTHER", "Other", "PAYMENT_PROOF", "TERMS", "SHARE_CODE"],
  },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/student/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleUpload = async (file: File, docType: string) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingType(docType);

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("type", docType);

      const res = await fetch("/api/student/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(`${docType.replace(/_/g, " ")} uploaded successfully`);
      await loadDocuments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setUploadingType(null);
      const ref = inputRefs.current[docType];
      if (ref) ref.value = "";
    }
  };

  const getDocsForCategory = (cat: typeof UPLOAD_CATEGORIES[0]) => {
    return documents.filter((d) =>
      cat.matchTypes.some((t) => d.type === t || d.type.toLowerCase() === t.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Documents</h1>
        <p className="text-sm text-text-muted mt-1">
          Upload and manage your required documents. Items marked with * are mandatory.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          <CheckCircle2 size={14} /> {success}
        </div>
      )}

      {/* Upload Categories */}
      <div className="space-y-4">
        {UPLOAD_CATEGORIES.map((cat) => {
          const docs = getDocsForCategory(cat);
          const hasUpload = docs.length > 0;
          const isVerified = docs.some((d) => d.status === "VERIFIED");
          const isUploading = uploadingType === cat.type;
          const Icon = cat.icon;

          return (
            <div key={cat.type} className={`glass-card rounded-xl border ${
              isVerified ? "border-neon-green/20" : hasUpload ? "border-yellow-500/20" : "border-white/[0.06]"
            }`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={cat.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {cat.label} {cat.required && <span className="text-red-400">*</span>}
                      </h3>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green text-[10px] font-medium">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                      {hasUpload && !isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-medium">
                          <Clock size={10} /> Pending Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>

                    {/* Uploaded files for this category */}
                    {docs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {docs.map((doc) => {
                          const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.UPLOADED;
                          const StatusIcon = st.icon;
                          return (
                            <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                              <StatusIcon size={14} className={st.color} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-text-primary truncate">{doc.name}</p>
                                <p className="text-[10px] text-text-muted">
                                  {formatFileSize(doc.fileSize)} · {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}
                                </p>
                              </div>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-text-muted hover:text-neon-blue transition-colors"
                              >
                                <Download size={12} />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Upload button */}
                    <div className="mt-3">
                      <input
                        ref={(el) => { inputRefs.current[cat.type] = el; }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file, cat.type);
                        }}
                      />
                      <button
                        onClick={() => inputRefs.current[cat.type]?.click()}
                        disabled={isUploading}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-xs font-medium transition-colors ${
                          hasUpload
                            ? "border-white/[0.1] text-text-muted hover:border-neon-blue/30 hover:text-neon-blue"
                            : "border-neon-blue/20 text-neon-blue bg-neon-blue/[0.03] hover:bg-neon-blue/[0.06]"
                        } disabled:opacity-50`}
                      >
                        {isUploading ? (
                          <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload size={12} /> {hasUpload ? "Upload New Version" : `Upload ${cat.label}`}</>
                        )}
                      </button>
                    </div>

                    {/* Rejection note */}
                    {docs.some((d) => d.status === "REJECTED" && d.reviewNote) && (
                      <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                        <strong>Rejection reason:</strong> {docs.find((d) => d.status === "REJECTED")?.reviewNote}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
