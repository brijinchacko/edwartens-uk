/**
 * Generate invoices for ALL existing paid students.
 *
 * Run with: node scripts/generate-all-invoices.js
 *
 * This script:
 * 1. Queries all students with paymentStatus PAID or PARTIAL
 * 2. For each student, finds their completed payments
 * 3. Checks if an invoice already exists for each payment
 * 4. If not, generates an invoice using the invoice lib
 * 5. Logs progress
 *
 * NOTE: This must be run from the project root so that the Prisma client
 * and invoice lib can be resolved. For Next.js projects with TypeScript,
 * you may need to run: npx tsx scripts/generate-all-invoices.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function generateInvoiceNumber(sequence) {
  const year = new Date().getFullYear();
  return `EDW-INV-${year}-${String(sequence).padStart(5, "0")}`;
}

async function getNextSequence() {
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: `EDW-INV-${year}` } },
    orderBy: { invoiceNumber: "desc" },
  });
  if (!lastInvoice) return 1;
  const parts = lastInvoice.invoiceNumber.split("-");
  return parseInt(parts[parts.length - 1] || "0") + 1;
}

const COURSE_LABELS = {
  PROFESSIONAL_MODULE: "Professional Module",
  AI_MODULE: "AI Module",
};

async function main() {
  console.log("=== Generate Invoices for All Paid Students ===\n");

  // Find all students with PAID or PARTIAL payment status
  const students = await prisma.student.findMany({
    where: {
      paymentStatus: { in: ["PAID", "PARTIAL"] },
    },
    include: {
      user: { select: { name: true, email: true, phone: true, address: true } },
    },
  });

  console.log(`Found ${students.length} students with PAID/PARTIAL status\n`);

  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalNoPayments = 0;

  for (const student of students) {
    // Find all completed payments for this student
    const payments = await prisma.payment.findMany({
      where: {
        studentId: student.id,
        status: "completed",
      },
      orderBy: { createdAt: "asc" },
    });

    if (payments.length === 0) {
      console.log(
        `  [SKIP] ${student.user.name} - no completed payments found`
      );
      totalNoPayments++;
      continue;
    }

    for (const payment of payments) {
      // Check if invoice already exists
      const existing = await prisma.invoice.findFirst({
        where: { paymentId: payment.id, studentId: student.id },
      });

      if (existing) {
        console.log(
          `  [EXISTS] ${student.user.name} - ${existing.invoiceNumber} (payment ${payment.id})`
        );
        totalSkipped++;
        continue;
      }

      // Generate invoice
      try {
        const courseName =
          COURSE_LABELS[payment.courseInterest] || payment.courseInterest;
        const amountPounds = payment.amount / 100;
        const netAmount = Math.round((amountPounds / 1.2) * 100) / 100;
        const vatAmount = Math.round((amountPounds - netAmount) * 100) / 100;

        const description =
          payment.type === "DEPOSIT"
            ? `Course Deposit - ${courseName}`
            : `${courseName} - Course Fee (Full Payment)`;

        const lineItems = [
          {
            description,
            quantity: 1,
            unitPrice: netAmount,
            amount: netAmount,
          },
        ];

        const sequence = await getNextSequence();
        const invoiceNumber = await generateInvoiceNumber(sequence);

        await prisma.invoice.create({
          data: {
            invoiceNumber,
            studentId: student.id,
            paymentId: payment.id,
            description,
            lineItems: JSON.parse(JSON.stringify(lineItems)),
            subtotal: Math.round(netAmount * 100),
            vatRate: 20,
            vatAmount: Math.round(vatAmount * 100),
            total: payment.amount,
            status: "PAID",
          },
        });

        console.log(
          `  [CREATED] ${student.user.name} - ${invoiceNumber} (${amountPounds.toFixed(2)} GBP)`
        );
        totalGenerated++;
      } catch (err) {
        console.error(
          `  [ERROR] ${student.user.name} - payment ${payment.id}:`,
          err.message
        );
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Students processed: ${students.length}`);
  console.log(`Invoices created: ${totalGenerated}`);
  console.log(`Invoices already existed: ${totalSkipped}`);
  console.log(`Students with no completed payments: ${totalNoPayments}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
