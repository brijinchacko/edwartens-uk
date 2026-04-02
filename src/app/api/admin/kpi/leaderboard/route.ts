import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import { getLeaderboard } from "@/lib/kpi";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const period = (searchParams.get("period") || "daily") as "daily" | "weekly" | "monthly";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!["daily", "weekly", "monthly"].includes(period)) {
      return NextResponse.json({ error: "Invalid period. Use daily, weekly, or monthly." }, { status: 400 });
    }

    const leaderboard = await getLeaderboard(period, limit);

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
