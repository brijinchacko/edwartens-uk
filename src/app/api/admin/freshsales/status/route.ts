import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { isFreshsalesConfigured, getFreshsalesCounts } from "@/lib/freshsales";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "users:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isFreshsalesConfigured()) {
      return NextResponse.json({
        configured: false,
        message: "Set FRESHSALES_API_KEY and FRESHSALES_DOMAIN in environment",
      });
    }

    const counts = await getFreshsalesCounts();

    return NextResponse.json({
      configured: true,
      contacts: counts.contacts,
      leads: counts.leads,
      deals: counts.deals,
    });
  } catch (error: any) {
    console.error("Freshsales status error:", error);
    return NextResponse.json(
      { configured: false, error: error.message || "Failed to connect" },
      { status: 500 }
    );
  }
}
