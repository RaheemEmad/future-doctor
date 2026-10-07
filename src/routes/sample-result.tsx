import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Download } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { SampleFullReport } from "@/components/sample-full-report";
import { Button } from "@/components/ui/button";
import { PAYMENT } from "@/lib/payment";
import { derivePersona } from "@/lib/persona";
import { QUESTIONS } from "@/lib/questions";
import { aggregateTraits, score } from "@/lib/scoring";
import { trackSampleResultViewed } from "@/lib/analytics";
import type { Choice, OnboardingData } from "@/lib/types";

export const Route = createFileRoute("/sample-result")({
  head: () => ({
    meta: [
      { title: "Full sample report | Vocare" },
      { name: "description", content: "Explore a complete free example of Vocare's medical specialty report: score reasoning, career paths, regional outlook, risks and a 30-year timeline." },
      { property: "og:title", content: "Full sample report | Vocare" },
      { property: "og:description", content: "Explore all post-assessment analytics in a free illustrative report for an intern in Cairo." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://future-doctor.lovable.app/sample-result" },
    ],
    links: [{ rel: "canonical", href: "https://future-doctor.lovable.app/sample-result" }],
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
  useEffect(() => { trackSampleResultViewed(); }, []);
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");
  const { result, choices, responses } = useMemo(() => {
    const answers = buildSampleAnswers();
    const choices = Object.entries(answers).map(([qid, idx]) => {
      const q = QUESTIONS.find((x) => x.id === qid);
      return q?.choices[idx];
    }).filter(Boolean) as Choice[];
    const traits = aggregateTraits(choices);
    const result = score(traits, SAMPLE_ONBOARDING, choices);
    const responses = QUESTIONS.flatMap((question) => {
      const choice = question.choices[answers[question.id]];
      return choice ? [{ id: question.id, prompt: question.prompt, answer: choice.label }] : [];
    });
    return { result, choices, responses };
  }, []);

  async function downloadSample() {
    setDownloadState("loading");
    try {
      const { generateResultsPdf } = await import("@/lib/pdf");
      const doc = generateResultsPdf({ onboarding: SAMPLE_ONBOARDING, result, persona: derivePersona(SAMPLE_ONBOARDING), summary: "ILLUSTRATIVE SAMPLE ONLY. Layla is a fictional intern in Cairo, not a real client. This example values family time, predictable outpatient work and patient relationships, with openness to practising in the Gulf. These are example results, not your personal assessment." });
      doc.setProperties({ title: "Vocare illustrative sample report", subject: "Fictional example, not personal assessment results" });
      doc.save("vocare-illustrative-sample.pdf");
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-6xl mx-auto px-5 sm:px-10 pt-10 lg:pt-14 pb-16">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-monitor">FREE SAMPLE · FULL REPORT</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-serif leading-tight text-balance">
          Vocare sample report
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          A complete, fictional example of the report after assessment. Explore the reasoning,
          trade-offs, career paths and long term outlook before deciding whether to unlock your own analytics.
        </p>
        <p className="text-sm mt-4 text-muted-foreground">This example is free. Your top match is free; your own full analytics cost {PAYMENT.priceEgp} EGP.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Button asChild className="min-h-11"><Link to="/onboarding">Start your assessment <ArrowRight /></Link></Button>
          <Button variant="outline" className="min-h-11" onClick={downloadSample} disabled={downloadState === "loading"}><Download />{downloadState === "loading" ? "Preparing sample…" : "Download sample PDF"}</Button>
        </div>
        {downloadState === "error" && <p role="alert" className="text-sm text-destructive mt-3">The sample PDF could not be downloaded. Please try again.</p>}

        <SampleFullReport original={result} onboarding={SAMPLE_ONBOARDING} choices={choices} responses={responses} />

        <section className="mt-10 border-t border-border pt-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="font-serif text-2xl">Your report, your priorities.</h2>
            <p className="text-sm text-muted-foreground mt-2">Top match free. Full personal analytics {PAYMENT.priceEgp} EGP via InstaPay.</p>
          </div>
          <Button asChild className="min-h-11 self-start"><Link to="/onboarding">Start your assessment <ArrowRight /></Link></Button>
        </section>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          See the <Link to="/methodology" className="underline hover:text-foreground">methodology</Link> and <Link to="/sources" className="underline hover:text-foreground">credibility &amp; sources</Link> for how every percentage is derived.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
