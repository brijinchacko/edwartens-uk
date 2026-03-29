"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Brain,
  ArrowLeft,
  Award,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Result {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  suggestions: {
    message?: string;
  } | null;
}

export default function TheoryQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const startQuiz = useCallback(async () => {
    try {
      const res = await fetch("/api/student/assessments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "THEORY" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start assessment");
        return;
      }

      setAttemptId(data.attemptId);
      setQuestions(data.questions);
    } catch {
      setError("Failed to start assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/student/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit assessment");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
        <p className="text-sm text-text-muted">Loading assessment...</p>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/student/assessments")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Assessments
        </button>
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (result) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/student/assessments")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Assessments
        </button>

        {result.passed ? (
          <div className="glass-card p-8 text-center space-y-4 border-neon-green/20">
            <Award size={56} className="mx-auto text-neon-green" />
            <h2 className="text-xl font-bold text-neon-green">
              Congratulations!
            </h2>
            <p className="text-4xl font-bold text-neon-green">
              {result.percentage}%
            </p>
            <p className="text-sm text-text-muted">
              {result.score} of {result.totalQuestions} correct
            </p>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              You have successfully passed the Theory Assessment. Your
              certificate will be generated once you also pass the practical
              assessment.
            </p>
            <button
              onClick={() => router.push("/student/certificates")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-lg text-sm font-medium hover:bg-neon-green/20 transition-colors"
            >
              <Award size={16} />
              View Certificates
            </button>
          </div>
        ) : (
          <div className="glass-card p-8 text-center space-y-4">
            <XCircle size={56} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold text-text-primary">
              Assessment Not Passed
            </h2>
            <p className="text-4xl font-bold text-red-400">
              {result.percentage}%
            </p>
            <p className="text-sm text-text-muted">
              {result.score} of {result.totalQuestions} correct
            </p>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              You need 80% to pass. Review the course material and try again
              when you are ready.
            </p>
            <button
              onClick={() => router.push("/student/assessments")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Assessments
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quiz screen
  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-neon-blue" />
          <h1 className="text-lg font-bold text-text-primary">
            Theory Assessment
          </h1>
        </div>
        <span className="text-xs text-text-muted">
          {answeredCount}/{totalQuestions} answered
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-dark-primary rounded-full overflow-hidden">
        <div
          className="h-full bg-neon-blue rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question number strip */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
              i === currentIndex
                ? "bg-neon-blue text-white"
                : answers[q.id]
                ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                : "bg-dark-primary text-text-muted border border-border hover:border-neon-blue/30"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      {current && (
        <div className="glass-card p-5 space-y-5">
          <div>
            <span className="text-xs text-neon-blue font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <p className="text-sm font-medium text-text-primary mt-2 leading-relaxed">
              {current.question}
            </p>
          </div>

          <div className="space-y-2.5">
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const key = `option${opt}` as keyof Question;
              const value = current[key];
              const isSelected = answers[current.id] === opt;

              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(current.id, opt)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? "border-neon-blue bg-neon-blue/10 text-text-primary"
                      : "border-border bg-dark-primary/50 text-text-secondary hover:border-neon-blue/30"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                      isSelected
                        ? "bg-neon-blue text-white"
                        : "bg-dark-primary text-text-muted border border-border"
                    }`}
                  >
                    {opt}
                  </span>
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQuestions}
            className="flex items-center gap-2 px-6 py-2.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-lg text-sm font-medium hover:bg-neon-green/20 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        ) : (
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min(totalQuestions - 1, prev + 1)
              )
            }
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
