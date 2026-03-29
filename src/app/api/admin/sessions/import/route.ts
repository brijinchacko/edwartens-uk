import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

function detectVideo(url: string) {
  if (!url) return { platform: null, videoId: null };
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\s?]+)/
  );
  if (ytMatch) return { platform: "youtube", videoId: ytMatch[1] };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { platform: "vimeo", videoId: vimeoMatch[1] };
  return { platform: null, videoId: null };
}

interface SessionInput {
  title: string;
  description?: string;
  phaseNumber: number;
  course: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  mandatory?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "sessions:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessions: inputs } = body as { sessions: SessionInput[] };

    if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
      return NextResponse.json(
        { error: "No sessions provided" },
        { status: 400 }
      );
    }

    // Load all phases for lookup
    const allPhases = await prisma.phase.findMany({
      select: { id: true, number: true, course: true },
    });

    const phaseMap = new Map(
      allPhases.map((p) => [`${p.course}-${p.number}`, p.id])
    );

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      try {
        if (!input.title?.trim()) {
          errors.push(`Row ${i + 1}: Missing title`);
          skipped++;
          continue;
        }

        const course = input.course?.toUpperCase().includes("AI")
          ? "AI_MODULE"
          : "PROFESSIONAL_MODULE";
        const phaseKey = `${course}-${input.phaseNumber}`;
        const phaseId = phaseMap.get(phaseKey);

        if (!phaseId) {
          errors.push(
            `Row ${i + 1} "${input.title}": Phase ${input.phaseNumber} not found for ${course}`
          );
          skipped++;
          continue;
        }

        const { platform, videoId } = detectVideo(input.videoUrl || "");

        await prisma.session.create({
          data: {
            title: input.title.trim(),
            description: input.description?.trim() || null,
            phaseId,
            videoUrl: input.videoUrl?.trim() || null,
            videoPlatform: platform,
            videoId: videoId,
            duration: input.duration ? input.duration * 60 : null, // minutes to seconds
            order: input.order || i + 1,
            isMandatory: input.mandatory !== false,
          },
        });
        created++;
      } catch (err: any) {
        errors.push(`Row ${i + 1} "${input.title}": ${err.message}`);
        skipped++;
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (error) {
    console.error("Bulk import sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
