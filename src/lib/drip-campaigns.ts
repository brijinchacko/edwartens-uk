import { prisma } from "./prisma";
import { sendEmail } from "./microsoft-graph";
import { emailTemplates, fillTemplate } from "./email-templates";

/* ─── Types ────────────────────────────────────────────────────────── */

export interface SequenceWithSteps {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  trigger: string;
  createdAt: Date;
  steps: {
    id: string;
    sequenceId: string;
    stepNumber: number;
    delayDays: number;
    templateId: string;
    subject: string | null;
    isActive: boolean;
  }[];
}

export interface RunResult {
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  details: { leadId: string; sequenceId: string; stepNumber: number; status: string; error?: string }[];
}

/* ─── Trigger → LeadStatus mapping ─────────────────────────────────── */

const TRIGGER_STATUS_MAP: Record<string, string[]> = {
  NEW_LEAD: ["NEW", "CONTACTED", "QUALIFIED", "ENROLLED"],
  CONTACTED: ["CONTACTED", "QUALIFIED", "ENROLLED"],
  QUALIFIED: ["QUALIFIED", "ENROLLED"],
  POST_CONSULTATION: ["CONTACTED", "QUALIFIED", "ENROLLED"],
  ENROLLED: ["ENROLLED"],
};

/* ─── Default sequences (for seeding) ──────────────────────────────── */

export const DEFAULT_SEQUENCES = [
  {
    name: "New Lead Welcome",
    description: "Automated welcome sequence for new leads upon enquiry",
    trigger: "NEW_LEAD",
    steps: [
      { stepNumber: 1, delayDays: 0, templateId: "initial-enquiry-thankyou", subject: null },
      { stepNumber: 2, delayDays: 3, templateId: "followup-checking-in", subject: "Checking In — EDWartens UK" },
      { stepNumber: 3, delayDays: 7, templateId: "post-thankyou-resources", subject: "Resources & Next Steps" },
      { stepNumber: 4, delayDays: 14, templateId: "followup-limited-batch", subject: null },
    ],
  },
  {
    name: "Post-Consultation Follow-up",
    description: "Follow-up sequence after initial consultation/call",
    trigger: "CONTACTED",
    steps: [
      { stepNumber: 1, delayDays: 1, templateId: "post-consultation-summary", subject: "Thank You for Attending" },
      { stepNumber: 2, delayDays: 5, templateId: "followup-checking-in", subject: "Checking In -- Any Questions?" },
      { stepNumber: 3, delayDays: 10, templateId: "followup-early-bird", subject: null },
    ],
  },
  {
    name: "Enrollment Welcome",
    description: "Welcome and onboarding sequence for newly enrolled students",
    trigger: "ENROLLED",
    steps: [
      { stepNumber: 1, delayDays: 0, templateId: "onboarding-welcome", subject: null },
      { stepNumber: 2, delayDays: 1, templateId: "onboarding-software", subject: null },
      { stepNumber: 3, delayDays: 3, templateId: "onboarding-batch-starts", subject: null },
    ],
  },
];

/* ─── Core functions ───────────────────────────────────────────────── */

