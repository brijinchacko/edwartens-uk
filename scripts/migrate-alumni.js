/**
 * Migrate existing ALUMNI students to new statuses.
 *
 * Run with: node scripts/migrate-alumni.js
 *
 * This script:
 * 1. Finds all students with status ALUMNI
 * 2. If they have a Placement record, sets status to ALUMNI_PLACED
 * 3. Otherwise sets status to ALUMNI_NOT_PLACED
 *
 * IMPORTANT: Run `npx prisma db push` first to apply the schema changes
 * before running this migration script.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("=== Migrate ALUMNI Students to New Statuses ===\n");

  // Find all students with status ALUMNI
  // After schema change, ALUMNI is no longer a valid enum value in Prisma.
  // We use raw query to find any rows still using the old value.
  const alumniStudents = await prisma.$queryRaw`
    SELECT s.id, u.name, u.email
    FROM "Student" s
    JOIN "User" u ON s."userId" = u.id
    WHERE s.status = 'ALUMNI'
  `;

  console.log(`Found ${alumniStudents.length} students with ALUMNI status\n`);

  if (alumniStudents.length === 0) {
    console.log("No students to migrate.");
    return;
  }

  let placedCount = 0;
  let notPlacedCount = 0;

  for (const student of alumniStudents) {
    // Check if the student has any placement record
    const placement = await prisma.placement.findFirst({
      where: { studentId: student.id },
    });

    const newStatus = placement ? "ALUMNI_PLACED" : "ALUMNI_NOT_PLACED";

    // Use raw query to update since old ALUMNI may not be valid in Prisma enum anymore
    await prisma.$executeRaw`
      UPDATE "Student" SET status = ${newStatus}::"StudentStatus", "updatedAt" = NOW()
      WHERE id = ${student.id}
    `;

    if (placement) {
      console.log(`  [PLACED] ${student.name} (${student.email})`);
      placedCount++;
    } else {
      console.log(`  [NOT PLACED] ${student.name} (${student.email})`);
      notPlacedCount++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total migrated: ${alumniStudents.length}`);
  console.log(`Set to ALUMNI_PLACED: ${placedCount}`);
  console.log(`Set to ALUMNI_NOT_PLACED: ${notPlacedCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
