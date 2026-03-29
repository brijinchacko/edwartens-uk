import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rescoreAllLeads, SCORING_RULES } from "@/lib/lead-scoring";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const result = await rescoreAllLeads();
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("Error rescoring leads:", error);
    const message = error instanceof Error ? error.message : "Failed to rescore leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ rules: SCORING_RULES });
  } catch (error: unknown) {
    console.error("Error fetching scoring rules:", error);
    return NextResponse.json({ error: "Failed to fetch scoring rules" }, { status: 500 });
  }
}
