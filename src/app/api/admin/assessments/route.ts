import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { autoGenerateCertificate } from "@/lib/certificate-generator";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "assessments:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, phaseId, score, maxScore, passed, feedback } = body;

    if (!studentId || !phaseId) {
      return NextResponse.json(
        { error: "studentId and phaseId are required" },
        { status: 400 }
      );
    }

    // Get the assessor's employee profile
    const assessor = await prisma.employee.findUnique({
      where: { userId: session.user.id as string },
    });

    const assessment = await prisma.assessment.create({
      data: {
        studentId,
        phaseId,
        assessorId: assessor?.id || null,
        score: score ?? null,
        maxScore: maxScore || 100,
        passed: passed || false,
        feedback: feedback || null,
      },
    });

    // Check if ALL phases are now assessed and passed → auto-generate certificate
    if (passed) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { course: true },
      });

      if (student) {
        const phases = await prisma.phase.findMany({
          where: { course: student.course },
        });

        const passedAssessments = await prisma.assessment.findMany({
          where: { studentId, passed: true },
          select: { phaseId: true },
        });

        const passedPhaseIds = new Set(passedAssessments.map((a) => a.phaseId));
        const allPassed = phases.every((p) => passedPhaseIds.has(p.id));

        if (allPassed) {
          // Auto-generate certificate
          try {
            const cert = await autoGenerateCertificate(studentId, "CPD");
            if (cert) {
              // Update student status to COMPLETED
              await prisma.student.update({
                where: { id: studentId },
                data: { status: "COMPLETED" },
              });

              return NextResponse.json({
                assessment,
                certificate: cert,
                message: "Assessment recorded. All phases passed — CPD certificate auto-generated!",
              });
            }
          } catch (certErr) {
            console.error("Auto certificate error:", certErr);
          }
        }
      }
    }

    return NextResponse.json({ assessment, message: "Assessment recorded" });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!hasPermission(role, "assessments:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const where = studentId ? { studentId } : {};
    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        phase: true,
        assessor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { assessedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Assessments fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
