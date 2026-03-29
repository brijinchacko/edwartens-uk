import { prisma } from "./prisma";
import { generateInvoiceNumber, formatDate, COURSE_LABELS } from "./utils";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in pounds
  amount: number; // in pounds
}

export async function generateInvoice(
  paymentId: string,
  studentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { name: true, email: true, phone: true, address: true } } },
  });

  if (!payment || !student) return;

  // Check if invoice already exists for this payment
  const existing = await prisma.invoice.findFirst({
    where: { paymentId, studentId },
  });
  if (existing) return;

  // Determine line items
  const courseName = COURSE_LABELS[payment.courseInterest] || payment.courseInterest;
  const amountPounds = payment.amount / 100;
  const netAmount = Math.round((amountPounds / 1.2) * 100) / 100; // Remove 20% VAT
  const vatAmount = Math.round((amountPounds - netAmount) * 100) / 100;

  const description =
    payment.type === "DEPOSIT"
      ? `Course Deposit - ${courseName}`
      : `${courseName} - Course Fee (Full Payment)`;

  const lineItems: LineItem[] = [
    {
      description,
      quantity: 1,
      unitPrice: netAmount,
      amount: netAmount,
    },
  ];

  // Generate invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: `EDW-INV-${new Date().getFullYear()}` } },
    orderBy: { invoiceNumber: "desc" },
  });
  const sequence = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0") + 1
    : 1;
  const invoiceNumber = generateInvoiceNumber(sequence);

  // Create invoice record
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      studentId,
      paymentId,
      description,
      lineItems: JSON.parse(JSON.stringify(lineItems)),
      subtotal: Math.round(netAmount * 100),
      vatRate: 20,
      vatAmount: Math.round(vatAmount * 100),
      total: payment.amount,
      status: "PAID",
    },
  });

  // Generate PDF
  const pdfPath = await generateInvoicePdf(invoice, student, payment, lineItems);

  // Update invoice with PDF URL
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: pdfPath },
  });
}

async function generateInvoicePdf(
  invoice: { invoiceNumber: string; date: Date; id: string },
  student: { user: { name: string; email: string; phone: string | null; address: string | null } },
  payment: { amount: number; stripePaymentIntentId: string | null; type: string; createdAt: Date },
  lineItems: LineItem[]
): Promise<string> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Colors
  const darkBlue = [10, 15, 20] as [number, number, number];
  const accentBlue = [40, 145, 255] as [number, number, number];
  const grey = [120, 120, 120] as [number, number, number];
  const black = [30, 30, 30] as [number, number, number];

  // Header - Company Info
  doc.setFontSize(22);
  doc.setTextColor(...accentBlue);
  doc.setFont("helvetica", "bold");
  doc.text("EDWartens UK", margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(...grey);
  doc.setFont("helvetica", "normal");
  doc.text("Training Division of Wartens Ltd", margin, y);
  y += 12;

  // INVOICE title
  doc.setFontSize(28);
  doc.setTextColor(...darkBlue);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, y, { align: "right" });
  y += 4;

  // Invoice details (right aligned)
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - margin, y + 6, { align: "right" });
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, y + 11, { align: "right" });
  doc.text(`Payment Date: ${formatDate(payment.createdAt)}`, pageWidth - margin, y + 16, { align: "right" });
  if (payment.stripePaymentIntentId) {
    doc.text(`Ref: ${payment.stripePaymentIntentId}`, pageWidth - margin, y + 21, { align: "right" });
  }

  // Company address (left side)
  doc.setFontSize(8);
  doc.setTextColor(...grey);
  const companyLines = [
    "Wartens Ltd",
    "8, Lyon Road",
    "Milton Keynes, MK1 1EX",
    "United Kingdom",
    "",
    "Company Reg: 15262249",
    "Phone: +44 333 33 98 394",
    "Email: info@wartens.com",
  ];
  companyLines.forEach((line, i) => {
    doc.text(line, margin, y + 6 + i * 4);
  });
  y += 42;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Bill To
  doc.setFontSize(9);
  doc.setTextColor(...accentBlue);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin, y);
  y += 6;
  doc.setTextColor(...black);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(student.user.name, margin, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text(student.user.email, margin, y);
  if (student.user.phone) {
    y += 5;
    doc.text(student.user.phone, margin, y);
  }
  if (student.user.address) {
    y += 5;
    doc.text(student.user.address, margin, y);
  }
  y += 12;

  // Table Header
  const colX = { desc: margin, qty: 120, unit: 145, amount: pageWidth - margin };

  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y - 4, contentWidth, 10, "F");
  doc.setFontSize(8);
  doc.setTextColor(...grey);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", colX.desc + 2, y + 2);
  doc.text("QTY", colX.qty, y + 2, { align: "center" });
  doc.text("UNIT PRICE", colX.unit + 10, y + 2, { align: "center" });
  doc.text("AMOUNT", colX.amount - 2, y + 2, { align: "right" });
  y += 12;

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.setFontSize(9);
  lineItems.forEach((item) => {
    doc.text(item.description, colX.desc + 2, y);
    doc.text(String(item.quantity), colX.qty, y, { align: "center" });
    doc.text(`£${item.unitPrice.toFixed(2)}`, colX.unit + 10, y, { align: "center" });
    doc.text(`£${item.amount.toFixed(2)}`, colX.amount - 2, y, { align: "right" });
    y += 8;
  });

  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Totals
  const totalsX = 140;
  const totalsValX = pageWidth - margin - 2;

  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text("Subtotal (Net)", totalsX, y);
  doc.setTextColor(...black);
  doc.text(`£${(lineItems.reduce((s, i) => s + i.amount, 0)).toFixed(2)}`, totalsValX, y, { align: "right" });
  y += 6;

  doc.setTextColor(...grey);
  doc.text("VAT (20%)", totalsX, y);
  doc.setTextColor(...black);
  const vatTotal = payment.amount / 100 - lineItems.reduce((s, i) => s + i.amount, 0);
  doc.text(`£${vatTotal.toFixed(2)}`, totalsValX, y, { align: "right" });
  y += 8;

  // Total
  doc.setFillColor(...accentBlue);
  doc.rect(totalsX - 5, y - 4, pageWidth - margin - totalsX + 7, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", totalsX, y + 2);
  doc.text(`£${(payment.amount / 100).toFixed(2)}`, totalsValX, y + 2, { align: "right" });
  y += 16;

  // Payment Status
  doc.setFontSize(9);
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("PAID", margin, y);
  doc.setTextColor(...grey);
  doc.setFont("helvetica", "normal");
  doc.text(` - Payment received via Stripe`, margin + 12, y);
  y += 15;

  // Footer
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 270, pageWidth - margin, 270);
  doc.setFontSize(7);
  doc.setTextColor(...grey);
  doc.text("EDWartens UK | Training Division of Wartens Ltd | Company Reg: 15262249", pageWidth / 2, 276, { align: "center" });
  doc.text("8, Lyon Road, Milton Keynes, MK1 1EX | info@wartens.com | +44 333 33 98 394", pageWidth / 2, 280, { align: "center" });
  doc.text("Thank you for choosing EDWartens UK for your professional development.", pageWidth / 2, 284, { align: "center" });

  // Save PDF
  const uploadsDir = path.join(process.cwd(), "uploads", "invoices");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `${invoice.invoiceNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(filePath, pdfBuffer);

  return `/api/uploads/invoices/${fileName}`;
}
