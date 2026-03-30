/**
 * Generate invoices for all students based on Excel payment data
 * Reads: Admission Results and KPI (1).xlsx → Results sheet
 * Creates Invoice records in the database
 */

const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const p = new PrismaClient();

const FILE = "/tmp/Admission Results and KPI (1).xlsx";

function normalizeEmail(e) {
  if (!e) return null;
  const emails = e.toString().split(/[\/,;]/).map(s => s.trim().toLowerCase());
  for (const em of emails) {
    if (em.includes("@")) return em;
  }
  return null;
}

function generateInvoiceNumber(seq) {
  const year = new Date().getFullYear();
  return `EDW-INV-${year}-${String(seq).padStart(5, "0")}`;
}

function parsePaymentDate(dateStr) {
  if (!dateStr) return new Date();
  // Handle formats like "22/Dec/2024 & 28/Dec/2024"
  const firstDate = dateStr.toString().split(/[&,]/)[0].trim();
  // Remove trailing comma/space
  const clean = firstDate.replace(/[,\s]+$/, "").trim();
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;
  return new Date();
}

async function main() {
  console.log("=== Generating Invoices from Excel Data ===");

  const wb = XLSX.readFile(FILE);
  const results = XLSX.utils.sheet_to_json(wb.Sheets["Results"]);
  console.log("Total rows:", results.length);

  // Get next invoice sequence
  const lastInvoice = await p.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
  });
  let seq = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0");
    seq = lastSeq + 1;
  }
  console.log("Starting invoice sequence:", seq);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of results) {
    try {
      const name = (row["Full Name"] || "").toString().trim();
      const email = normalizeEmail(row["Email ID"]);
      const received = parseFloat(row["£ Received"]) || 0;
      const courseFee = parseFloat(row["Course Fee"]) || 0;
      const due = parseFloat(row["Due Amount"]) || 0;
      const paymentDate = parsePaymentDate(row["Payment Date"]);
      const paymentMode = (row["Mod Of Payement"] || "").toString().trim();
      const comment = (row["Comment"] || "").toString().trim();

      // Skip if no payment
      if (received <= 0) { skipped++; continue; }

      // Skip if dropped with only £100
      if (comment.toLowerCase().includes("dropped") && received <= 100) { skipped++; continue; }

      // Find student by email
      let studentId = null;
      if (email) {
        const user = await p.user.findUnique({ where: { email } });
        if (user) {
          const student = await p.student.findUnique({ where: { userId: user.id } });
          if (student) studentId = student.id;
        }
      }

      // Also try finding via lead
      if (!studentId && email) {
        const lead = await p.lead.findFirst({ where: { email } });
        if (lead?.convertedToStudentId) {
          studentId = lead.convertedToStudentId;
        }
      }

      if (!studentId) { skipped++; continue; }

      // Check if invoice already exists for this student
      const existingInvoice = await p.invoice.findFirst({
        where: { studentId },
      });
      if (existingInvoice) { skipped++; continue; }

      // Calculate VAT (20%)
      const netAmount = received / 1.2; // Remove VAT to get net
      const vatAmount = received - netAmount;

      // Create invoice
      const invoiceNumber = generateInvoiceNumber(seq);

      // Build line items
      const lineItems = [];

      // Check if it's a deposit or full payment
      if (received <= 100) {
        lineItems.push({
          description: "Course Deposit — Professional Module",
          quantity: 1,
          unitPrice: received,
          total: received,
        });
      } else {
        // Full or partial payment
        lineItems.push({
          description: "Professional Module — PLC, SCADA & HMI Training (CPD Accredited)",
          quantity: 1,
          unitPrice: Math.round(netAmount * 100) / 100,
          total: Math.round(netAmount * 100) / 100,
        });
      }

      await p.invoice.create({
        data: {
          invoiceNumber,
          studentId,
          date: paymentDate,
          dueDate: due > 0 ? new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000) : paymentDate,
          description: `Professional Module Training — ${name}`,
          lineItems: JSON.stringify(lineItems),
          subtotal: Math.round(netAmount * 100) / 100,
          vatRate: 20,
          vatAmount: Math.round(vatAmount * 100) / 100,
          total: received,
          status: due > 0 ? "ISSUED" : "PAID",
          notes: paymentMode ? `Payment: ${paymentMode}` : null,
        },
      });

      seq++;
      created++;
      if (created % 20 === 0) console.log(`  Created ${created} invoices...`);
    } catch (err) {
      errors++;
    }
  }

  // Final stats
  const totalInvoices = await p.invoice.count();
  console.log("\n=== DONE ===");
  console.log("Invoices created:", created);
  console.log("Skipped:", skipped);
  console.log("Errors:", errors);
  console.log("Total invoices in DB:", totalInvoices);

  await p.$disconnect();
}

main().catch(console.error);
