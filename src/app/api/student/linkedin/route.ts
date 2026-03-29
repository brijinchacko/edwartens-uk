import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { linkedInProfile: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const profile = student.linkedInProfile;

    if (!profile) {
      return NextResponse.json({
        id: null,
        profileUrl: null,
        isVerified: false,
        feedback: null,
        status: "NOT_SUBMITTED",
      });
    }

    let status = "PENDING";
    if (profile.isVerified) {
      status = "VERIFIED";
    } else if (profile.feedback) {
      status = "REJECTED";
    }

    return NextResponse.json({
      id: profile.id,
      profileUrl: profile.profileUrl,
      isVerified: profile.isVerified,
      feedback: profile.feedback,
      status,
    });
  } catch (error) {
    console.error("LinkedIn GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { linkedInProfile: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    const { profileUrl } = await req.json();

    if (!profileUrl?.trim()) {
      return NextResponse.json(
        { error: "LinkedIn profile URL is required" },
        { status: 400 }
      );
    }

    if (!profileUrl.includes("linkedin.com/in/")) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn profile URL" },
        { status: 400 }
      );
    }

    if (student.linkedInProfile) {
      // Update existing
      await prisma.linkedInProfile.update({
        where: { id: student.linkedInProfile.id },
        data: {
          profileUrl: profileUrl.trim(),
          isVerified: false,
          feedback: null,
          verifiedBy: null,
          verifiedAt: null,
        },
      });
    } else {
      // Create new
      await prisma.linkedInProfile.create({
        data: {
          studentId: student.id,
          profileUrl: profileUrl.trim(),
        },
      });
    }

    // Log journey event
    await prisma.studentJourney.create({
      data: {
        studentId: student.id,
        eventType: "LINKEDIN_VERIFIED",
        title: "LinkedIn Profile Submitted",
        description: `LinkedIn profile URL submitted for verification.`,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("LinkedIn POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
