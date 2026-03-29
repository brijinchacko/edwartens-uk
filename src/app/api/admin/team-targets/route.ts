import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCrmRole } from "@/lib/rbac";
import { getTeamTargetSummary } from "@/lib/incentives";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !isCrmRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getTeamTargetSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Team targets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
