const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Lead status breakdown
  const statuses = await p.lead.groupBy({ by: ["status"], _count: true });
  console.log("=== LEAD STATUS BREAKDOWN ===");
  statuses.forEach(s => console.log("  ", s.status, ":", s._count));

  // Total notes
  const notes = await p.leadNote.count();
  console.log("\nTotal lead notes:", notes);

  // Notes by source
  const sources = await p.leadNote.groupBy({
    by: ["createdBy"],
    _count: true,
    orderBy: { _count: { createdBy: "desc" } },
    take: 15,
  });
  console.log("\n=== NOTES BY SOURCE ===");
  sources.forEach(s => console.log("  ", s.createdBy, ":", s._count));

  // Leads with/without notes
  const leadsWithNotes = await p.lead.count({ where: { notes: { some: {} } } });
  const totalLeads = await p.lead.count();
  console.log("\nLeads with notes:", leadsWithNotes, "/", totalLeads);
  console.log("Leads WITHOUT notes:", totalLeads - leadsWithNotes);

  // Leads by source
  const leadSources = await p.lead.groupBy({
    by: ["source"],
    _count: true,
    orderBy: { _count: { source: "desc" } },
    take: 10,
  });
  console.log("\n=== LEADS BY SOURCE ===");
  leadSources.forEach(s => console.log("  ", s.source, ":", s._count));

  // Check Excel imported notes with counsellor info
  const excelNotes = await p.leadNote.count({ where: { content: { contains: "Counsellor:" } } });
  console.log("\nNotes with Counsellor info:", excelNotes);

  // Check for employee initials in notes
  const initialsMap = {
    "AA": "Araina Asif",
    "AG": "Anisha George",
    "VS": "Vaisakh Sankar",
    "NK": "Nikhil Chandran",
    "YB": "Yasmeen Banu",
    "SG": "Sagar",
  };

  console.log("\n=== NOTES WITH EMPLOYEE INITIALS ===");
  for (const [init, name] of Object.entries(initialsMap)) {
    const count = await p.leadNote.count({
      where: {
        OR: [
          { content: { contains: `Counsellor: ${init}` } },
          { content: { contains: `Counselor: ${init}` } },
          { content: { contains: ` ${init} ` } },
        ],
      },
    });
    console.log("  ", init, `(${name}):`, count, "notes");
  }

  // Sample leads - check if Excel comments with initials are properly mapped
  console.log("\n=== SAMPLE EXCEL NOTES WITH INITIALS ===");
  const sampleNotes = await p.leadNote.findMany({
    where: {
      OR: [
        { content: { contains: "Counsellor: VS" } },
        { content: { contains: "Counsellor: AG" } },
        { content: { contains: "Counsellor: AA" } },
      ],
    },
    include: { lead: { select: { name: true } } },
    take: 5,
  });
  sampleNotes.forEach(n => {
    console.log("\n  Lead:", n.lead.name);
    console.log("  Note:", n.content.substring(0, 200));
    console.log("  Created by:", n.createdBy);
  });

  await p.$disconnect();
}

main().catch(console.error);
