"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  PenTool,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Type,
  Pencil,
  Shield,
} from "lucide-react";

interface DocumentInfo {
  type: string;
  label: string;
  description: string;
  signed: boolean;
  signedAt: string | null;
  signatureType: string | null;
  verified: boolean;
}

const DOCUMENT_ICON_COLORS: Record<string, string> = {
  TERMS_AND_CONDITIONS: "text-blue-400",
  ENROLLMENT_AGREEMENT: "text-purple-400",
  PHOTO_CONSENT: "text-amber-400",
};

export default function SignDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingDoc, setSigningDoc] = useState<DocumentInfo | null>(null);
  const [signatureMode, setSignatureMode] = useState<"TYPED" | "DRAWN">("TYPED");
  const [typedName, setTypedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/student/sign");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (signingDoc && signatureMode === "DRAWN") {
      // Small delay so canvas is mounted
      setTimeout(initCanvas, 100);
    }
  }, [signingDoc, signatureMode, initCanvas]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    initCanvas();
  };

  const handleSubmit = async () => {
    if (!signingDoc) return;
    setSubmitting(true);
    setError(null);

    try {
      let signatureData: string;

      if (signatureMode === "TYPED") {
        if (!typedName.trim()) throw new Error("Please type your name");
        signatureData = typedName.trim();
      } else {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not ready");
        signatureData = canvas.toDataURL("image/png");
      }

      const res = await fetch("/api/student/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: signingDoc.type,
          signature: signatureData,
          signatureType: signatureMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit signature");

      setSigningDoc(null);
      setTypedName("");
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-neon-blue" size={32} />
      </div>
    );
  }

  const signed = documents.filter((d) => d.signed);
  const unsigned = documents.filter((d) => !d.signed);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <PenTool className="text-neon-blue" size={28} />
          Sign Documents
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review and sign required documents for your enrollment
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Signing Progress</span>
          <span className="text-sm font-medium text-text-primary">
            {signed.length}/{documents.length} completed
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${documents.length > 0 ? (signed.length / documents.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Unsigned documents */}
      {unsigned.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Clock size={14} />
            Awaiting Your Signature ({unsigned.length})
          </h2>
          {unsigned.map((doc) => (
            <div
              key={doc.type}
              className="glass-card rounded-xl p-5 border border-amber-500/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileText
                    size={20}
                    className={DOCUMENT_ICON_COLORS[doc.type] || "text-gray-400"}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {doc.label}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSigningDoc(doc);
                    setSignatureMode("TYPED");
                    setTypedName("");
                    setError(null);
                  }}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors text-sm font-medium"
                >
                  <PenTool size={14} />
                  Sign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signed documents */}
      {signed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Signed Documents ({signed.length})
          </h2>
          {signed.map((doc) => (
            <div
              key={doc.type}
              className="glass-card rounded-xl p-5 border border-emerald-500/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileText
                    size={20}
                    className={DOCUMENT_ICON_COLORS[doc.type] || "text-gray-400"}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {doc.label}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Signed {doc.signedAt ? new Date(doc.signedAt).toLocaleDateString("en-GB") : ""}
                      </span>
                      <span className="text-xs text-text-muted">
                        {doc.signatureType === "DRAWN" ? "Hand-drawn" : "Typed"} signature
                      </span>
                      {doc.verified && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <Shield size={12} />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signing Modal */}
      {signingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Sign: {signingDoc.label}
              </h3>
              <button
                onClick={() => setSigningDoc(null)}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document text */}
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] max-h-40 overflow-y-auto">
              <p className="text-sm text-text-secondary leading-relaxed">
                {signingDoc.description}
              </p>
              <p className="text-xs text-text-muted mt-3">
                By signing below, you acknowledge that you have read and agree to the above terms.
                This signature is legally binding and will be recorded with your IP address and timestamp.
              </p>
            </div>

            {/* Signature mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setSignatureMode("TYPED")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  signatureMode === "TYPED"
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "bg-white/[0.03] text-text-secondary border border-white/[0.06] hover:bg-white/[0.05]"
                }`}
              >
                <Type size={14} />
                Type Name
              </button>
              <button
                onClick={() => setSignatureMode("DRAWN")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  signatureMode === "DRAWN"
                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                    : "bg-white/[0.03] text-text-secondary border border-white/[0.06] hover:bg-white/[0.05]"
                }`}
              >
                <Pencil size={14} />
                Draw Signature
              </button>
            </div>

            {/* Signature input */}
            {signatureMode === "TYPED" ? (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Type your full legal name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.08] text-text-primary text-lg font-serif italic focus:outline-none focus:border-neon-blue/50"
                  placeholder="Your full name"
                  autoFocus
                />
                {typedName && (
                  <div className="mt-3 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
                    <p className="text-2xl font-serif italic text-text-primary">
                      {typedName}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">Signature preview</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Draw your signature below
                  </label>
                  <button
                    onClick={clearCanvas}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  className="w-full h-32 rounded-lg border border-white/[0.08] cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawing}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSigningDoc(null)}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || (signatureMode === "TYPED" && !typedName.trim())}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <PenTool size={14} />
                    Sign Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
