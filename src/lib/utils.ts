import { createHash } from "crypto";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import type { Opportunity, OpportunityFilter } from "./types";

export function normaliseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function stripHtml(value: string): string {
  return normaliseWhitespace(value.replace(/<[^>]+>/g, " "));
}

export function truncate(value: string, maxLength = 240): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

export function hashId(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export function toIsoDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatDate(value?: string | null): string {
  if (!value) return "TBC";
  try {
    return format(parseISO(value), "PPP");
  } catch {
    return "TBC";
  }
}

export function emphasise(value: string, keywords: string[]): boolean {
  const lowered = value.toLowerCase();
  return keywords.some((keyword) => lowered.includes(keyword.toLowerCase()));
}

export function filterOpportunities(
  opportunities: Opportunity[],
  filter: OpportunityFilter,
): Opportunity[] {
  return opportunities.filter((item) => {
    if (filter.types && filter.types.length > 0) {
      if (!filter.types.includes(item.opportunityType)) {
        return false;
      }
    }

    if (filter.mode && filter.mode !== "any" && item.mode !== filter.mode) {
      return false;
    }

    if (filter.country) {
      const matchCountry = item.countryFocus.some((country) =>
        country.toLowerCase().includes(filter.country!.toLowerCase()),
      );
      if (!matchCountry) return false;
    }

    if (filter.tag) {
      const matchTag = item.tags.some((tag) =>
        tag.toLowerCase() === filter.tag!.toLowerCase(),
      );
      if (!matchTag) return false;
    }

    if (typeof filter.minConfidence === "number") {
      if (item.aiConfidence < filter.minConfidence) return false;
    }

    if (filter.deadlineWithinDays !== undefined && filter.deadlineWithinDays !== null) {
      if (!item.deadline) return false;
      const deadlineDate = parseISO(item.deadline);
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + filter.deadlineWithinDays);
      if (isAfter(deadlineDate, threshold)) return false;
    }

    if (filter.query) {
      const lowered = filter.query.toLowerCase();
      const haystack = `${item.title} ${item.summary} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(lowered)) return false;
    }

    if (filter.hasFunding) {
      if (!item.funding && !item.stipend) return false;
    }

    return true;
  });
}

export function isDeadlineUpcoming(opportunity: Opportunity, days = 30): boolean {
  if (!opportunity.deadline) return false;
  const deadlineDate = parseISO(opportunity.deadline);
  const now = new Date();
  if (isBefore(deadlineDate, now)) return false;
  const threshold = new Date();
  threshold.setDate(now.getDate() + days);
  return isBefore(deadlineDate, threshold);
}

export function sortOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return [...opportunities].sort((a, b) => {
    const confidenceDelta = b.aiConfidence - a.aiConfidence;
    if (Math.abs(confidenceDelta) > 0.05) {
      return confidenceDelta;
    }

    const deadlineA = a.deadline ? parseISO(a.deadline) : null;
    const deadlineB = b.deadline ? parseISO(b.deadline) : null;

    if (deadlineA && deadlineB) {
      return deadlineA.getTime() - deadlineB.getTime();
    }

    if (deadlineA) return -1;
    if (deadlineB) return 1;

    const publishedA = a.publishedAt ? parseISO(a.publishedAt) : null;
    const publishedB = b.publishedAt ? parseISO(b.publishedAt) : null;

    if (publishedA && publishedB) {
      return publishedB.getTime() - publishedA.getTime();
    }

    return a.title.localeCompare(b.title);
  });
}
