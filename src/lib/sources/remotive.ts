import type { Opportunity, OpportunitySource } from "../types";
import {
  COUNTRY_ALIASES,
  KEYWORDS_INTERNSHIPS,
  PRIORITY_TAGS,
  TARGET_COUNTRY,
} from "../constants";
import { hashId, stripHtml, truncate } from "../utils";

const REMOTIVE_ENDPOINT = "https://remotive.com/api/remote-jobs";
const REMOTIVE_QUERIES = [
  "algeria internship",
  "algeria software intern",
  "north africa intern",
  "maghreb intern",
];

const REMOTIVE_SOURCE: OpportunitySource = {
  id: "remotive-software-dev",
  name: "Remotive Software Dev Jobs API",
  url: REMOTIVE_ENDPOINT,
  type: "api",
  attribution: "Remotive public job feed",
  complianceNotes: [
    "Jobs are displayed with source attribution and link back to Remotive as required.",
    "API calls limited to three times per day in production builds.",
  ],
  updateFrequencyHours: 8,
};

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary?: string;
  description: string;
  tags: string[];
}

function isRelevantLocation(location: string): boolean {
  const lowered = location.toLowerCase();
  return COUNTRY_ALIASES.some((alias) => lowered.includes(alias.toLowerCase())) || lowered.includes("worldwide") || lowered.includes("africa");
}

export async function fetchRemotiveInternships(): Promise<Opportunity[]> {
  try {
    const results = await Promise.all(
      REMOTIVE_QUERIES.map(async (query) => {
        try {
          const url = new URL(REMOTIVE_ENDPOINT);
          url.searchParams.set("category", "software-dev");
          url.searchParams.set("search", query);
          const response = await fetch(url, {
            headers: {
              "User-Agent": "ScholarshipAggregator/1.0 (+https://agentic-feda284b.vercel.app)",
            },
            next: {
              revalidate: 60 * 60 * 6,
              tags: ["remotive-internships"],
            },
          });

          if (!response.ok) {
            console.warn(`remotive feed error for query "${query}": ${response.status} ${response.statusText}`);
            return [] as RemotiveJob[];
          }

          const data = (await response.json()) as { jobs: RemotiveJob[] };
          return data.jobs ?? [];
        } catch (error) {
          console.warn(`remotive query failed (${query})`, error);
          return [] as RemotiveJob[];
        }
      }),
    );

    const deduped = new Map<number, RemotiveJob>();
    results.flat().forEach((job) => {
      deduped.set(job.id, job);
    });

    return Array.from(deduped.values())
      .filter((job) => {
        const lowered = job.title.toLowerCase();
        const isInternship = KEYWORDS_INTERNSHIPS.some((keyword) => lowered.includes(keyword));
        if (!isInternship) return false;
        return isRelevantLocation(job.candidate_required_location);
      })
      .map((job) => {
        const description = stripHtml(job.description ?? "");
        const content = `${job.title} ${job.company_name} ${job.candidate_required_location} ${description}`.toLowerCase();
        const mentionsAlgeria = COUNTRY_ALIASES.some((alias) => content.includes(alias.toLowerCase()));
        const countryFocus = new Set<string>();
        if (mentionsAlgeria) {
          countryFocus.add(TARGET_COUNTRY);
        }
        if (job.candidate_required_location.toLowerCase().includes("africa")) {
          countryFocus.add("Africa");
        }
        if (countryFocus.size === 0) {
          countryFocus.add("Remote");
        }

        const tags = new Set<string>([
          "internship",
          "remote",
          ...job.tags.map((tag) => tag.toLowerCase()),
        ]);
        PRIORITY_TAGS.forEach((tag) => {
          if (content.includes(tag)) {
            tags.add(tag);
          }
        });

        const aiConfidenceBase = mentionsAlgeria ? 0.76 : 0.62;
        const aiConfidence = Math.min(0.9, aiConfidenceBase + (tags.has("computer science") ? 0.08 : 0));

        const opportunity: Opportunity = {
          id: hashId(`remotive-${job.id}`),
          sourceId: REMOTIVE_SOURCE.id,
          source: REMOTIVE_SOURCE,
          opportunityType: "internship",
          title: job.title,
          summary: truncate(description || `${job.company_name} internship`),
          description,
          url: job.url,
          publishedAt: job.publication_date ? new Date(job.publication_date).toISOString() : null,
          deadline: null,
          location: job.candidate_required_location,
          countryFocus: Array.from(countryFocus),
          eligibility: [
            "Open to candidates legally able to work from stated location",
            "Strong interest in computer science or software engineering",
          ],
          tags: Array.from(tags),
          mode: "remote",
          funding: job.salary ?? null,
          stipend: job.salary ?? null,
          currency: null,
          aiConfidence,
          manualReviewNeeded: !mentionsAlgeria,
        };

        return opportunity;
      });
  } catch (error) {
    console.warn("remotive feed exception", error);
    return [];
  }
}

export { REMOTIVE_SOURCE };
