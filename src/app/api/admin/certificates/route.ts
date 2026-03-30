import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificateNo, formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import { generateCertificateImage } from "@/lib/certificate-generator";
import { logAudit } from "@/lib/audit";

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

    // Check if student already has a certificate of this type — replace it
    const existingCert = await prisma.certificate.findFirst({
      where: { studentId, type },
    });

    if (existingCert) {
      // Delete old certificate file
      if (existingCert.pdfUrl) {
        const fs = await import("fs");
        const path = await import("path");
        const oldFileName = existingCert.pdfUrl.split("/").pop();
        if (oldFileName) {
          const oldPath = path.join(process.cwd(), "uploads", "certificates", oldFileName);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
      await prisma.certificate.delete({ where: { id: existingCert.id } });
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

    // Generate certificate image from template
    let pdfUrl: string | null = null;
    try {
      pdfUrl = await generateCertificateImage({
        studentName: student.user.name,
        date: formatDate(new Date()),
        certNo: certificateNo,
        verifyUrl: `https://edwartens.co.uk/verify/${certificateNo}`,
      });
    } catch (imgErr) {
      console.error("Certificate image generation error:", imgErr);
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        type,
        certificateNo,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        pdfUrl,
        qrCode: `https://edwartens.co.uk/verify/${certificateNo}`,
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

    // Audit log
    await logAudit({
      userId: session.user.id as string,
      userName: session.user.name || session.user.email,
      userRole: session.user.role,
      action: "CREATE",
      entity: "certificate",
      entityId: certificate.id,
      entityName: `${type} - ${student.user.name} (${certificateNo})`,
      details: JSON.stringify({ type, certificateNo, studentId, studentName: student.user.name, replaced: !!existingCert }),
    });

    return NextResponse.json({
      ...certificate,
      replaced: !!existingCert,
      message: existingCert
        ? `Previous ${type} certificate replaced with new one`
        : "Certificate generated successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Admin certificate create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
