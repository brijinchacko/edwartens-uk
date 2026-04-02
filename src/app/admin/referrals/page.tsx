"use client";

import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Gift,
  PoundSterling,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  Loader2,
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
  notes: string | null;
  createdAt: string;
  referrer: {
    user: { name: string; email: string };
  };
}

interface Stats {
  total: number;
  enrolled: number;
  rewarded: number;
  conversionRate: number;
  totalRewardsGiven: number;
}

const STATUS_OPTIONS = ["PENDING", "CONTACTED", "ENROLLED", "REWARDED"];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400" },
  CONTACTED: { bg: "bg-blue-500/10", text: "text-blue-400" },
  ENROLLED: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  REWARDED: { bg: "bg-purple-500/10", text: "text-purple-400" },
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/admin/referrals")
      .then((res) => res.json())
      .then((data) => {
        setReferrals(data.referrals || []);
        setStats(data.stats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = referrals.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.referredName.toLowerCase().includes(q) ||
      r.referredEmail.toLowerCase().includes(q) ||
      r.referrer.user.name.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateReferral = async (id: string, data: Record<string, unknown>) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const result = await res.json();
        setReferrals((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...result.referral } : r))
        );
      }
    } catch (e) {
      console.error("Update error:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/[0.06] rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Referral Tracking</h1>
        <p className="text-sm text-text-muted mt-1">
          Manage student referrals and rewards
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neon-blue/10">
                <Users size={20} className="text-neon-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                <p className="text-xs text-text-muted">Total Referrals</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.conversionRate}%</p>
                <p className="text-xs text-text-muted">Conversion Rate</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10">
                <Gift size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.rewarded}</p>
                <p className="text-xs text-text-muted">Rewards Given</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <PoundSterling size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  \u00a3{stats.totalRewardsGiven.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">Total Rewards Value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by referrer, referred name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/50"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none w-full sm:w-44 px-4 py-2.5 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-neon-blue/50"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-xs font-medium text-text-muted">Referrer</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Referred</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Date</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Status</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Reward</th>
                <th className="text-left p-4 text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No referrals found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const st = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-text-primary">{r.referrer.user.name}</p>
                        <p className="text-xs text-text-muted">{r.referrer.user.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-text-primary">{r.referredName}</p>
                        <p className="text-xs text-text-muted">{r.referredEmail}</p>
                        {r.referredPhone && (
                          <p className="text-xs text-text-muted">{r.referredPhone}</p>
                        )}
                      </td>
                      <td className="p-4 text-text-muted text-xs">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(r.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "Europe/London",
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={r.status}
                          onChange={(e) => updateReferral(r.id, { status: e.target.value })}
                          disabled={updatingId === r.id}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${st.bg} ${st.text}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        {r.rewardGiven ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs">
                            <CheckCircle2 size={12} />
                            \u00a3{r.rewardAmount || 0}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">Not given</span>
                        )}
                      </td>
                      <td className="p-4">
                        {!r.rewardGiven ? (
                          <button
                            onClick={() =>
                              updateReferral(r.id, {
                                rewardGiven: true,
                                rewardAmount: 100,
                                rewardType: "DISCOUNT",
                                status: "REWARDED",
                              })
                            }
                            disabled={updatingId === r.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            {updatingId === r.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Gift size={12} />
                            )}
                            Mark Rewarded
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted">
                            {r.rewardGivenAt
                              ? new Date(r.rewardGivenAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  timeZone: "Europe/London",
                                })
                              : "Done"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
