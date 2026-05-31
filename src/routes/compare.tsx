import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { getSaved } from "@/lib/saved";
import { score, aggregateTraits } from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";
import { GEO_INTENT_LABEL } from "@/lib/types";

type Search = { ids?: string };

export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): Search => ({ ids: typeof s.ids === "string" ? s.ids : "" }),
  head: () => ({
    meta: [
      { title: "Compare results — Aequitas" },
      { name: "description", content: "Side-by-side comparison of saved assessment runs." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids } = Route.useSearch();
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 3);

  const runs = useMemo(() => {
    return idList.map((id: string) => {
      const r = getSaved(id);
      if (!r) return null;
      const choices = Object.entries(r.answers).map(([qid, idx]) => {
        const q = QUESTIONS.find((x) => x.id === qid);
        return q?.choices[idx];
      }).filter(Boolean) as any[];
      const traits = aggregateTraits(choices);
      const result = score(traits, r.onboarding, choices);
      return { run: r, result };
    }).filter(Boolean) as { run: ReturnType<typeof getSaved> & {}; result: AssessmentResult }[];
  }, [idList.join(",")]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 lg:pt-14">
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Side by side</span>
        <h1 className="text-4xl lg:text-5xl font-serif mt-4 leading-tight max-w-3xl text-balance">
          Compare your saved runs.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          See how your priorities, top matches, and regret risk shift between runs.
        </p>
      </section>

      {runs.length < 2 ? (
        <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10 mb-20">
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground mb-4">Pick at least 2 saved runs to compare.</p>
            <Link to="/saved" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-brand-foreground text-sm font-medium">
              Go to saved runs
            </Link>
          </div>
        </section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-6 sm:px-10 mt-10 mb-16"
        >
          <div className={`grid gap-4 ${runs.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {runs.map(({ run, result }) => (
              <div key={run.id} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-serif text-xl truncate">{run.name}</h2>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(run.savedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  {run.onboarding.geographicIntent ? GEO_INTENT_LABEL[run.onboarding.geographicIntent] : "—"}
                </p>

                <div className="rounded-2xl bg-brand text-brand-foreground p-5 mb-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-70 mb-1">Top match</div>
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="font-serif text-2xl leading-tight">{result.matches[0]?.specialty.name}</h3>
                    <div className="text-3xl font-serif">{result.matches[0]?.compatibility}<span className="text-base">%</span></div>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {result.matches.slice(1, 5).map((m) => (
                    <div key={m.specialty.id} className="flex items-center justify-between text-sm">
                      <span className="truncate text-foreground/80">{m.specialty.name}</span>
                      <span className="tabular-nums text-muted-foreground">{m.compatibility}%</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs border-t border-border/60 pt-4">
                  <Stat label="Confidence" v={`${result.confidence}%`} />
                  <Stat label="Regret risk" v={`${result.regretRisk.score}%`} warn={result.regretRisk.score > 40} />
                  <Stat label="Burnout" v={`${result.matches[0]?.burnoutWarning}%`} warn={(result.matches[0]?.burnoutWarning ?? 0) > 55} />
                </div>

                {result.tensions.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-border/60">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-warning mb-2">Tensions</div>
                    <ul className="space-y-1.5 text-xs text-foreground/80">
                      {result.tensions.slice(0, 2).map((t) => <li key={t}>— {t}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/saved" className="text-sm text-muted-foreground hover:text-foreground">← Back to saved runs</Link>
          </div>
        </motion.section>
      )}

      <SiteFooter />
    </div>
  );
}

function Stat({ label, v, warn }: { label: string; v: string; warn?: boolean }) {
  return (
    <div>
      <div className={`font-serif text-lg ${warn ? "text-warning" : "text-foreground"}`}>{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
