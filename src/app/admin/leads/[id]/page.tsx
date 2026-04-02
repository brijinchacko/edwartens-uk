import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  COURSE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  formatDate,
} from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Tag,
  User,
  Clock,
  FileText,
  Download,
  Image,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import LeadActionsWithCallLog from "./LeadActionsWithCallLog";
import LeadEmails from "./LeadEmails";

export const metadata: Metadata = {
  title: "Lead Detail | EDWartens Admin",
};

async function getLead(id: string) {
  try {
    return await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          include: { user: { select: { name: true, email: true } } },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userRole = (session?.user as any)?.role || "ADMIN";

  const [lead, employeeList] = await Promise.all([
    getLead(id),
    prisma.employee.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  if (!lead) {
    notFound();
  }

  const employees = employeeList.map((e) => ({ id: e.id, name: e.user.name }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/leads"
          className="p-2 rounded-lg hover:bg-white/[0.03] text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{lead.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${LEAD_STATUS_COLORS[lead.status] ? `${LEAD_STATUS_COLORS[lead.status].bg} ${LEAD_STATUS_COLORS[lead.status].text} ${LEAD_STATUS_COLORS[lead.status].border}` : "bg-white/[0.05] text-text-muted"}`}
            >
              {LEAD_STATUS_LABELS[lead.status] || lead.status}
            </span>
            <span className="text-text-muted text-sm">
              Created {formatDate(lead.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Follow-up Alert */}
      {lead.followUpDate && (() => {
        const now = new Date();
        const followUp = new Date(lead.followUpDate);
        const diffMs = followUp.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;
        const isToday = diffDays === 0;
        const isSoon = diffDays > 0 && diffDays <= 2;

        let message = "";
        let colorClass = "";
        if (isOverdue) {
          message = `Follow up overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}!`;
          colorClass = "bg-red-500/10 border-red-500/20 text-red-400";
        } else if (isToday) {
          message = "Follow up is today!";
          colorClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
        } else if (isSoon) {
          message = `Follow up in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
          colorClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
        } else {
          message = `Follow up in ${diffDays} days`;
          colorClass = "bg-neon-blue/10 border-neon-blue/20 text-neon-blue";
        }

        return (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClass}`}>
            <Calendar size={16} />
            <div>
              <span className="text-sm font-medium">{message}</span>
              <span className="text-xs opacity-70 ml-2">
                {formatDate(lead.followUpDate)}
              </span>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <details open className="glass-card group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <User size={16} className="text-neon-blue" />
                Contact Information
              </h2>
              <ChevronDown size={16} className="text-text-muted group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 pb-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">{lead.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary">{lead.phone}</span>
                </div>
                {lead.alternatePhone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-text-muted shrink-0" />
                    <span className="text-text-secondary">{lead.alternatePhone} <span className="text-text-muted text-xs">(alt)</span></span>
                  </div>
                )}
                {lead.enquiryDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-text-muted shrink-0" />
                    <span className="text-text-secondary">Enquiry: {formatDate(lead.enquiryDate)}</span>
                  </div>
                )}
                {lead.courseInterest && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag size={16} className="text-text-muted shrink-0" />
                    <span className="text-text-secondary">
                      {COURSE_LABELS[lead.courseInterest] || lead.courseInterest}
                    </span>
                  </div>
                )}
                {lead.qualification && (
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-text-muted shrink-0" />
                    <span className="text-text-secondary">
                      {lead.qualification}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Tag size={16} className="text-text-muted shrink-0" />
                  <span className="text-text-secondary capitalize">
                    Source: {lead.source}
                  </span>
                </div>
                {lead.followUpDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-text-muted shrink-0" />
                    <span className="text-text-secondary">
                      Follow-up: {formatDate(lead.followUpDate)}
                    </span>
                  </div>
                )}
                {lead.assignedTo && (
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-text-muted shrink-0" />
                    <span className="text-text-secondary">
                      Assigned to: {lead.assignedTo.user.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* UTM Info */}
          {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
            <details open className="glass-card group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Tag size={16} className="text-neon-blue" />
                  Attribution
                </h2>
                <ChevronDown size={16} className="text-text-muted group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-5">
                <div className="space-y-2 text-sm">
                  {lead.utmSource && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Source</span>
                      <span className="text-text-secondary">
                        {lead.utmSource}
                      </span>
                    </div>
                  )}
                  {lead.utmMedium && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Medium</span>
                      <span className="text-text-secondary">
                        {lead.utmMedium}
                      </span>
                    </div>
                  )}
                  {lead.utmCampaign && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Campaign</span>
                      <span className="text-text-secondary">
                        {lead.utmCampaign}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </details>
          )}
        </div>

        {/* Documents/Files + Actions + Notes Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imported Files Section */}
          {(() => {
            const fileNotes = lead.notes.filter((n: any) => n.content?.includes("[File Imported]"));
            if (fileNotes.length === 0) return null;
            return (
              <details open className="glass-card group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <FileText size={16} className="text-neon-blue" />
                    Documents & Files ({fileNotes.length})
                  </h2>
                  <ChevronDown size={16} className="text-text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fileNotes.map((note: any) => {
                      const match = note.content?.match(/\[File Imported\]\s*(.+?)\s*\((.+?)\)\s*—\s*(\S+)/);
                      if (!match) return null;
                      const [, fileName, fileSize, fileUrl] = match;
                      const isPdf = fileName?.toLowerCase().endsWith(".pdf");
                      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName || "");
                      return (
                        <a
                          key={note.id}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? "bg-red-500/10" : isImage ? "bg-blue-500/10" : "bg-white/[0.05]"}`}>
                            {isImage ? <Image size={14} className="text-blue-400" /> : <FileText size={14} className={isPdf ? "text-red-400" : "text-text-muted"} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-primary truncate group-hover:text-neon-blue transition-colors">{fileName}</p>
                            <p className="text-[10px] text-text-muted">{fileSize}</p>
                          </div>
                          <Download size={12} className="text-text-muted group-hover:text-neon-blue shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </details>
            );
          })()}
          {/* Emails Section */}
          <LeadEmails leadId={lead.id} leadEmail={lead.email} />

          <LeadActionsWithCallLog
            leadId={lead.id}
            leadName={lead.name}
            currentStatus={lead.status}
            isConverted={!!lead.convertedToStudentId}
            courseInterest={lead.courseInterest}
            phone={lead.phone}
            email={lead.email}
            followUpDate={lead.followUpDate ? lead.followUpDate.toISOString() : null}
            assignedToId={lead.assignedToId}
            assignedToName={lead.assignedTo?.user?.name || null}
            userRole={userRole}
            employees={employees}
            category={lead.category || null}
          />

          {/* Notes List (server-rendered) */}
          <details open className="glass-card group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <MessageSquare size={16} className="text-neon-blue" />
                Notes Timeline
              </h2>
              <ChevronDown size={16} className="text-text-muted group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 pb-5">
              {lead.notes.length === 0 ? (
                <p className="text-text-muted text-sm py-8 text-center">
                  No notes yet. Add a note to track your interactions.
                </p>
              ) : (
                <div className="space-y-4">
                  {lead.notes.map((note: any) => (
                    <div
                      key={note.id}
                      className="relative pl-6 pb-4 border-l border-white/[0.06] last:pb-0"
                    >
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-neon-blue" />
                      <div className="bg-white/[0.02] rounded-lg p-3">
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-text-muted">
                            {note.createdBy}
                          </span>
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
