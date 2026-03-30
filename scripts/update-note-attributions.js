const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Employee initial mapping
const INITIALS_MAP = {
  "VS": "Vaisakh Sankar",
  "AA": "Araina Asif",
  "AG": "Anisha George",
  "YB": "Yasmeen Banu",
  "NK": "Nikhil Chandran",
  "SK": "Sagar",
  "RG": "RG",  // Unknown - keep initials
  "SM": "SM",  // Unknown - keep initials
  "GJ": "GJ",  // Unknown - keep initials
  "RF": "RF",  // Unknown - keep initials
  "SS": "SS",  // Unknown - keep initials
  "FS": "FS",  // Unknown - keep initials
};

async function main() {
  console.log("=== Updating Note Attributions ===");

  // Step 1: Update notes that have "Counsellor: XX" pattern
  // Change createdBy from "Excel Import" to actual employee name
  const excelNotes = await p.leadNote.findMany({
    where: {
      content: { contains: "Counsellor:" },
      createdBy: "Excel Import",
    },
    select: { id: true, content: true },
  });

  console.log("Excel notes with counsellor info:", excelNotes.length);

  let updated = 0;
  for (const note of excelNotes) {
    // Extract initials from "Counsellor: XX"
    const match = note.content.match(/Counsellor:\s*([A-Z]{2}(?:\s*[,&\/]\s*[A-Z]{2})*)/);
    if (!match) continue;

    const initials = match[1].trim().split(/\s*[,&\/]\s*/)[0]; // Take first if multiple
    const fullName = INITIALS_MAP[initials];

    if (fullName) {
      await p.leadNote.update({
        where: { id: note.id },
        data: { createdBy: fullName },
      });
      updated++;
    }
  }
  console.log("Notes attributed to employees:", updated);

  // Step 2: Update Freshsales notes - map "Freshsales Sync" to show source better
  const fsNotes = await p.leadNote.count({ where: { createdBy: "Freshsales Sync" } });
  console.log("\nFreshsales sync notes:", fsNotes);

  // Step 3: Update Freshsales form notes - extract key info
  const formNotes = await p.leadNote.findMany({
    where: {
      content: { contains: "[Freshsales Form]" },
    },
    select: { id: true, content: true, createdBy: true },
    take: 5,
  });
  console.log("Sample form notes:", formNotes.length);
  formNotes.forEach(n => console.log("  ", n.content.substring(0, 150)));

  // Step 4: Update RFQ leads - add counsellor from the Excel
  // Re-read Excel to get counsellor mapping per lead email
  const XLSX = require("xlsx");
  const wb = XLSX.readFile("/tmp/PLC Training Enquiries.xlsx");

  // RFQ sheet has counsellor column
  const rfqData = XLSX.utils.sheet_to_json(wb.Sheets["RFQ"]);
  console.log("\n=== Updating RFQ lead counsellors ===");
  let rfqUpdated = 0;

  for (const row of rfqData) {
    const email = (row["Email ID"] || "").toString().trim().toLowerCase();
    const counsellor = (row.counsellor || "").toString().trim();
    const comments = (row.Comments || "").toString().trim();

    if (!email || !counsellor || counsellor.length > 3) continue;

    const fullName = INITIALS_MAP[counsellor] || counsellor;

    // Find lead by email
    const lead = await p.lead.findFirst({ where: { email } });
    if (!lead) continue;

    // Check if we already have a note with this counsellor for this lead
    const existingNote = await p.leadNote.findFirst({
      where: { leadId: lead.id, content: { contains: `[RFQ] Counsellor: ${fullName}` } },
    });
    if (existingNote) continue;

    // Add counsellor note
    const noteContent = [`[RFQ] Counsellor: ${fullName}`, comments].filter(Boolean).join(" | ");
    if (noteContent.trim().length > 10) {
      await p.leadNote.create({
        data: {
          leadId: lead.id,
          content: noteContent,
          createdBy: fullName,
        },
      });
      rfqUpdated++;
    }
  }
  console.log("RFQ counsellor notes added:", rfqUpdated);

  // Step 5: Update Quality leads with detailed info
  const qualData = XLSX.utils.sheet_to_json(wb.Sheets["Quality leads"]);
  console.log("\n=== Updating Quality Lead details ===");
  let qualUpdated = 0;

  for (const row of qualData) {
    const email = (row["Email ID"] || "").toString().trim().toLowerCase();
    const counsellor = (row.Counselor || row.Counsellor || "").toString().trim();
    const visa = (row["Visa Status"] || "").toString().trim();
    const education = (row.Education || "").toString().trim();
    const experience = (row.Experience || "").toString().trim();
    const comment = (row.Comment || "").toString().trim();
    const usp = (row.USP || "").toString().trim();
    const interested = (row["Interested "] || "").toString().trim();

    if (!email) continue;

    const fullName = INITIALS_MAP[counsellor] || counsellor || "Unknown";
    const lead = await p.lead.findFirst({ where: { email } });
    if (!lead) continue;

    // Check if quality note already exists
    const existing = await p.leadNote.findFirst({
      where: { leadId: lead.id, content: { contains: "[Quality Lead Detail]" } },
    });
    if (existing) continue;

    const details = [
      visa ? `Visa: ${visa}` : "",
      education ? `Education: ${education}` : "",
      experience ? `Experience: ${experience}` : "",
      usp ? `USP: ${usp}` : "",
      interested ? `Interested: ${interested}` : "",
      comment ? `Notes: ${comment}` : "",
    ].filter(Boolean).join("\n");

    if (details.length > 10) {
      await p.leadNote.create({
        data: {
          leadId: lead.id,
          content: `[Quality Lead Detail] Counsellor: ${fullName}\n${details}`,
          createdBy: fullName,
        },
      });
      qualUpdated++;
    }

    // Update lead qualification if available
    if (education && !lead.qualification) {
      await p.lead.update({
        where: { id: lead.id },
        data: { qualification: education },
      });
    }
  }
  console.log("Quality lead details added:", qualUpdated);

  // Final stats
  const totalNotes = await p.leadNote.count();
  const notesByCreator = await p.leadNote.groupBy({
    by: ["createdBy"],
    _count: true,
    orderBy: { _count: { createdBy: "desc" } },
    take: 15,
  });
  console.log("\n=== FINAL NOTE ATTRIBUTION ===");
  console.log("Total notes:", totalNotes);
  notesByCreator.forEach(s => console.log("  ", s.createdBy, ":", s._count));

  await p.$disconnect();
}

main().catch(console.error);
