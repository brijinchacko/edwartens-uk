import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!isCrmRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const feedback = await prisma.studentFeedback.findMany({
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate NPS metrics
    const npsResponses = feedback.filter((f) => f.npsScore !== null);
    const promoters = npsResponses.filter((f) => f.npsScore! >= 9).length;
    const passives = npsResponses.filter((f) => f.npsScore! >= 7 && f.npsScore! <= 8).length;
    const detractors = npsResponses.filter((f) => f.npsScore! <= 6).length;
    const npsScore =
      npsResponses.length > 0
        ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
        : 0;

    // Average rating
    const ratedResponses = feedback.filter((f) => f.rating !== null);
    const avgRating =
      ratedResponses.length > 0
        ? Number((ratedResponses.reduce((sum, f) => sum + f.rating!, 0) / ratedResponses.length).toFixed(1))
        : 0;

    // Testimonials
    const testimonials = feedback.filter((f) => f.testimonial && f.testimonial.trim() !== "");

    return NextResponse.json({
      feedback,
      metrics: {
        npsScore,
        totalResponses: npsResponses.length,
        promoters,
        passives,
        detractors,
        avgRating,
        ratingCount: ratedResponses.length,
        testimonialCount: testimonials.length,
      },
    });
  } catch (error) {
    console.error("Admin feedback GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role: string }).role;
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, canPublish } = body;

    if (!id) {
      return NextResponse.json({ error: "Feedback ID required" }, { status: 400 });
    }

    const updated = await prisma.studentFeedback.update({
      where: { id },
      data: { canPublish },
    });

    return NextResponse.json({ feedback: updated });
  } catch (error) {
    console.error("Admin feedback PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
