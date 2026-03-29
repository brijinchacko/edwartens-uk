import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DOCUMENT_TYPES = [
  {
    type: "TERMS_AND_CONDITIONS",
    label: "Terms & Conditions",
    description:
      "By signing, you agree to the terms and conditions of the EDWartens UK training programme including attendance requirements, code of conduct, and payment obligations.",
  },
  {
    type: "ENROLLMENT_AGREEMENT",
    label: "Enrollment Agreement",
    description:
      "This enrollment agreement confirms your registration in the course programme. You acknowledge the course schedule, assessment criteria, and certification requirements.",
  },
  {
    type: "PHOTO_CONSENT",
    label: "Photo & Media Consent",
    description:
      "By signing, you consent to EDWartens UK using photographs and video recordings taken during training sessions for marketing, social media, and promotional purposes.",
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { signatures: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const documents = DOCUMENT_TYPES.map((doc) => {
      const signature = student.signatures.find(
        (s) => s.documentType === doc.type
      );
      return {
        ...doc,
        signed: !!signature?.signedAt,
        signedAt: signature?.signedAt || null,
        signatureType: signature?.signatureType || null,
        verified: signature?.verified || false,
      };
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Sign GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentType, signature, signatureType } = body;

    if (!documentType || !signature || !signatureType) {
      return NextResponse.json(
        { error: "documentType, signature, and signatureType are required" },
        { status: 400 }
      );
    }

    const validTypes = DOCUMENT_TYPES.map((d) => d.type);
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    if (!["TYPED", "DRAWN"].includes(signatureType)) {
      return NextResponse.json(
        { error: "signatureType must be TYPED or DRAWN" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Check if already signed
    const existing = await prisma.documentSignature.findFirst({
      where: {
        studentId: student.id,
        documentType,
        signedAt: { not: null },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Document already signed" },
        { status: 400 }
      );
    }

    // Get IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    // Upsert the signature
    const sig = await prisma.documentSignature.upsert({
      where: {
        id:
          (
            await prisma.documentSignature.findFirst({
              where: { studentId: student.id, documentType },
              select: { id: true },
            })
          )?.id || "new",
      },
      create: {
        studentId: student.id,
        documentType,
        signature,
        signatureType,
        signedAt: new Date(),
        ipAddress: ip,
      },
      update: {
        signature,
        signatureType,
        signedAt: new Date(),
        ipAddress: ip,
      },
    });

    return NextResponse.json({ signature: sig });
  } catch (error) {
    console.error("Sign POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
