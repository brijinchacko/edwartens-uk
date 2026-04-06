"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Trash2, Download, Loader2, X, FolderOpen } from "lucide-react";

interface Doc {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploaderName: string | null;
  notes: string | null;
  expiryDate: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: "IDENTITY", label: "Identity Proof" },
  { value: "CONTRACT", label: "Contract / Offer Letter" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "PAYSLIP", label: "Payslip" },
  { value: "GENERAL", label: "General" },
  { value: "OTHER", label: "Other" },
];

const CATEGORY_COLORS: Record<string, string> = {
  IDENTITY: "bg-purple-500/20 text-purple-400",
  CONTRACT: "bg-blue-500/20 text-blue-400",
  CERTIFICATE: "bg-green-500/20 text-green-400",
  PAYSLIP: "bg-yellow-500/20 text-yellow-400",
  GENERAL: "bg-gray-500/20 text-gray-400",
  OTHER: "bg-white/10 text-white/50",
};

export default function EmployeeDocuments({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("GENERAL");
  const [docNotes, setDocNotes] = useState("");
  const [docExpiry, setDocExpiry] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    fetch(`/api/admin/employees/${employeeId}/documents?${params}`)
      .then((r) => r.json())
      .then((d) => setDocs(d.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, [employeeId, categoryFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !docName) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", docName);
    formData.append("category", docCategory);
    if (docNotes) formData.append("notes", docNotes);
    if (docExpiry) formData.append("expiryDate", docExpiry);

    try {
      const res = await fetch(`/api/admin/employees/${employeeId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setShowUpload(false);
        setDocName("");
        setDocNotes("");
        setDocExpiry("");
        setDocCategory("GENERAL");
        if (fileRef.current) fileRef.current.value = "";
        fetchDocs();
      }
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/admin/employees/${employeeId}/documents?docId=${docId}`, { method: "DELETE" });
    fetchDocs();
  };

  const fmtSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Documents for {employeeName}
          <span className="text-white/30 text-xs">({docs.length})</span>
        </h3>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-1 px-2 py-1 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded text-xs hover:bg-neon-green/30 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">Document Name *</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                placeholder="e.g. Passport, Offer Letter"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">Category</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">File *</label>
              <input
                ref={fileRef}
                type="file"
                required
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-white/10 file:text-white/60 file:text-[10px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 mb-0.5 block">Expiry Date</label>
              <input
                type="date"
                value={docExpiry}
                onChange={(e) => setDocExpiry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-0.5 block">Notes</label>
            <input
              type="text"
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
              placeholder="Optional notes"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-1 px-3 py-1.5 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded text-xs disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button type="button" onClick={() => setShowUpload(false)} className="px-3 py-1.5 text-white/40 text-xs hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Documents List */}
      {loading ? (
        <p className="text-xs text-white/30 py-2">Loading...</p>
      ) : docs.length === 0 ? (
        <p className="text-xs text-white/30 py-2">No documents uploaded yet</p>
      ) : (
        <div className="space-y-1.5">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between bg-white/[0.03] rounded px-3 py-2 group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-white/30 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{doc.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.OTHER}`}>
                      {CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    {doc.fileSize && <span>{fmtSize(doc.fileSize)}</span>}
                    <span>{new Date(doc.createdAt).toLocaleDateString("en-GB")}</span>
                    {doc.uploaderName && <span>by {doc.uploaderName}</span>}
                    {doc.expiryDate && (
                      <span className={new Date(doc.expiryDate) < new Date() ? "text-red-400" : "text-white/30"}>
                        Expires: {new Date(doc.expiryDate).toLocaleDateString("en-GB")}
                      </span>
                    )}
                    {doc.notes && <span className="truncate max-w-[200px]">{doc.notes}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-white/40 hover:text-neon-blue transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 text-white/40 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
