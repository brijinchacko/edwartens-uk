import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { generateWeeklyBatches } from "@/lib/batch-generator";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "batches:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const weeks = parseInt(searchParams.get("weeks") || "8", 10);

    const result = await generateWeeklyBatches(Math.min(weeks, 16));
    return NextResponse.json({ message: `Generated ${result.created} batches, skipped ${result.skipped}`, ...result });
  } catch (error) {
    console.error("Batch generation error:", error);
    return NextResponse.json({ error: "Failed to generate batches" }, { status: 500 });
  }
}
