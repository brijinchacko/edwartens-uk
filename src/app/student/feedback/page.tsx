"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle, MessageSquare } from "lucide-react";

export default function StudentFeedbackPage() {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pastFeedback, setPastFeedback] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/student/feedback")
      .then((res) => res.json())
      .then((data) => setPastFeedback(data.feedback || []))
      .catch(() => {});
  }, [submitted]);

  const handleSubmit = async () => {
    if (npsScore === null && rating === 0 && !feedback && !testimonial) {
      setError("Please provide at least one form of feedback");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/student/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NPS",
          npsScore,
          rating: rating > 0 ? rating : null,
          feedback: feedback || null,
          testimonial: testimonial || null,
          canPublish,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback");
        return;
      }

      setSubmitted(true);
      setNpsScore(null);
      setRating(0);
      setFeedback("");
      setTestimonial("");
      setCanPublish(false);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const npsLabels: Record<number, string> = {
    0: "Not at all likely",
    1: "Very unlikely",
    2: "Unlikely",
    3: "Somewhat unlikely",
    4: "Neutral",
    5: "Neutral",
    6: "Somewhat likely",
    7: "Likely",
    8: "Very likely",
    9: "Extremely likely",
    10: "Absolutely!",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Share Your Feedback</h1>
        <p className="text-text-muted mt-1">
          Your feedback helps us improve the learning experience for everyone.
        </p>
      </div>

      {submitted && (
        <div className="glass-card p-4 border-l-4 border-green-500 bg-green-500/5">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-green-400 font-medium text-sm">
              Thank you for your feedback!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 border-l-4 border-red-500 bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* NPS Score */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-2">
          How likely are you to recommend EDWartens? (0-10)
        </h2>
        <p className="text-xs text-text-muted mb-4">
          0 = Not at all likely, 10 = Extremely likely
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => i).map((score) => (
            <button
              key={score}
              onClick={() => setNpsScore(score)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                npsScore === score
                  ? score <= 6
                    ? "bg-red-500 text-white"
                    : score <= 8
                    ? "bg-yellow-500 text-white"
                    : "bg-green-500 text-white"
                  : "bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        {npsScore !== null && (
          <p className="mt-2 text-xs text-text-muted">{npsLabels[npsScore]}</p>
        )}
      </div>

      {/* Course Rating */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-3">
          Rate your course experience
        </h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-white/20"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-text-muted">{rating}/5</span>
          )}
        </div>
      </div>

      {/* Written Feedback */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-3">
          Your Feedback
        </h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us what you liked, what could be improved, or any suggestions..."
          rows={4}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-neon-blue/50 resize-none"
        />
      </div>

      {/* Testimonial */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-text-primary mb-2">
          Share Your Success Story
        </h2>
        <p className="text-xs text-text-muted mb-3">
          Would you like to share your experience? This may be featured on our website.
        </p>
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="Share how EDWartens training has helped your career..."
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-neon-blue/50 resize-none"
        />
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={canPublish}
            onChange={(e) => setCanPublish(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/[0.04] text-neon-blue focus:ring-neon-blue/50"
          />
          <span className="text-sm text-text-secondary">
            I consent to EDWartens using my testimonial for marketing
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue text-white rounded-lg font-medium hover:bg-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {submitting ? (
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Send size={16} />
        )}
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>

      {/* Past Feedback */}
      {pastFeedback.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-neon-blue" />
            Your Previous Feedback
          </h2>
          <div className="space-y-3">
            {pastFeedback.map((fb: any) => (
              <div key={fb.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                <div className="flex items-center gap-3 mb-2">
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
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star size={12} className="fill-yellow-400" /> {fb.rating}/5
                    </span>
                  )}
                  <span className="text-xs text-text-muted ml-auto">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {fb.feedback && <p className="text-sm text-text-secondary">{fb.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
