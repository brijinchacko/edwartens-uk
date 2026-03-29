import { NextRequest, NextResponse } from "next/server";
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

    const referrals = await prisma.referral.findMany({
      include: {
        referrer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = referrals.length;
    const enrolled = referrals.filter((r) => r.status === "ENROLLED").length;
    const rewarded = referrals.filter((r) => r.status === "REWARDED").length;
    const conversionRate = total > 0 ? Math.round(((enrolled + rewarded) / total) * 100) : 0;
    const totalRewardsGiven = referrals
      .filter((r) => r.rewardGiven && r.rewardAmount)
      .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

    return NextResponse.json({
      referrals,
      stats: { total, enrolled, rewarded, conversionRate, totalRewardsGiven },
    });
  } catch (error) {
    console.error("Admin referrals GET error:", error);
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
    const { id, status, rewardType, rewardAmount, rewardGiven, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Referral ID required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (rewardType) updateData.rewardType = rewardType;
    if (rewardAmount !== undefined) updateData.rewardAmount = rewardAmount;
    if (notes !== undefined) updateData.notes = notes;
    if (rewardGiven !== undefined) {
      updateData.rewardGiven = rewardGiven;
      if (rewardGiven) updateData.rewardGivenAt = new Date();
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ referral });
  } catch (error) {
    console.error("Admin referrals PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
