import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "sessions:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const phases = await prisma.phase.findMany({
      orderBy: [{ course: "asc" }, { order: "asc" }],
      select: {
        id: true,
        number: true,
        name: true,
        course: true,
      },
    });

    return NextResponse.json({ phases });
  } catch (error) {
    console.error("Phases list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
