import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { QUESTIONS } from "@/lib/questions";
import { aggregateTraits, score } from "@/lib/scoring";
import type { Choice, OnboardingData } from "@/lib/types";

export const Route = createFileRoute("/sample-result")({
  head: () => ({
    meta: [
      { title: "Sample result — Vocare" },
      { name: "description", content: "See what a full Vocare result looks like before you spend 12 minutes on the assessment." },
      { property: "og:title", content: "Sample result — Vocare" },
      { property: "og:description", content: "A worked example of a Vocare specialty match, with reasoning." },
    ],
  }),
  component: SampleResultPage,
});

// A plausible composite "Layla, PGY-1 in Cairo" — used purely for illustration.
const SAMPLE_ONBOARDING: OnboardingData = {
  ageRange: "26–29",
  gender: "Woman",
  stage: "Intern / PGY-1",
  country: "Egypt",
  relationship: "Long-term partner",
  wantsChildren: "yes",
  workLifeBalance: 4,
  lifestyleVision: "predictable_outpatient",
  willingnessToSacrifice: 2,
  financialPriority: 4,
  ambition: 4,
  relocationOpenness: 3,
  workEnvironment: "clinic",
  careerArchetypes: ["master_clinician", "lifestyle_physician", "telemedicine"],
  geographicIntent: "gulf",
  meaningTop: ["relationships", "technical_mastery", "saving_lives"],
};

// Picks the first choice of each question that nudges toward the persona above.
// This is deterministic and stays in sync with scoring/questions.
function buildSampleAnswers(): Record<string, number> {
  const ans: Record<string, number> = {};
  for (const q of QUESTIONS) {
    // pick the choice whose first trait nudge best matches the persona shape
    let bestIdx = 0;
    let bestScore = -Infinity;
    q.choices.forEach((c, i) => {
      let s = 0;
      for (const [t, v] of Object.entries(c.traits ?? {})) {
        if (t === "lifestyle_balance") s += (v as number) * SAMPLE_ONBOARDING.workLifeBalance;
        if (t === "family_priority") s += (v as number) * 4;
        if (t === "income_priority") s += (v as number) * SAMPLE_ONBOARDING.financialPriority;
        if (t === "stamina") s -= Math.abs(v as number) * 1.5;
        if (t === "procedural") s += (v as number) * 0.8;
      }
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    });
    ans[q.id] = bestIdx;
  }
  return ans;
}

function SampleResultPage() {
  const { result, topMatch } = useMemo(() => {
    const answers = buildSampleAnswers();
    const choices = Object.entries(answers).map(([qid, idx]) => {
      const q = QUESTIONS.find((x) => x.id === qid);
      return q?.choices[idx];
    }).filter(Boolean) as Choice[];
    const traits = aggregateTraits(choices);
    const result = score(traits, SAMPLE_ONBOARDING, choices);
    return { result, topMatch: result.matches[0] };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-6 sm:px-10 pt-10 lg:pt-14 pb-16">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Sample result</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full bg-muted">Illustrative</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-serif leading-tight text-balance">
          What you get at the end.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          This is a worked example for a composite PGY-1 in Cairo who values family time, wants a
          procedural craft, and is open to the Gulf. Your own result will be ranked across all
          {" "}{result.matches.length}+ specialties with the same reasoning shown for every match.
        </p>

        <section className="mt-10 rounded-3xl border border-border bg-card p-8">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Top match</p>
              <h2 className="font-serif text-3xl mt-1">{topMatch.specialty.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Compatibility</p>
              <p className="font-serif text-4xl text-brand">{topMatch.compatibility}%</p>
            </div>
          </div>
          <p className="mt-4 text-foreground/85 leading-relaxed">{topMatch.specialty.blurb}</p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Why this percentage</p>
            <ul className="space-y-2">
              {topMatch.breakdown.slice(0, 5).map((b) => (
                <li key={b.channel} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-foreground/85">{b.explanation}</span>
                  <span className="shrink-0 tabular-nums text-brand font-medium">+{b.points.toFixed(1)} pts</span>
                </li>
              ))}
              {topMatch.penalties.slice(0, 2).map((p, i) => (
                <li key={i} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-foreground/85">{p.explanation}</span>
                  <span className="shrink-0 tabular-nums text-warning font-medium">−{Math.abs(p.points).toFixed(1)} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 grid gap-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Runners-up</p>
          {result.matches.slice(1, 5).map((m) => (
            <div key={m.specialty.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-serif text-lg truncate">{m.specialty.name}</p>
                <p className="text-xs text-muted-foreground truncate">{m.breakdown[0]?.explanation ?? m.specialty.blurb}</p>
              </div>
              <span className="shrink-0 tabular-nums font-medium">{m.compatibility}%</span>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl bg-brand text-brand-foreground p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] opacity-80 mb-2">
              <Sparkles className="size-3.5" /> Your real result will be specific to you
            </div>
            <h3 className="font-serif text-2xl">Twelve minutes. Forty specialties. One ranked list with reasoning.</h3>
          </div>
          <Link to="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground text-sm font-medium hover:opacity-90 transition shrink-0">
            Start your assessment <ArrowRight className="size-4" />
          </Link>
        </section>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          See the <Link to="/methodology" className="underline hover:text-foreground">methodology</Link> and <Link to="/sources" className="underline hover:text-foreground">credibility &amp; sources</Link> for how every percentage is derived.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
