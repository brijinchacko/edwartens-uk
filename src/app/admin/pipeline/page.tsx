import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABELS, formatDate } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lead Pipeline | EDWartens Admin",
  description: "Visual lead pipeline view",
};

const PIPELINE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  NEW: { bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  CONTACTED: { bg: "bg-yellow-500/5", border: "border-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-400" },
  QUALIFIED: { bg: "bg-green-500/5", border: "border-green-500/20", text: "text-green-400", dot: "bg-green-400" },
  ENROLLED: { bg: "bg-purple-500/5", border: "border-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  LOST: { bg: "bg-red-500/5", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-400" },
};

async function getPipelineData() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignedTo: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const pipeline: Record<string, typeof leads> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      ENROLLED: [],
      LOST: [],
    };

    for (const lead of leads) {
      if (pipeline[lead.status]) {
        pipeline[lead.status].push(lead);
      }
    }

    return pipeline;
  } catch {
    return { NEW: [], CONTACTED: [], QUALIFIED: [], ENROLLED: [], LOST: [] };
  }
}

export default async function PipelinePage() {
  const pipeline = await getPipelineData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Lead Pipeline</h1>
        <p className="text-text-muted mt-1">
          Visual overview of your lead funnel
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(pipeline).map(([status, leads]) => {
          const colors = PIPELINE_COLORS[status];
          return (
            <div key={status} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className={`flex items-center justify-between p-3 rounded-t-lg border ${colors.border} ${colors.bg}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <h3 className={`text-sm font-semibold ${colors.text}`}>
                    {LEAD_STATUS_LABELS[status] || status}
                  </h3>
                </div>
                <span className={`text-xs font-medium ${colors.text}`}>
                  {leads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 p-2 bg-white/[0.01] border border-t-0 border-white/[0.06] rounded-b-lg min-h-[200px]">
                {leads.length === 0 ? (
                  <p className="text-text-muted text-xs text-center py-8">
                    No leads
                  </p>
                ) : (
                  leads.slice(0, 10).map((lead: any) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-neon-blue/10 flex items-center justify-center text-[10px] font-medium text-neon-blue shrink-0">
                          {getInitials(lead.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary font-medium truncate">
                            {lead.name}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                        <span className="capitalize">{lead.source}</span>
                        {lead.followUpDate && (
                          <span>
                            Follow-up: {formatDate(lead.followUpDate)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
                {leads.length > 10 && (
                  <p className="text-xs text-text-muted text-center py-1">
                    +{leads.length - 10} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
