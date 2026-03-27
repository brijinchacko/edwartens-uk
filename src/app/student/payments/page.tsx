import { getTestSession } from "@/lib/test-session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ExternalLink,
} from "lucide-react";

const COURSE_FEES: Record<string, number> = {
  PROFESSIONAL_MODULE: 2140,
  AI_MODULE: 2140,
};

export default async function PaymentsPage() {
  const session = getTestSession("STUDENT");

  let student: {
    id: string;
    course: string;
    paymentStatus: string;
    paidAmount: number | null;
    stripePaymentId: string | null;
  } | null = null;

  try {
    student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        course: true,
        paymentStatus: true,
        paidAmount: true,
        stripePaymentId: true,
      },
    });
  } catch (error) {
    console.error("Payment data error:", error);
  }

  const courseFee = student ? COURSE_FEES[student.course] || 2140 : 2140;
  const paidAmount = student?.paidAmount || 0;
  const remaining = courseFee - paidAmount;
  const paymentStatus = student?.paymentStatus || "PENDING";

  const statusConfig = {
    PAID: {
      label: "Fully Paid",
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      border: "border-neon-green/20",
      icon: CheckCircle2,
    },
    PARTIAL: {
      label: "Partially Paid",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      icon: AlertCircle,
    },
    PENDING: {
      label: "Payment Pending",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: Clock,
    },
    REFUNDED: {
      label: "Refunded",
      color: "text-text-muted",
      bg: "bg-white/[0.03]",
      border: "border-border",
      icon: Receipt,
    },
  };

  const status =
    statusConfig[paymentStatus as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Payments</h1>
        <p className="text-sm text-text-muted mt-1">
          View your payment status and history
        </p>
      </div>

      {/* Payment Status Card */}
      <div className="glass-card gradient-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center">
              <CreditCard size={24} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">
                Course Payment
              </p>
              <p className="text-sm text-text-muted">
                {student?.course === "PROFESSIONAL_MODULE"
                  ? "Professional Module"
                  : student?.course === "AI_MODULE"
                    ? "AI Module"
                    : "Course Fee"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color} ${status.bg} border ${status.border}`}
          >
            <StatusIcon size={14} />
            {status.label}
          </span>
        </div>

        {/* Amount Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-primary rounded-lg text-center">
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(courseFee)}
            </p>
            <p className="text-xs text-text-muted mt-1">Total Fee</p>
          </div>
          <div className="p-4 bg-dark-primary rounded-lg text-center">
            <p className="text-2xl font-bold text-neon-green">
              {formatCurrency(paidAmount)}
            </p>
            <p className="text-xs text-text-muted mt-1">Paid</p>
          </div>
          <div className="p-4 bg-dark-primary rounded-lg text-center">
            <p
              className={`text-2xl font-bold ${remaining > 0 ? "text-red-400" : "text-neon-green"}`}
            >
              {formatCurrency(remaining > 0 ? remaining : 0)}
            </p>
            <p className="text-xs text-text-muted mt-1">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">Payment Progress</span>
            <span className="text-xs text-text-muted">
              {courseFee > 0
                ? Math.round((paidAmount / courseFee) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${courseFee > 0 ? Math.min((paidAmount / courseFee) * 100, 100) : 0}%`,
                background:
                  paymentStatus === "PAID"
                    ? "#92E02C"
                    : "linear-gradient(90deg, #2891FF, #92E02C)",
              }}
            />
          </div>
        </div>

        {/* Pay Button */}
        {paymentStatus !== "PAID" && paymentStatus !== "REFUNDED" && (
          <form action="/api/student/payment/create-session" method="POST">
            <button
              type="submit"
              className="w-full py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Make Payment
              <ExternalLink size={14} />
            </button>
          </form>
        )}
      </div>

      {/* Payment Info */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Payment Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-muted">Payment Method</span>
            <span className="text-text-primary">Stripe (Card / Bank Transfer)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-muted">Currency</span>
            <span className="text-text-primary">GBP (British Pound)</span>
          </div>
          {student?.stripePaymentId && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-muted">Transaction ID</span>
              <span className="text-text-primary font-mono text-xs">
                {student.stripePaymentId}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2">
            <span className="text-text-muted">Support</span>
            <span className="text-neon-blue">info@wartens.com</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="p-4 bg-neon-blue/5 border border-neon-blue/10 rounded-lg">
        <p className="text-xs text-text-secondary">
          If you have any payment issues or need to arrange a payment plan,
          please contact our support team at{" "}
          <span className="text-neon-blue">info@wartens.com</span> or call{" "}
          <span className="text-neon-blue">+44 333 33 98 394</span>.
        </p>
      </div>
    </div>
  );
}
