"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  LayoutTemplate,
} from "lucide-react";
import {
  emailTemplates,
  getTemplatesByCategory,
  fillTemplate,
  type EmailTemplate,
} from "@/lib/email-templates";
import Link from "next/link";

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
  status?: string;
  source?: string;
  courseInterest?: string;
}

type ComposeView = "none" | "template-picker" | "compose";

export default function EmailClient() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeView, setComposeView] = useState<ComposeView>("none");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [needsConnection, setNeedsConnection] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Compose form state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeLeadId, setComposeLeadId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Mass email state
  const [showMassEmail, setShowMassEmail] = useState(false);
  const [massTemplateId, setMassTemplateId] = useState<string | null>(null);
  const [massSelectedLeadIds, setMassSelectedLeadIds] = useState<Set<string>>(new Set());
  const [massStatusFilter, setMassStatusFilter] = useState("");
  const [massSourceFilter, setMassSourceFilter] = useState("");
  const [massCourseFilter, setMassCourseFilter] = useState("");
  const [massSending, setMassSending] = useState(false);
  const [massProgress, setMassProgress] = useState(0);
  const [massResult, setMassResult] = useState<{
    sent: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Template picker collapsed categories
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const fetchEmails = useCallback(async (search?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("count", "30");
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      const data = await res.json();
      if (data.needsConnection) {
        setNeedsConnection(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to fetch emails");
      setEmails(data.emails || []);
      if (data.connectedEmail) setConnectedEmail(data.connectedEmail);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load emails";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads?limit=500");
      const data = await res.json();
      if (data.leads) {
        setLeads(
          data.leads.map(
            (l: {
              id: string;
              name: string;
              email: string;
              status?: string;
              source?: string;
              courseInterest?: string;
            }) => ({
              id: l.id,
              name: l.name,
              email: l.email,
              status: l.status,
              source: l.source,
              courseInterest: l.courseInterest,
            })
          )
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
          body: composeBody.includes("<")
            ? composeBody
            : composeBody.replace(/\n/g, "<br />"),
          leadId: composeLeadId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setComposeView("none");
      resetCompose();
      fetchEmails();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send email";
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
    setSelectedTemplateId(null);
  };

  const handleReply = (email: Email) => {
    setComposeTo(email.from.email);
    setComposeSubject(
      email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`
    );
    setComposeBody(
      `\n\n--- Original Message ---\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${formatDateTime(email.receivedDateTime)}\n\n`
    );
    setComposeView("compose");
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setComposeSubject(template.subject);
    setComposeBody(template.body);
    setSelectedTemplateId(template.id);
    setComposeView("compose");
  };

  const handleComposeBlank = () => {
    resetCompose();
    setComposeView("compose");
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

  const getLinkedLead = (email: Email) => {
    return leads.find(
      (l) =>
        l.email === email.from.email ||
        email.to.some((t) => t.email === l.email)
    );
  };

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/admin/emails/connect");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setError("Failed to start Outlook connection");
    }
  };

  // Mass email helpers
  const filteredMassLeads = useMemo(() => {
    return leads.filter((l) => {
      if (massStatusFilter && l.status !== massStatusFilter) return false;
      if (massSourceFilter && l.source !== massSourceFilter) return false;
      if (massCourseFilter && l.courseInterest !== massCourseFilter)
        return false;
      return true;
    });
  }, [leads, massStatusFilter, massSourceFilter, massCourseFilter]);

  const uniqueStatuses = useMemo(
    () => [...new Set(leads.map((l) => l.status).filter(Boolean))],
    [leads]
  );
  const uniqueSources = useMemo(
    () => [...new Set(leads.map((l) => l.source).filter(Boolean))],
    [leads]
  );
  const uniqueCourses = useMemo(
    () => [...new Set(leads.map((l) => l.courseInterest).filter(Boolean))],
    [leads]
  );

  const handleMassSelectAll = () => {
    if (massSelectedLeadIds.size === filteredMassLeads.length) {
      setMassSelectedLeadIds(new Set());
    } else {
      setMassSelectedLeadIds(new Set(filteredMassLeads.map((l) => l.id)));
    }
  };

  const toggleMassLead = (id: string) => {
    setMassSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMassSend = async () => {
    if (!massTemplateId || massSelectedLeadIds.size === 0) return;
    setMassSending(true);
    setMassProgress(0);
    setMassResult(null);

    try {
      // Simulate progress (actual sending happens server-side)
      const total = massSelectedLeadIds.size;
      const progressInterval = setInterval(() => {
        setMassProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 90 / (total * 1.2);
        });
      }, 1000);

      const res = await fetch("/api/admin/emails/mass-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: massTemplateId,
          leadIds: Array.from(massSelectedLeadIds),
        }),
      });

      clearInterval(progressInterval);
      setMassProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send mass email");

      setMassResult({
        sent: data.sent,
        failed: data.failed,
        errors: data.errors || [],
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send mass email";
      setMassResult({ sent: 0, failed: massSelectedLeadIds.size, errors: [message] });
    } finally {
      setMassSending(false);
    }
  };

  const openMassEmail = () => {
    setMassTemplateId(null);
    setMassSelectedLeadIds(new Set());
    setMassStatusFilter("");
    setMassSourceFilter("");
    setMassCourseFilter("");
    setMassResult(null);
    setMassProgress(0);
    setShowMassEmail(true);
  };

  const massPreviewLead = useMemo(() => {
    const firstId = Array.from(massSelectedLeadIds)[0];
    return leads.find((l) => l.id === firstId);
  }, [massSelectedLeadIds, leads]);

  const massPreviewBody = useMemo(() => {
    if (!massTemplateId || !massPreviewLead) return "";
    const template = emailTemplates.find((t) => t.id === massTemplateId);
    if (!template) return "";
    return fillTemplate(template.body, {
      candidateName: massPreviewLead.name || "there",
      senderName: "[Your Name]",
      senderTitle: "[Your Title]",
      senderEmail: connectedEmail || "[Your Email]",
      senderPhone: "[Your Phone]",
    });
  }, [massTemplateId, massPreviewLead, connectedEmail]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);

  if (needsConnection) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-12 text-center space-y-4">
          <Mail size={48} className="mx-auto text-text-muted" />
          <h2 className="text-xl font-bold text-text-primary">
            Connect Your Outlook
          </h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Connect your Microsoft Outlook account to read and send emails
            directly from the CRM. Each team member connects their own account.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
          >
            <Mail size={16} />
            Connect Outlook Account
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

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
          <Link
            href="/admin/emails/templates"
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-text-secondary rounded-lg hover:bg-white/[0.08] hover:text-text-primary transition-colors text-sm font-medium"
          >
            <LayoutTemplate size={16} />
            Templates
          </Link>
          <button
            onClick={openMassEmail}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-text-secondary rounded-lg hover:bg-white/[0.08] hover:text-text-primary transition-colors text-sm font-medium"
          >
            <Users size={16} />
            Mass Email
          </button>
          <button
            onClick={() => {
              resetCompose();
              setComposeView("template-picker");
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

      {/* ──────────── TEMPLATE PICKER MODAL ──────────── */}
      {composeView === "template-picker" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <LayoutTemplate size={18} className="text-neon-blue" />
                <h3 className="text-base font-semibold text-text-primary">
                  Choose a Template
                </h3>
              </div>
              <button
                onClick={() => setComposeView("none")}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {/* Blank email option */}
              <button
                onClick={handleComposeBlank}
                className="w-full text-left p-4 rounded-xl border border-dashed border-white/[0.12] hover:border-neon-blue/40 hover:bg-neon-blue/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-neon-blue/10">
                    <FileText
                      size={16}
                      className="text-text-muted group-hover:text-neon-blue"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Blank Email
                    </p>
                    <p className="text-xs text-text-muted">
                      Start from scratch with an empty email
                    </p>
                  </div>
                </div>
              </button>

              {/* Templates by category */}
              {Object.entries(templatesByCategory).map(
                ([category, templates]) => (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center gap-2 py-2 px-1 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-secondary transition-colors"
                    >
                      {collapsedCategories.has(category) ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      {category}
                      <span className="text-[10px] font-normal normal-case">
                        ({templates.length})
                      </span>
                    </button>
                    {!collapsedCategories.has(category) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleSelectTemplate(template)}
                            className="text-left p-3 rounded-xl border border-white/[0.06] hover:border-neon-blue/30 hover:bg-neon-blue/5 transition-all group"
                          >
                            <p className="text-sm font-medium text-text-primary group-hover:text-neon-blue truncate">
                              {template.name}
                            </p>
                            <p className="text-[11px] text-text-muted mt-1 line-clamp-2">
                              {template.subject}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────── COMPOSE MODAL ──────────── */}
      {composeView === "compose" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-text-primary">
                  New Email
                </h3>
                {selectedTemplateId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                    {emailTemplates.find((t) => t.id === selectedTemplateId)
                      ?.name || "Template"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComposeView("template-picker")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-neon-blue hover:bg-neon-blue/5 rounded-lg transition-colors"
                >
                  <LayoutTemplate size={14} />
                  Change Template
                </button>
                <button
                  onClick={() => setComposeView("none")}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

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
                  {selectedTemplateId && (
                    <span className="ml-2 text-neon-blue/60">
                      (HTML template loaded)
                    </span>
                  )}
                </label>
                {selectedTemplateId ? (
                  <div className="w-full bg-white rounded-lg border border-white/[0.06] overflow-hidden">
                    <div
                      className="p-4 text-sm min-h-[200px] max-h-[400px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: composeBody }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Write your message..."
                    rows={10}
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20 resize-none"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Link to Lead (optional)
                </label>
                <select
                  value={composeLeadId}
                  onChange={(e) => {
                    setComposeLeadId(e.target.value);
                    // Auto-fill To field if lead selected
                    const lead = leads.find((l) => l.id === e.target.value);
                    if (lead) {
                      setComposeTo(lead.email);
                      // Replace placeholder in template body
                      if (selectedTemplateId && lead.name) {
                        setComposeBody((prev) =>
                          fillTemplate(prev, {
                            candidateName: lead.name,
                          })
                        );
                      }
                    }
                  }}
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

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setComposeView("none")}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={
                  sending || !composeTo || !composeSubject || !composeBody
                }
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

      {/* ──────────── MASS EMAIL MODAL ──────────── */}
      {showMassEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-neon-blue" />
                <h3 className="text-base font-semibold text-text-primary">
                  Mass Email
                </h3>
                {massSelectedLeadIds.size > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                    {massSelectedLeadIds.size} selected
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMassEmail(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {massResult ? (
                /* ── Results ── */
                <div className="p-8 space-y-6">
                  <div className="text-center space-y-3">
                    {massResult.failed === 0 ? (
                      <CheckCircle2
                        size={48}
                        className="mx-auto text-emerald-400"
                      />
                    ) : (
                      <AlertCircle
                        size={48}
                        className="mx-auto text-amber-400"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-text-primary">
                      Mass Email Complete
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="glass-card p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {massResult.sent}
                      </p>
                      <p className="text-xs text-text-muted mt-1">Sent</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">
                        {massResult.failed}
                      </p>
                      <p className="text-xs text-text-muted mt-1">Failed</p>
                    </div>
                  </div>
                  {massResult.errors.length > 0 && (
                    <div className="max-w-lg mx-auto space-y-2">
                      <p className="text-xs font-medium text-text-muted">
                        Errors:
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {massResult.errors.map((err, i) => (
                          <p
                            key={i}
                            className="text-xs text-red-400 bg-red-500/5 p-2 rounded"
                          >
                            {err}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <button
                      onClick={() => setShowMassEmail(false)}
                      className="px-6 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Form ── */
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
                  {/* Left: Template & Leads */}
                  <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
                    {/* Template selection */}
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-2">
                        Email Template *
                      </label>
                      <select
                        value={massTemplateId || ""}
                        onChange={(e) =>
                          setMassTemplateId(e.target.value || null)
                        }
                        className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
                      >
                        <option value="">Select a template...</option>
                        {Object.entries(templatesByCategory).map(
                          ([category, templates]) => (
                            <optgroup key={category} label={category}>
                              {templates.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </optgroup>
                          )
                        )}
                      </select>
                    </div>

                    {/* Filters */}
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-2">
                        Filter Leads
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={massStatusFilter}
                          onChange={(e) => {
                            setMassStatusFilter(e.target.value);
                            setMassSelectedLeadIds(new Set());
                          }}
                          className="px-2 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
                        >
                          <option value="">All Statuses</option>
                          {uniqueStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <select
                          value={massSourceFilter}
                          onChange={(e) => {
                            setMassSourceFilter(e.target.value);
                            setMassSelectedLeadIds(new Set());
                          }}
                          className="px-2 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
                        >
                          <option value="">All Sources</option>
                          {uniqueSources.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <select
                          value={massCourseFilter}
                          onChange={(e) => {
                            setMassCourseFilter(e.target.value);
                            setMassSelectedLeadIds(new Set());
                          }}
                          className="px-2 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-primary focus:outline-none focus:border-neon-blue/40"
                        >
                          <option value="">All Courses</option>
                          {uniqueCourses.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lead list */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-text-muted">
                          Select Leads ({filteredMassLeads.length} available)
                        </label>
                        <button
                          onClick={handleMassSelectAll}
                          className="text-[11px] text-neon-blue hover:text-neon-blue/80 transition-colors"
                        >
                          {massSelectedLeadIds.size ===
                          filteredMassLeads.length
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto rounded-lg border border-white/[0.06] divide-y divide-white/[0.04]">
                        {filteredMassLeads.length === 0 ? (
                          <p className="p-4 text-xs text-text-muted text-center">
                            No leads match filters
                          </p>
                        ) : (
                          filteredMassLeads.map((lead) => (
                            <label
                              key={lead.id}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={massSelectedLeadIds.has(lead.id)}
                                onChange={() => toggleMassLead(lead.id)}
                                className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.03] text-neon-blue focus:ring-neon-blue/30 focus:ring-offset-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-primary truncate">
                                  {lead.name}
                                </p>
                                <p className="text-[11px] text-text-muted truncate">
                                  {lead.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {lead.status && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted">
                                    {lead.status}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Preview */}
                  <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
                    <label className="block text-xs font-medium text-text-muted">
                      Email Preview
                      {massPreviewLead && (
                        <span className="ml-1 text-neon-blue/60">
                          (showing for {massPreviewLead.name})
                        </span>
                      )}
                    </label>
                    {massTemplateId && massPreviewLead ? (
                      <div className="bg-white rounded-lg overflow-hidden border border-white/[0.06]">
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs text-gray-500">
                            Subject:{" "}
                            <span className="text-gray-800 font-medium">
                              {fillTemplate(
                                emailTemplates.find(
                                  (t) => t.id === massTemplateId
                                )?.subject || "",
                                {
                                  candidateName:
                                    massPreviewLead.name || "there",
                                }
                              )}
                            </span>
                          </p>
                        </div>
                        <div
                          className="p-4 text-sm max-h-[350px] overflow-y-auto"
                          dangerouslySetInnerHTML={{
                            __html: massPreviewBody,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                        <LayoutTemplate
                          size={32}
                          className="mb-3 opacity-20"
                        />
                        <p className="text-xs text-center">
                          {!massTemplateId
                            ? "Select a template to preview"
                            : "Select at least one lead to preview"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!massResult && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
                <p className="text-xs text-text-muted">
                  {massSelectedLeadIds.size > 0
                    ? `${massSelectedLeadIds.size} lead${massSelectedLeadIds.size !== 1 ? "s" : ""} selected`
                    : "No leads selected"}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMassEmail(false)}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  {massSending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-40 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon-blue rounded-full transition-all duration-500"
                          style={{ width: `${massProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted">
                        {Math.round(massProgress)}%
                      </span>
                      <Loader2
                        size={16}
                        className="text-neon-blue animate-spin"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={handleMassSend}
                      disabled={
                        !massTemplateId || massSelectedLeadIds.size === 0
                      }
                      className="flex items-center gap-2 px-5 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                      Send to {massSelectedLeadIds.size} Lead
                      {massSelectedLeadIds.size !== 1 ? "s" : ""}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
