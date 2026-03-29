import { prisma } from "@/lib/prisma";

type JourneyEventType =
  | "LEAD_CREATED" | "LEAD_ASSIGNED" | "LEAD_CONTACTED"
  | "DEPOSIT_PAID" | "FULL_PAYMENT" | "STUDENT_CREATED"
  | "ONBOARDING_STARTED" | "ONBOARDING_COMPLETED" | "BATCH_ASSIGNED"
  | "DOCUMENT_UPLOADED" | "DOCUMENT_VERIFIED" | "SOFTWARE_VERIFIED"
  | "TRAINING_STARTED" | "TRAINING_COMPLETED"
  | "PROJECT_SUBMITTED" | "ASSESSMENT_COMPLETED"
  | "PRE_COURSE_COMPLETED" | "THEORY_ASSESSMENT_COMPLETED"
  | "PRACTICAL_SUBMITTED" | "PRACTICAL_GRADED"
  | "CERTIFICATE_DISPATCH_PENDING" | "CERTIFICATE_SENT"
  | "RESUME_REVIEW" | "LINKEDIN_VERIFIED"
  | "JOB_APPLICATION" | "INTERVIEW_SCHEDULED" | "INTERVIEW_COMPLETED"
  | "CERTIFICATE_ISSUED" | "STATUS_CHANGE" | "NOTE_ADDED" | "FEEDBACK_RECEIVED";

export async function logJourneyEvent(
  studentId: string,
  eventType: JourneyEventType,
  title: string,
  description?: string,
  metadata?: Record<string, string | number | boolean | null>,
  createdBy?: string
) {
  try {
    await prisma.studentJourney.create({
      data: {
        studentId,
        eventType,
        title,
        description: description || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        createdBy: createdBy || null,
      },
    });
  } catch (error) {
    console.error("Failed to log journey event:", error);
    // Don't throw - journey logging should never break the main flow
  }
}
