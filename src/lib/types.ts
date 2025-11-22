export type OpportunityType = "scholarship" | "internship";

export type OpportunityMode = "remote" | "in-person" | "hybrid";

export interface OpportunitySource {
  id: string;
  name: string;
  url: string;
  type: "rss" | "api" | "manual" | "curated";
  attribution: string;
  complianceNotes?: string[];
  updateFrequencyHours?: number;
}

export interface Opportunity {
  id: string;
  sourceId: string;
  source: OpportunitySource;
  opportunityType: OpportunityType;
  title: string;
  summary: string;
  description: string;
  url: string;
  publishedAt: string | null;
  deadline?: string | null;
  location: string;
  countryFocus: string[];
  eligibility: string[];
  tags: string[];
  mode: OpportunityMode;
  funding?: string | null;
  stipend?: string | null;
  currency?: string | null;
  aiConfidence: number;
  manualReviewNeeded?: boolean;
}

export interface OpportunityFilter {
  query?: string;
  types?: OpportunityType[];
  mode?: OpportunityMode | "any";
  country?: string;
  tag?: string;
  hasFunding?: boolean;
  deadlineWithinDays?: number;
  minConfidence?: number;
}

export interface AggregatedOpportunities {
  opportunities: Opportunity[];
  generatedAt: string;
  sources: OpportunitySource[];
  stats: AggregationStats;
}

export interface AggregationStats {
  total: number;
  scholarships: number;
  internships: number;
  remoteRatio: number;
  averageConfidence: number;
  deadlinesSoon: number;
}

export interface TelegramDigestEntry {
  id: string;
  title: string;
  url: string;
  summary: string;
  sourceName: string;
  opportunityType: OpportunityType;
  publishedAt: string | null;
}
