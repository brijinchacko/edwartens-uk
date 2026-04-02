"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  PoundSterling,
  Loader2,
  AlertCircle,
  UserPlus,
  Star,
  ArrowRight,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ReferralItem {
  id: string;
  referredName: string;
  referredEmail: string;
  referredPhone: string | null;
  status: string;
  rewardType: string | null;
  rewardAmount: number | null;
  rewardGiven: boolean;
  rewardGivenAt: string | null;
  createdAt: string;
  notes: string | null;
}

const REWARD_AMOUNT = 130; // £130 flat per successful referral

const STATUS_FLOW = [
  { key: "PENDING", label: "Referred", desc: "We received your referral" },
  { key: "CONTACTED", label: "Contacted", desc: "Our team has reached out" },
  { key: "ENROLLED", label: "Enrolled", desc: "They've enrolled in a course" },
  { key: "REWARDED", label: "Reward Credited", desc: "£130 credited to you!" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Referred" },
  CONTACTED: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Contacted" },
  ENROLLED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Enrolled" },
  REWARDED: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Reward Credited" },
};

export default function StudentReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const fetchReferrals = () => {
    fetch("/api/student/referrals")
      .then((res) => res.json())
      .then((data) => {
        setReferrals(data.referrals || []);
        setTotalRewards(data.totalRewards || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Name and email are required");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/student/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit referral");
        return;
      }
      setSuccess("Referral submitted! We'll contact them within 24 hours.");
      setForm({ name: "", email: "", phone: "" });
      fetchReferrals();
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Failed to submit referral");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = referrals.filter((r) => r.status === "PENDING").length;
  const contactedCount = referrals.filter((r) => r.status === "CONTACTED").length;
  const enrolledCount = referrals.filter((r) => r.status === "ENROLLED" || r.status === "REWARDED").length;
  const rewardedCount = referrals.filter((r) => r.status === "REWARDED").length;
  const potentialEarnings = referrals.filter((r) => r.status !== "REWARDED").length * REWARD_AMOUNT;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero Banner */}
      <div className="glass-card rounded-xl overflow-hidden border-2 border-neon-green/20">
        <div className="bg-gradient-to-r from-neon-green/10 via-neon-blue/5 to-purple/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-neon-green/20 border border-neon-green/30">
              <Gift size={32} className="text-neon-green" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary">
                Refer & Earn <span className="text-neon-green">£{REWARD_AMOUNT}</span>
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                For every friend who enrols and completes full payment, you earn <strong className="text-neon-green">£{REWARD_AMOUNT} flat</strong> — no limits!
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-neon-green">£{totalRewards}</p>
              <p className="text-xs text-text-muted">Total Earned</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="grid grid-cols-4 gap-2">
            {STATUS_FLOW.map((step, i) => (
              <div key={step.key} className="text-center relative">
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                  i === 3 ? "bg-neon-green/20 text-neon-green" : "bg-white/[0.06] text-text-muted"
                }`}>
                  {i + 1}
                </div>
                <p className="text-[10px] font-medium text-text-primary mt-1">{step.label}</p>
                <p className="text-[9px] text-text-muted">{step.desc}</p>
                {i < 3 && (
                  <ArrowRight size={10} className="absolute right-0 top-3 text-text-muted hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{referrals.length}</p>
          <p className="text-[10px] text-text-muted">Total Referrals</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{contactedCount}</p>
          <p className="text-[10px] text-text-muted">Being Contacted</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{enrolledCount}</p>
          <p className="text-[10px] text-text-muted">Enrolled</p>
        </div>
        <div className="glass-card p-4 text-center border border-neon-green/20">
          <p className="text-2xl font-bold text-neon-green">£{totalRewards}</p>
          <p className="text-[10px] text-text-muted">Earned So Far</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-xl p-5 border-2 border-neon-blue/20">
            <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-neon-blue" />
              Refer a Friend
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Full Name *</label>
                <input
                  type="text"
                  placeholder="Your friend's name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Email *</label>
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="+44 7xxx xxx xxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-2.5 rounded-lg">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg">
                  <CheckCircle2 size={14} /> {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 text-sm font-semibold hover:bg-neon-green/30 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Refer & Earn £{REWARD_AMOUNT}
              </button>
            </form>
          </div>

          {/* Terms & Conditions */}
          <div className="glass-card rounded-xl p-4">
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                <Shield size={12} className="text-neon-blue" />
                Referral Terms & Conditions
              </span>
              {showTerms ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
            </button>
            {showTerms && (
              <div className="mt-3 space-y-2 text-[11px] text-text-muted leading-relaxed">
                <p><strong className="text-text-secondary">1. Reward Amount:</strong> £{REWARD_AMOUNT} flat per successful referral.</p>
                <p><strong className="text-text-secondary">2. Eligibility:</strong> The reward is credited ONLY when the referred candidate has completed full payment of their course fee. Partial payments do not qualify.</p>
                <p><strong className="text-text-secondary">3. Payment:</strong> Rewards are processed within 30 days of the referred candidate completing full payment. Payment will be made via bank transfer or credited against your outstanding balance.</p>
                <p><strong className="text-text-secondary">4. No Self-Referral:</strong> You cannot refer yourself or use alternate accounts.</p>
                <p><strong className="text-text-secondary">5. Duplicate Referrals:</strong> If a candidate has already been referred by another student or exists in our database, the referral will not be eligible for a reward.</p>
                <p><strong className="text-text-secondary">6. No Limit:</strong> There is no limit to the number of friends you can refer. Each qualifying referral earns £{REWARD_AMOUNT}.</p>
                <p><strong className="text-text-secondary">7. Tracking:</strong> You can monitor the status of your referrals in real-time on this page. Statuses: Referred → Contacted → Enrolled → Reward Credited.</p>
                <p><strong className="text-text-secondary">8. Right to Modify:</strong> EDWartens UK reserves the right to modify or discontinue the referral programme at any time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Referrals List */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl border border-white/[0.06]">
            <div className="p-5 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Users size={18} />
                Your Referrals
                <span className="ml-auto text-xs text-text-muted">{referrals.length} total</span>
              </h2>
            </div>

            {referrals.length === 0 ? (
              <div className="p-8 text-center">
                <Gift size={48} className="mx-auto text-neon-green/20 mb-3" />
                <p className="text-text-secondary text-sm font-medium">No referrals yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Refer your first friend and earn £{REWARD_AMOUNT}!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {referrals.map((ref) => {
                  const st = STATUS_STYLES[ref.status] || STATUS_STYLES.PENDING;
                  const isExpanded = expandedRef === ref.id;
                  const statusIdx = STATUS_FLOW.findIndex((s) => s.key === ref.status);

                  return (
                    <div
                      key={ref.id}
                      className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setExpandedRef(isExpanded ? null : ref.id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${st.bg} ${st.text}`}>
                          {ref.referredName.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {ref.referredName}
                            </p>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <Mail size={10} /> {ref.referredEmail}
                            </span>
                            {ref.referredPhone && (
                              <span className="flex items-center gap-1">
                                <Phone size={10} /> {ref.referredPhone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reward */}
                        <div className="text-right shrink-0">
                          {ref.status === "REWARDED" ? (
                            <p className="text-sm font-bold text-neon-green">+£{ref.rewardAmount || REWARD_AMOUNT}</p>
                          ) : (
                            <p className="text-xs text-text-muted">Pending</p>
                          )}
                        </div>
                      </div>

                      {/* Expanded: Progress tracker */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-white/[0.04]">
                          {/* Progress bar */}
                          <div className="flex items-center gap-1 mb-3">
                            {STATUS_FLOW.map((step, i) => {
                              const reached = i <= statusIdx;
                              return (
                                <div key={step.key} className="flex-1">
                                  <div className={`h-1.5 rounded-full ${reached ? (i === 3 ? "bg-neon-green" : "bg-neon-blue") : "bg-white/[0.06]"}`} />
                                  <p className={`text-[9px] mt-1 ${reached ? "text-text-primary font-medium" : "text-text-muted"}`}>
                                    {step.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-text-muted">Referred on:</span>
                              <span className="text-text-secondary ml-1">
                                {new Date(ref.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}
                              </span>
                            </div>
                            {ref.rewardGivenAt && (
                              <div>
                                <span className="text-text-muted">Reward credited:</span>
                                <span className="text-neon-green ml-1">
                                  {new Date(ref.rewardGivenAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}
                                </span>
                              </div>
                            )}
                          </div>

                          {ref.status === "ENROLLED" && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
                              <Info size={12} />
                              Reward will be credited once they complete full payment.
                            </div>
                          )}

                          {ref.status === "REWARDED" && (
                            <div className="mt-2 p-2 rounded-lg bg-neon-green/10 border border-neon-green/20 text-xs text-neon-green flex items-center gap-2">
                              <CheckCircle2 size={12} />
                              £{ref.rewardAmount || REWARD_AMOUNT} has been credited to your account.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
