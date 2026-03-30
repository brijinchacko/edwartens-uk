const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("=== Linking Freshsales files to leads/students ===");

  const fileNotes = await p.leadNote.findMany({
    where: { content: { contains: "[File Imported]" } },
    include: { lead: { select: { id: true, name: true, convertedToStudentId: true } } },
  });

  console.log("Total file notes:", fileNotes.length);

  let created = 0;
  let skipped = 0;

  for (const note of fileNotes) {
    const match = note.content.match(/\[File Imported\]\s*(.+?)\s*\((.+?)\)\s*—\s*(\S+)/);
    if (!match) { skipped++; continue; }

    const [, fileName, fileSize, fileUrl] = match;
    const studentId = note.lead.convertedToStudentId;

    // Skip if no student linked
    if (!studentId) { skipped++; continue; }

    // Check if document already exists
    const existing = await p.document.findFirst({
      where: { name: fileName, studentId },
    });
    if (existing) { skipped++; continue; }

    // Determine type
    const lower = fileName.toLowerCase();
    let docType = "OTHER";
    if (lower.includes("resume") || lower.includes("cv")) docType = "RESUME";
    else if (lower.includes("photo") || lower.includes("avatar") || lower.includes("passport")) docType = "ID_PROOF";
    else if (lower.includes("certificate") || lower.includes("degree") || lower.includes("qualification")) docType = "QUALIFICATION";
    else if (lower.includes("payment") || lower.includes("fee") || lower.includes("receipt")) docType = "PAYMENT_PROOF";
    else if (lower.includes("terms") || lower.includes("condition")) docType = "TERMS";
    else if (lower.includes("sharecode") || lower.includes("share")) docType = "SHARE_CODE";

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
    } catch {
      skipped++;
    }

    if (created % 50 === 0 && created > 0) console.log("  Created", created, "documents...");
  }

  const totalDocs = await p.document.count();
  console.log("\nResults:");
  console.log("  Documents created:", created);
  console.log("  Skipped:", skipped);
  console.log("  Total documents in DB:", totalDocs);

  await p.$disconnect();
}

main().catch(console.error);
