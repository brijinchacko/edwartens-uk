"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  DollarSign,
  GitMerge,
} from "lucide-react";

interface SyncResult {
  imported: number;
  merged: number;
  skipped: number;
  dealsImported: number;
  errors: string[];
  total: number;
  syncedAt: string;
}

export default function FreshsalesSync() {
  const [status, setStatus] = useState<{
    configured: boolean;
    contacts: number;
    leads: number;
    deals: number;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState<string>("");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/freshsales/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() =>
        setStatus({
          configured: false,
          contacts: 0,
          leads: 0,
          deals: 0,
          error: "Failed to check status",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSync = async (type: string) => {
    setSyncing(true);
    setSyncType(type);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/freshsales/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
      setSyncType("");
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-neon-blue" />
          <span className="text-text-muted text-sm">
            Checking Freshsales connection...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Freshsales CRM Integration
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Import contacts, deals, and notes from Freshsales CRM
          </p>
        </div>
      </div>

      {!status?.configured ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle size={16} className="text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm text-yellow-400 font-medium">
              Not configured
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {status?.error ||
                "Set FRESHSALES_API_KEY and FRESHSALES_DOMAIN in environment"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={14} className="text-neon-green" />
            <span className="text-neon-green font-medium">
              Connected to Freshsales CRM
            </span>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-neon-blue" />
                <span className="text-xs text-text-muted">Contacts</span>
              </div>
              <p className="text-lg font-bold text-text-primary">
                {status.contacts.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-purple" />
                <span className="text-xs text-text-muted">Leads</span>
              </div>
              <p className="text-lg font-bold text-text-primary">
                {status.leads.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={14} className="text-neon-green" />
                <span className="text-xs text-text-muted">Deals</span>
              </div>
              <p className="text-lg font-bold text-text-primary">
                {status.deals.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Sync Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSync("contacts")}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {syncing && syncType === "contacts" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Sync Contacts
            </button>
            <button
              onClick={() => handleSync("deals")}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {syncing && syncType === "deals" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <DollarSign size={14} />
              )}
              Sync Deals
            </button>
            <button
              onClick={() => handleSync("all")}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple/10 text-purple border border-purple/20 hover:bg-purple/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {syncing && syncType === "all" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Sync All
            </button>
          </div>

          {syncing && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-blue/5 border border-neon-blue/10">
              <Loader2 size={16} className="animate-spin text-neon-blue" />
              <span className="text-sm text-text-secondary">
                Syncing from Freshsales... This may take a few minutes for large
                datasets.
              </span>
            </div>
          )}
        </>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Sync completed at{" "}
                {new Date(result.syncedAt).toLocaleString("en-GB")}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {result.imported}
                </p>
                <p className="text-xs text-text-muted">New Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-neon-blue">
                  {result.merged}
                </p>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <GitMerge size={10} /> Merged
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {result.dealsImported}
                </p>
                <p className="text-xs text-text-muted">Deals Linked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-muted">
                  {result.skipped}
                </p>
                <p className="text-xs text-text-muted">Skipped</p>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 font-medium mb-1">
                {result.errors.length} error
                {result.errors.length !== 1 ? "s" : ""}
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-300">
                    {e}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
