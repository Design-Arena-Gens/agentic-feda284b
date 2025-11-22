import { ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { getAggregatedOpportunities } from "@/lib/opportunities";
import { OpportunityDashboard } from "@/components/opportunity-dashboard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const revalidate = 3600; // refresh hourly

export default async function Home() {
  const aggregated = await getAggregatedOpportunities();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pb-24 dark:from-zinc-950 dark:via-zinc-950 dark:to-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-20 sm:px-10">
        <Hero />
        <OpportunityDashboard
          opportunities={aggregated.opportunities}
          sources={aggregated.sources}
          generatedAt={aggregated.generatedAt}
          stats={aggregated.stats}
        />
        <Compliance />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="space-y-8 text-center md:text-left">
      <Badge className="mx-auto w-fit bg-sky-100 text-sky-700 md:mx-0">Algeria · EU Pathways</Badge>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-5 md:max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Scholarships & CS Internships Radar for Algerian Talent
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Automated discovery across compliant European funding feeds, Algerian tech ecosystems, and partner submissions.
            Real-time filters prioritise legitimate, fully funded programmes without breaching protected platforms.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Badge className="bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">
              <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500" aria-hidden />
              Intelligent keyword & country scoring
            </Badge>
            <Badge className="bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">
              <UploadCloud className="mr-1 h-3.5 w-3.5 text-blue-500" aria-hidden />
              Telegram-ready digests
            </Badge>
          </div>
        </div>
        <Card className="flex max-w-sm flex-col gap-3 border border-indigo-100 bg-white/70 p-6 text-left text-sm shadow-md dark:border-indigo-900/40 dark:bg-zinc-900/70">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Update Cadence</h2>
          <ul className="space-y-3 text-zinc-600 dark:text-zinc-300">
            <li>
              <strong className="text-zinc-900 dark:text-white">Hourly:</strong> Opportunity Desk, Scholarship Positions RSS
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">Every 6h:</strong> Remotive API internship sweep
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-white">Weekly:</strong> Curated partner submissions & DAAD digest review
            </li>
          </ul>
          <p className="rounded-lg bg-indigo-50/70 p-3 text-xs text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            LinkedIn, Glassdoor, and other protected sources are excluded by design to stay compliant with their Terms of Service.
          </p>
        </Card>
      </div>
    </section>
  );
}

function Compliance() {
  return (
    <section className="grid gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 md:grid-cols-3">
      <div className="space-y-3 md:col-span-1">
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden />
          Compliance-first
        </Badge>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Collection Blueprint</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Legal-friendly automation ensures opportunities remain verifiable and attributable. Manual submissions from universities and NGOs fill protected gaps.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">Automated feeds</h3>
        <ul className="space-y-2 text-zinc-600 dark:text-zinc-300">
          <li>✅ Public RSS from Opportunity Desk & Scholarship Positions (licensed for redistribution with attribution).</li>
          <li>✅ Remotive API for remote-friendly CS internships referencing Algeria or Africa.</li>
          <li>✅ Cached hourly with exponential backoff and telemetry in place.</li>
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-100">
        <h3 className="font-semibold">Human-in-the-loop guardrails</h3>
        <ul className="space-y-2">
          <li>⚠️ Items without explicit Algerian mention flagged for review.</li>
          <li>⚠️ Protected sources (LinkedIn, DAAD login areas) require manual intake forms or API partnerships.</li>
          <li>⚠️ All Telegram dispatches demand an explicit approval token stored in project env.</li>
        </ul>
      </div>
    </section>
  );
}
