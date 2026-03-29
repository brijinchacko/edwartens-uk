"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  Send,
  X,
  Paperclip,
  ChevronLeft,
  Reply,
  Inbox,
  Loader2,
} from "lucide-react";

interface EmailAddress {
  name: string;
  email: string;
}

interface Email {
  id: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  receivedDateTime: string;
  bodyPreview: string;
  body: string;
  bodyContentType?: string;
  isRead: boolean;
  hasAttachments: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
}

export default function EmailClient() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Compose form state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeLeadId, setComposeLeadId] = useState("");

  const fetchEmails = useCallback(async (search?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("count", "30");
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch emails");
      setEmails(data.emails || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load emails";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads?limit=100");
      const data = await res.json();
      if (data.leads) {
        setLeads(
          data.leads.map((l: { id: string; name: string; email: string }) => ({
            id: l.id,
            name: l.name,
            email: l.email,
          }))
        );
      }
    } catch {
      // Leads dropdown is optional
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    fetchLeads();
  }, [fetchEmails, fetchLeads]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails(searchQuery);
  };

  const handleSend = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody.replace(/\n/g, "<br />"),
          leadId: composeLeadId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setShowCompose(false);
      resetCompose();
      fetchEmails();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send email";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const resetCompose = () => {
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setComposeLeadId("");
  };

  const handleReply = (email: Email) => {
    setComposeTo(email.from.email);
    setComposeSubject(
      email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`
    );
    setComposeBody(
      `\n\n--- Original Message ---\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${formatDateTime(email.receivedDateTime)}\n\n`
    );
    setShowCompose(true);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Find if an email matches a lead
  const getLinkedLead = (email: Email) => {
    return leads.find(
      (l) =>
        l.email === email.from.email ||
        email.to.some((t) => t.email === l.email)
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
            <Mail size={20} className="text-neon-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Emails</h1>
            <p className="text-xs text-text-muted">
              Microsoft Outlook Integration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEmails(searchQuery)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => {
              resetCompose();
              setShowCompose(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium"
          >
            <Send size={16} />
            Compose
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-white/[0.05] border border-white/[0.06] rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Email Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[calc(100vh-16rem)]">
        {/* Email List */}
        <div
          className={`lg:col-span-2 glass-card overflow-hidden flex flex-col ${
            selectedEmail ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="px-4 py-3 border-b border-white/[0.06] text-xs text-text-muted">
            {emails.length} email{emails.length !== 1 ? "s" : ""}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="text-neon-blue animate-spin" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <Inbox size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No emails found</p>
              </div>
            ) : (
              emails.map((email) => {
                const linkedLead = getLinkedLead(email);
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors ${
                      selectedEmail?.id === email.id
                        ? "bg-neon-blue/5 border-l-2 border-l-neon-blue"
                        : ""
                    } ${!email.isRead ? "bg-white/[0.02]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          !email.isRead
                            ? "font-semibold text-text-primary"
                            : "text-text-secondary"
                        }`}
                      >
                        {email.from.name || email.from.email}
                      </p>
                      <span className="text-[10px] text-text-muted shrink-0">
                        {formatDateTime(email.receivedDateTime)}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        !email.isRead
                          ? "font-medium text-text-primary"
                          : "text-text-secondary"
                      }`}
                    >
                      {email.subject}
                    </p>
                    <p className="text-xs text-text-muted mt-1 line-clamp-1">
                      {email.bodyPreview}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {email.hasAttachments && (
                        <Paperclip size={10} className="text-text-muted" />
                      )}
                      {linkedLead && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/10 text-neon-blue">
                          Lead: {linkedLead.name}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Email Preview */}
        <div
          className={`lg:col-span-3 glass-card overflow-hidden flex flex-col ${
            selectedEmail ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedEmail ? (
            <>
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="lg:hidden p-1 rounded text-text-muted hover:text-text-primary"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-text-primary truncate">
                    {selectedEmail.subject}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    From: {selectedEmail.from.name}{" "}
                    &lt;{selectedEmail.from.email}&gt;
                  </p>
                  <p className="text-xs text-text-muted">
                    To:{" "}
                    {selectedEmail.to
                      .map((t) => t.name || t.email)
                      .join(", ")}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {formatDateTime(selectedEmail.receivedDateTime)}
                  </p>
                </div>
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.06] rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-colors"
                >
                  <Reply size={14} />
                  Reply
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedEmail.bodyContentType === "html" ||
                selectedEmail.body.includes("<") ? (
                  <div
                    className="text-sm text-text-secondary prose prose-invert prose-sm max-w-none [&_a]:text-neon-blue [&_img]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                ) : (
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                    {selectedEmail.body}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <Mail size={40} className="mb-3 opacity-20" />
              <p className="text-sm">Select an email to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-base font-semibold text-text-primary">
                New Email
              </h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  To
                </label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Message
                </label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={10}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Link to Lead (optional)
                </label>
                <select
                  value={composeLeadId}
                  onChange={(e) => setComposeLeadId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
                >
                  <option value="">None</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !composeTo || !composeSubject || !composeBody}
                className="flex items-center gap-2 px-5 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
