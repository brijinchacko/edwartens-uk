import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { generateInvoice } from "@/lib/invoice";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "students:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

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

    // Find completed payments for this student
    const payments = await prisma.payment.findMany({
      where: {
        studentId,
        status: "completed",
      },
      orderBy: { createdAt: "asc" },
    });

    if (payments.length === 0) {
      return NextResponse.json(
        { error: "No completed payments found for this student" },
        { status: 400 }
      );
    }

    let generated = 0;
    let skipped = 0;
    let lastInvoiceNumber = "";

    for (const payment of payments) {
      // Check if invoice already exists for this payment
      const existing = await prisma.invoice.findFirst({
        where: { paymentId: payment.id, studentId },
      });

      if (existing) {
        skipped++;
        lastInvoiceNumber = existing.invoiceNumber;
        continue;
      }

      await generateInvoice(payment.id, studentId);
      generated++;

      // Get the invoice number that was just created
      const newInvoice = await prisma.invoice.findFirst({
        where: { paymentId: payment.id, studentId },
      });
      if (newInvoice) {
        lastInvoiceNumber = newInvoice.invoiceNumber;
      }
    }

    if (generated === 0 && skipped > 0) {
      return NextResponse.json({
        message: "Invoices already exist for all payments",
        invoiceNumber: lastInvoiceNumber,
        generated: 0,
        skipped,
      });
    }

    return NextResponse.json({
      message: `${generated} invoice(s) generated`,
      invoiceNumber: lastInvoiceNumber,
      generated,
      skipped,
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
