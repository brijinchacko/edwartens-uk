import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: student.id },
      orderBy: { createdAt: "desc" },
    });

    const totalRewards = referrals
      .filter((r) => r.rewardGiven && r.rewardAmount)
      .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

    return NextResponse.json({ referrals, totalRewards });
  } catch (error) {
    console.error("Student referrals GET error:", error);
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
    const userName = (session.user as { name?: string }).name || "Student";

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Check for duplicate referral
    const existing = await prisma.referral.findFirst({
      where: { referrerId: student.id, referredEmail: email },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already referred this person" }, { status: 400 });
    }

    // Create the referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: student.id,
        referredName: name,
        referredEmail: email,
        referredPhone: phone || null,
      },
    });

    // Auto-create a Lead with source "Referral"
    await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || "N/A",
        source: "Referral",
        notes: {
          create: {
            content: `Referred by student: ${userName} (ID: ${student.id})`,
            createdBy: "system",
          },
        },
      },
    });

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    console.error("Student referrals POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
