import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { notifyAdmins } from "@/lib/notify";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "documents");

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Handle both JSON and FormData (documents step sends FormData)
    const contentType = req.headers.get("content-type") || "";
    let step: string;
    let body: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      step = formData.get("step") as string;
      // Store formData reference for document handling
      body = { step, _formData: formData };
    } else {
      body = await req.json();
      step = body.step as string;
    }

    switch (step) {
      case "profile": {
        const {
          phone,
          dateOfBirth,
          address,
          emergencyName,
          emergencyPhone,
        } = body;

        await prisma.user.update({
          where: { id: userId },
          data: {
            phone: phone || undefined,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth as string) : undefined,
            address: address || undefined,
            emergencyName: emergencyName || undefined,
            emergencyPhone: emergencyPhone || undefined,
          },
        });

        return NextResponse.json({
          message: "Profile updated successfully",
          step: "profile",
        });
      }

      case "education": {
        const { qualification, passoutYear, previousExp } = body;

        const student = await prisma.student.findUnique({
          where: { userId },
        });
        if (!student) {
          return NextResponse.json(
            { error: "Student record not found" },
            { status: 404 }
          );
        }

        await prisma.student.update({
          where: { id: student.id },
          data: {
            qualification: qualification || undefined,
            passoutYear: passoutYear || undefined,
            previousExp: previousExp || undefined,
          },
        });

        return NextResponse.json({
          message: "Education details updated",
          step: "education",
        });
      }

      case "terms": {
        const { accepted } = body;

        if (!accepted) {
          return NextResponse.json(
            { error: "You must accept the terms to proceed" },
            { status: 400 }
          );
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            termsAccepted: true,
            termsAcceptedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: "Terms accepted",
          step: "terms",
        });
      }

      case "complete": {
        // Mark onboarding as complete
        await prisma.user.update({
          where: { id: userId },
          data: { onboarded: true },
        });

        // Update student status to ACTIVE if currently ONBOARDING
        const student = await prisma.student.findUnique({
          where: { userId },
        });
        if (student && student.status === "ONBOARDING") {
          await prisma.student.update({
            where: { id: student.id },
            data: { status: "ACTIVE" },
          });
        }

        // Notify admins of onboarding completion
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        await notifyAdmins("Onboarding Completed", `${user?.name || "A student"} has completed their onboarding checklist.`, `/admin/students`);

        return NextResponse.json({
          message: "Onboarding completed successfully",
          step: "complete",
        });
      }

      case "documents": {
        const student = await prisma.student.findUnique({
          where: { userId },
        });
        if (!student) {
          return NextResponse.json(
            { error: "Student record not found" },
            { status: 404 }
          );
        }

        const formData = body._formData as FormData;
        const fileFields = ["idProof", "qualificationCert", "cv"];
        const uploaded = [];

        await mkdir(UPLOADS_DIR, { recursive: true });

        for (const fieldName of fileFields) {
          const file = formData.get(fieldName) as File | null;
          if (!file) continue;

          const ext = path.extname(file.name) || ".pdf";
          const filename = `${student.id}-${uuidv4()}${ext}`;
          const filePath = path.join(UPLOADS_DIR, filename);

          const bytes = await file.arrayBuffer();
          await writeFile(filePath, Buffer.from(bytes));

          const fileUrl = `/api/uploads/documents/${filename}`;
          const docType =
            fieldName === "idProof"
              ? "ID Proof"
              : fieldName === "qualificationCert"
                ? "Qualification"
                : "CV";

          const doc = await prisma.document.create({
            data: {
              studentId: student.id,
              name: file.name,
              type: docType,
              fileUrl,
              fileSize: file.size,
              mimeType: file.type,
              status: "UPLOADED",
            },
          });
          uploaded.push(doc);
        }

        return NextResponse.json({
          message: `${uploaded.length} document(s) uploaded`,
          step: "documents",
          documents: uploaded,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid onboarding step" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