export async function getActiveSequences(): Promise<SequenceWithSteps[]> {
  return prisma.emailSequence.findMany({
    where: { isActive: true },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAllSequences(): Promise<SequenceWithSteps[]> {
  return prisma.emailSequence.findMany({
    include: { steps: { orderBy: { stepNumber: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Find leads eligible for a specific sequence step.
 * A lead is eligible when:
 * 1. Their status matches the trigger
 * 2. They were created at least `delayDays` ago
 * 3. They haven't already received this step
 */
export async function getLeadsForStep(
  sequenceId: string,
  stepNumber: number,
  delayDays: number,
  trigger: string
): Promise<{ id: string; name: string; email: string; phone: string; qualification: string | null; courseInterest: string | null; status: string; createdAt: Date }[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - delayDays);

  // Get status list for this trigger
  const allowedStatuses = TRIGGER_STATUS_MAP[trigger] || [];

  // Get lead IDs that already received this step
  const alreadySent = await prisma.emailSequenceLog.findMany({
    where: { sequenceId, stepNumber },
    select: { leadId: true },
  });
  const sentLeadIds = new Set(alreadySent.map((l) => l.leadId));

  // Find eligible leads
  const leads = await prisma.lead.findMany({
    where: {
      status: { in: allowedStatuses as any },
      createdAt: { lte: cutoffDate },
      email: { not: "" },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      qualification: true,
      courseInterest: true,
      status: true,
      createdAt: true,
    },
  });

  return leads.filter((lead) => !sentLeadIds.has(lead.id));
}

/**
 * Process a single sequence step: send emails to eligible leads, log results
 */
export async function processSequenceStep(
  sequence: SequenceWithSteps,
  step: SequenceWithSteps["steps"][0],
  employeeId: string | null
): Promise<{ sent: number; skipped: number; failed: number; details: RunResult["details"] }> {
  const details: RunResult["details"] = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const leads = await getLeadsForStep(sequence.id, step.stepNumber, step.delayDays, sequence.trigger);

  const template = emailTemplates.find((t) => t.id === step.templateId);
  if (!template) {
    // Log skip for all leads — template not found
    for (const lead of leads) {
      details.push({ leadId: lead.id, sequenceId: sequence.id, stepNumber: step.stepNumber, status: "SKIPPED", error: "Template not found" });
      skipped++;
    }
    return { sent, skipped, failed, details };
  }

  for (const lead of leads) {
    try {
      const firstName = lead.name.split(" ")[0];
      const variables: Record<string, string> = {
        name: lead.name,
        firstName,
        email: lead.email,
        phone: lead.phone || "",
        course: lead.courseInterest === "AI_MODULE" ? "AI & Data Module" : "Professional Module",
        counsellorName: "EDWartens Team",
        counsellorEmail: "info@edwartens.co.uk",
        counsellorPhone: "0333 33 98 394",
        counsellorTitle: "Training Advisor",
        companyName: "EDWartens UK",
      };

      const subject = step.subject || template.subject;
      const filledSubject = fillTemplate(subject, variables);
      const filledBody = fillTemplate(template.body, variables);

      if (employeeId) {
        await sendEmail(employeeId, lead.email, filledSubject, filledBody);
      }

      // Log success
      await prisma.emailSequenceLog.create({
        data: {
          leadId: lead.id,
          sequenceId: sequence.id,
          stepNumber: step.stepNumber,
          status: "SENT",
        },
      });

      // Add note to lead
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: `[Email Sent] [Drip: ${sequence.name}] Step ${step.stepNumber}: ${filledSubject}`,
          createdBy: "Drip Campaign",
        },
      });

      details.push({ leadId: lead.id, sequenceId: sequence.id, stepNumber: step.stepNumber, status: "SENT" });
      sent++;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      await prisma.emailSequenceLog.create({
        data: {
          leadId: lead.id,
          sequenceId: sequence.id,
          stepNumber: step.stepNumber,
          status: "FAILED",
          error: errMsg,
        },
      });
      details.push({ leadId: lead.id, sequenceId: sequence.id, stepNumber: step.stepNumber, status: "FAILED", error: errMsg });
      failed++;
    }
  }

  return { sent, skipped, failed, details };
}

/**
 * Run all active sequences — process every step of every active sequence
 */
export async function runAllSequences(employeeId: string | null): Promise<RunResult> {
  const sequences = await getActiveSequences();
  const result: RunResult = { processed: 0, sent: 0, skipped: 0, failed: 0, details: [] };

  for (const sequence of sequences) {
    for (const step of sequence.steps) {
      if (!step.isActive) continue;
      const stepResult = await processSequenceStep(sequence, step, employeeId);
      result.processed += stepResult.sent + stepResult.skipped + stepResult.failed;
      result.sent += stepResult.sent;
      result.skipped += stepResult.skipped;
      result.failed += stepResult.failed;
      result.details.push(...stepResult.details);
    }
  }

  return result;
}

/**
 * Seed default sequences if none exist
 */
export async function seedDefaultSequences(): Promise<number> {
  const existing = await prisma.emailSequence.count();
  if (existing > 0) return 0;

  let created = 0;
  for (const seq of DEFAULT_SEQUENCES) {
    await prisma.emailSequence.create({
      data: {
        name: seq.name,
        description: seq.description,
        trigger: seq.trigger,
        isActive: true,
        steps: {
          create: seq.steps.map((s) => ({
            stepNumber: s.stepNumber,
            delayDays: s.delayDays,
            templateId: s.templateId,
            subject: s.subject,
            isActive: true,
          })),
        },
      },
    });
    created++;
  }

  return created;
}
