"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  Lock,
  PanelLeftClose,
  PanelLeft,
  Download,
  FileText,
} from "lucide-react";

interface SessionData {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  videoUrl: string | null;
  videoPlatform: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
  order: number;
  isMandatory: boolean;
  materials: any;
  phase: { number: number; name: string };
  instructorName: string | null;
  progress: {
    status: string;
    watchedSeconds: number;
  } | null;
  nextSessionId: string | null;
  previousSessionId: string | null;
  courseNav: {
    phases: Array<{
      id: string;
      number: number;
      name: string;
      sessions: Array<{
        id: string;
        title: string;
        order: number;
        status: string; // NOT_STARTED, IN_PROGRESS, COMPLETED, LOCKED
        duration: number | null;
      }>;
    }>;
  } | null;
}

export default function SessionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchedRef = useRef(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/sessions/${sessionId}`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
          setWatchedSeconds(d.progress?.watchedSeconds || 0);
          watchedRef.current = d.progress?.watchedSeconds || 0;
          setIsCompleted(d.progress?.status === "COMPLETED");
        }
      } catch {
        // Error loading
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const saveProgress = useCallback(async () => {
    try {
      await fetch(`/api/student/sessions/${sessionId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchedSeconds: watchedRef.current,
          status: "IN_PROGRESS",
        }),
      });
    } catch {
      // Silently fail
    }
  }, [sessionId]);

  useEffect(() => {
    if (isCompleted) return;

    intervalRef.current = setInterval(() => {
      watchedRef.current += 30;
      setWatchedSeconds(watchedRef.current);
      saveProgress();
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      saveProgress();
    };
  }, [isCompleted, saveProgress]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      const res = await fetch(
        `/api/student/sessions/${sessionId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchedSeconds: data?.duration || watchedRef.current,
            status: "COMPLETED",
          }),
        }
      );
      if (res.ok) {
        setIsCompleted(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      // Error
    } finally {
      setMarkingComplete(false);
    }
  };

  const totalDuration = data?.duration || 1;
  const progressPercent = isCompleted
    ? 100
    : Math.min(Math.round((watchedSeconds / totalDuration) * 100), 100);
  const canComplete = progressPercent >= 90 && !isCompleted;

  function getEmbedUrl(): string | null {
    if (!data) return null;
    if (data.videoPlatform === "youtube" && data.videoId) {
      return `https://www.youtube.com/embed/${data.videoId}?autoplay=1&rel=0`;
    }
    if (data.videoPlatform === "vimeo" && data.videoId) {
      return `https://player.vimeo.com/video/${data.videoId}?autoplay=1`;
    }
    if (data.videoUrl) {
      const ytMatch = data.videoUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s]+)/
      );
      if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
      }
      const vimeoMatch = data.videoUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
      }
      return data.videoUrl;
    }
    return null;
  }

  function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function formatMin(sec: number | null): string {
    if (!sec) return "--";
    return `${Math.floor(sec / 60)}m`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-text-secondary">Session not found.</p>
        <Link
          href="/student/sessions"
          className="text-sm text-neon-blue hover:underline mt-4 inline-block"
        >
          Back to Sessions
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl();
  const materials = data.materials
    ? Array.isArray(data.materials)
      ? data.materials
      : []
    : [];

  return (
    <div className="flex gap-0 lg:gap-6 relative">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-40 lg:hidden w-12 h-12 rounded-full bg-neon-blue/20 border border-neon-blue/30 text-neon-blue flex items-center justify-center shadow-lg"
      >
        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
      </button>

      {/* Course Navigator Sidebar */}
      {data.courseNav && (
        <div
          className={`fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto w-72 lg:w-64 shrink-0 bg-[#0a0a14] lg:bg-transparent border-r border-white/[0.06] lg:border-0 transform transition-transform lg:transform-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full overflow-y-auto p-4 lg:p-0 pt-16 lg:pt-0">
            <div className="glass-card p-3 space-y-3 lg:sticky lg:top-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2">
                Course Content
              </h3>
              {data.courseNav.phases.map((phase) => (
                <div key={phase.id}>
                  <p className="text-xs font-medium text-purple px-2 mb-1">
                    P{phase.number}: {phase.name}
                  </p>
                  <div className="space-y-0.5">
                    {phase.sessions.map((s) => {
                      const isCurrent = s.id === sessionId;
                      const isSessionCompleted = s.status === "COMPLETED";
                      const isLocked = s.status === "LOCKED";

                      return (
                        <div key={s.id}>
                          {isLocked ? (
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-40 cursor-not-allowed">
                              <Lock size={12} className="shrink-0 text-text-muted" />
                              <span className="text-xs text-text-muted truncate">
                                {s.title}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                router.push(`/student/sessions/${s.id}`);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                                isCurrent
                                  ? "bg-neon-blue/10 border border-neon-blue/20"
                                  : "hover:bg-white/[0.03]"
                              }`}
                            >
                              {isSessionCompleted ? (
                                <CheckCircle2
                                  size={12}
                                  className="shrink-0 text-neon-green"
                                />
                              ) : isCurrent ? (
                                <PlayCircle
                                  size={12}
                                  className="shrink-0 text-neon-blue"
                                />
                              ) : (
                                <PlayCircle
                                  size={12}
                                  className="shrink-0 text-text-muted"
                                />
                              )}
                              <span
                                className={`text-xs truncate ${
                                  isCurrent
                                    ? "text-neon-blue font-medium"
                                    : isSessionCompleted
                                    ? "text-text-secondary"
                                    : "text-text-muted"
                                }`}
                              >
                                {s.title}
                              </span>
                              <span className="text-[10px] text-text-muted ml-auto shrink-0">
                                {formatMin(s.duration)}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/sessions"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            All Sessions
          </Link>
          <div className="flex items-center gap-3">
            {data.previousSessionId && (
              <button
                onClick={() =>
                  router.push(`/student/sessions/${data.previousSessionId}`)
                }
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
            )}
            {data.nextSessionId && (
              <button
                onClick={() =>
                  router.push(`/student/sessions/${data.nextSessionId}`)
                }
                className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
              >
                Next
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="glass-card overflow-hidden rounded-xl">
          {embedUrl ? (
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={data.title}
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-dark-primary flex items-center justify-center">
              <div className="text-center">
                <PlayCircle
                  size={48}
                  className="mx-auto text-text-muted mb-3"
                />
                <p className="text-text-secondary">Video not available yet</p>
              </div>
            </div>
          )}
          {/* Progress Bar under video */}
          <div className="h-1 bg-dark-primary">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${progressPercent}%`,
                background: isCompleted
                  ? "#92E02C"
                  : "linear-gradient(90deg, #2891FF, #92E02C)",
              }}
            />
          </div>
        </div>

        {/* Session Info */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-neon-blue mb-1">
                Phase {data.phase.number} &bull; {data.phase.name}
              </p>
              <h1 className="text-lg font-bold text-text-primary">
                {data.title}
              </h1>
              {data.instructorName && (
                <p className="text-xs text-text-muted mt-1">
                  Instructor: {data.instructorName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded-full text-xs text-neon-green">
                  <CheckCircle2 size={12} />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-dark-tertiary border border-border rounded-full text-xs text-text-muted">
                  <Clock size={12} />
                  {formatDuration(watchedSeconds)}
                </span>
              )}
            </div>
          </div>

          {data.description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {data.description}
            </p>
          )}

          {/* Watch Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Watch Progress</span>
              <span className="text-xs text-text-muted">
                {progressPercent}%
                {data.duration && ` — ${formatDuration(data.duration)} total`}
              </span>
            </div>
            <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progressPercent}%`,
                  background: isCompleted
                    ? "#92E02C"
                    : "linear-gradient(90deg, #2891FF, #92E02C)",
                }}
              />
            </div>
          </div>

          {/* Mark as Complete */}
          {canComplete && (
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="w-full py-3 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded-lg hover:bg-neon-green/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {markingComplete ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Mark as Complete
            </button>
          )}

          {/* Auto-navigate on completion */}
          {isCompleted && data.nextSessionId && (
            <button
              onClick={() =>
                router.push(`/student/sessions/${data.nextSessionId}`)
              }
              className="w-full py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              Continue to Next Session
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Materials Section */}
        {materials.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FileText size={16} className="text-text-muted" />
              Session Materials
            </h3>
            <div className="space-y-2">
              {materials.map((m: any, i: number) => (
                <a
                  key={i}
                  href={m.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                >
                  <Download
                    size={14}
                    className="text-text-muted group-hover:text-neon-blue shrink-0"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">
                    {m.name || m.title || `Resource ${i + 1}`}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
