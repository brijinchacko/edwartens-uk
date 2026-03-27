"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { COURSE_FEE_TOTAL, DEPOSIT_AMOUNT } from "@/lib/course-config";
import { use } from "react";

interface Props {
  params: Promise<{ courseSlug: string; batchId: string }>;
}

export default function RegisterPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-neon-blue" /></div>}>
      <RegisterContent params={params} />
    </Suspense>
  );
}

function RegisterContent({ params }: Props) {
  const { courseSlug, batchId } = use(params);
  const searchParams = useSearchParams();
  const defaultPayment = searchParams.get("payment") || "full";
  const cancelled = searchParams.get("cancelled");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [paymentType, setPaymentType] = useState<"deposit" | "full">(
    defaultPayment === "deposit" ? "deposit" : "full"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          qualification: qualification || null,
          batchId,
          paymentType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-3 sm:px-5 lg:px-6">
          {/* Back link */}
          <Link
            href={`/courses/${courseSlug}/batch/${batchId}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-neon-blue transition-colors mb-8"
          >
            <ArrowRight size={14} className="rotate-180" />
            Back to Batch Details
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Register & <span className="gradient-text">Pay</span>
          </h1>
          <p className="text-text-secondary mb-8">
            Complete the form below and proceed to secure payment.
          </p>

          {cancelled && (
            <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-400">
                Payment was cancelled. Your seat has not been reserved. You can try again below.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-primary border border-border rounded-lg text-sm text-text-primary focus:border-neon-blue/50 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-primary border border-border rounded-lg text-sm text-text-primary focus:border-neon-blue/50 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-primary border border-border rounded-lg text-sm text-text-primary focus:border-neon-blue/50 focus:outline-none transition-colors"
                    placeholder="+44 7XXX XXXXXX"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-text-secondary">Qualification</label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-primary border border-border rounded-lg text-sm text-text-primary focus:border-neon-blue/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select (optional)</option>
                    <option value="GCSE">GCSE</option>
                    <option value="A-Level">A-Level</option>
                    <option value="BTEC">BTEC / HND</option>
                    <option value="Bachelors">Bachelor&apos;s Degree</option>
                    <option value="Masters">Master&apos;s Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Payment Option</h2>

              {/* Full Payment */}
              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  paymentType === "full"
                    ? "border-neon-green/40 bg-neon-green/5"
                    : "border-border hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "full" ? "border-neon-green" : "border-text-muted"
                      }`}
                    >
                      {paymentType === "full" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-green" />
                      )}
                    </div>
                    <span className="font-semibold text-white">Pay in Full</span>
                  </div>
                  <span className="text-lg font-bold text-neon-green">
                    £{COURSE_FEE_TOTAL.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-text-muted ml-8">
                  Complete payment now. Your student account will be created automatically.
                </p>
                <div className="mt-3 ml-8 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={12} className="text-neon-blue" />
                    <span className="text-[11px] font-medium text-white">Instalment Options Available</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Pay in 3-6 interest-free instalments via <strong className="text-text-secondary">Klarna</strong> or{" "}
                    <strong className="text-text-secondary">ClearPay</strong> at checkout. Subject to credit approval.
                    Direct debit options available.
                  </p>
                </div>
              </button>

              {/* Deposit */}
              <button
                type="button"
                onClick={() => setPaymentType("deposit")}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  paymentType === "deposit"
                    ? "border-neon-blue/40 bg-neon-blue/5"
                    : "border-border hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "deposit" ? "border-neon-blue" : "border-text-muted"
                      }`}
                    >
                      {paymentType === "deposit" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-neon-blue" />
                      )}
                    </div>
                    <span className="font-semibold text-white">Secure Your Seat</span>
                  </div>
                  <span className="text-lg font-bold text-neon-blue">£{DEPOSIT_AMOUNT}</span>
                </div>
                <p className="text-xs text-text-muted ml-8">
                  Pay £{DEPOSIT_AMOUNT} deposit to reserve your place. Remaining balance of £
                  {(COURSE_FEE_TOTAL - DEPOSIT_AMOUNT).toLocaleString()} due before course start.
                </p>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold hover:shadow-lg hover:shadow-neon-blue/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Secure Payment <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Shield size={12} />
                256-bit SSL Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard size={12} />
                Powered by Stripe
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                7-Day Refund Policy
              </span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
