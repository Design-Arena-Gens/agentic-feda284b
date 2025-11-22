import Link from "next/link";
import { Calendar, ExternalLink, Gauge, MapPin, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Opportunity } from "@/lib/types";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: Opportunity;
  highlight?: boolean;
}

export function OpportunityCard({ opportunity, highlight }: OpportunityCardProps) {
  const isScholarship = opportunity.opportunityType === "scholarship";
  const confidencePercent = Math.round(opportunity.aiConfidence * 100);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-transparent transition-shadow hover:shadow-lg",
        highlight && "ring-2 ring-sky-400",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isScholarship ? "blue" : "default"}>
              {isScholarship ? "Scholarship" : "CS Internship"}
            </Badge>
            <Badge variant="outline">{opportunity.mode.replace(/-/g, " ")}</Badge>
            {opportunity.manualReviewNeeded && (
              <Badge variant="outline" className="border-amber-400 text-amber-600">
                <ShieldAlert className="mr-1 h-3 w-3" aria-hidden />
                Needs manual review
              </Badge>
            )}
          </div>

          <Link
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-lg font-semibold text-zinc-900 transition hover:text-sky-600 dark:text-zinc-100"
          >
            {opportunity.title}
            <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
          </Link>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {opportunity.summary}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 text-right text-xs text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {opportunity.source.name}
          </span>
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5 text-sky-500" aria-hidden />
            Confidence {confidencePercent}%
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            {opportunity.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-violet-500" aria-hidden />
            Deadline {formatDate(opportunity.deadline)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.countryFocus.map((country) => (
          <Badge key={country} className="bg-sky-50 text-sky-700">
            {country}
          </Badge>
        ))}
        {opportunity.tags.slice(0, 6).map((tag) => (
          <Badge key={tag} variant="default" className="bg-zinc-100 text-zinc-600">
            {tag}
          </Badge>
        ))}
      </div>

      {opportunity.eligibility.length > 0 && (
        <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-200">Eligibility Quick Takeaways</p>
          <ul className="list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
            {opportunity.eligibility.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
