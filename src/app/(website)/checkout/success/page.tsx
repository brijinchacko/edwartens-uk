"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight, Loader2 } from "lucide-react";

interface PaymentInfo {
  status: string;
  paymentType: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/checkout/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setPaymentInfo(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  const isDeposit = paymentInfo?.paymentType === "deposit";
  const amount = paymentInfo?.amountTotal
    ? `£${(paymentInfo.amountTotal / 100).toLocaleString()}`
    : "";

  return (
    <div className="pt-20">
      <section className="py-24 sm:py-32">
        <div className="max-w-xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-8">
            <CheckCircle2 size={40} className="text-neon-green" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Payment <span className="gradient-text">Successful</span>
          </h1>

          {amount && (
            <p className="text-2xl font-bold text-neon-green mb-2">{amount} paid</p>
          )}

          {isDeposit ? (
            <div className="space-y-4 mb-8">
              <p className="text-text-secondary">
                Your seat has been secured with a £100 deposit. Our team will contact you
                shortly to complete your enrolment and arrange the remaining balance.
              </p>
              <div className="glass-card rounded-xl p-5 text-left space-y-3">
                <h3 className="text-sm font-semibold text-white">What happens next?</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Our admissions team will call you within 24 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Complete remaining payment before course start date
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Receive your login credentials and course materials
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              <p className="text-text-secondary">
                Your payment is confirmed and your student account is being set up.
                You will receive login credentials at your registered email.
              </p>
              <div className="glass-card rounded-xl p-5 flex items-center gap-4">
                <Mail size={24} className="text-neon-blue flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Check your email</p>
                  <p className="text-xs text-text-muted">
                    Login credentials sent to {paymentInfo?.customerEmail || "your email"}
                  </p>
                </div>
              </div>
              <div className="glass-card rounded-xl p-5 text-left space-y-3">
                <h3 className="text-sm font-semibold text-white">What happens next?</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Login with your temporary password
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Complete your onboarding (profile, documents)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Start your pre-recorded foundation sessions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                    Attend your classroom training on the batch dates
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isDeposit && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
              >
                Login to Student Portal <ArrowRight size={16} />
              </Link>
            )}
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-3.5 rounded-lg glass-card text-text-secondary font-semibold text-sm hover:bg-white/[0.06] transition-all"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-neon-blue" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
