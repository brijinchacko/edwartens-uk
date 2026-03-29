"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutTemplate,
  Search,
  Eye,
  Send,
  Users,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Copy,
} from "lucide-react";
import Link from "next/link";
import {
  emailTemplates,
  getTemplatesByCategory,
  fillTemplate,
  type EmailTemplate,
} from "@/lib/email-templates";

/* ─── Types ──────────────────────────────────────────────────────── */
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  source?: string;
  courseInterest?: string;
}

type ViewMode = "browse" | "preview" | "compose" | "mass-send";

/* ─── Sample data for preview ────────────────────────────────────── */
const SAMPLE_VARIABLES: Record<string, string> = {
  name: "John Smith",
  firstName: "John",
  email: "john.smith@example.com",
  phone: "+44 7700 900000",
  course: "Professional Module",
  counsellorName: "Sarah Johnson",
  counsellorEmail: "sarah@edwartens.co.uk",
  counsellorPhone: "+44 7700 900001",
  counsellorTitle: "Training Advisor",
  companyName: "EDWartens UK",
};

/* ─── Category colours ───────────────────────────────────────────── */
const categoryColors: Record<string, string> = {
  "Initial Contact": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Post-Consultation": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Payment: "bg-green-500/10 text-green-400 border-green-500/20",
  "Follow-up": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Onboarding: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Post-Training": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

/* ═══════════════════════════════════════════════════════════════════ */

export default function TemplatesClient() {
  const [view, setView] = useState<ViewMode>("browse");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeLeadId, setComposeLeadId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Mass send state
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

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);
  const categories = useMemo(
    () => ["all", ...Object.keys(templatesByCategory)],
    [templatesByCategory]
  );

  const filteredTemplates = useMemo(() => {
    let list = emailTemplates;
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
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
              phone?: string;
              status?: string;
              source?: string;
              courseInterest?: string;
            }) => ({
              id: l.id,
              name: l.name,
              email: l.email,
              phone: l.phone,
              status: l.status,
              source: l.source,
              courseInterest: l.courseInterest,
            })
          )
        );
      }
    } catch {
      // optional
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* ─── Compose helpers ──────────────────────────────────────────── */
  const openCompose = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setComposeSubject(template.subject);
    setComposeBody(template.body);
    setComposeTo("");
    setComposeLeadId("");
    setSendResult(null);
    setView("compose");
  };

  const fillLeadIntoCompose = (lead: Lead) => {
    if (!selectedTemplate) return;
    setComposeTo(lead.email);
    setComposeLeadId(lead.id);
    const vars: Record<string, string> = {
      name: lead.name || "there",
      firstName: (lead.name || "there").split(" ")[0],
      email: lead.email,
      phone: lead.phone || "",
      course: lead.courseInterest || "Industrial Automation",
      counsellorName: "[Your Name]",
      counsellorEmail: "[Your Email]",
      counsellorPhone: "[Your Phone]",
      counsellorTitle: "[Your Title]",
      companyName: "EDWartens UK",
    };
    setComposeSubject(fillTemplate(selectedTemplate.subject, vars));
    setComposeBody(fillTemplate(selectedTemplate.body, vars));
  };

  const handleSend = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          leadId: composeLeadId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setSendResult({ ok: true, message: "Email sent successfully!" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send";
      setSendResult({ ok: false, message });
    } finally {
      setSending(false);
    }
  };

  /* ─── Mass send helpers ────────────────────────────────────────── */
  const openMassSend = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setMassSelectedLeadIds(new Set());
    setMassStatusFilter("");
    setMassSourceFilter("");
    setMassCourseFilter("");
    setMassResult(null);
    setMassProgress(0);
    setView("mass-send");
  };

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
    if (!selectedTemplate || massSelectedLeadIds.size === 0) return;
    setMassSending(true);
    setMassProgress(0);
    setMassResult(null);

    try {
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
          templateId: selectedTemplate.id,
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
      setMassResult({
        sent: 0,
        failed: massSelectedLeadIds.size,
        errors: [message],
      });
    } finally {
      setMassSending(false);
    }
  };

  const copyTemplateHtml = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/emails"
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
            <LayoutTemplate size={20} className="text-neon-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Email Templates
            </h1>
            <p className="text-xs text-text-muted">
              {emailTemplates.length} templates across{" "}
              {Object.keys(templatesByCategory).length} categories
            </p>
          </div>
        </div>
        <Link
          href="/admin/emails"
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-text-secondary rounded-lg hover:bg-white/[0.08] hover:text-text-primary transition-colors text-sm font-medium"
        >
          <Mail size={16} />
          Back to Inbox
        </Link>
      </div>

      {/* ── BROWSE VIEW ──────────────────────────────────────────── */}
      {view === "browse" && (
        <>
          {/* Search & Category Tabs */}
          <div className="space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    activeCategory === cat
                      ? "bg-neon-blue/10 text-neon-blue border-neon-blue/30"
                      : "bg-white/[0.03] text-text-muted border-white/[0.06] hover:bg-white/[0.06] hover:text-text-secondary"
                  }`}
                >
                  {cat === "all" ? "All Templates" : cat}
                  {cat !== "all" && (
                    <span className="ml-1.5 opacity-60">
                      ({templatesByCategory[cat]?.length || 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="glass-card p-4 hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      categoryColors[template.category] ||
                      "bg-white/[0.05] text-text-muted border-white/[0.08]"
                    }`}
                  >
                    {template.category}
                  </span>
                  <button
                    onClick={() => copyTemplateHtml(template)}
                    className="p-1 rounded text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy HTML"
                  >
                    {copiedId === template.id ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1 line-clamp-1">
                  {template.name}
                </h3>
                <p className="text-[11px] text-text-muted mb-3 line-clamp-2">
                  {template.subject}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setView("preview");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-white/[0.05] border border-white/[0.06] text-text-secondary hover:text-text-primary hover:bg-white/[0.08] transition-colors"
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                  <button
                    onClick={() => openCompose(template)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue hover:bg-neon-blue/20 transition-colors"
                  >
                    <Send size={12} />
                    Use Template
                  </button>
                  <button
                    onClick={() => openMassSend(template)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-white/[0.05] border border-white/[0.06] text-text-secondary hover:text-neon-green hover:border-neon-green/20 hover:bg-neon-green/5 transition-colors"
                  >
                    <Users size={12} />
                    Mass Send
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="glass-card p-12 text-center">
              <LayoutTemplate
                size={40}
                className="mx-auto text-text-muted mb-3 opacity-30"
              />
              <p className="text-sm text-text-muted">
                No templates found matching your search.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── PREVIEW VIEW ─────────────────────────────────────────── */}
      {view === "preview" && selectedTemplate && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("browse")}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">
                {selectedTemplate.name}
              </h2>
              <p className="text-xs text-text-muted">
                Subject: {fillTemplate(selectedTemplate.subject, SAMPLE_VARIABLES)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openCompose(selectedTemplate)}
                className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium"
              >
                <Send size={16} />
                Use Template
              </button>
              <button
                onClick={() => openMassSend(selectedTemplate)}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-text-secondary rounded-lg hover:bg-white/[0.08] hover:text-text-primary transition-colors text-sm font-medium"
              >
                <Users size={16} />
                Mass Send
              </button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  categoryColors[selectedTemplate.category] ||
                  "bg-white/[0.05] text-text-muted border-white/[0.08]"
                }`}
              >
                {selectedTemplate.category}
              </span>
              <span className="text-[10px] text-text-muted">
                Preview with sample data
              </span>
            </div>
            <div className="bg-white p-6 overflow-x-auto">
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: fillTemplate(selectedTemplate.body, SAMPLE_VARIABLES),
                }}
              />
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Template Variables
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.variables.map((v) => (
                <span
                  key={v}
                  className="text-[11px] px-2 py-1 rounded bg-white/[0.05] border border-white/[0.06] text-text-secondary font-mono"
                >
                  {"{{"}
                  {v}
                  {"}}"}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPOSE VIEW ─────────────────────────────────────────── */}
      {view === "compose" && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-text-primary">
                  Send Email
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                  {selectedTemplate.name}
                </span>
              </div>
              <button
                onClick={() => setView("browse")}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Lead picker */}
              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Select Lead (auto-fills variables)
                </label>
                <select
                  value={composeLeadId}
                  onChange={(e) => {
                    const lead = leads.find((l) => l.id === e.target.value);
                    if (lead) fillLeadIntoCompose(lead);
                  }}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/40 focus:ring-1 focus:ring-neon-blue/20"
                >
                  <option value="">-- Select a lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

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
                  Message (HTML template)
                </label>
                <div className="w-full bg-white rounded-lg border border-white/[0.06] overflow-hidden">
                  <div
                    className="p-4 text-sm min-h-[200px] max-h-[400px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: composeBody }}
                  />
                </div>
              </div>

              {sendResult && (
                <div
                  className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    sendResult.ok
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {sendResult.ok ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {sendResult.message}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
              <button
                onClick={() => setView("browse")}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !composeTo || !composeSubject}
                className="flex items-center gap-2 px-5 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MASS SEND VIEW ───────────────────────────────────────── */}
      {view === "mass-send" && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-[#0f0f1e] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-neon-green" />
                <h3 className="text-base font-semibold text-text-primary">
                  Mass Send
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                  {selectedTemplate.name}
                </span>
              </div>
              <button
                onClick={() => setView("browse")}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Filter by Status
                  </label>
                  <select
                    value={massStatusFilter}
                    onChange={(e) => setMassStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/40"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Filter by Source
                  </label>
                  <select
                    value={massSourceFilter}
                    onChange={(e) => setMassSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/40"
                  >
                    <option value="">All Sources</option>
                    {uniqueSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Filter by Course
                  </label>
                  <select
                    value={massCourseFilter}
                    onChange={(e) => setMassCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-neon-blue/40"
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

              {/* Select all / count */}
              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      filteredMassLeads.length > 0 &&
                      massSelectedLeadIds.size === filteredMassLeads.length
                    }
                    onChange={handleMassSelectAll}
                    className="rounded border-white/[0.12] bg-white/[0.03]"
                  />
                  Select All ({filteredMassLeads.length} leads)
                </label>
                <span className="text-xs text-text-muted">
                  {massSelectedLeadIds.size} selected
                </span>
              </div>

              {/* Lead list */}
              <div className="max-h-[280px] overflow-y-auto rounded-lg border border-white/[0.06] divide-y divide-white/[0.04]">
                {leadsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="text-neon-blue animate-spin" />
                  </div>
                ) : filteredMassLeads.length === 0 ? (
                  <div className="py-8 text-center text-sm text-text-muted">
                    No leads match your filters.
                  </div>
                ) : (
                  filteredMassLeads.map((lead) => (
                    <label
                      key={lead.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={massSelectedLeadIds.has(lead.id)}
                        onChange={() => toggleMassLead(lead.id)}
                        className="rounded border-white/[0.12] bg-white/[0.03]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">
                          {lead.name}
                        </p>
                        <p className="text-[11px] text-text-muted truncate">
                          {lead.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lead.status && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted">
                            {lead.status}
                          </span>
                        )}
                        {lead.source && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-muted">
                            {lead.source}
                          </span>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Progress bar */}
              {massSending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Sending emails...</span>
                    <span>{Math.round(massProgress)}%</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2">
                    <div
                      className="bg-neon-blue h-2 rounded-full transition-all duration-500"
                      style={{ width: `${massProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Results */}
              {massResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-green-400 text-sm">
                      <CheckCircle2 size={16} />
                      {massResult.sent} sent
                    </div>
                    {massResult.failed > 0 && (
                      <div className="flex items-center gap-1.5 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {massResult.failed} failed
                      </div>
                    )}
                  </div>
                  {massResult.errors.length > 0 && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 max-h-[120px] overflow-y-auto">
                      {massResult.errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
              <button
                onClick={() => setView("browse")}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMassSend}
                disabled={massSending || massSelectedLeadIds.size === 0}
                className="flex items-center gap-2 px-5 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {massSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {massSending
                  ? "Sending..."
                  : `Send to ${massSelectedLeadIds.size} Lead${
                      massSelectedLeadIds.size !== 1 ? "s" : ""
                    }`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
