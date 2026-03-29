import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission((session.user as { role: string }).role, "certificates:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Delete the file if it exists
    if (cert.pdfUrl) {
      const fileName = cert.pdfUrl.split("/").pop();
      if (fileName) {
        const filePath = path.join(process.cwd(), "uploads", "certificates", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.certificate.delete({ where: { id } });

    return NextResponse.json({ message: "Certificate deleted" });
  } catch (error) {
    console.error("Certificate delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission((session.user as { role: string }).role, "certificates:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    // Handle file upload (multipart form data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Validate file type
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Only PDF, PNG, and JPG files are allowed" },
          { status: 400 }
        );
      }

      // Save file
      const uploadsDir = path.join(process.cwd(), "uploads", "certificates");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cert = await prisma.certificate.findUnique({ where: { id } });
      if (!cert) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
      }

      // Delete old file if exists
      if (cert.pdfUrl) {
        const oldFileName = cert.pdfUrl.split("/").pop();
        if (oldFileName) {
          const oldPath = path.join(uploadsDir, oldFileName);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      const ext = file.name.split(".").pop() || "pdf";
      const fileName = `${cert.certificateNo}.${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const pdfUrl = `/api/uploads/certificates/${fileName}`;

      const updated = await prisma.certificate.update({
        where: { id },
        data: { pdfUrl },
        include: { student: { include: { user: { select: { name: true } } } } },
      });

      return NextResponse.json(updated);
    }

    // Handle JSON update (revoke/revalidate)
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    if (body.isValid !== undefined) updateData.isValid = body.isValid;
    if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate);

    const updated = await prisma.certificate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Certificate update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
