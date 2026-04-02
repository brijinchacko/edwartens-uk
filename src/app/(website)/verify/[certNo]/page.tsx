"use client";

import { useState, useEffect, use, type FormEvent } from "react";
import {
  ShieldCheck,
  ShieldX,
  Search,
  Loader2,
  Award,
  User,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";

interface CertificateResult {
  valid: boolean;
  certificate?: {
    certificateNo: string;
    type: string;
    issuedDate: string;
    expiryDate: string | null;
    studentName: string;
    course: string;
    isValid: boolean;
  };
  message?: string;
}

export default function VerifyCertNoPage({
  params,
}: {
  params: Promise<{ certNo: string }>;
}) {
  const { certNo } = use(params);

  const [certificateNo, setCertificateNo] = useState(
    decodeURIComponent(certNo)
  );
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [error, setError] = useState("");
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  async function verify(certNo: string, fullName: string, dob: string) {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateNo: certNo,
          name: fullName,
          dateOfBirth: dob,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-submit with just certificate number on load (for QR code scans)
  useEffect(() => {
    if (!autoSubmitted && certificateNo) {
      setAutoSubmitted(true);
      // Auto-verify with just the certificate number
      verify(certificateNo, "", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    verify(certificateNo, name, dateOfBirth);
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10 text-center">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Certificate Verification
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Verify a <span className="gradient-text">Certificate</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Certificate number has been pre-filled from the QR code. Complete
            the remaining fields to verify the certificate.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 sm:py-24">
        <div className="max-w-lg mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-2xl p-6 sm:p-10">
            <div className="w-14 h-14 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-6 mx-auto">
              <ShieldCheck size={28} className="text-neon-blue" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Certificate Number (pre-filled) */}
              <div>
                <label
                  htmlFor="certificateNo"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Certificate Number
                </label>
                <div className="relative">
                  <Hash
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="certificateNo"
                    type="text"
                    required
                    value={certificateNo}
                    onChange={(e) => setCertificateNo(e.target.value)}
                    placeholder="e.g. EDW-UK-2025-00001"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neon-blue/5 border border-neon-blue/20 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-neon-blue mt-1">
                  Pre-filled from QR code
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Full Name (as on certificate)
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-neon-blue/50 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-neon-blue text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Verify Certificate
                  </>
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <ShieldX
                  size={20}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Result: Invalid */}
            {result && !result.valid && (
              <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <ShieldX
                  size={20}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-red-300">
                    Certificate Not Found
                  </p>
                  <p className="text-sm text-red-300/70 mt-1">
                    {result.message ||
                      "The details provided do not match any certificate in our records. Please complete all fields and try again."}
                  </p>
                </div>
              </div>
            )}

            {/* Result: Valid */}
            {result && result.valid && result.certificate && (
              <div className="mt-6 p-5 rounded-lg bg-neon-green/5 border border-neon-green/20">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={20} className="text-neon-green" />
                  <span className="text-sm font-semibold text-neon-green">
                    Certificate Verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Hash size={14} className="text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted">
                        Certificate No
                      </p>
                      <p className="text-sm text-white font-medium">
                        {result.certificate.certificateNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User size={14} className="text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted">
                        Student Name
                      </p>
                      <p className="text-sm text-white font-medium">
                        {result.certificate.studentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award
                      size={14}
                      className="text-text-muted flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted">
                        Certificate Type
                      </p>
                      <p className="text-sm text-white font-medium">
                        {result.certificate.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText
                      size={14}
                      className="text-text-muted flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted">
                        Course
                      </p>
                      <p className="text-sm text-white font-medium">
                        {result.certificate.course}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar
                      size={14}
                      className="text-text-muted flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted">
                        Issued Date
                      </p>
                      <p className="text-sm text-white font-medium">
                        {new Date(
                          result.certificate.issuedDate
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Europe/London",
                        })}
                      </p>
                    </div>
                  </div>

                  {result.certificate.expiryDate && (
                    <div className="flex items-center gap-3">
                      <Calendar
                        size={14}
                        className="text-text-muted flex-shrink-0"
                      />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted">
                          Expiry Date
                        </p>
                        <p className="text-sm text-white font-medium">
                          {new Date(
                            result.certificate.expiryDate
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <span
                      className={`inline-block text-[11px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full ${
                        result.certificate.isValid
                          ? "bg-neon-green/15 text-neon-green"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {result.certificate.isValid ? "Active" : "Revoked"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-text-muted text-center mt-6">
            If you believe there is an error, please contact us at{" "}
            <a
              href="mailto:info@wartens.com"
              className="text-neon-blue hover:underline"
            >
              info@wartens.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
