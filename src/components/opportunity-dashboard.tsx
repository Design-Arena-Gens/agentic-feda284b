"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, BarChart3, Bell, Database, Download } from "lucide-react";
import type { AggregatedOpportunities, Opportunity, OpportunityFilter, OpportunitySource } from "@/lib/types";
import { filterOpportunities, formatDate, sortOpportunities } from "@/lib/utils";
import { OpportunityCard } from "@/components/opportunity-card";
import { FilterPanel } from "@/components/filter-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OpportunityDashboardProps {
  opportunities: Opportunity[];
  sources: OpportunitySource[];
  generatedAt: string;
  stats: AggregatedOpportunities["stats"];
}

export function OpportunityDashboard({ opportunities, sources, generatedAt, stats }: OpportunityDashboardProps) {
  const [filter, setFilter] = useState<OpportunityFilter>({});

  const filtered = useMemo(() => {
    const result = filterOpportunities(opportunities, filter);
    return sortOpportunities(result);
  }, [filter, opportunities]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    opportunities.forEach((opportunity) => {
      opportunity.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [opportunities]);

  const handleExport = () => {
    const payload = {
      generatedAt,
      filter,
      count: filtered.length,
      opportunities: filtered,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "algeria-scholarships-opportunities.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
      <FilterPanel filter={filter} onFilterChange={setFilter} availableTags={availableTags} />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            icon={<BarChart3 className="h-5 w-5 text-sky-500" aria-hidden />}
            label="Opportunities"
            value={filtered.length}
            helper={`${stats.total} tracked · ${Math.round(stats.remoteRatio * 100)}% remote/hybrid`}
          />
          <InsightCard
            icon={<Database className="h-5 w-5 text-emerald-500" aria-hidden />}
            label="Average Confidence"
            value={`${Math.round(stats.averageConfidence * 100)}%`}
            helper="Heuristic based on source relevance & keywords"
          />
          <InsightCard
            icon={<Bell className="h-5 w-5 text-violet-500" aria-hidden />}
            label="Deadlines Soon"
            value={stats.deadlinesSoon}
            helper="Within the next 30 days"
          />
        </div>

        <Card className="flex flex-col gap-4 border border-sky-100 bg-sky-50/70 p-6 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-100">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide">
            <span>Data Freshness</span>
            <Badge className="bg-white/60 text-sky-600 dark:bg-sky-900/60 dark:text-sky-100">
              {formatDate(generatedAt)}
            </Badge>
          </div>
          <p>
            We combine compliant public feeds, curated partner submissions, and manual validation to avoid scraping-prohibited platforms such as LinkedIn. To augment protected sources (DAAD, Erasmus+), organisations can submit verified entries via our compliance intake form.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {sources.map((source) => (
              <Badge key={source.id} variant="outline" className="border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-200">
                {source.name}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="text-xs" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Export filtered JSON
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <Card className="flex items-center gap-3 border border-amber-200 bg-amber-50/70 p-4 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" aria-hidden />
              <div>
                <p className="font-medium">No matches with current filters.</p>
                <p className="text-sm text-amber-600 dark:text-amber-200/80">
                  Relax constraints or broaden keywords. Try removing funding-only filter first.
                </p>
              </div>
            </Card>
          )}

          {filtered.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} highlight={opportunity.manualReviewNeeded === false && opportunity.aiConfidence > 0.75} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface InsightCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  helper?: string;
}

function InsightCard({ icon, label, value, helper }: InsightCardProps) {
  return (
    <Card className="border border-zinc-200/80 bg-white/80 p-5 dark:border-zinc-800/70 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
          {helper && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{helper}</p>}
        </div>
        {icon}
      </div>
    </Card>
  );
}
