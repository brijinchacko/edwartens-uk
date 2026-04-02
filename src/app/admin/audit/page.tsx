"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ScrollText,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditUser {
  userId: string;
  userName: string;
}

const ENTITIES = [
  "lead",
  "student",
  "batch",
  "session",
  "certificate",
  "email",
  "work-session",
];

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "SEND_EMAIL",
  "STATUS_CHANGE",
  "CHECK_IN",
  "CHECK_OUT",
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-400",
  DELETE: "bg-red-500/10 text-red-400",
  LOGIN: "bg-yellow-500/10 text-yellow-400",
  LOGOUT: "bg-yellow-500/10 text-yellow-400",
  SEND_EMAIL: "bg-purple-500/10 text-purple-400",
  STATUS_CHANGE: "bg-orange-500/10 text-orange-400",
  CHECK_IN: "bg-teal-500/10 text-teal-400",
  CHECK_OUT: "bg-teal-500/10 text-teal-400",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<AuditUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filters
  const [filterUserId, setFilterUserId] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (filterUserId) params.set("userId", filterUserId);
      if (filterEntity) params.set("entity", filterEntity);
      if (filterAction) params.set("action", filterAction);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterUserId, filterEntity, filterAction, filterDateFrom, filterDateTo, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const resetFilters = () => {
    setFilterUserId("");
    setFilterEntity("");
    setFilterAction("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSearch("");
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Entity", "Entity Name", "Details", "IP Address"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString("en-GB", { timeZone: "Europe/London" }),
      log.userName,
      log.userRole,
      log.action,
      log.entity,
      log.entityName || "",
      (log.details || "").replace(/"/g, '""'),
      log.ipAddress || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="text-neon-blue" size={24} />
          <div>
            <h1 className="text-xl font-bold text-text-primary">Audit Log</h1>
            <p className="text-sm text-text-muted">
              {total} total entries
            </p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg glass-card hover:bg-white/[0.04] transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">Filters</span>
          {(filterUserId || filterEntity || filterAction || filterDateFrom || filterDateTo || search) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-red-400 hover:text-red-300"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <select
            value={filterUserId}
            onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
            className="text-sm rounded-lg border border-border bg-dark-secondary px-3 py-2 text-text-primary"
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.userName}
              </option>
            ))}
          </select>

          <select
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
            className="text-sm rounded-lg border border-border bg-dark-secondary px-3 py-2 text-text-primary"
          >
            <option value="">All Entities</option>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="text-sm rounded-lg border border-border bg-dark-secondary px-3 py-2 text-text-primary"
          >
            <option value="">All Actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }}
            className="text-sm rounded-lg border border-border bg-dark-secondary px-3 py-2 text-text-primary"
            placeholder="From"
          />

          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }}
            className="text-sm rounded-lg border border-border bg-dark-secondary px-3 py-2 text-text-primary"
            placeholder="To"
          />

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="w-full text-sm rounded-lg border border-border bg-dark-secondary pl-8 pr-3 py-2 text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Timestamp</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Action</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Entity</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="border-b border-border/50 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-text-primary">{log.userName}</div>
                      <div className="text-xs text-text-muted">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          ACTION_COLORS[log.action] || "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-text-primary capitalize">{log.entity}</div>
                      {log.entityName && (
                        <div className="text-xs text-text-muted truncate max-w-[200px]">
                          {log.entityName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary truncate max-w-[300px]">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-white/[0.04] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-white/[0.04] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="glass-card rounded-xl p-6 w-full max-w-lg mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Audit Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-white/[0.04] text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Timestamp</span>
                <span className="text-text-primary">{formatDate(selectedLog.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">User</span>
                <span className="text-text-primary">{selectedLog.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Role</span>
                <span className="text-text-primary">{selectedLog.userRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Action</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    ACTION_COLORS[selectedLog.action] || "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {selectedLog.action}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Entity</span>
                <span className="text-text-primary capitalize">{selectedLog.entity}</span>
              </div>
              {selectedLog.entityId && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Entity ID</span>
                  <span className="text-text-primary font-mono text-xs">{selectedLog.entityId}</span>
                </div>
              )}
              {selectedLog.entityName && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Entity Name</span>
                  <span className="text-text-primary">{selectedLog.entityName}</span>
                </div>
              )}
              {selectedLog.ipAddress && (
                <div className="flex justify-between">
                  <span className="text-text-muted">IP Address</span>
                  <span className="text-text-primary font-mono text-xs">{selectedLog.ipAddress}</span>
                </div>
              )}
              {selectedLog.details && (
                <div>
                  <span className="text-text-muted block mb-1">Details</span>
                  <div className="bg-dark-secondary rounded-lg p-3 text-text-secondary text-xs whitespace-pre-wrap break-all">
                    {selectedLog.details}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
