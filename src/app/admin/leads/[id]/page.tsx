import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  COURSE_LABELS,
  LEAD_STATUS_LABELS,
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
  MessageSquare,
  UserPlus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Lead Detail | EDWartens Admin",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  QUALIFIED: "bg-green-500/10 text-green-400 border-green-500/20",
  ENROLLED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
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
  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

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
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status]}`}
            >
              {LEAD_STATUS_LABELS[lead.status] || lead.status}
            </span>
            <span className="text-text-muted text-sm">
              Created {formatDate(lead.createdAt)}
            </span>
          </div>
        </div>
        {lead.status !== "ENROLLED" && (
          <Link
            href={`/admin/leads/${lead.id}?action=convert`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-colors text-sm font-medium"
          >
            <UserPlus size={16} />
            Convert to Student
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">{lead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-text-muted shrink-0" />
                <span className="text-text-secondary">{lead.phone}</span>
              </div>
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

          {/* UTM Info */}
          {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
            <div className="glass-card p-5">
              <h2 className="text-base font-semibold text-text-primary mb-4">
                Attribution
              </h2>
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
          )}

          {/* Status Change */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Update Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  disabled={lead.status === key}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    lead.status === key
                      ? "opacity-50 cursor-not-allowed " + STATUS_COLORS[key]
                      : STATUS_COLORS[key] + " hover:opacity-80 cursor-pointer"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Timeline */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">
                Notes & Activity
              </h2>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-xs font-medium">
                <MessageSquare size={14} />
                Add Note
              </button>
            </div>

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
        </div>
      </div>
    </div>
  );
}
