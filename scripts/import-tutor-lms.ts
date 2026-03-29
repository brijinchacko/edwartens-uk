/**
 * Import Tutor LMS course export into EDWartens sessions
 * Usage: npx tsx scripts/import-tutor-lms.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Map Tutor LMS topics to EDWartens phases
// The Tutor LMS has 10 topics but EDWartens has 6 phases (0-5)
// We'll map them logically:
// Topic 1 (Introduction) → Phase 0 (Foundation)
// Topic 2-5 (Electrical, Mechanical, Instrumentation, Pneumatics) → Phase 1 (PLC basics + foundation)
// Topic 6 (Control Systems) → Phase 2 (Advanced PLC)
// Topic 7 (Robotics) → Phase 3 (HMI Development)
// Topic 8 (Communication Protocols) → Phase 4 (SCADA)
// Topic 9-10 (Maintenance, Safety) → Phase 5 (Advanced + Career)

const TOPIC_TO_PHASE: Record<number, number> = {
  1: 0, // Introduction → Foundation
  2: 1, // Electrical Engineering → PLC Programming
  3: 1, // Mechanical Engineering → PLC Programming
  4: 2, // Instrumentation & Sensors → Advanced PLC
  5: 2, // Pneumatics & Hydraulics → Advanced PLC
  6: 3, // Control Systems & Automation → HMI Development
  7: 3, // Robotics & Industrial Automation → HMI Development
  8: 4, // Industrial Communication Protocols → SCADA
  9: 5, // Maintenance & Reliability → Advanced + Career
  10: 5, // Safety & Standards → Advanced + Career
};

function extractVideoUrl(meta: any): { url: string | null; platform: string | null; videoId: string | null } {
  if (!meta?._video?.[0]) return { url: null, platform: null, videoId: null };

  const video = meta._video[0];

  // Check Vimeo
  const vimeoUrl = video.source_vimeo || video.source_external_url;
  if (vimeoUrl && vimeoUrl.includes("vimeo.com")) {
    const match = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    return {
      url: vimeoUrl,
      platform: "vimeo",
      videoId: match ? match[1] : null,
    };
  }

  // Check YouTube
  const ytUrl = video.source_youtube;
  if (ytUrl && (ytUrl.includes("youtube.com") || ytUrl.includes("youtu.be"))) {
    const match = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s]+)/);
    return {
      url: ytUrl,
      platform: "youtube",
      videoId: match ? match[1] : null,
    };
  }

  return { url: null, platform: null, videoId: null };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const filePath = path.resolve("/Users/brijinchacko/Downloads/courses/13/13.json");
  console.log("Reading:", filePath);

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  const course = data.data[0].data.course;
  const contents = course.contents;

  console.log(`Course: ${course.post_title}`);
  console.log(`Topics found: ${contents.length}`);

  // Load phases
  const phases = await prisma.phase.findMany({
    where: { course: "PROFESSIONAL_MODULE" },
    orderBy: { order: "asc" },
  });

  const phaseByNumber = new Map(phases.map((p) => [p.number, p]));
  console.log(`Phases loaded: ${phases.length}`);

  let totalCreated = 0;
  let globalOrder = 0;

  for (let topicIdx = 0; topicIdx < contents.length; topicIdx++) {
    const topic = contents[topicIdx];
    const topicNumber = topicIdx + 1;
    const topicTitle = topic.post_title;
    const phaseNumber = TOPIC_TO_PHASE[topicNumber];

    if (phaseNumber === undefined) {
      console.log(`  Skipping topic ${topicNumber}: ${topicTitle} (no phase mapping)`);
      continue;
    }

    const phase = phaseByNumber.get(phaseNumber);
    if (!phase) {
      console.log(`  Phase ${phaseNumber} not found for topic: ${topicTitle}`);
      continue;
    }

    console.log(`\nTopic ${topicNumber}: "${topicTitle}" → Phase ${phaseNumber} (${phase.name})`);

    const children = topic.children || [];

    for (const child of children) {
      if (child.post_type !== "lesson") continue;

      const title = child.post_title;
      const description = stripHtml(child.post_content || "").slice(0, 500) || null;
      const { url, platform, videoId } = extractVideoUrl(child.meta);

      globalOrder++;

      try {
        await prisma.session.create({
          data: {
            title,
            description,
            phaseId: phase.id,
            videoUrl: url,
            videoPlatform: platform,
            videoId: videoId,
            duration: null, // No duration in export
            order: child.menu_order || globalOrder,
            isMandatory: !!url, // Only mandatory if has video
          },
        });
        totalCreated++;
        const videoInfo = url ? ` | ${platform}: ${videoId || url}` : "";
        console.log(`  ✓ ${title}${videoInfo}`);
      } catch (err: any) {
        console.error(`  ✗ ${title}: ${err.message}`);
      }
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Total sessions created: ${totalCreated}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Import failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
