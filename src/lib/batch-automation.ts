import { prisma } from "./prisma";
import { notifyStudent, notifyAdmins } from "./notify";

// Check if all onboarding requirements are met
export async function checkStudentReadiness(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true, documents: true, softwareChecklist: true },
  });
  if (!student) return false;

  const hasIdProof = student.documents.some(
    (d) =>
      (d.type === "ID_PROOF" || d.type === "ID Proof") &&
      (d.status === "UPLOADED" || d.status === "VERIFIED")
  );
  const hasQualification = student.documents.some(
    (d) =>
      (d.type === "QUALIFICATION" || d.type === "Qualification") &&
      (d.status === "UPLOADED" || d.status === "VERIFIED")
  );
  const hasCv = student.documents.some(
    (d) =>
      (d.type === "CV" || d.type === "RESUME") &&
      (d.status === "UPLOADED" || d.status === "VERIFIED")
  );
  const isPaid = student.paymentStatus === "PAID";
  const softwareOk = student.softwareChecklist?.allVerified || false;

  return hasIdProof && hasQualification && hasCv && isPaid && softwareOk;
}

// Auto-update batch statuses when end date passes
export async function autoUpdateBatchStatuses() {
  const now = new Date();
  // Find ACTIVE batches where endDate has passed
  const expiredBatches = await prisma.batch.findMany({
    where: { status: "ACTIVE", endDate: { lt: now } },
    include: {
      students: { select: { id: true, status: true, userId: true } },
    },
  });

  let updated = 0;
  for (const batch of expiredBatches) {
    await prisma.batch.update({
      where: { id: batch.id },
      data: { status: "COMPLETED" },
    });
    // Move ACTIVE students to POST_TRAINING
    for (const student of batch.students) {
      if (student.status === "ACTIVE") {
        await prisma.student.update({
          where: { id: student.id },
          data: { status: "POST_TRAINING" },
        });
        await notifyStudent(
          student.id,
          "Training Completed",
          "Your batch training has been completed. Career support phase begins now.",
          "/student/dashboard"
        );
        updated++;
      }
    }
  }
  return { batchesCompleted: expiredBatches.length, studentsUpdated: updated };
}

// Auto-mark certificate issued -> COMPLETED status
export async function autoCompleteOnCertificate(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { status: true },
  });
  if (
    student &&
    !["ALUMNI_PLACED", "ALUMNI_NOT_PLACED", "DROPPED"].includes(student.status)
  ) {
    await prisma.student.update({
      where: { id: studentId },
      data: { status: "ALUMNI_NOT_PLACED" },
    });
  }
}
