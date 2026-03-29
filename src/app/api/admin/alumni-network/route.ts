import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!isCrmRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profiles = await prisma.alumniProfile.findMany({
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            batch: { select: { name: true, course: true } },
            placements: { select: { company: true, role: true, salary: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const totalStudents = await prisma.student.count();
    const completedStudents = await prisma.student.count({
      where: { status: { in: ["COMPLETED", "ALUMNI"] } },
    });
    const totalAlumni = profiles.length;
    const placedPercentage = completedStudents > 0 ? Math.round((totalAlumni / completedStudents) * 100) : 0;

    const companies = profiles.map((p) => p.currentCompany).filter(Boolean);
    const companyCounts: Record<string, number> = {};
    companies.forEach((c) => {
      companyCounts[c!] = (companyCounts[c!] || 0) + 1;
    });
    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const salaries = profiles
      .map((p) => p.salary)
      .filter(Boolean)
      .map((s) => {
        const match = s!.match(/(\d[\d,]*)/g);
        if (match && match.length >= 2) {
          return (parseInt(match[0].replace(/,/g, "")) + parseInt(match[1].replace(/,/g, ""))) / 2;
        }
        if (match && match.length === 1) return parseInt(match[0].replace(/,/g, ""));
        return null;
      })
      .filter(Boolean) as number[];

    const avgSalary = salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0;

    return NextResponse.json({
      profiles,
      stats: {
        totalAlumni,
        totalStudents,
        completedStudents,
        placedPercentage,
        avgSalary,
        topCompanies,
      },
    });
  } catch (error) {
    console.error("Admin alumni GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
