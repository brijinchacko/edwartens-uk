"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Send, Loader2, ExternalLink, ChevronDown, ChevronUp, X } from "lucide-react";

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
  isRead: boolean;
  hasAttachments: boolean;
}

export default function LeadEmails({
  leadId,
  leadEmail,
}: {
  leadId: string;
  leadEmail: string;
}) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendError, setSendError] = useState("");

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/emails/lead/${leadId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch emails");
      setEmails(data.emails || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load emails";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSend = async () => {
    if (!subject || !body) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: leadEmail,
          subject,
          body: body.replace(/\n/g, "<br />"),
          leadId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setShowCompose(false);
      setSubject("");
      setBody("");
      fetchEmails();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send";
      setSendError(message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Mail size={16} className="text-neon-blue" />
          Emails ({emails.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-blue/10 text-neon-blue rounded-lg text-xs font-medium hover:bg-neon-blue/20 transition-colors"
          >
            <Send size={12} />
            Send Email
          </button>
          <a
            href="/admin/emails"
            className="p-1.5 rounded-lg text-text-muted hover:text-neon-blue transition-colors"
            title="Open full inbox"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={20} className="text-neon-blue animate-spin" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 py-4 text-center">{error}</p>
      ) : emails.length === 0 ? (
        <p className="text-xs text-text-muted py-4 text-center">
          No email history with this lead
        </p>
      ) : (
        <div className="space-y-2">
          {(expanded ? emails : emails.slice(0, 3)).map((email) => (
            <div
              key={email.id}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {email.subject}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {email.from.name || email.from.email} &rarr;{" "}
                    {email.to.map((t) => t.name || t.email).join(", ")}
                  </p>
                </div>
                <span className="text-[10px] text-text-muted shrink-0">
                  {formatDate(email.receivedDateTime)}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 line-clamp-2">
                {email.bodyPreview}
              </p>
            </div>
          ))}
          {emails.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-text-muted hover:text-neon-blue transition-colors"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show all {emails.length} emails <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Quick Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-text-primary">
                Email to {leadEmail}
              </h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-1 rounded text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {sendError && (
                <p className="text-xs text-red-400">{sendError}</p>
              )}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={6}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 px-5 py-3 border-t border-white/[0.06]">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !subject || !body}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-neon-blue text-white rounded-lg text-xs font-medium disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
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
