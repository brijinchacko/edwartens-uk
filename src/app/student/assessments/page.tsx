"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  FileCode,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Trophy,
} from "lucide-react";

interface Attempt {
  id: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  suggestions: Record<string, unknown> | null;
  attemptNumber: number;
  startedAt: string;
  completedAt: string | null;
  type: string;
}

interface ProjectSubmission {
  id: string;
  title: string;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
}

const TABS = [
  { key: "pre-course", label: "Pre-Course", icon: BookOpen },
  { key: "theory", label: "Theory", icon: Brain },
  { key: "practical", label: "Practical", icon: FileCode },
];

export default function AssessmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pre-course");
  const [preCourseAttempts, setPreCourseAttempts] = useState<Attempt[]>([]);
  const [theoryAttempts, setTheoryAttempts] = useState<Attempt[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [preRes, theoryRes, projectRes] = await Promise.all([
        fetch("/api/student/assessments/attempts?type=PRE_COURSE"),
        fetch("/api/student/assessments/attempts?type=THEORY"),
        fetch("/api/student/project"),
      ]);

      if (preRes.ok) {
        const data = await preRes.json();
        setPreCourseAttempts(data);
      }
      if (theoryRes.ok) {
        const data = await theoryRes.json();
        setTheoryAttempts(data);
      }
      if (projectRes.ok) {
        const data = await projectRes.json();
        setProjectSubmissions(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const theoryPassed = theoryAttempts.some((a) => a.passed);
  const completedPreCourse = preCourseAttempts.some((a) => a.completedAt);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-neon-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Assessments</h1>
        <p className="text-sm text-text-muted mt-1">
          Track your progress across all assessments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-primary/50 rounded-lg border border-border w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "pre-course" && (
        <PreCourseTab
          attempts={preCourseAttempts}
          completed={completedPreCourse}
          onStart={() => router.push("/student/assessments/pre-course")}
        />
      )}

      {activeTab === "theory" && (
        <TheoryTab
          attempts={theoryAttempts}
          passed={theoryPassed}
          onStart={() => router.push("/student/assessments/theory")}
        />
      )}

      {activeTab === "practical" && (
        <PracticalTab submissions={projectSubmissions} />
      )}
    </div>
  );
}

function PreCourseTab({
  attempts,
  completed,
  onStart,
}: {
  attempts: Attempt[];
  completed: boolean;
  onStart: () => void;
}) {
  if (!completed) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <BookOpen size={48} className="mx-auto text-neon-blue opacity-50" />
        <h3 className="text-lg font-semibold text-text-primary">
          Pre-Course Assessment
        </h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          This assessment helps us understand your current knowledge level. It
          has 20 questions and there is no pass/fail — it is purely diagnostic.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors"
        >
          Take Pre-Course Assessment
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const latest = attempts[0];
  const percentage = latest
    ? Math.round((latest.score / latest.totalQuestions) * 100)
    : 0;
  const suggestions = latest?.suggestions as {
    areas?: { topic: string; wrongCount: number; tip: string }[];
  } | null;

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Your Pre-Course Result
          </h3>
          <span className="text-xs text-text-muted">
            Completed{" "}
            {latest?.completedAt
              ? new Date(latest.completedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : ""}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-neon-blue">{percentage}%</p>
            <p className="text-xs text-text-muted mt-1">
              {latest?.score}/{latest?.totalQuestions} correct
            </p>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-dark-primary rounded-full overflow-hidden">
              <div
                className="h-full bg-neon-blue rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {suggestions?.areas && suggestions.areas.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Improvement Suggestions
          </h3>
          <div className="space-y-3">
            {suggestions.areas.map((area, i) => (
              <div
                key={i}
                className="p-3 bg-dark-primary/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    {area.topic}
                  </span>
                  <span className="text-xs text-red-400">
                    {area.wrongCount} missed
                  </span>
                </div>
                <p className="text-xs text-text-muted">{area.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TheoryTab({
  attempts,
  passed,
  onStart,
}: {
  attempts: Attempt[];
  passed: boolean;
  onStart: () => void;
}) {
  const completedAttempts = attempts.filter((a) => a.completedAt);

  return (
    <div className="space-y-4">
      {passed && (
        <div className="glass-card p-5 border-neon-green/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-green/10 rounded-lg">
              <Trophy size={24} className="text-neon-green" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neon-green">
                Theory Assessment Passed
              </h3>
              <p className="text-xs text-text-muted">
                Congratulations! You have successfully passed the theory
                assessment.
              </p>
            </div>
          </div>
        </div>
      )}

      {!passed && (
        <div className="glass-card p-6 text-center space-y-4">
          <Brain size={48} className="mx-auto text-neon-blue opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary">
            Theory Assessment
          </h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            50 questions covering your course material. You need 80% or higher
            to pass.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors"
          >
            {completedAttempts.length > 0 ? (
              <>
                <RotateCcw size={16} />
                Retry Theory Assessment
              </>
            ) : (
              <>
                Take Theory Assessment
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {completedAttempts.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Past Attempts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted border-b border-border">
                  <th className="pb-2 pr-4">Attempt</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Result</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {completedAttempts.map((a) => {
                  const pct = Math.round(
                    (a.score / a.totalQuestions) * 100
                  );
                  return (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-4 text-text-primary">
                        #{a.attemptNumber}
                      </td>
                      <td className="py-2.5 pr-4 text-text-primary">
                        {a.score}/{a.totalQuestions} ({pct}%)
                      </td>
                      <td className="py-2.5 pr-4">
                        {a.passed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
                            <CheckCircle2 size={12} />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            <XCircle size={12} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-text-muted">
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PracticalTab({
  submissions,
}: {
  submissions: ProjectSubmission[];
}) {
  const router = useRouter();

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    SUBMITTED: { label: "Submitted", color: "text-neon-blue", bg: "bg-neon-blue/10" },
    UNDER_REVIEW: { label: "Under Review", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    APPROVED: { label: "Approved", color: "text-neon-green", bg: "bg-neon-green/10" },
    REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10" },
  };

  if (submissions.length === 0) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <FileCode size={48} className="mx-auto text-neon-blue opacity-50" />
        <h3 className="text-lg font-semibold text-text-primary">
          Practical Assessment
        </h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Submit your project for practical evaluation. You need to score 80% or
          higher to pass.
        </p>
        <button
          onClick={() => router.push("/student/project")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg text-sm font-medium hover:bg-neon-blue/20 transition-colors"
        >
          Go to Project Submission
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Project Submissions
        </h3>
        <button
          onClick={() => router.push("/student/project")}
          className="text-xs text-neon-blue hover:underline"
        >
          Go to Submissions Page
        </button>
      </div>
      {submissions.map((sub) => {
        const cfg = statusConfig[sub.status] || statusConfig.SUBMITTED;
        return (
          <div key={sub.id} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">
                {sub.title}
              </p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.color} ${cfg.bg}`}
              >
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(sub.submittedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {sub.score !== null && (
                <span>Score: {sub.score}%</span>
              )}
            </div>
            {sub.feedback && (
              <p className="text-xs text-text-secondary bg-dark-primary/50 p-2 rounded">
                {sub.feedback}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
