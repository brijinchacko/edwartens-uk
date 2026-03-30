import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

function generateInvoiceNumber(seq: number) {
  const year = new Date().getFullYear();
  return `EDW-INV-${year}-${String(seq).padStart(5, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "students:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, amount, description, vatRate = 20 } = body;

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get next sequence
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { invoiceNumber: "desc" },
    });
    let seq = 1;
    if (lastInvoice) {
      seq = parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0") + 1;
    }

    const invoiceNumber = generateInvoiceNumber(seq);
    const totalAmount = amount || student.paidAmount || 0;

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    const netAmount = Math.round((totalAmount / (1 + vatRate / 100)) * 100) / 100;
    const vatAmount = Math.round((totalAmount - netAmount) * 100) / 100;

    const lineDescription = description || (totalAmount <= 100
      ? `Course Deposit — Professional Module`
      : `Professional Module — PLC, SCADA & HMI Training (CPD Accredited)`);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        studentId,
        date: new Date(),
        dueDate: new Date(),
        description: `Invoice for ${student.user.name}`,
        lineItems: JSON.stringify([{
          description: lineDescription,
          quantity: 1,
          unitPrice: netAmount,
          total: netAmount,
        }]),
        subtotal: netAmount,
        vatRate,
        vatAmount,
        total: totalAmount,
        status: "PAID",
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: "Invoice Generated",
        message: `Your invoice ${invoiceNumber} for £${totalAmount.toFixed(2)} has been generated. You can view and download it from your Payments section.`,
        type: "INVOICE",
        link: "/student/payments",
      },
    });

    return NextResponse.json({
      message: "Invoice generated",
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        studentName: invoice.student?.user?.name,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
