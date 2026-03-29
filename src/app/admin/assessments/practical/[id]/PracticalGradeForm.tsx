"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Send } from "lucide-react";

export default function PracticalGradeForm({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    status: string;
    score: number;
  } | null>(null);

  const scoreNum = typeof score === "number" ? score : null;
  const isPassing = scoreNum !== null && scoreNum >= 80;
  const scoreColor =
    scoreNum === null
      ? "border-white/[0.1]"
      : scoreNum >= 80
        ? "border-green-500/50 bg-green-500/5"
        : "border-red-500/50 bg-red-500/5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (scoreNum === null || scoreNum < 0 || scoreNum > 100) {
      setError("Please enter a valid score between 0 and 100");
      return;
    }
    if (!feedback.trim()) {
      setError("Please provide feedback");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/assessments/practical/${submissionId}/grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: scoreNum, feedback: feedback.trim() }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to grade submission");
        return;
      }

      setSuccess({
        status: data.submission.status,
        score: data.submission.score,
      });

      setTimeout(() => {
        router.push("/admin/assessments");
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          {success.status === "APPROVED" ? (
            <CheckCircle className="text-green-400" size={24} />
          ) : (
            <XCircle className="text-red-400" size={24} />
          )}
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Submission Graded
            </h2>
            <p className="text-sm text-text-muted">
              Score: {success.score}/100 —{" "}
              {success.status === "APPROVED" ? (
                <span className="text-green-400 font-medium">PASSED</span>
              ) : (
                <span className="text-red-400 font-medium">
                  RESUBMISSION REQUIRED
                </span>
              )}
            </p>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Redirecting to assessments page...
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-5">
      <h2 className="text-lg font-semibold text-text-primary">
        Grade Submission
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Score Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Score (0-100)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) =>
                setScore(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="Enter score"
              className={`w-32 px-3 py-2 rounded-lg bg-white/[0.03] border ${scoreColor} text-text-primary placeholder:text-text-muted text-lg font-bold focus:outline-none focus:ring-2 focus:ring-neon-blue/40 transition-colors`}
            />
            <span className="text-text-muted text-sm">/100</span>
            {scoreNum !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isPassing
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {isPassing ? (
                  <>
                    <CheckCircle size={12} />
                    Pass
                  </>
                ) : (
                  <>
                    <XCircle size={12} />
                    Below threshold (80)
                  </>
                )}
              </span>
            )}
          </div>

          {/* Visual score bar */}
          {scoreNum !== null && (
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isPassing ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, scoreNum))}%` }}
              />
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Provide detailed feedback on the submission..."
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.1] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-neon-blue/40 resize-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neon-blue text-white font-medium hover:bg-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} />
          {loading ? "Grading..." : "Submit Grade"}
        </button>
      </form>
    </div>
  );
}
