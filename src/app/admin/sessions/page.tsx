import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Video, Clock, CheckCircle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Sessions | EDWartens Admin",
  description: "Manage training sessions",
};

async function getSessions() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        phase: { select: { name: true, number: true, course: true } },
        _count: {
          select: { progress: true },
        },
      },
      orderBy: [
        { phase: { number: "asc" } },
        { order: "asc" },
      ],
    });

    // Get completion counts per session
    const completionCounts = await prisma.sessionProgress.groupBy({
      by: ["sessionId"],
      where: { status: "COMPLETED" },
      _count: true,
    });

    const completionMap = new Map<string, number>(
      completionCounts.map((c: any) => [c.sessionId, c._count] as [string, number])
    );

    // Group by phase
    const grouped = new Map<
      string,
      {
        phase: { name: string; number: number; course: string };
        sessions: typeof sessions;
      }
    >();

    for (const session of sessions) {
      const key = `${session.phase.course}-${session.phase.number}`;
      if (!grouped.has(key)) {
        grouped.set(key, { phase: session.phase, sessions: [] });
      }
      grouped.get(key)!.sessions.push(session);
    }

    return { grouped: Array.from(grouped.values()), completionMap };
  } catch {
    return { grouped: [], completionMap: new Map<string, number>() };
  }
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export default async function SessionsPage() {
  const { grouped, completionMap } = await getSessions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Sessions</h1>
        <p className="text-text-muted mt-1">
          Training sessions grouped by phase
        </p>
      </div>

      {grouped.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-text-muted">No sessions found</p>
        </div>
      ) : (
        grouped.map((group) => (
          <div key={`${group.phase.course}-${group.phase.number}`}>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              Phase {group.phase.number}: {group.phase.name}
            </h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-4 py-3 text-text-muted font-medium">
                        Title
                      </th>
                      <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                        Duration
                      </th>
                      <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                        Video
                      </th>
                      <th className="text-left px-4 py-3 text-text-muted font-medium">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                        Completion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.sessions.map((session: any) => {
                      const completed = completionMap.get(session.id) || 0;
                      const total = session._count.progress;
                      const rate =
                        total > 0
                          ? Math.round((completed / total) * 100)
                          : 0;

                      return (
                        <tr
                          key={session.id}
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Video
                                size={16}
                                className="text-text-muted shrink-0"
                              />
                              <span className="text-text-primary">
                                {session.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-text-muted" />
                              {formatDuration(session.duration)}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {session.videoUrl ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                                Available
                              </span>
                            ) : (
                              <span className="text-xs text-text-muted">
                                Not set
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {session.isMandatory ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                Mandatory
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-neon-green rounded-full"
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                              <span className="text-xs text-text-muted">
                                {rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
