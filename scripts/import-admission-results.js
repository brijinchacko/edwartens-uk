const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const p = new PrismaClient();

const FILE = "/Users/brijinchacko/Downloads/Admission Results and KPI (1).xlsx";

// Counsellor initial mapping
const INITIALS = {
  "Share with Ajeesh": "Ajeesh (former)",
  "VS": "Vaisakh Sankar",
  "AA": "Araina Asif",
  "AG": "Anisha George",
  "YB": "Yasmeen Banu",
  "NK": "Nikhil Chandran",
  "SK": "Sagar",
  "RG": "RG",
  "SM": "SM",
  "GJ": "GJ",
  "RF": "RF",
};

function normalizeEmail(e) {
  if (!e) return null;
  // Handle multiple emails - take first valid one
  const emails = e.toString().split(/[\/,;]/).map(s => s.trim().toLowerCase());
  for (const em of emails) {
    if (em.includes("@")) return em;
  }
  return null;
}

function normalizePhone(p) {
  if (!p) return null;
  return p.toString().split(/[\/,;]/)[0].replace(/[\s\-\(\)]/g, "").trim() || null;
}

async function main() {
  console.log("=== Importing Admission Results & KPI ===");
  const wb = XLSX.readFile(FILE);

  // ══════════════════════════════════════════
  // SHEET 1: Results (current admissions)
  // ══════════════════════════════════════════
  console.log("\n--- Processing RESULTS sheet ---");
  const results = XLSX.utils.sheet_to_json(wb.Sheets["Results"]);
  console.log("Rows:", results.length);

  let updated = 0, created = 0, skipped = 0, notesAdded = 0;

  for (const row of results) {
    try {
      const name = (row["Full Name"] || "").toString().trim();
      const email = normalizeEmail(row["Email ID"]);
      const phone = normalizePhone(row["Mobile"]);
      const counsellor = (row["Counselor"] || "").toString().trim();
      const fee = parseFloat(row["Course Fee"]) || 0;
      const paymentDate = (row["Payment Date"] || "").toString().trim();
      const paymentMode = (row["Mod Of Payement"] || "").toString().trim();
      const due = parseFloat(row["Due Amount"]) || 0;
      const received = parseFloat(row["£ Received"]) || 0;
      const comment = (row["Comment"] || "").toString().trim();
      const classAssigned = (row["Class Assigned"] || "").toString().trim();
      const batchNo = (row["Batch N°"] || "").toString().trim();
      const placed = (row["Placed"] || "").toString().trim();
      const invoiceSent = (row["Invoice Sent"] || "").toString().trim();
      const document = (row["Document"] || "").toString().trim();
      const software = (row["TraininginPLC & Software"] || "").toString().trim();

      if (!name || !email) { skipped++; continue; }

      // Check if student exists
      const existingUser = await p.user.findUnique({ where: { email } });
      const existingLead = await p.lead.findFirst({ where: { email } });

      // Determine payment status
      let paymentStatus = "PENDING";
      if (due === 0 && received > 0) paymentStatus = "PAID";
      else if (received > 0 && due > 0) paymentStatus = "PARTIAL";

      // Determine if dropped (from comment)
      const isDropped = comment.toLowerCase().includes("dropped") ||
                        comment.toLowerCase().includes("refund") ||
                        classAssigned === "N/A" && received <= 100;

      // Map counsellor
      const counsellorName = INITIALS[counsellor] || counsellor || "Unknown";

      if (existingUser) {
        // Update existing student
        const student = await p.student.findUnique({ where: { userId: existingUser.id } });
        if (student) {
          const updates = {};
          if (received > 0) {
            updates.paidAmount = received;
            updates.paymentStatus = paymentStatus;
          }
          if (isDropped) updates.status = "DROPPED";
          if (placed === "Yes") updates.status = "ALUMNI";

          if (Object.keys(updates).length > 0) {
            await p.student.update({ where: { id: student.id }, data: updates });
            updated++;
          }
        }
      }

      // Update lead if exists
      if (existingLead) {
        if (isDropped && existingLead.status !== "LOST") {
          await p.lead.update({ where: { id: existingLead.id }, data: { status: "LOST" } });
        } else if (received > 100 && existingLead.status !== "ENROLLED") {
          await p.lead.update({ where: { id: existingLead.id }, data: { status: "ENROLLED" } });
        }
      }

      // Add detailed note to lead
      const leadToNote = existingLead;
      if (leadToNote) {
        // Check if we already have this admission note
        const existingNote = await p.leadNote.findFirst({
          where: { leadId: leadToNote.id, content: { contains: "[Admission Result]" } },
        });

        if (!existingNote) {
          const noteContent = [
            `[Admission Result]`,
            `Counsellor: ${counsellorName}`,
            fee ? `Course Fee: £${fee}` : "",
            received ? `Received: £${received}` : "",
            due ? `Due: £${due}` : "",
            paymentDate ? `Payment Date: ${paymentDate}` : "",
            paymentMode ? `Payment Mode: ${paymentMode}` : "",
            classAssigned && classAssigned !== "N/A" ? `Batch: ${classAssigned}` : "",
            invoiceSent ? `Invoice: ${invoiceSent}` : "",
            document ? `Documents: ${document}` : "",
            software ? `Software: ${software}` : "",
            placed ? `Placed: ${placed}` : "",
            isDropped ? "⚠️ DROPPED" : "",
            comment ? `Notes: ${comment}` : "",
          ].filter(Boolean).join("\n");

          await p.leadNote.create({
            data: {
              leadId: leadToNote.id,
              content: noteContent,
              createdBy: counsellorName,
            },
          });
          notesAdded++;
        } else {
          skipped++;
        }
      }
    } catch (err) {
      skipped++;
    }
  }

  console.log(`Results: ${updated} students updated, ${notesAdded} notes added, ${skipped} skipped`);

  // ══════════════════════════════════════════
  // SHEET 2: FY 24-25 (historical)
  // ══════════════════════════════════════════
  console.log("\n--- Processing FY 24-25 sheet ---");
  const fyRaw = XLSX.utils.sheet_to_json(wb.Sheets["FY 24-25"], { header: 1 });

  // Find header row
  let headerIdx = -1;
  for (let i = 0; i < 10; i++) {
    if (fyRaw[i] && fyRaw[i].includes("Full Name")) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    console.log("Could not find FY 24-25 headers");
    await p.$disconnect();
    return;
  }

  const headers = fyRaw[headerIdx];
  const nameIdx = headers.indexOf("Full Name");
  const emailIdx = headers.indexOf("Email ID");
  const phoneIdx = headers.indexOf("Mobile Number");
  const batchIdx = headers.indexOf("Batch");
  const paidIdx = headers.indexOf("Paid amount");
  const dueIdx = headers.indexOf("Due amount");
  const totalIdx = headers.indexOf("Total amount ");
  const placedIdx = headers.indexOf("Placed");
  const modeIdx = headers.indexOf("Mode of Training");
  const certIdx = headers.indexOf("Certificate");
  const monthIdx = headers.indexOf("Month");

  let fyUpdated = 0, fyNotes = 0, fySkipped = 0;

  for (let i = headerIdx + 1; i < fyRaw.length; i++) {
    const row = fyRaw[i];
    if (!row || !row[nameIdx]) continue;

    try {
      const name = (row[nameIdx] || "").toString().trim();
      const email = normalizeEmail(row[emailIdx]);
      const phone = normalizePhone(row[phoneIdx]);
      const paid = parseFloat(row[paidIdx]) || 0;
      const due = parseFloat(row[dueIdx]) || 0;
      const total = parseFloat(row[totalIdx]) || 0;
      const placed = (row[placedIdx] || "").toString().trim();
      const mode = (row[modeIdx] || "").toString().trim();
      const cert = (row[certIdx] || "").toString().trim();
      const month = (row[monthIdx] || "").toString().trim();

      if (!name || !email) { fySkipped++; continue; }

      // Find existing student
      const user = await p.user.findUnique({ where: { email } });
      if (user) {
        const student = await p.student.findUnique({ where: { userId: user.id } });
        if (student) {
          const updates = {};
          if (paid > 0 && (!student.paidAmount || student.paidAmount < paid)) {
            updates.paidAmount = paid;
          }
          if (due === 0 && paid > 0) updates.paymentStatus = "PAID";
          else if (paid > 0 && due > 0) updates.paymentStatus = "PARTIAL";
          if (placed === "Yes") updates.status = "ALUMNI";

          if (Object.keys(updates).length > 0) {
            await p.student.update({ where: { id: student.id }, data: updates });
            fyUpdated++;
          }
        }
      }

      // Find and update lead
      const lead = await p.lead.findFirst({ where: { email } });
      if (lead) {
        const existingNote = await p.leadNote.findFirst({
          where: { leadId: lead.id, content: { contains: "[FY 24-25]" } },
        });

        if (!existingNote) {
          await p.leadNote.create({
            data: {
              leadId: lead.id,
              content: [
                `[FY 24-25] Month: ${month}`,
                paid ? `Paid: £${paid}` : "",
                due ? `Due: £${due}` : "",
                total ? `Total: £${total}` : "",
                mode ? `Mode: ${mode}` : "",
                cert ? `Certificate: ${cert}` : "",
                placed ? `Placed: ${placed}` : "",
              ].filter(Boolean).join(" | "),
              createdBy: "Excel Import (FY 24-25)",
            },
          });
          fyNotes++;
        }

        // Update lead status
        if (paid > 100 && lead.status === "NEW") {
          await p.lead.update({ where: { id: lead.id }, data: { status: "ENROLLED" } });
        }
      }
    } catch {
      fySkipped++;
    }
  }

  console.log(`FY 24-25: ${fyUpdated} students updated, ${fyNotes} notes added, ${fySkipped} skipped`);

  // Final counts
  const totalStudents = await p.student.count();
  const totalLeads = await p.lead.count();
  const totalNotes = await p.leadNote.count();
  const paidStudents = await p.student.count({ where: { paymentStatus: "PAID" } });
  const droppedStudents = await p.student.count({ where: { status: "DROPPED" } });

  console.log("\n=== FINAL COUNTS ===");
  console.log("Students:", totalStudents, "(Paid:", paidStudents, "Dropped:", droppedStudents, ")");
  console.log("Leads:", totalLeads);
  console.log("Notes:", totalNotes);

  await p.$disconnect();
}

main().catch(console.error);
