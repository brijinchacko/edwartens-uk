"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, Video } from "lucide-react";

interface Phase {
  id: string;
  number: number;
  name: string;
  course: string;
}

function detectVideo(url: string) {
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\s?]+)/
  );
  if (ytMatch) {
    return { platform: "youtube", videoId: ytMatch[1] };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { platform: "vimeo", videoId: vimeoMatch[1] };
  }
  return { platform: null, videoId: null };
}

export default function CreateSessionModal({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phases, setPhases] = useState<Phase[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    phaseId: "",
    videoUrl: "",
    duration: "",
    order: "",
    isMandatory: true,
  });

  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/phases")
      .then((r) => r.json())
      .then((d) => setPhases(d.phases || []))
      .catch(() => {});
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "videoUrl") {
      const { platform } = detectVideo(value);
      setDetectedPlatform(platform);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { platform, videoId } = detectVideo(form.videoUrl);

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          phaseId: form.phaseId,
          videoUrl: form.videoUrl || null,
          videoPlatform: platform,
          videoId: videoId,
          duration: form.duration ? parseInt(form.duration) * 60 : null, // Convert minutes to seconds
          order: parseInt(form.order) || 1,
          isMandatory: form.isMandatory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session");

      setSuccess("Session created successfully!");
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        setForm({
          title: "",
          description: "",
          phaseId: "",
          videoUrl: "",
          duration: "",
          order: "",
          isMandatory: true,
        });
        setDetectedPlatform(null);
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium"
      >
        <Plus size={16} />
        Add Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] bg-[#0a0a14]/95 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Video size={18} className="text-neon-blue" />
                Add Session
              </h2>
              <button
                onClick={() => !loading && setOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to PLC Programming"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief description of the session..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Phase *
                </label>
                <select
                  name="phaseId"
                  required
                  value={form.phaseId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                >
                  <option value="" className="bg-[#0a0a14]">
                    Select Phase
                  </option>
                  {phases.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="bg-[#0a0a14] text-white"
                    >
                      Phase {p.number}: {p.name} (
                      {p.course === "PROFESSIONAL_MODULE" ? "PM" : "AI"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1.5">
                  Video URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleChange}
                  placeholder="YouTube or Vimeo URL"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                />
                {detectedPlatform && (
                  <p className="text-xs text-neon-green mt-1">
                    Detected: {detectedPlatform === "youtube" ? "YouTube" : "Vimeo"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    min={1}
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">
                    Order *
                  </label>
                  <input
                    type="number"
                    name="order"
                    required
                    min={1}
                    value={form.order}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-neon-blue/40 transition-colors"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isMandatory"
                  checked={form.isMandatory}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-neon-blue focus:ring-neon-blue/30"
                />
                <span className="text-sm text-text-secondary">
                  Mandatory session (required to unlock next)
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Session
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
