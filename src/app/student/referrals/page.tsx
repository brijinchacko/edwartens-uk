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
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
  CONTACTED: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Contacted" },
  ENROLLED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Enrolled" },
  REWARDED: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Rewarded" },
};

export default function StudentReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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

      setSuccess("Referral submitted successfully! We will reach out to them soon.");
      setForm({ name: "", email: "", phone: "" });
      fetchReferrals();
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Failed to submit referral");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/[0.06] rounded w-48" />
        <div className="h-64 bg-white/[0.04] rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Refer a Friend</h1>
        <p className="text-sm text-text-muted mt-1">
          Help your friends start their career and earn rewards
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="glass-card rounded-xl p-6 border border-neon-blue/20 bg-gradient-to-r from-neon-blue/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-neon-blue/10">
            <Gift size={24} className="text-neon-blue" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Get \u00a3100 off your next course!
            </h2>
            <p className="text-sm text-text-secondary">
              For each successful referral who enrols in an EDWartens course, you will receive
              \u00a3100 off your next course or a \u00a3100 voucher. There is no limit to how many
              friends you can refer.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6 border border-white/[0.06]">
            <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <UserPlus size={18} />
              Submit a Referral
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Full Name *</label>
                <input
                  type="text"
                  placeholder="Friend's name"
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
                <label className="text-xs text-text-muted mb-1 block">Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 size={14} />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue text-white text-sm font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit Referral
              </button>
            </form>
          </div>

          {/* Reward Summary */}
          <div className="glass-card rounded-xl p-5 border border-white/[0.06] mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <PoundSterling size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">
                  \u00a3{totalRewards.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">Total Rewards Earned</p>
              </div>
            </div>
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
                <Users size={40} className="mx-auto text-text-muted/30 mb-3" />
                <p className="text-text-muted text-sm">No referrals yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Submit your first referral to start earning rewards
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {referrals.map((ref) => {
                  const st = STATUS_STYLES[ref.status] || STATUS_STYLES.PENDING;
                  return (
                    <div key={ref.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary">{ref.referredName}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Mail size={12} />
                              {ref.referredEmail}
                            </span>
                            {ref.referredPhone && (
                              <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Phone size={12} />
                                {ref.referredPhone}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock size={12} />
                              {new Date(ref.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ref.rewardGiven && ref.rewardAmount && (
                            <span className="text-xs text-emerald-400 font-medium">
                              +\u00a3{ref.rewardAmount}
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </div>
                      </div>
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
