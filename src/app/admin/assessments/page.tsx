import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AssessmentTabs from "./AssessmentTabs";

export const metadata: Metadata = {
  title: "Assessments | EDWartens Admin",
  description: "Grade and manage student assessments",
};

async function getTheoryAttempts() {
  try {
    return await prisma.assessmentAttempt.findMany({
      where: { type: "THEORY" },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

async function getPreCourseResults() {
  try {
    return await prisma.assessmentAttempt.findMany({
      where: { type: "PRE_COURSE" },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

async function getPracticalSubmissions() {
  try {
    return await prisma.projectSubmission.findMany({
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

async function getPendingDispatches() {
  try {
    return await prisma.certificateDispatch.findMany({
      where: { status: "PENDING" },
      include: {
        certificate: {
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AssessmentsPage() {
  const [theoryAttempts, preCourseResults, practicalSubmissions, pendingDispatches] =
    await Promise.all([
      getTheoryAttempts(),
      getPreCourseResults(),
      getPracticalSubmissions(),
      getPendingDispatches(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Assessments</h1>
        <p className="text-text-muted mt-1">
          Manage theory, pre-course, practical assessments and certificate
          dispatch
        </p>
      </div>

      <AssessmentTabs
        theoryAttempts={JSON.parse(JSON.stringify(theoryAttempts))}
        preCourseResults={JSON.parse(JSON.stringify(preCourseResults))}
        practicalSubmissions={JSON.parse(JSON.stringify(practicalSubmissions))}
        pendingDispatches={JSON.parse(JSON.stringify(pendingDispatches))}
      />
    </div>
  );
}
