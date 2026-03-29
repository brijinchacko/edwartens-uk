"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";

const NOTE_TYPES = [
  "Note",
  "Call Log",
  "Email Log",
  "Follow-up",
  "Internal Note",
] as const;

interface StudentNotesProps {
  studentId: string;
}

export default function StudentNotes({ studentId }: StudentNotesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("Note");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");

    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add note");
        return;
      }

      setContent("");
      setType("Note");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Failed to add note");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm focus:outline-none focus:border-neon-blue/40 transition-colors disabled:opacity-50"
        >
          {NOTE_TYPES.map((t) => (
            <option key={t} value={t} className="bg-dark-secondary">
              {t}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note, call log, or follow-up..."
        disabled={isPending}
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-neon-blue/40 transition-colors resize-none disabled:opacity-50"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 text-neon-blue text-sm font-medium border border-neon-blue/30 hover:bg-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} />
          {isPending ? "Adding..." : "Add Note"}
        </button>
      </div>
    </form>
  );
}
