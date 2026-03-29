"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, RotateCcw, Loader2 } from "lucide-react";

interface Props {
  certId: string;
  certNo: string;
  studentName: string;
  isValid: boolean;
}

export default function CertificateActions({ certId, certNo, studentName, isValid }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDelete = async () => {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/certificates/${certId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setShowConfirm(false);
      router.refresh();
    } catch {
      alert("Failed to delete certificate");
    } finally {
      setLoading("");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("upload");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/certificates/${certId}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to upload certificate");
    } finally {
      setLoading("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleToggleValid = async () => {
    setLoading("toggle");
    try {
      const res = await fetch(`/api/admin/certificates/${certId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isValid: !isValid }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to update certificate");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Upload custom certificate */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={!!loading}
        className="p-1.5 rounded text-text-muted hover:text-neon-blue hover:bg-neon-blue/10 transition-colors disabled:opacity-50"
        title="Upload certificate file"
      >
        {loading === "upload" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
      </button>

      {/* Revoke / Revalidate */}
      <button
        onClick={handleToggleValid}
        disabled={!!loading}
        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
          isValid
            ? "text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10"
            : "text-text-muted hover:text-neon-green hover:bg-neon-green/10"
        }`}
        title={isValid ? "Revoke certificate" : "Revalidate certificate"}
      >
        {loading === "toggle" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
      </button>

      {/* Delete */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={!!loading}
        className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        title="Delete certificate"
      >
        {loading === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>

      {/* Confirm delete modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl p-6">
            <h3 className="text-white font-semibold mb-2">Delete Certificate</h3>
            <p className="text-sm text-text-muted mb-4">
              Are you sure you want to delete certificate <span className="text-white font-mono">{certNo}</span> for <span className="text-white">{studentName}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-text-secondary text-sm hover:bg-white/[0.03] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading === "delete"}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
