"use client";

import { useMemo } from "react";
import { Filter, MapPin, RefreshCcw, Sparkles } from "lucide-react";
import type { OpportunityFilter, OpportunityType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

interface FilterPanelProps {
  filter: OpportunityFilter;
  onFilterChange: (filter: OpportunityFilter) => void;
  availableTags: string[];
}

const opportunityTypeCopy: Record<OpportunityType, string> = {
  scholarship: "Scholarships",
  internship: "CS Internships",
};

export function FilterPanel({ filter, onFilterChange, availableTags }: FilterPanelProps) {
  const activeTypes = filter.types ?? [];

  const toggleType = (type: OpportunityType) => {
    const exists = activeTypes.includes(type);
    const nextTypes = exists ? activeTypes.filter((item) => item !== type) : [...activeTypes, type];
    onFilterChange({
      ...filter,
      types: nextTypes.length > 0 ? nextTypes : undefined,
    });
  };

  const sortedTags = useMemo(() => availableTags.slice(0, 12).sort(), [availableTags]);

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <header className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        <Filter className="h-4 w-4" aria-hidden /> Filters
      </header>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Keyword Search
        </label>
        <Input
          placeholder="AI, Erasmus, stipend…"
          value={filter.query ?? ""}
          onChange={(event) => onFilterChange({ ...filter, query: event.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Opportunity Type
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(opportunityTypeCopy) as OpportunityType[]).map((type) => {
            const active = activeTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  "rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium transition dark:border-zinc-700",
                  active
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300",
                )}
              >
                {opportunityTypeCopy[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Preferred Mode
        </label>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {["any", "remote", "in-person", "hybrid"].map((mode) => {
            const active = (filter.mode ?? "any") === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filter,
                    mode: mode === "any" ? undefined : (mode as OpportunityFilter["mode"]),
                  })
                }
                className={cn(
                  "rounded-lg border border-zinc-200 px-3 py-2 capitalize transition dark:border-zinc-700",
                  active
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300",
                )}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <label className="flex items-center gap-1 uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Min Confidence
          </label>
          <Input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={filter.minConfidence?.toString() ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onFilterChange({
                ...filter,
                minConfidence: value ? Number(value) : undefined,
              });
            }}
          />
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-1 uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> Focus Country
          </label>
          <Input
            placeholder="Algeria"
            value={filter.country ?? ""}
            onChange={(event) =>
              onFilterChange({
                ...filter,
                country: event.target.value || undefined,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Fast Tag Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {sortedTags.map((tag) => {
            const active = filter.tag === tag;
            return (
              <Badge
                key={tag}
                role="button"
                tabIndex={0}
                onClick={() =>
                  onFilterChange({
                    ...filter,
                    tag: active ? undefined : tag,
                  })
                }
                className={cn(
                  "cursor-pointer border border-transparent hover:border-sky-200 hover:bg-sky-50",
                  active && "border-sky-400 bg-sky-100 text-sky-700",
                )}
              >
                #{tag}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500"
            checked={Boolean(filter.hasFunding)}
            onChange={(event) =>
              onFilterChange({
                ...filter,
                hasFunding: event.target.checked ? true : undefined,
              })
            }
          />
          Show funded/stipend opportunities only
        </label>
        <Button
          type="button"
          variant="ghost"
          className="gap-1 text-xs text-zinc-500 hover:text-zinc-700"
          onClick={() => onFilterChange({})}
        >
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden /> Reset
        </Button>
      </div>
    </div>
  );
}
