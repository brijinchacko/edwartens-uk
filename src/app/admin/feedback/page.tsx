"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Minus, MessageSquare, Eye, EyeOff, BarChart3 } from "lucide-react";

interface FeedbackItem {
  id: string;
  npsScore: number | null;
  rating: number | null;
  feedback: string | null;
  testimonial: string | null;
  canPublish: boolean;
  type: string;
  createdAt: string;
  student: {
    user: { name: string; email: string };
  };
}

interface Metrics {
  npsScore: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  avgRating: number;
  ratingCount: number;
  testimonialCount: number;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "testimonials" | "all">("overview");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/feedback")
      .then((res) => res.json())
      .then((data) => {
        setFeedback(data.feedback || []);
        setMetrics(data.metrics || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePublish = async (id: string, canPublish: boolean) => {
    await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, canPublish }),
    });
    setFeedback((prev) =>
      prev.map((f) => (f.id === id ? { ...f, canPublish } : f))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/[0.06] rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const testimonials = feedback.filter(
    (f) => f.testimonial && f.testimonial.trim() !== ""
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Student Feedback</h1>
          <p className="text-text-muted mt-1">NPS scores, ratings, and testimonials</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg w-fit">
        {(["overview", "testimonials", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              tab === t
                ? "bg-neon-blue text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NPS Score */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-muted">NPS Score</p>
              <BarChart3 size={18} className="text-neon-blue" />
            </div>
            <p className={`text-4xl font-bold ${
              metrics.npsScore >= 50 ? "text-green-400" :
              metrics.npsScore >= 0 ? "text-yellow-400" :
              "text-red-400"
            }`}>
              {metrics.npsScore}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Based on {metrics.totalResponses} responses
            </p>
            {/* NPS Breakdown Bar */}
            {metrics.totalResponses > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                  {metrics.promoters > 0 && (
                    <div
                      className="bg-green-500 rounded-l-full"
                      style={{ width: `${(metrics.promoters / metrics.totalResponses) * 100}%` }}
                    />
                  )}
                  {metrics.passives > 0 && (
                    <div
                      className="bg-yellow-500"
                      style={{ width: `${(metrics.passives / metrics.totalResponses) * 100}%` }}
                    />
                  )}
                  {metrics.detractors > 0 && (
                    <div
                      className="bg-red-500 rounded-r-full"
                      style={{ width: `${(metrics.detractors / metrics.totalResponses) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-green-400">
                    <ThumbsUp size={10} /> {metrics.promoters} Promoters
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Minus size={10} /> {metrics.passives} Passives
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <ThumbsDown size={10} /> {metrics.detractors} Detractors
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Average Rating */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-muted">Average Course Rating</p>
              <Star size={18} className="text-yellow-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-yellow-400">{metrics.avgRating}</p>
              <span className="text-lg text-text-muted">/5</span>
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(metrics.avgRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-white/20"}
                />
              ))}
              <span className="text-xs text-text-muted ml-2">
                {metrics.ratingCount} ratings
              </span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-muted">Testimonials</p>
              <MessageSquare size={18} className="text-cyan" />
            </div>
            <p className="text-4xl font-bold text-cyan">{metrics.testimonialCount}</p>
            <p className="text-xs text-text-muted mt-1">
              {testimonials.filter((t) => t.canPublish).length} published
            </p>
          </div>
        </div>
      )}

      {/* Testimonials Tab */}
      {tab === "testimonials" && (
        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <MessageSquare size={32} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">No testimonials yet</p>
            </div>
          ) : (
            testimonials.map((fb) => (
              <div key={fb.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-text-primary">{fb.student.user.name}</p>
                      {fb.npsScore !== null && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          fb.npsScore >= 9 ? "bg-green-500/10 text-green-400" :
                          fb.npsScore >= 7 ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          NPS: {fb.npsScore}
                        </span>
                      )}
                      {fb.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                          <Star size={10} className="fill-yellow-400" /> {fb.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary italic">
                      &ldquo;{fb.testimonial}&rdquo;
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(fb.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePublish(fb.id, !fb.canPublish)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      fb.canPublish
                        ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        : "bg-white/[0.06] text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {fb.canPublish ? <Eye size={14} /> : <EyeOff size={14} />}
                    {fb.canPublish ? "Published" : "Unpublished"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Feedback Tab / Overview Tab */}
      {(tab === "all" || tab === "overview") && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">NPS</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Feedback</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                      No feedback submitted yet
                    </td>
                  </tr>
                ) : (
                  feedback.slice(0, tab === "overview" ? 10 : undefined).map((fb) => (
                    <tr key={fb.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-primary font-medium">{fb.student.user.name}</p>
                        <p className="text-xs text-text-muted">{fb.student.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {fb.npsScore !== null ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            fb.npsScore >= 9 ? "bg-green-500/10 text-green-400" :
                            fb.npsScore >= 7 ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {fb.npsScore}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {fb.rating ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= fb.rating! ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-text-secondary truncate">
                          {fb.feedback || fb.testimonial || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                        {new Date(fb.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
