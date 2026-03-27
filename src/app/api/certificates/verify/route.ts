import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { certificateNo, name, dateOfBirth } = body;

    if (!certificateNo) {
      return NextResponse.json(
        { error: "Certificate number is required." },
        { status: 400 }
      );
    }

    // Find the certificate by its unique number, joining through Student -> User
    const certificate = await prisma.certificate.findUnique({
      where: { certificateNo: certificateNo.trim() },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                dateOfBirth: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        message:
          "No certificate found with the provided number. Please check and try again.",
      });
    }

    // If name and/or date of birth are provided, verify they match
    if (name && name.trim()) {
      const certName = certificate.student.user.name.toLowerCase().trim();
      const inputName = name.toLowerCase().trim();
      if (certName !== inputName) {
        return NextResponse.json({
          valid: false,
          message:
            "The name provided does not match our records for this certificate.",
        });
      }
    }

    if (dateOfBirth) {
      const userDob = certificate.student.user.dateOfBirth;
      if (userDob) {
        const inputDate = new Date(dateOfBirth).toISOString().split("T")[0];
        const storedDate = userDob.toISOString().split("T")[0];
        if (inputDate !== storedDate) {
          return NextResponse.json({
            valid: false,
            message:
              "The date of birth provided does not match our records for this certificate.",
          });
        }
      }
    }

    // Format the course type for display
    const courseLabels: Record<string, string> = {
      PROFESSIONAL_MODULE: "Professional Automation Engineering",
      AI_MODULE: "AI & Machine Learning in Industrial Automation",
    };

    const typeLabels: Record<string, string> = {
      CPD: "CPD Accredited Certificate",
      EXPERIENCE: "Experience Certificate",
      ISO: "ISO Certified Certificate",
      COMPLETION: "Course Completion Certificate",
    };

    return NextResponse.json({
      valid: true,
      certificate: {
        certificateNo: certificate.certificateNo,
        type: typeLabels[certificate.type] || certificate.type,
        issuedDate: certificate.issuedDate.toISOString(),
        expiryDate: certificate.expiryDate
          ? certificate.expiryDate.toISOString()
          : null,
        studentName: certificate.student.user.name,
        course:
          courseLabels[certificate.student.course] ||
          certificate.student.course,
        isValid: certificate.isValid,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
