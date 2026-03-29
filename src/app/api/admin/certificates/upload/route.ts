import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificateNo } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import { CertificateType } from "@prisma/client";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(
        (session.user as { role: string }).role,
        "certificates:manage"
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const studentId = formData.get("studentId") as string | null;
    const type = formData.get("type") as string | null;
    const file = formData.get("file") as File | null;

    if (!studentId || !type || !file) {
      return NextResponse.json(
        { error: "Student ID, certificate type, and file are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, PNG, and JPG files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Check student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student already has a certificate of this type — replace it
    const existingCert = await prisma.certificate.findFirst({
      where: { studentId, type: type as CertificateType },
    });

    const uploadsDir = path.join(process.cwd(), "uploads", "certificates");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (existingCert) {
      // Delete old certificate file
      if (existingCert.pdfUrl) {
        const oldFileName = existingCert.pdfUrl.split("/").pop();
        if (oldFileName) {
          const oldPath = path.join(uploadsDir, oldFileName);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
      await prisma.certificate.delete({ where: { id: existingCert.id } });
    }

    // Determine next sequence number for certificate number
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
      const lastSeq = parseInt(
        lastCert.certificateNo.split("-").pop() || "0"
      );
      sequence = lastSeq + 1;
    }

    const certificateNo = generateCertificateNo(sequence);

    // Save file to disk
    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${certificateNo}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const pdfUrl = `/api/uploads/certificates/${fileName}`;

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        type: type as CertificateType,
        certificateNo,
        pdfUrl,
        qrCode: `https://edwartens.co.uk/verify/${certificateNo}`,
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

    return NextResponse.json(
      {
        ...certificate,
        replaced: !!existingCert,
        message: existingCert
          ? `Previous ${type} certificate replaced with uploaded one`
          : "Certificate uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin certificate upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
