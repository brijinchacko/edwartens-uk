"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  Wrench,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface TheoryAttempt {
  id: string;
  studentId: string;
  course: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attemptNumber: number;
  startedAt: string;
  student: { user: { name: string } };
}

interface PreCourseResult {
  id: string;
  studentId: string;
  course: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  startedAt: string;
  student: { user: { name: string } };
}

interface PracticalSubmission {
  id: string;
  studentId: string;
  title: string;
  status: string;
  score: number | null;
  attemptNumber: number;
  submittedAt: string;
  student: { user: { name: string } };
}

interface PendingDispatch {
  id: string;
  certificateId: string;
  status: string;
  createdAt: string;
  certificate: {
    id: string;
    certificateNo: string;
    type: string;
    issuedDate: string;
    student: { user: { name: string } };
  };
}

const TABS = [
  { key: "theory", label: "Theory Attempts", icon: BookOpen },
  { key: "precourse", label: "Pre-Course Results", icon: ClipboardCheck },
  { key: "practical", label: "Practical Submissions", icon: Wrench },
  { key: "dispatch", label: "Certificate Dispatch", icon: Truck },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  UNDER_REVIEW: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
  RESUBMIT_REQUIRED: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function AssessmentTabs({
  theoryAttempts,
  preCourseResults,
  practicalSubmissions,
  pendingDispatches,
}: {
  theoryAttempts: TheoryAttempt[];
  preCourseResults: PreCourseResult[];
  practicalSubmissions: PracticalSubmission[];
  pendingDispatches: PendingDispatch[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("theory");
  const [dispatchLoading, setDispatchLoading] = useState<string | null>(null);
  const [dispatchDone, setDispatchDone] = useState<Set<string>>(new Set());

  async function handleMarkSent(certId: string) {
    setDispatchLoading(certId);
    try {
      const res = await fetch(`/api/admin/certificates/${certId}/dispatch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setDispatchDone((prev) => new Set(prev).add(certId));
        router.refresh();
      }
    } catch {
      // Silently handle error
    } finally {
      setDispatchLoading(null);
    }
  }

  const counts = {
    theory: theoryAttempts.length,
    precourse: preCourseResults.length,
    practical: practicalSubmissions.length,
    dispatch: pendingDispatches.length,
  };

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                  : "text-text-muted hover:text-text-primary hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-neon-blue/20 text-neon-blue"
                    : "bg-white/[0.06] text-text-muted"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {/* Theory Attempts */}
          {activeTab === "theory" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Score
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Passed
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                    Attempt #
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {theoryAttempts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-text-muted"
                    >
                      No theory attempts found
                    </td>
                  </tr>
                ) : (
                  theoryAttempts.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {a.student.user.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {a.course.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {a.score}/{a.totalQuestions}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            a.passed
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {a.passed ? (
                            <CheckCircle size={10} />
                          ) : (
                            <XCircle size={10} />
                          )}
                          {a.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                        #{a.attemptNumber}
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                        {formatDate(a.startedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pre-Course Results */}
          {activeTab === "precourse" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Score
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Passed
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {preCourseResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-text-muted"
                    >
                      No pre-course results found
                    </td>
                  </tr>
                ) : (
                  preCourseResults.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {a.student.user.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {a.course.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {a.score}/{a.totalQuestions}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            a.passed
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {a.passed ? (
                            <CheckCircle size={10} />
                          ) : (
                            <XCircle size={10} />
                          )}
                          {a.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                        {formatDate(a.startedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Practical Submissions */}
          {activeTab === "practical" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Score
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                    Attempt #
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {practicalSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-text-muted"
                    >
                      No practical submissions found
                    </td>
                  </tr>
                ) : (
                  practicalSubmissions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {s.student.user.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">
                        {s.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            STATUS_COLORS[s.status] ||
                            "bg-white/[0.05] text-text-muted"
                          }`}
                        >
                          {s.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {s.score !== null ? `${s.score}/100` : "-"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                        #{s.attemptNumber}
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                        {formatDate(s.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {s.status === "SUBMITTED" ||
                        s.status === "UNDER_REVIEW" ? (
                          <Link
                            href={`/admin/assessments/practical/${s.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue text-xs font-medium hover:bg-neon-blue/20 transition-colors border border-neon-blue/20"
                          >
                            Grade
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/assessments/practical/${s.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] text-text-muted text-xs font-medium hover:bg-white/[0.06] transition-colors border border-white/[0.06]"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Certificate Dispatch */}
          {activeTab === "dispatch" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Certificate No
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                    Generated Date
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingDispatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-text-muted"
                    >
                      No pending dispatches
                    </td>
                  </tr>
                ) : (
                  pendingDispatches.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {d.certificate.student.user.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                        {d.certificate.certificateNo}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border bg-neon-blue/10 text-neon-blue border-neon-blue/20">
                          {d.certificate.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                        {formatDate(d.certificate.issuedDate)}
                      </td>
                      <td className="px-4 py-3">
                        {dispatchDone.has(d.certificate.id) ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
                            <CheckCircle size={12} />
                            Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkSent(d.certificate.id)}
                            disabled={dispatchLoading === d.certificate.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors border border-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Truck size={12} />
                            {dispatchLoading === d.certificate.id
                              ? "Sending..."
                              : "Mark as Sent"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
