import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, COURSE_LABELS } from "@/lib/utils";
import { Briefcase, MapPin, Users, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Job Notifications | EDWartens Admin",
  description: "Manage job alerts and notifications",
};

async function getJobs() {
  try {
    return await prisma.jobNotification.findMany({
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { sentAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Job Notifications
          </h1>
          <p className="text-text-muted mt-1">
            {jobs.length} job alert{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium w-fit">
          <Plus size={16} />
          Send Job Alert
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No job alerts sent yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job: any) => (
            <div key={job.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-text-primary font-semibold">
                    {job.role}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Briefcase size={14} className="text-text-muted" />
                    <span className="text-sm text-text-secondary">
                      {job.company}
                    </span>
                  </div>
                </div>
                {job.targetCourse && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue">
                    {COURSE_LABELS[job.targetCourse] || job.targetCourse}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted line-clamp-2 mb-3">
                {job.description}
              </p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-3">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {job.location}
                    </span>
                  )}
                  {job.salaryRange && (
                    <span>{job.salaryRange}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    Sent to {job.sentTo.length}
                  </span>
                  <span>
                    {job._count.applications} applied
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/[0.04] text-xs text-text-muted">
                Sent {formatDate(job.sentAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
