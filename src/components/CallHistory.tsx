"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Clock,
  Loader2,
} from "lucide-react";

type CallLog = {
  id: string;
  direction: "INBOUND" | "OUTBOUND" | "INTERNAL";
  status: "RINGING" | "ANSWERED" | "MISSED" | "BUSY" | "FAILED" | "VOICEMAIL";
  callerNumber: string;
  calledNumber: string;
  duration: number;
  isRecorded: boolean;
  recordingUrl: string | null;
  notes: string | null;
  startedAt: string;
  user?: { name: string } | null;
};

type Props = {
  leadId?: string;
  studentId?: string;
};

export function CallHistory({ leadId, studentId }: Props) {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (leadId) params.set("leadId", leadId);
    if (studentId) params.set("studentId", studentId);
    params.set("limit", "20");

    fetch(`/api/admin/calls?${params}`)
      .then((res) => res.json())
      .then((data) => setCalls(data.calls || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [leadId, studentId]);

  const formatDuration = (secs: number) => {
    if (secs === 0) return "0s";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (direction: string, status: string) => {
    if (status === "MISSED" || status === "FAILED") return <PhoneMissed size={14} className="text-red-400" />;
    if (direction === "INBOUND") return <PhoneIncoming size={14} className="text-neon-green" />;
    if (direction === "OUTBOUND") return <PhoneOutgoing size={14} className="text-neon-blue" />;
    return <Phone size={14} className="text-text-muted" />;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ANSWERED: "bg-neon-green/10 text-neon-green",
      MISSED: "bg-red-500/10 text-red-400",
      BUSY: "bg-yellow-500/10 text-yellow-400",
      FAILED: "bg-red-500/10 text-red-400",
      RINGING: "bg-neon-blue/10 text-neon-blue",
      VOICEMAIL: "bg-purple/10 text-purple",
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status] || "bg-white/5 text-text-muted"}`}>
        {status}
      </span>
    );
  };

  const handlePlayRecording = async (callId: string) => {
    setPlayingId(callId);
    try {
      const res = await fetch(`/api/admin/calls/recording?id=${callId}`);
      const data = await res.json();
      if (data.url) {
        const audio = new Audio(data.url);
        audio.play();
        audio.onended = () => setPlayingId(null);
      }
    } catch {
      setPlayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted py-4">
        <Loader2 size={14} className="animate-spin" />
        Loading call history...
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4">No call history yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {calls.map((call) => (
        <div key={call.id} className="glass-card rounded-lg p-3 flex items-center gap-3">
          <div className="flex-shrink-0">{getIcon(call.direction, call.status)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-white">
                {call.direction === "OUTBOUND" ? call.calledNumber : call.callerNumber}
              </span>
              {getStatusBadge(call.status)}
              {call.duration > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock size={10} />
                  {formatDuration(call.duration)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-text-muted">{formatTime(call.startedAt)}</span>
              {call.user && (
                <span className="text-[10px] text-text-muted">by {call.user.name}</span>
              )}
            </div>
          </div>
          {call.isRecorded && (
            <button
              onClick={() => handlePlayRecording(call.id)}
              disabled={playingId === call.id}
              className="flex-shrink-0 w-7 h-7 rounded-md bg-neon-blue/10 flex items-center justify-center text-neon-blue hover:bg-neon-blue/20 transition-colors"
              title="Play recording"
            >
              {playingId === call.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Play size={12} />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
