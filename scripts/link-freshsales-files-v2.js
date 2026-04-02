const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("=== Linking Freshsales files to students (by email match) ===\n");

  // Get all leads that have file import notes
  const leadsWithFiles = await p.$queryRaw`
    SELECT DISTINCT l.id, l.name, l.email, l."convertedToStudentId"
    FROM "Lead" l
    JOIN "LeadNote" ln ON ln."leadId" = l.id
    WHERE ln.content LIKE '%[File Imported]%'
    AND l.email IS NOT NULL AND l.email != ''
  `;

  console.log("Leads with file imports:", leadsWithFiles.length);

  // Build email -> student mapping
  const students = await p.student.findMany({
    include: { user: { select: { name: true, email: true } } },
  });

  const emailToStudent = {};
  for (const s of students) {
    const email = s.user.email?.toLowerCase().trim();
    if (email) emailToStudent[email] = s.id;
  }

  console.log("Students in DB:", students.length);
  console.log("Students with email:", Object.keys(emailToStudent).length);

  let created = 0;
  let skipped = 0;
  let noStudentMatch = 0;
  let alreadyExists = 0;

  for (const lead of leadsWithFiles) {
    // Find student by email match
    const studentId = lead.convertedToStudentId || emailToStudent[lead.email?.toLowerCase().trim()];
    if (!studentId) {
      noStudentMatch++;
      continue;
    }

    // Get file notes for this lead
    const fileNotes = await p.leadNote.findMany({
      where: { leadId: lead.id, content: { contains: "[File Imported]" } },
    });

    for (const note of fileNotes) {
      const match = note.content.match(/\[File Imported\]\s*(.+?)\s*\((.+?)\)\s*—\s*(\S+)/);
      if (!match) { skipped++; continue; }

      const [, fileName, fileSize, fileUrl] = match;

      // Check if document already exists
      const existing = await p.document.findFirst({
        where: { name: fileName, studentId },
      });
      if (existing) { alreadyExists++; continue; }

      // Determine type
      const lower = fileName.toLowerCase();
      let docType = "OTHER";
      if (lower.includes("resume") || lower.includes("cv")) docType = "CV";
      else if (lower.includes("photo") || lower.includes("avatar") || lower.includes("passport") || lower.includes("brp") || lower.includes("visa") || lower.includes("share") || lower.includes("pic")) docType = "ID_PROOF";
      else if (lower.includes("certificate") || lower.includes("cert") || lower.includes("degree") || lower.includes("qualification") || lower.includes("marksheet")) docType = "QUALIFICATION";

      // Parse size
      const sizeMatch = fileSize.match(/([\d.]+)\s*(KB|MB)/i);
      const sizeBytes = sizeMatch
        ? parseFloat(sizeMatch[1]) * (sizeMatch[2].toUpperCase() === "MB" ? 1024 * 1024 : 1024)
        : 0;

      // Mime type
      let mimeType = "application/octet-stream";
      if (lower.endsWith(".pdf")) mimeType = "application/pdf";
      else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
      else if (lower.endsWith(".png")) mimeType = "image/png";
      else if (lower.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      try {
        await p.document.create({
          data: {
            studentId,
            name: fileName,
            type: docType,
            fileUrl,
            fileSize: Math.round(sizeBytes),
            mimeType,
            status: "UPLOADED",
            uploadedAt: note.createdAt,
          },
        });
        created++;
      } catch (e) {
        skipped++;
      }

      if (created % 100 === 0 && created > 0) console.log(`  ...created ${created} documents`);
    }
  }

  // Summary
  const totalDocs = await p.document.count();
  const studentsWithDocs = await p.$queryRaw`
    SELECT COUNT(DISTINCT "studentId") as count FROM "Document"
  `;
  const studentsWithoutDocs = await p.$queryRaw`
    SELECT COUNT(*) as count FROM "Student" s
    WHERE NOT EXISTS (SELECT 1 FROM "Document" d WHERE d."studentId" = s.id)
    AND s.status NOT IN ('DROPPED')
  `;

  console.log("\n=== RESULTS ===");
  console.log("  Documents created:", created);
  console.log("  Already existed:", alreadyExists);
  console.log("  Skipped (no match/parse error):", skipped);
  console.log("  Leads with no student match:", noStudentMatch);
  console.log("  Total documents in DB:", totalDocs);
  console.log("  Students WITH documents:", studentsWithDocs[0].count.toString());
  console.log("  Students WITHOUT documents:", studentsWithoutDocs[0].count.toString());

  await p.$disconnect();
}

main().catch(console.error);
