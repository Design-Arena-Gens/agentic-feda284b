import Parser from "rss-parser";
import { parseISO } from "date-fns";
import { curatedOpportunities } from "@/data/curated-opportunities";
import {
  COUNTRY_ALIASES,
  KEYWORDS_INTERNSHIPS,
  KEYWORDS_SCHOLARSHIPS,
  PRIORITY_TAGS,
  TARGET_COUNTRY,
} from "./constants";
import {
  AggregatedOpportunities,
  AggregationStats,
  Opportunity,
  OpportunityFilter,
  OpportunitySource,
} from "./types";
import {
  filterOpportunities,
  hashId,
  normaliseWhitespace,
  sortOpportunities,
  stripHtml,
  toIsoDate,
  truncate,
} from "./utils";
import { REMOTIVE_SOURCE, fetchRemotiveInternships } from "./sources/remotive";

const parser = new Parser({
  customFields: {
    item: ["content:encoded", "contentSnippet", "categories"],
  },
});

const OPPORTUNITY_DESK_SOURCE: OpportunitySource = {
  id: "opportunitydesk-scholarships",
  name: "Opportunity Desk Scholarships RSS",
  url: "https://www.opportunitydesk.org/category/scholarships/feed/",
  type: "rss",
  attribution: "Opportunity Desk RSS Feed",
  complianceNotes: [
    "Public RSS feed attributed directly to Opportunity Desk.",
    "Feed accessed at most once per hour to respect rate limits.",
  ],
  updateFrequencyHours: 6,
};

const SCHOLARSHIP_POSITIONS_SOURCE: OpportunitySource = {
  id: "scholarshippositions-scholarships",
  name: "Scholarship Positions Scholarships RSS",
  url: "https://www.scholarship-positions.com/feed/",
  type: "rss",
  attribution: "Scholarship Positions RSS Feed",
  complianceNotes: [
    "Feed is publicly documented and supports fair-use aggregation with attribution.",
  ],
  updateFrequencyHours: 12,
};

export const REGISTERED_SOURCES: OpportunitySource[] = [
  OPPORTUNITY_DESK_SOURCE,
  SCHOLARSHIP_POSITIONS_SOURCE,
  REMOTIVE_SOURCE,
  ...curatedOpportunities.map((item) => item.source),
];

function buildTags(text: string, defaults: string[]): string[] {
  const lowered = text.toLowerCase();
  const tags = new Set(defaults);
  PRIORITY_TAGS.forEach((tag) => {
    if (lowered.includes(tag)) {
      tags.add(tag);
    }
  });
  KEYWORDS_SCHOLARSHIPS.forEach((keyword) => {
    if (lowered.includes(keyword)) {
      tags.add(keyword);
    }
  });
  return Array.from(tags);
}

function computeConfidence(content: string, opportunityType: Opportunity["opportunityType"]): number {
  const lowered = content.toLowerCase();
  let score = opportunityType === "scholarship" ? 0.55 : 0.5;

  if (COUNTRY_ALIASES.some((alias) => lowered.includes(alias.toLowerCase()))) {
    score += 0.25;
  }

  if (PRIORITY_TAGS.some((tag) => lowered.includes(tag))) {
    score += 0.1;
  }

  if (KEYWORDS_INTERNSHIPS.some((keyword) => lowered.includes(keyword))) {
    score += 0.07;
  }

  if (/deadline|apply by/.test(lowered)) {
    score += 0.05;
  }

  return Math.max(0, Math.min(0.98, score));
}

