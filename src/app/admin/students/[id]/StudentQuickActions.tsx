"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Award } from "lucide-react";

const DOCUMENT_TYPES = [
  "ID_PROOF",
  "QUALIFICATION",
  "RESUME",
  "CV",
  "PAYMENT_PROOF",
  "OTHER",
];

const DOC_TYPE_LABELS: Record<string, string> = {
  ID_PROOF: "ID Proof",
  QUALIFICATION: "Qualification",
  RESUME: "Resume",
  CV: "CV",
  PAYMENT_PROOF: "Payment Proof",
  OTHER: "Other",
};

interface StudentQuickActionsProps {
  studentId: string;
  studentName: string;
  canSeeRevenue: boolean;
}

export default function StudentQuickActions({
  studentId,
  studentName,
  canSeeRevenue,
}: StudentQuickActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload document state
  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState("OTHER");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  // Invoice state
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceMsg, setInvoiceMsg] = useState("");

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadMsg("Please select a file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadMsg("File size exceeds 10MB limit");
      return;
    }

    setUploading(true);
    setUploadMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);
      formData.append("name", file.name);

      const res = await fetch(`/api/admin/students/${studentId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setUploadMsg(err.error || "Upload failed");
      } else {
        setUploadMsg("Document uploaded successfully");
        setShowUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      }
    } catch {
      setUploadMsg("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerateInvoice() {
    setGeneratingInvoice(true);
    setInvoiceMsg("");

    try {
      const res = await fetch("/api/admin/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setInvoiceMsg(err.error || "Invoice generation failed");
      } else {
        const data = await res.json();
        setInvoiceMsg(
          data.message || `Invoice ${data.invoiceNumber || ""} generated`
        );
        router.refresh();
      }
    } catch {
      setInvoiceMsg("Invoice generation failed");
    } finally {
      setGeneratingInvoice(false);
    }
  }

  function handleIssueCertificate() {
    router.push("/admin/certificates");
  }

  return (
    <div className="glass-card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-4">
        Quick Actions
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {/* Upload Document Button */}
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium hover:bg-purple-500/20 transition-colors"
        >
          <Upload size={14} />
          Upload Document
        </button>

        {/* Generate Invoice Button */}
        {canSeeRevenue && (
          <button
            onClick={handleGenerateInvoice}
            disabled={generatingInvoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
          >
            <FileText size={14} />
            {generatingInvoice ? "Generating..." : "Generate Invoice"}
          </button>
        )}

        {/* Issue Certificate Button */}
        <button
          onClick={handleIssueCertificate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 text-xs font-medium hover:bg-neon-blue/20 transition-colors"
        >
          <Award size={14} />
          Issue Certificate
        </button>
      </div>

      {/* Invoice feedback */}
      {invoiceMsg && (
        <p
          className={`text-xs mb-3 ${invoiceMsg.includes("failed") ? "text-red-400" : "text-green-400"}`}
        >
          {invoiceMsg}
        </p>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div>
            <label className="block text-xs text-text-muted mb-1">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-dark-secondary">
                  {DOC_TYPE_LABELS[t] || t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">
              File (PDF, JPG, PNG, max 10MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              className="w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-neon-blue/10 file:text-neon-blue hover:file:bg-neon-blue/20"
            />
          </div>

          {uploadMsg && (
            <p
              className={`text-xs ${uploadMsg.includes("success") ? "text-green-400" : "text-red-400"}`}
            >
              {uploadMsg}
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue border border-neon-blue/30 text-xs font-medium hover:bg-neon-blue/30 transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}
