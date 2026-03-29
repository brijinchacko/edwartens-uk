import { prisma } from "./prisma";

export interface ScoreBreakdown {
  leadCreated: number;
  emailProvided: number;
  phoneProvided: number;
  hasQualification: number;
  callsCompleted: number;
  emailsSent: number;
  followUpSet: number;
  qualifiedStatus: number;
  enrolledStatus: number;
  multipleInteractions: number;
  recentActivity: number;
  staleLeadPenalty: number;
}

export const SCORING_RULES = [
  { id: "leadCreated", label: "Lead created", points: 5, description: "Every lead starts with base points" },
  { id: "emailProvided", label: "Email provided", points: 5, description: "Lead has an email address" },
  { id: "phoneProvided", label: "Phone provided", points: 5, description: "Lead has a phone number" },
  { id: "hasQualification", label: "Has qualification", points: 5, description: "Lead listed a qualification" },
  { id: "callsCompleted", label: "Call completed", points: 10, description: "+10 per call (note contains 'Call Report')" },
  { id: "emailsSent", label: "Email sent", points: 5, description: "+5 per email (note contains 'Email Sent')" },
  { id: "followUpSet", label: "Follow-up set", points: 5, description: "Lead has a follow-up date scheduled" },
  { id: "qualifiedStatus", label: "Responded / interested (QUALIFIED)", points: 15, description: "Lead reached QUALIFIED status" },
  { id: "enrolledStatus", label: "Enrolled", points: 25, description: "Lead converted to ENROLLED" },
  { id: "multipleInteractions", label: "Multiple interactions (>3 notes)", points: 10, description: "More than 3 notes on the lead" },
  { id: "recentActivity", label: "Recent activity (last 7 days)", points: 10, description: "A note was added in the last 7 days" },
  { id: "staleLeadPenalty", label: "Stale lead (>30 days no activity)", points: -10, description: "No notes in the last 30 days" },
];

export async function calculateLeadScore(leadId: string): Promise<{ score: number; breakdown: ScoreBreakdown }> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  const breakdown: ScoreBreakdown = {
    leadCreated: 5,
    emailProvided: lead.email ? 5 : 0,
    phoneProvided: lead.phone ? 5 : 0,
    hasQualification: lead.qualification ? 5 : 0,
    callsCompleted: 0,
    emailsSent: 0,
    followUpSet: lead.followUpDate ? 5 : 0,
    qualifiedStatus: lead.status === "QUALIFIED" ? 15 : 0,
    enrolledStatus: lead.status === "ENROLLED" ? 25 : 0,
    multipleInteractions: 0,
    recentActivity: 0,
    staleLeadPenalty: 0,
  };

  // Count calls and emails from notes
  const callCount = lead.notes.filter((n) => n.content.includes("Call Report")).length;
  breakdown.callsCompleted = callCount * 10;

  const emailCount = lead.notes.filter((n) => n.content.includes("Email Sent")).length;
  breakdown.emailsSent = emailCount * 5;

  // Multiple interactions
  if (lead.notes.length > 3) {
    breakdown.multipleInteractions = 10;
  }

  // Recent activity
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const hasRecentNote = lead.notes.some((n) => n.createdAt >= sevenDaysAgo);
  if (hasRecentNote) {
    breakdown.recentActivity = 10;
  }

  // Stale lead penalty
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const hasRecentish = lead.notes.some((n) => n.createdAt >= thirtyDaysAgo);
  if (!hasRecentish && lead.notes.length > 0 && !["ENROLLED", "LOST"].includes(lead.status)) {
    breakdown.staleLeadPenalty = -10;
  }
  // Also penalise leads with no notes at all that are old
  if (lead.notes.length === 0 && lead.createdAt < thirtyDaysAgo && !["ENROLLED", "LOST"].includes(lead.status)) {
    breakdown.staleLeadPenalty = -10;
  }

  const score = Math.max(0, Object.values(breakdown).reduce((sum, v) => sum + v, 0));

  // Update the lead record
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      leadScore: score,
      scoreBreakdown: breakdown as any,
      lastScoredAt: new Date(),
    },
  });

  return { score, breakdown };
}

export async function rescoreAllLeads(): Promise<{ updated: number }> {
  const leads = await prisma.lead.findMany({
    where: {
      status: { notIn: ["LOST"] },
    },
    select: { id: true },
  });

  let updated = 0;
  for (const lead of leads) {
    try {
      await calculateLeadScore(lead.id);
      updated++;
    } catch (err) {
      console.error(`Failed to score lead ${lead.id}:`, err);
    }
  }

  return { updated };
}
