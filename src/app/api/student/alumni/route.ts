import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await prisma.alumniProfile.findMany({
      where: { isPublic: true },
      include: {
        student: {
          include: {
            user: { select: { name: true, avatar: true } },
            batch: { select: { name: true, course: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const totalAlumni = profiles.length;
    const companies = [...new Set(profiles.map((p) => p.currentCompany).filter(Boolean))];
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
      stats: { totalAlumni, companyCount: companies.length, avgSalary },
    });
  } catch (error) {
    console.error("Alumni GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!["COMPLETED", "ALUMNI_PLACED", "ALUMNI_NOT_PLACED"].includes(student.status)) {
      return NextResponse.json({ error: "Only completed/alumni students can update profiles" }, { status: 403 });
    }

    const body = await req.json();
    const { headline, currentCompany, currentRole, location, linkedInUrl, bio, skills, salary, willingToMentor, isPublic } = body;

    const profile = await prisma.alumniProfile.upsert({
      where: { studentId: student.id },
      update: {
        headline,
        currentCompany,
        currentRole,
        location,
        linkedInUrl,
        bio,
        skills: skills || [],
        salary,
        willingToMentor: willingToMentor || false,
        isPublic: isPublic !== false,
      },
      create: {
        studentId: student.id,
        headline,
        currentCompany,
        currentRole,
        location,
        linkedInUrl,
        bio,
        skills: skills || [],
        salary,
        willingToMentor: willingToMentor || false,
        isPublic: isPublic !== false,
        placedDate: new Date(),
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Alumni POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
