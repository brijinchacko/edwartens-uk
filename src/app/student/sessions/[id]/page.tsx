"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
} from "lucide-react";

interface SessionData {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  videoUrl: string | null;
  videoPlatform: string | null;
  videoId: string | null;
  order: number;
  phase: { number: number; name: string };
  progress: {
    status: string;
    watchedSeconds: number;
  } | null;
  nextSessionId: string | null;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchedRef = useRef(0);

  // Load session data
  useEffect(() => {
    async function load() {
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

  // Track progress every 30 seconds
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

    // Increment watched seconds and save every 30s
    intervalRef.current = setInterval(() => {
      watchedRef.current += 30;
      setWatchedSeconds(watchedRef.current);
      saveProgress();
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Save on unmount
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
      // Try to extract YouTube ID from URL
      const ytMatch = data.videoUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s]+)/
      );
      if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
      }
      // Try Vimeo
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/sessions"
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sessions
        </Link>
        {data.nextSessionId && (
          <button
            onClick={() =>
              router.push(`/student/sessions/${data.nextSessionId}`)
            }
            className="flex items-center gap-2 text-sm text-neon-blue hover:underline"
          >
            Next Session <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Video Player */}
      <div className="glass-card overflow-hidden">
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
              <p className="text-text-secondary">
                Video not available yet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Session Info & Progress */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-neon-blue mb-1">
              Phase {data.phase.number} &bull; {data.phase.name}
            </p>
            <h1 className="text-lg font-bold text-text-primary">
              {data.title}
            </h1>
            {data.description && (
              <p className="text-sm text-text-secondary mt-2">
                {data.description}
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
                {formatDuration(watchedSeconds)} watched
              </span>
            )}
          </div>
        </div>

        {/* Watch Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">
              Watch Progress
            </span>
            <span className="text-xs text-text-muted">
              {progressPercent}%
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

        {/* Duration info */}
        {data.duration && (
          <p className="text-xs text-text-muted">
            Session duration: {formatDuration(data.duration)}
          </p>
        )}
      </div>
    </div>
  );
}
