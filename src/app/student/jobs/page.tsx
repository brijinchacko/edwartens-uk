import { getTestSession } from "@/lib/test-session";
import { prisma } from "@/lib/prisma";
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Banknote,
} from "lucide-react";
import { JobActionButtons } from "./JobActionButtons";

export default async function JobsPage() {
  const session = getTestSession("STUDENT");

  let jobs: Array<{
    id: string;
    company: string;
    role: string;
    location: string | null;
    salaryRange: string | null;
    description: string;
    requirements: string | null;
    sentAt: Date;
    applicationStatus: string | null;
    applicationId: string | null;
  }> = [];

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        batch: true,
        jobApplications: true,
      },
    });

    if (student) {
      const notifications = await prisma.jobNotification.findMany({
        where: {
          OR: [
            { targetCourse: student.course },
            { targetBatchId: student.batch?.id },
          ],
        },
        orderBy: { sentAt: "desc" },
      });

      const appMap = new Map(
        student.jobApplications.map((a: { jobId: string; id: string; status: string }) => [a.jobId, a])
      );

      jobs = notifications.map((j: { id: string; company: string; role: string; location: string | null; salaryRange: string | null; description: string; requirements: string | null; sentAt: Date }) => {
        const app = appMap.get(j.id) as { id: string; status: string } | undefined;
        return {
          id: j.id,
          company: j.company,
          role: j.role,
          location: j.location,
          salaryRange: j.salaryRange,
          description: j.description,
          requirements: j.requirements,
          sentAt: j.sentAt,
          applicationStatus: app?.status || null,
          applicationId: app?.id || null,
        };
      });
    }
  } catch (error) {
    console.error("Jobs data error:", error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          Job Notifications
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Job opportunities matching your course and skills
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary">No job notifications yet.</p>
          <p className="text-xs text-text-muted mt-1">
            New opportunities will appear here as they become available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 size={18} className="text-neon-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {job.role}
                    </h3>
                    <p className="text-sm text-text-secondary">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-muted shrink-0">
                  <Clock size={12} />
                  {job.sentAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4">
                {job.location && (
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin size={12} className="text-text-muted" />
                    {job.location}
                  </div>
                )}
                {job.salaryRange && (
                  <div className="flex items-center gap-1.5 text-xs text-neon-green">
                    <Banknote size={12} />
                    {job.salaryRange}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary line-clamp-3">
                {job.description}
              </p>

              {/* Requirements */}
              {job.requirements && (
                <div className="p-3 bg-dark-primary/50 rounded-lg">
                  <p className="text-xs text-text-muted mb-1 font-medium">
                    Requirements
                  </p>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <JobActionButtons
                jobId={job.id}
                currentStatus={job.applicationStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
