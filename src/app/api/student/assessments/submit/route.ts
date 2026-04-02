import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logJourneyEvent } from "@/lib/journey";
import { notifyByRole } from "@/lib/notifications";
import { checkAndGenerateCertificate } from "@/lib/assessment-certification";
import { notifyUser } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { attemptId, answers } = await req.json();

    if (!attemptId || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "attemptId and answers are required" },
        { status: 400 }
      );
    }

    // Find attempt and verify ownership
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.studentId !== student.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (attempt.completedAt) {
      return NextResponse.json(
        { error: "This attempt has already been submitted" },
        { status: 400 }
      );
    }

    // Fetch all questions by IDs
    const questions = await prisma.assessmentQuestion.findMany({
      where: { id: { in: attempt.questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Grade: compare each answer to correctAnswer
    let correct = 0;
    const totalQuestions = attempt.questionIds.length;
    const detailedAnswers: Record<string, { selected: string; correct: string; isCorrect: boolean }> = {};

    for (const qId of attempt.questionIds) {
      const question = questionMap.get(qId);
      if (!question) continue;

      const selected = answers[qId] || "";
      const isCorrect = selected === question.correctAnswer;
      if (isCorrect) correct++;

      detailedAnswers[qId] = {
        selected,
        correct: question.correctAnswer,
        isCorrect,
      };
    }

    const percentage = Math.round((correct / totalQuestions) * 100);
    let passed = false;
    let suggestions: Record<string, unknown> | null = null;

    const studentName = session.user.name || "Student";

    if (attempt.type === "PRE_COURSE") {
      // No pass/fail for pre-course
      passed = false;

      // Generate suggestions: group wrong answers by topic
      const wrongByCategory: Record<string, string[]> = {};
      for (const qId of attempt.questionIds) {
        const question = questionMap.get(qId);
        if (!question) continue;
        if (!detailedAnswers[qId]?.isCorrect) {
          const cat = question.explanation || "General";
          if (!wrongByCategory[cat]) wrongByCategory[cat] = [];
          wrongByCategory[cat].push(question.question);
        }
      }

      suggestions = {
        score: correct,
        totalQuestions,
        percentage,
        areas: Object.entries(wrongByCategory).map(([area, qs]) => ({
          topic: area,
          wrongCount: qs.length,
          tip: `Review concepts related to: ${area}. You missed ${qs.length} question(s) in this area.`,
        })),
      };

      // Notify CRM staff
      await notifyByRole(
        ["ADMIN", "ADMISSION_COUNSELLOR"],
        "Pre-Course Assessment Completed",
        `${studentName} completed the pre-course assessment with score ${correct}/${totalQuestions} (${percentage}%).`,
        "ASSESSMENT",
        "/admin/assessments"
      );

      // Log journey
      await logJourneyEvent(
        student.id,
        "PRE_COURSE_COMPLETED",
        "Pre-Course Assessment Completed",
        `Scored ${correct}/${totalQuestions} (${percentage}%)`,
        { score: correct, total: totalQuestions, percentage }
      );
    } else if (attempt.type === "THEORY") {
      passed = percentage >= 80;

      if (!passed) {
        suggestions = {
          message: `You scored ${percentage}%. You need 80% to pass. Review the material and try again.`,
          score: correct,
          totalQuestions,
          percentage,
        };
      }

      // Notify TRAINER + ADMIN
      await notifyByRole(
        ["TRAINER", "ADMIN"],
        "Theory Assessment Completed",
        `${studentName} ${passed ? "passed" : "failed"} the theory assessment with score ${correct}/${totalQuestions} (${percentage}%).`,
        "ASSESSMENT",
        "/admin/assessments"
      );

      // Log journey
      await logJourneyEvent(
        student.id,
        "THEORY_ASSESSMENT_COMPLETED",
        "Theory Assessment Completed",
        `Scored ${correct}/${totalQuestions} (${percentage}%). ${passed ? "PASSED" : "FAILED"}`,
        { score: correct, total: totalQuestions, percentage, passed }
      );

      // If passed, check for certificate generation
      if (passed) {
        await checkAndGenerateCertificate(student.id);
      }
    }

    // Notify the student of their results
    const score = percentage;
    const resultMsg = passed ? `Congratulations! You scored ${score}% and passed.` : `You scored ${score}%. You need 80% to pass. You can retake the assessment.`;
    await notifyUser(session.user.id, passed ? "Assessment Passed!" : "Assessment Results", resultMsg, "ASSESSMENT", "/student/assessments");

    // Update attempt
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        score: correct,
        passed,
        answers: detailedAnswers,
        suggestions: suggestions ? JSON.parse(JSON.stringify(suggestions)) : undefined,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      score: correct,
      totalQuestions,
      percentage,
      passed,
      suggestions,
    });
  } catch (error) {
    console.error("Submit assessment error:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
