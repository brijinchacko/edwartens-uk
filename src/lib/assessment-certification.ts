import { prisma } from "./prisma";
import { autoGenerateCertificate } from "./certificate-generator";
import { logJourneyEvent } from "./journey";
import { notifyUser, notifyByRole } from "./notifications";

/**
 * Check if a student has passed both theory (≥80%) AND practical (≥80%)
 * If so, auto-generate a CPD certificate and create a dispatch task.
 * This function is idempotent — it skips if a CPD cert already exists.
 */
export async function checkAndGenerateCertificate(
  studentId: string
): Promise<boolean> {
  // Check if CPD certificate already exists
  const existingCert = await prisma.certificate.findFirst({
    where: { studentId, type: "CPD", isValid: true },
  });

  if (existingCert) return false; // Already has certificate

  // Check theory assessment — need a passing attempt
  const theoryPass = await prisma.assessmentAttempt.findFirst({
    where: { studentId, type: "THEORY", passed: true },
  });

  if (!theoryPass) return false;

  // Check practical assessment — need an approved submission with score ≥ 80
  const practicalPass = await prisma.projectSubmission.findFirst({
    where: {
      studentId,
      status: "APPROVED",
      score: { gte: 80 },
    },
  });

  if (!practicalPass) return false;

  // Both passed — generate certificate
  const certResult = await autoGenerateCertificate(studentId, "CPD");
  if (!certResult) return false;

  // Look up the certificate record by certNo
  const cert = await prisma.certificate.findUnique({
    where: { certificateNo: certResult.certNo },
  });
  if (!cert) return false;

  // Create dispatch record
  await prisma.certificateDispatch.create({
    data: {
      certificateId: cert.id,
      status: "PENDING",
    },
  });

  // Get student info for notifications
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { id: true, name: true } } },
  });

  if (student) {
    // Notify student
    await notifyUser(
      student.userId,
      "Certificate Generated!",
      "Congratulations! Your CPD certificate has been generated. A hardcopy will be sent to you shortly.",
      "CERTIFICATE_GENERATED",
      "/student/certificates"
    );

    // Notify admins
    await notifyByRole(
      ["SUPER_ADMIN", "ADMIN"],
      "Certificate Sending Pending",
      `Certificate for ${student.user.name} (${cert.certificateNo}) is ready to be sent.`,
      "CERTIFICATE_DISPATCH",
      `/admin/certificates`
    );

    // Log journey events
    await logJourneyEvent(
      studentId,
      "CERTIFICATE_DISPATCH_PENDING",
      "Certificate Dispatch Pending",
      `CPD certificate ${cert.certificateNo} generated. Awaiting dispatch.`
    );

    // Update student status to COMPLETED
    await prisma.student.update({
      where: { id: studentId },
      data: { status: "COMPLETED" },
    });
  }

  return true;
}
