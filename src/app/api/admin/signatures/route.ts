import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role, "students:read")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const documentType = searchParams.get("documentType");
    const verified = searchParams.get("verified");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (documentType) {
      where.documentType = documentType;
    }

    if (verified === "true") {
      where.verified = true;
    } else if (verified === "false") {
      where.verified = false;
    }

    if (search) {
      where.student = {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }

    const signatures = await prisma.documentSignature.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      signatures: signatures.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        studentName: s.student.user.name,
        studentEmail: s.student.user.email,
        documentType: s.documentType,
        signedAt: s.signedAt,
        signatureType: s.signatureType,
        verified: s.verified,
        verifiedBy: s.verifiedBy,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("Signatures GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatures" },
      { status: 500 }
    );
  }
}