async function fetchScholarshipRss(source: OpportunitySource): Promise<Opportunity[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? [])
      .map((item) => {
        const link = item.link ?? item.guid ?? source.url;
        const itemRecord = item as unknown as Record<string, unknown>;
        const encodedContent =
          typeof itemRecord["content:encoded"] === "string"
            ? (itemRecord["content:encoded"] as string)
            : "";
        const rawContent = `${item.title ?? ""} ${item.contentSnippet ?? ""} ${encodedContent}`;
        const textContent = stripHtml(rawContent || "").toLowerCase();
        const relatesToAlgeria = COUNTRY_ALIASES.some((alias) =>
          textContent.includes(alias.toLowerCase()),
        );
        const summary = truncate(
          stripHtml(item.contentSnippet ?? rawContent ?? ""),
          220,
        );
        const description = stripHtml(encodedContent || item.contentSnippet || rawContent || "");

        const countryFocus = new Set<string>();
        if (relatesToAlgeria) {
          countryFocus.add(TARGET_COUNTRY);
        }
        if (/north africa|mena|africa/.test(textContent)) {
          countryFocus.add("North Africa");
        }
        if (countryFocus.size === 0) {
          countryFocus.add("Multi-country");
        }

        const opportunity: Opportunity = {
          id: hashId(`${source.id}-${link}`),
          sourceId: source.id,
          source,
          opportunityType: "scholarship",
          title: normaliseWhitespace(item.title ?? "Untitled Opportunity"),
          summary,
          description,
          url: link,
          publishedAt: toIsoDate(item.isoDate ?? item.pubDate ?? null),
          deadline: null,
          location: relatesToAlgeria ? "Algeria · Europe" : "European Union",
          countryFocus: Array.from(countryFocus),
          eligibility: [],
          tags: buildTags(rawContent ?? "", ["scholarship"]),
          mode: "in-person",
          funding: null,
          stipend: null,
          currency: null,
          aiConfidence: computeConfidence(rawContent ?? "", "scholarship"),
          manualReviewNeeded: !relatesToAlgeria,
        };

        return opportunity;
      })
      .filter(Boolean) as Opportunity[];
  } catch (error) {
    console.warn(`[opportunities] Feed ingestion skipped for ${source.id}`, error);
    return [];
  }
}

function dedupeOpportunities(opportunities: Opportunity[]): Opportunity[] {
  const map = new Map<string, Opportunity>();
  opportunities.forEach((opportunity) => {
    const existing = map.get(opportunity.id);
    if (!existing) {
      map.set(opportunity.id, opportunity);
      return;
    }

    const resolved = existing.aiConfidence >= opportunity.aiConfidence ? existing : opportunity;
    map.set(opportunity.id, resolved);
  });
  return Array.from(map.values());
}

function computeStats(opportunities: Opportunity[]): AggregationStats {
  const scholarships = opportunities.filter((item) => item.opportunityType === "scholarship").length;
  const internships = opportunities.filter((item) => item.opportunityType === "internship").length;
  const total = opportunities.length;
  const remoteCount = opportunities.filter((item) => item.mode === "remote" || item.mode === "hybrid").length;
  const deadlinesSoon = opportunities.filter((item) => {
    if (!item.deadline) return false;
    try {
      const deadline = parseISO(item.deadline);
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + 30);
      return deadline >= new Date() && deadline <= threshold;
    } catch {
      return false;
    }
  }).length;

  const averageConfidence = total
    ? opportunities.reduce((acc, item) => acc + item.aiConfidence, 0) / total
    : 0;

  return {
    total,
    scholarships,
    internships,
    remoteRatio: total ? remoteCount / total : 0,
    averageConfidence,
    deadlinesSoon,
  };
}

export async function getAggregatedOpportunities(): Promise<AggregatedOpportunities> {
  const [opportunityDesk, scholarshipPositions, remotiveInternships] = await Promise.all([
    fetchScholarshipRss(OPPORTUNITY_DESK_SOURCE),
    fetchScholarshipRss(SCHOLARSHIP_POSITIONS_SOURCE),
    fetchRemotiveInternships(),
  ]);

  const combined = dedupeOpportunities([
    ...opportunityDesk,
    ...scholarshipPositions,
    ...remotiveInternships,
    ...curatedOpportunities,
  ]);

  const sorted = sortOpportunities(combined);

  const stats = computeStats(sorted);

  const sources = dedupeSources([
    OPPORTUNITY_DESK_SOURCE,
    SCHOLARSHIP_POSITIONS_SOURCE,
    ...remotiveInternships.map((item) => item.source),
    ...curatedOpportunities.map((item) => item.source),
  ]);

  return {
    opportunities: sorted,
    generatedAt: new Date().toISOString(),
    sources,
    stats,
  };
}

function dedupeSources(sources: OpportunitySource[]): OpportunitySource[] {
  const map = new Map<string, OpportunitySource>();
  sources.forEach((source) => {
    if (!map.has(source.id)) {
      map.set(source.id, source);
    }
  });
  return Array.from(map.values());
}

export async function getRelevantOpportunities(filter: OpportunityFilter) {
  const { opportunities } = await getAggregatedOpportunities();
  const filtered = filterOpportunities(opportunities, filter);
  return sortOpportunities(filtered);
}
