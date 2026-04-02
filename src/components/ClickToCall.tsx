"use client";

import { useState } from "react";
import { Phone, PhoneCall, PhoneOff, Loader2 } from "lucide-react";

type Props = {
  phoneNumber: string;
  leadId?: string;
  studentId?: string;
  sipExtension?: string; // The calling user's SIP extension
  compact?: boolean;
};

export function ClickToCall({ phoneNumber, leadId, studentId, sipExtension = "100", compact }: Props) {
  const [calling, setCalling] = useState(false);
  const [status, setStatus] = useState<"idle" | "ringing" | "error">("idle");

  const handleCall = async () => {
    setCalling(true);
    setStatus("ringing");

    try {
      const res = await fetch("/api/admin/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sipExtension,
          phoneNumber,
          leadId,
          studentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Call failed");
      }

      // Call initiated — Zadarma will ring the agent's phone first, then connect to the number
      setTimeout(() => {
        setCalling(false);
        setStatus("idle");
      }, 5000);
    } catch {
      setStatus("error");
      setTimeout(() => {
        setCalling(false);
        setStatus("idle");
      }, 3000);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleCall}
        disabled={calling}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
          status === "ringing"
            ? "bg-neon-green/20 text-neon-green animate-pulse"
            : status === "error"
            ? "bg-red-500/20 text-red-400"
            : "bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20"
        }`}
        title={`Call ${phoneNumber}`}
      >
        {calling ? (
          status === "ringing" ? (
            <PhoneCall size={12} />
          ) : (
            <PhoneOff size={12} />
          )
        ) : (
          <Phone size={12} />
        )}
        {compact ? null : phoneNumber}
      </button>
    );
  }

  return (
    <button
      onClick={handleCall}
      disabled={calling}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        status === "ringing"
          ? "bg-neon-green/20 text-neon-green border border-neon-green/30 animate-pulse"
          : status === "error"
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20"
      }`}
      title={`Call ${phoneNumber}`}
    >
      {calling ? (
        status === "ringing" ? (
          <>
            <PhoneCall size={14} className="animate-bounce" />
            Calling...
          </>
        ) : (
          <>
            <PhoneOff size={14} />
            Failed
          </>
        )
      ) : (
        <>
          <Phone size={14} />
          {phoneNumber}
        </>
      )}
    </button>
  );
}
