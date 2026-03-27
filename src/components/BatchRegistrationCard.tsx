import Link from "next/link";
import { ArrowRight, Shield, CreditCard, Users } from "lucide-react";
import { COURSE_FEE_TOTAL, DEPOSIT_AMOUNT } from "@/lib/course-config";

interface Props {
  batchId: string;
  courseSlug: string;
  courseName: string;
  batchName: string;
  startDate: string;
  availableSeats: number;
  capacity: number;
  location: string;
}

export default function BatchRegistrationCard({
  batchId,
  courseSlug,
  courseName,
  batchName,
  startDate,
  availableSeats,
  capacity,
  location,
}: Props) {
  return (
    <div className="glass-card gradient-border rounded-2xl p-6 space-y-6">
      {/* Price */}
      <div className="text-center">
        <p className="text-sm text-text-muted mb-1">Course Fee</p>
        <p className="text-4xl font-bold gradient-text">£{COURSE_FEE_TOTAL.toLocaleString()}</p>
        <p className="text-xs text-text-muted">inc VAT (£2,140 + 20% VAT)</p>
      </div>

      {/* Seats */}
      <div className="flex items-center justify-center gap-2">
        <Users size={14} className={availableSeats <= 3 ? "text-yellow-400" : "text-neon-green"} />
        <span className={`text-sm font-medium ${availableSeats <= 3 ? "text-yellow-400" : "text-neon-green"}`}>
          {availableSeats} of {capacity} seats available
        </span>
      </div>

      {/* Quick Info */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Batch</span>
          <span className="text-white font-medium">{batchName}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex justify-between">
          <span className="text-text-muted">Starts</span>
          <span className="text-white font-medium">{startDate}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex justify-between">
          <span className="text-text-muted">Location</span>
          <span className="text-white font-medium">{location}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex justify-between">
          <span className="text-text-muted">Schedule</span>
          <span className="text-white font-medium">9 AM – 5 PM BST</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex justify-between">
          <span className="text-text-muted">Certificate</span>
          <span className="text-neon-green font-medium">CPD Accredited</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Link
          href={`/courses/${courseSlug}/batch/${batchId}/register?payment=full`}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 transition-all"
        >
          Pay in Full — £{COURSE_FEE_TOTAL.toLocaleString()} <ArrowRight size={16} />
        </Link>
        <Link
          href={`/courses/${courseSlug}/batch/${batchId}/register?payment=deposit`}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg glass-card border border-neon-blue/20 text-neon-blue font-semibold text-sm hover:bg-neon-blue/5 transition-all"
        >
          Secure Seat — £{DEPOSIT_AMOUNT} Deposit
        </Link>
      </div>

      {/* Instalment Info */}
      <div className="glass-card rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-neon-green" />
          <span className="text-xs font-semibold text-white">Instalment Options</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Pay in 3-6 interest-free instalments via <strong className="text-white">Klarna</strong> or{" "}
          <strong className="text-white">ClearPay</strong>. Available at checkout, subject to credit
          approval. Direct debit options available.
        </p>
      </div>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
        <Shield size={12} />
        <span>Secure payment powered by Stripe</span>
      </div>
    </div>
  );
}
