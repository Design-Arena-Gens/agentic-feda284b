import { NextResponse } from "next/server";
import { getAggregatedOpportunities } from "@/lib/opportunities";
import type { OpportunityFilter, OpportunityMode, OpportunityType } from "@/lib/types";
import { filterOpportunities, sortOpportunities } from "@/lib/utils";

function parseFilter(searchParams: URLSearchParams): OpportunityFilter {
  const query = searchParams.get("q") ?? undefined;
  const typesParam = searchParams.getAll("type");
  const types = typesParam.filter(Boolean) as OpportunityType[];
  const mode = (searchParams.get("mode") as OpportunityMode | "any" | null) ?? "any";
  const country = searchParams.get("country") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const hasFunding = searchParams.get("funding") === "true";
  const minConfidence = searchParams.get("minConfidence");
  const deadlineWithinDays = searchParams.get("deadlineWithinDays");

  const filter: OpportunityFilter = {};

  if (query) filter.query = query;
  if (types.length > 0) filter.types = types;
  if (mode && mode !== "any") filter.mode = mode;
  if (country) filter.country = country;
  if (tag) filter.tag = tag;
  if (hasFunding) filter.hasFunding = true;
  if (minConfidence) filter.minConfidence = Number(minConfidence);
  if (deadlineWithinDays) filter.deadlineWithinDays = Number(deadlineWithinDays);

  return filter;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = parseFilter(searchParams);
  const aggregated = await getAggregatedOpportunities();
  const filtered = filterOpportunities(aggregated.opportunities, filter);
  const sorted = sortOpportunities(filtered);

  return NextResponse.json(
    {
      ...aggregated,
      opportunities: sorted,
      filter,
      results: {
        count: sorted.length,
      },
    },
    {
      headers: {
        "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
      },
    },
  );
}
