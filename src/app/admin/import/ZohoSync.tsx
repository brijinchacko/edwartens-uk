"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CloudDownload,
  Users,
  UserCheck,
  Loader2,
  Clock,
} from "lucide-react";

interface ZohoStatus {
  isConfigured: boolean;
  connected: boolean;
  lastSync: string | null;
  counts: {
    leads: number;
    contacts: number;
  };
}

interface SyncResult {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails?: string[];
  syncedAt: string;
}

export default function ZohoSync() {
  const [status, setStatus] = useState<ZohoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncType, setSyncType] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/zoho/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setError("Failed to check Zoho connection status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSync = async (type: "leads" | "contacts" | "all") => {
    setSyncing(true);
    setSyncType(type);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/zoho/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setResult(data);
      // Refresh status after sync
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
      setSyncType(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-text-muted" />
          <span className="text-text-muted">Checking Zoho CRM connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10">
            <CloudDownload size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Zoho CRM Integration
            </h3>
            <p className="text-sm text-text-muted">
              Import leads and contacts from Zoho CRM
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-text-muted hover:text-text-primary"
          title="Refresh status"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        {status?.connected ? (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400 font-medium">Connected to Zoho CRM</span>
          </>
        ) : status?.isConfigured ? (
          <>
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">
              Credentials configured but connection failed
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-sm text-red-400 font-medium">
              Not configured
            </span>
            <span className="text-xs text-text-muted ml-2">
              Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN in environment
            </span>
          </>
        )}
      </div>

      {/* Zoho Record Counts */}
      {status?.connected && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Users size={18} className="text-neon-blue" />
            <div>
              <p className="text-sm text-text-muted">Zoho Leads</p>
              <p className="text-lg font-semibold text-text-primary">
                {status.counts.leads.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <UserCheck size={18} className="text-purple" />
            <div>
              <p className="text-sm text-text-muted">Zoho Contacts</p>
              <p className="text-lg font-semibold text-text-primary">
                {status.counts.contacts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Sync */}
      {status?.lastSync && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock size={14} />
          <span>Last synced: {formatDate(status.lastSync)}</span>
        </div>
      )}

      {/* Sync Buttons */}
      {status?.connected && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSync("leads")}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing && syncType === "leads" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Users size={16} />
            )}
            Sync Leads from Zoho
          </button>
          <button
            onClick={() => handleSync("contacts")}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple/10 text-purple hover:bg-purple/20 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing && syncType === "contacts" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserCheck size={16} />
            )}
            Sync Contacts from Zoho
          </button>
          <button
            onClick={() => handleSync("all")}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing && syncType === "all" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CloudDownload size={16} />
            )}
            Sync All
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {syncing && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neon-blue/5 border border-neon-blue/20">
          <Loader2 size={18} className="animate-spin text-neon-blue" />
          <div>
            <p className="text-sm text-text-primary font-medium">
              Syncing {syncType === "all" ? "leads and contacts" : syncType} from Zoho CRM...
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              This may take a moment depending on the number of records.
            </p>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {result && (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              {result.errors === 0 ? (
                <CheckCircle2 size={18} className="text-green-400" />
              ) : (
                <AlertTriangle size={18} className="text-yellow-400" />
              )}
              <span className="text-sm font-medium text-text-primary">
                Sync completed at {formatDate(result.syncedAt)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center px-3 py-2 rounded bg-white/[0.03]">
                <p className="text-lg font-bold text-text-primary">{result.total}</p>
                <p className="text-xs text-text-muted">Total Found</p>
              </div>
              <div className="text-center px-3 py-2 rounded bg-green-500/5">
                <p className="text-lg font-bold text-green-400">{result.imported}</p>
                <p className="text-xs text-text-muted">Imported</p>
              </div>
              <div className="text-center px-3 py-2 rounded bg-yellow-500/5">
                <p className="text-lg font-bold text-yellow-400">{result.skipped}</p>
                <p className="text-xs text-text-muted">Skipped</p>
              </div>
              <div className="text-center px-3 py-2 rounded bg-red-500/5">
                <p className="text-lg font-bold text-red-400">{result.errors}</p>
                <p className="text-xs text-text-muted">Errors</p>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {result.errorDetails && result.errorDetails.length > 0 && (
            <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-sm font-medium text-red-400 mb-2">Error Details:</p>
              <ul className="space-y-1">
                {result.errorDetails.slice(0, 10).map((err, i) => (
                  <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                    <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                    {err}
                  </li>
                ))}
                {result.errorDetails.length > 10 && (
                  <li className="text-xs text-text-muted">
                    ...and {result.errorDetails.length - 10} more errors
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && !syncing && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <XCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
