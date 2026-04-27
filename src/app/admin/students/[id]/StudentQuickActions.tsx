"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Award, KeyRound, Copy, Check, X } from "lucide-react";

const DOCUMENT_TYPES = [
  "ID_PROOF",
  "QUALIFICATION",
  "RESUME",
  "CV",
  "PAYMENT_PROOF",
  "TERMS_AND_CONDITIONS",
  "PHOTO",
  "OTHER",
];

const DOC_TYPE_LABELS: Record<string, string> = {
  ID_PROOF: "ID Proof",
  QUALIFICATION: "Qualification",
  RESUME: "Resume",
  CV: "CV",
  PAYMENT_PROOF: "Payment Proof",
  TERMS_AND_CONDITIONS: "Terms and Conditions",
  PHOTO: "Photo",
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

  // Password reset state
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetCreds, setResetCreds] = useState<{ email: string; tempPassword: string } | null>(null);
  const [resetError, setResetError] = useState("");
  const [copiedField, setCopiedField] = useState<"email" | "password" | null>(null);

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
    const amountStr = prompt("Enter invoice amount (£):", "2568");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setInvoiceMsg("Invalid amount");
      return;
    }
    const description = prompt("Description (optional):", "Professional Module — PLC, SCADA & HMI Training") || undefined;

    setGeneratingInvoice(true);
    setInvoiceMsg("");

    try {
      const res = await fetch("/api/admin/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, amount, description }),
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

  async function handleResetPassword() {
    const ok = window.confirm(
      `Reset login password for ${studentName}?\n\nThe student's current password will stop working immediately. You will be shown the new password ONCE — copy and share it with the student.`
    );
    if (!ok) return;

    setResettingPassword(true);
    setResetError("");

    try {
      const res = await fetch(`/api/admin/students/${studentId}/reset-password`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setResetError(err.error || "Failed to reset password");
        return;
      }
      const data = await res.json();
      setResetCreds({ email: data.email, tempPassword: data.tempPassword });
    } catch {
      setResetError("Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  }

  async function copyToClipboard(text: string, field: "email" | "password") {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Clipboard may be unavailable — silently ignore; user can copy manually.
    }
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

        {/* Reset Login Password — generates a fresh password and shows it
            once so the admin can share it with the student manually. Use
            this when the welcome email never arrived or the student
            forgot their password. */}
        <button
          onClick={handleResetPassword}
          disabled={resettingPassword}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          <KeyRound size={14} />
          {resettingPassword ? "Resetting..." : "Reset Login"}
        </button>
      </div>

      {/* Reset error feedback (failure path only — success opens the modal) */}
      {resetError && (
        <p className="text-xs text-red-400 mb-3">{resetError}</p>
      )}

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

      {/* One-time credentials modal — backdrop click is intentionally
          inert so the admin can't accidentally dismiss before saving the
          password. Same pattern as the lead Add/Update modals. */}
      {resetCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">New Login Credentials</h3>
              <button
                onClick={() => setResetCreds(null)}
                className="text-text-muted hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <p className="text-xs text-amber-300">
                  This password is shown <strong>once</strong>. Copy it now and
                  share it with the student — it cannot be retrieved again.
                </p>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">Login URL</label>
                <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-text-secondary break-all">
                  /login
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white break-all font-mono">
                    {resetCreds.email}
                  </div>
                  <button
                    onClick={() => copyToClipboard(resetCreds.email, "email")}
                    className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-muted hover:text-white"
                    aria-label="Copy email"
                  >
                    {copiedField === "email" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-green-400 break-all font-mono select-all">
                    {resetCreds.tempPassword}
                  </div>
                  <button
                    onClick={() => copyToClipboard(resetCreds.tempPassword, "password")}
                    className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-muted hover:text-white"
                    aria-label="Copy password"
                  >
                    {copiedField === "password" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-muted">
                The student should sign in at <span className="text-white">/login</span> using
                the <strong>Student</strong> tab and change their password after the
                first login.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setResetCreds(null)}
                  className="px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue border border-neon-blue/30 text-xs font-medium hover:bg-neon-blue/30 transition-colors"
                >
                  I&apos;ve saved it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
