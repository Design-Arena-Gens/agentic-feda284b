import { NextResponse } from "next/server";
import { z } from "zod";
import { getRelevantOpportunities } from "@/lib/opportunities";
import { sendTelegramDigest } from "@/lib/telegram";
import type { OpportunityFilter } from "@/lib/types";

const bodySchema = z.object({
  chatId: z.union([z.string(), z.number()]).transform((value) => String(value)),
  limit: z.number().min(1).max(10).default(6).optional(),
  filters: z
    .object({
      types: z.array(z.enum(["scholarship", "internship"])).optional(),
      query: z.string().optional(),
      country: z.string().optional(),
      mode: z.enum(["remote", "in-person", "hybrid", "any"]).optional(),
      hasFunding: z.boolean().optional(),
      minConfidence: z.number().min(0).max(1).optional(),
      deadlineWithinDays: z.number().min(1).max(365).optional(),
    })
    .optional()
    .default({}),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.parse(raw);
    const filter: OpportunityFilter = {
      ...parsed.filters,
    };

    if (parsed.filters?.mode === "any") {
      delete filter.mode;
    }

    const opportunities = await getRelevantOpportunities(filter);
    const entries = opportunities.slice(0, parsed.limit ?? 6).map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      summary: item.summary,
      sourceName: item.source.name,
      opportunityType: item.opportunityType,
      publishedAt: item.publishedAt,
    }));

    await sendTelegramDigest(parsed.chatId, entries);

    return NextResponse.json({
      ok: true,
      sent: entries.length,
      chatId: parsed.chatId,
    });
  } catch (error) {
    console.error("telegram digest error", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to send Telegram digest",
      },
      { status: 400 },
    );
  }
}
