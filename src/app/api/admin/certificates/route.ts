import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificateNo } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "certificates:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type");
    const studentId = searchParams.get("studentId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (studentId) where.studentId = studentId;

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { issuedDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.certificate.count({ where }),
    ]);

    return NextResponse.json({
      certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin certificates list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "certificates:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, type, expiryDate, metadata } = body;

    if (!studentId || !type) {
      return NextResponse.json(
        { error: "Student ID and certificate type are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true } } },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Determine next sequence number
    const lastCert = await prisma.certificate.findFirst({
      where: {
        certificateNo: {
          startsWith: `EDW-UK-${new Date().getFullYear()}-`,
        },
      },
      orderBy: { certificateNo: "desc" },
    });

    let sequence = 1;
    if (lastCert) {
      const lastSeq = parseInt(lastCert.certificateNo.split("-").pop() || "0");
      sequence = lastSeq + 1;
    }

    const certificateNo = generateCertificateNo(sequence);

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        type,
        certificateNo,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        metadata: metadata || null,
        isValid: true,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Admin certificate create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
