"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { StickyNote, Plus, Trash2, Loader2, Maximize2, Minimize2 } from "lucide-react";

interface Note {
  id: string;
  content: string;
  color: string;
  updatedAt: string;
}

const COLORS = [
  { value: "yellow", bg: "border-l-yellow-400", label: "Yellow" },
  { value: "blue", bg: "border-l-blue-400", label: "Blue" },
  { value: "green", bg: "border-l-green-400", label: "Green" },
  { value: "pink", bg: "border-l-pink-400", label: "Pink" },
];

const COLOR_DOT: Record<string, string> = {
  yellow: "bg-yellow-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  pink: "bg-pink-400",
};

const COLOR_BORDER: Record<string, string> = {
  yellow: "border-l-yellow-400",
  blue: "border-l-blue-400",
  green: "border-l-green-400",
  pink: "border-l-pink-400",
};

export default function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [panelSize, setPanelSize] = useState<"sm" | "md" | "lg">("md");
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const PANEL_SIZES = {
    sm: { width: "w-[240px]", maxH: "max-h-[300px]", rows: 2 },
    md: { width: "w-[320px]", maxH: "max-h-[450px]", rows: 3 },
    lg: { width: "w-[420px]", maxH: "max-h-[600px]", rows: 6 },
  };
  const ps = PANEL_SIZES[panelSize];

  const toggleNoteExpand = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sticky-notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setDeleteConfirm(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/sticky-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", color: "yellow" }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
      }
    } catch {}
    setCreating(false);
  };

  const handleUpdate = async (id: string, updates: { content?: string; color?: string }) => {
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );

    try {
      await fetch("/api/admin/sticky-notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch {}
  };

  const handleContentChange = (id: string, content: string) => {
    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content } : n))
    );

    // Debounce save
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    debounceTimers.current[id] = setTimeout(() => {
      handleUpdate(id, { content });
    }, 2000);
  };

  const handleBlurSave = (id: string, content: string) => {
    // Clear debounce timer and save immediately
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
      delete debounceTimers.current[id];
    }
    handleUpdate(id, { content });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sticky-notes?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setDeleteConfirm(null);
      }
    } catch {}
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotes();
        }}
        className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
        title="Sticky Notes"
      >
        <StickyNote size={18} className="text-text-muted" />
        {notes.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-500 text-[9px] font-bold text-black flex items-center justify-center">
            {notes.length > 9 ? "9+" : notes.length}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 ${ps.width} ${ps.maxH} rounded-xl border border-white/[0.08] bg-[#0a0a14] shadow-2xl z-50 flex flex-col transition-all duration-200`}>
          {/* Header */}
          <div className="p-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-text-primary">Sticky Notes</h3>
            <div className="flex items-center gap-1.5">
              {/* Size toggle */}
              {(["sm", "md", "lg"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setPanelSize(size)}
                  className={`w-5 h-5 rounded text-[9px] font-bold transition-colors ${
                    panelSize === size
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-white/[0.03] text-text-muted border border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                  title={size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
                >
                  {size === "sm" ? "S" : size === "md" ? "M" : "L"}
                </button>
              ))}
              {/* Add button */}
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-medium hover:bg-yellow-500/20 transition-colors disabled:opacity-50 ml-1"
              >
                {creating ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Plus size={10} />
                )}
                Add
              </button>
            </div>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={16} className="animate-spin text-text-muted" />
              </div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No sticky notes yet. Click &quot;Add Note&quot; to create one.
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`rounded-lg bg-white/[0.02] border border-white/[0.06] border-l-[3px] ${COLOR_BORDER[note.color] || "border-l-yellow-400"}`}
                >
                  <textarea
                    value={note.content}
                    onChange={(e) => handleContentChange(note.id, e.target.value)}
                    onBlur={(e) => handleBlurSave(note.id, e.target.value)}
                    placeholder="Type your note..."
                    className="w-full p-2.5 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none resize-y"
                    style={{ minHeight: expandedNotes.has(note.id) ? 150 : 48, maxHeight: expandedNotes.has(note.id) ? 400 : 120 }}
                    rows={expandedNotes.has(note.id) ? 8 : ps.rows}
                  />
                  <div className="flex items-center justify-between px-2.5 pb-2">
                    {/* Color picker */}
                    <div className="flex items-center gap-1.5">
                      {COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => handleUpdate(note.id, { color: c.value })}
                          className={`w-4 h-4 rounded-full ${COLOR_DOT[c.value]} transition-transform ${
                            note.color === c.value ? "ring-2 ring-white/40 scale-110" : "opacity-60 hover:opacity-100"
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                    {/* Expand/Collapse */}
                    <button
                      onClick={() => toggleNoteExpand(note.id)}
                      className="p-1 rounded hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-colors"
                      title={expandedNotes.has(note.id) ? "Collapse" : "Expand"}
                    >
                      {expandedNotes.has(note.id) ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                    </button>
                    {/* Delete */}
                    {deleteConfirm === note.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium text-text-muted hover:text-text-secondary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(note.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
