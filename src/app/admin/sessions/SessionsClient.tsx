"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Clock, Trash2, Loader2 } from "lucide-react";
import CreateSessionModal from "./CreateSessionModal";
import BulkImportSessions from "./BulkImportSessions";

interface SessionItem {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  videoPlatform: string | null;
  duration: number | null;
  isMandatory: boolean;
  order: number;
  phase: { id: string; number: number; name: string; course: string };
  batch: { id: string; name: string } | null;
  enrolled: number;
  completed: number;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export default function SessionsClient({
  initialSessions,
}: {
  initialSessions: SessionItem[];
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered =
    courseFilter === "ALL"
      ? sessions
      : sessions.filter((s) => s.phase.course === courseFilter);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete session "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/sessions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // Error
    } finally {
      setDeleting(null);
    }
  };

  const handleSuccess = () => {
    router.refresh();
  };

  // Group by phase
  const grouped = new Map<
    string,
    {
      phase: { name: string; number: number; course: string };
      sessions: SessionItem[];
    }
  >();
  for (const session of filtered) {
    const key = `${session.phase.course}-${session.phase.number}`;
    if (!grouped.has(key)) {
      grouped.set(key, { phase: session.phase, sessions: [] });
    }
    grouped.get(key)!.sessions.push(session);
  }
  const groups = Array.from(grouped.values());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sessions</h1>
          <p className="text-text-muted mt-1">
            Manage training sessions and video content ({sessions.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportSessions onSuccess={handleSuccess} />
          <CreateSessionModal onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Course Filter */}
      <div className="flex gap-2">
        {["ALL", "PROFESSIONAL_MODULE", "AI_MODULE"].map((c) => (
          <button
            key={c}
            onClick={() => setCourseFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              courseFilter === c
                ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                : "bg-white/[0.03] text-text-muted border border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            {c === "ALL"
              ? "All Courses"
              : c === "PROFESSIONAL_MODULE"
              ? "Professional Module"
              : "AI Module"}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Video size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">No sessions found</p>
          <p className="text-xs text-text-muted mt-1">
            Create sessions individually or bulk import from CSV
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={`${group.phase.course}-${group.phase.number}`}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-text-primary">
                Phase {group.phase.number}: {group.phase.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple/10 text-purple">
                {group.phase.course === "PROFESSIONAL_MODULE" ? "PM" : "AI"}
              </span>
              <span className="text-xs text-text-muted">
                {group.sessions.length} session
                {group.sessions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-4 py-3 text-text-muted font-medium">
                        #
                      </th>
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
                        Progress
                      </th>
                      <th className="text-right px-4 py-3 text-text-muted font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.sessions.map((session) => {
                      const rate =
                        session.enrolled > 0
                          ? Math.round(
                              (session.completed / session.enrolled) * 100
                            )
                          : 0;

                      return (
                        <tr
                          key={session.id}
                          className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 text-text-muted text-xs">
                            {session.order}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Video
                                size={16}
                                className="text-text-muted shrink-0"
                              />
                              <div>
                                <span className="text-text-primary">
                                  {session.title}
                                </span>
                                {session.description && (
                                  <p className="text-xs text-text-muted truncate max-w-[300px]">
                                    {session.description}
                                  </p>
                                )}
                              </div>
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
                                {session.videoPlatform === "youtube"
                                  ? "YouTube"
                                  : session.videoPlatform === "vimeo"
                                  ? "Vimeo"
                                  : "Link"}
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
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() =>
                                handleDelete(session.id, session.title)
                              }
                              disabled={deleting === session.id}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete session"
                            >
                              {deleting === session.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
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
