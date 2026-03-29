import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { logJourneyEvent } from "@/lib/journey";
import { notifyUser } from "@/lib/notifications";
import { checkAndGenerateCertificate } from "@/lib/assessment-certification";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "assessments:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { score, feedback } = body;

    if (score === undefined || score === null || typeof score !== "number") {
      return NextResponse.json(
        { error: "score is required and must be a number (0-100)" },
        { status: 400 }
      );
    }
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: "score must be between 0 and 100" },
        { status: 400 }
      );
    }
    if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "feedback is required" },
        { status: 400 }
      );
    }

    // Find the submission
    const submission = await prisma.projectSubmission.findUnique({
      where: { id },
      include: {
        student: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get the grader's employee profile
    const grader = await prisma.employee.findUnique({
      where: { userId: session.user.id as string },
    });

    const status = score >= 80 ? "APPROVED" : "RESUBMIT_REQUIRED";
    const grade = score >= 80 ? "PASS" : "FAIL";

    // Update submission
    const updated = await prisma.projectSubmission.update({
      where: { id },
      data: {
        gradedBy: grader?.id || (session.user.id as string),
        score,
        feedback: feedback.trim(),
        status,
        grade,
      },
      include: {
        student: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    // Notify student of result
    const resultText = score >= 80 ? "passed" : "needs resubmission";
    await notifyUser(
      submission.student.userId,
      `Practical Assessment ${score >= 80 ? "Passed" : "Requires Resubmission"}`,
      `Your practical submission "${submission.title}" scored ${score}/100 and ${resultText}.`,
      "ASSESSMENT_RESULT",
      "/student/assessments"
    );

    // Log journey event
    await logJourneyEvent(
      submission.studentId,
      "PRACTICAL_GRADED" as any,
      `Practical Graded: ${score}/100`,
      `Submission "${submission.title}" scored ${score}/100. Status: ${status}.`,
      { score, status, submissionId: id },
      grader?.id || (session.user.id as string)
    );

    // If approved, check if certificate should be generated
    if (status === "APPROVED") {
      try {
        await checkAndGenerateCertificate(submission.studentId);
      } catch (certErr) {
        console.error("Certificate generation check error:", certErr);
      }
    }

    return NextResponse.json({
      submission: updated,
      message: `Submission graded: ${status}`,
    });
  } catch (error) {
    console.error("Practical grading error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
