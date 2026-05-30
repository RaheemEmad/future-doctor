import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, RefreshCw, Share2, AlertTriangle, Sparkles, Check, X,
  Compass, Heart, Globe2, TrendingUp, Bookmark, SlidersHorizontal, Link2,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { loadSession, resetSession, saveSession } from "@/lib/session";
import { score, aggregateTraits } from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";
import { MEANING_LABEL, GEO_INTENT_LABEL, CAREER_ARCHETYPE_LABEL } from "@/lib/types";
import type { Choice, SpecialtyMatch, MeaningSource, CareerArchetype, Trait, TraitScores } from "@/lib/types";
import { decodeShare, encodeShare } from "@/lib/share";
import { saveRun } from "@/lib/saved";
import { ENRICHED_SPECIALTIES } from "@/lib/enrichment";

type Search = { s?: string };

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>): Search => ({ s: typeof s.s === "string" ? s.s : undefined }),
  head: () => ({
    meta: [
      { title: "Your results — Aequitas" },
      { name: "description", content: "Your personalized medical specialty compatibility profile." },
    ],
  }),
  component: ResultsPage,
});

const REFINEABLE: { trait: Trait; label: string }[] = [
  { trait: "lifestyle_balance", label: "Lifestyle balance need" },
  { trait: "family_priority", label: "Family priority" },
  { trait: "income_priority", label: "Income priority" },
  { trait: "stamina", label: "Stamina / schedule tolerance" },
  { trait: "death_comfort", label: "Comfort with mortality" },
  { trait: "ambition", label: "Ambition" },
  { trait: "identity_career", label: "Career as identity" },
  { trait: "procedural", label: "Procedural drive" },
];

function ResultsPage() {
  const navigate = useNavigate();
  const { s: shareToken } = Route.useSearch();
  const [session, setSession] = useState(() => loadSession());
  const [tweaks, setTweaks] = useState<Partial<Record<Trait, number>>>({});
  const [showRefine, setShowRefine] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Decode share token if present
  useEffect(() => {
    if (!shareToken) return;
    const payload = decodeShare(shareToken);
    if (!payload) return;
    const choices = Object.entries(payload.a).map(([qid, idx]) => {
      const q = QUESTIONS.find((x) => x.id === qid);
      return q?.choices[idx];
    }).filter(Boolean) as Choice[];
    const traits = aggregateTraits(choices);
    const result = score(traits, payload.o, choices);
    const next = { onboarding: payload.o, answers: payload.a, result };
    saveSession(next);
    setSession(next);
    // strip token from URL for cleanliness
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("s");
      window.history.replaceState(null, "", url.toString());
    }
  }, [shareToken]);

  useEffect(() => {
    if (!shareToken && !session.result) navigate({ to: "/" });
  }, [session.result, navigate, shareToken]);

  // Recompute on tweak
  const originalChoices: Choice[] = useMemo(() => {
    if (!session.onboarding) return [];
    return Object.entries(session.answers).map(([qid, idx]) => {
      const q = QUESTIONS.find((x) => x.id === qid);
      return q?.choices[idx];
    }).filter(Boolean) as Choice[];
  }, [session.answers, session.onboarding]);

  const liveResult = useMemo(() => {
    if (!session.result || !session.onboarding) return null;
    if (Object.keys(tweaks).length === 0) return session.result;
    const baseTraits = aggregateTraits(originalChoices);
    const merged: TraitScores = { ...baseTraits, ...tweaks };
    return score(merged, session.onboarding, originalChoices);
  }, [tweaks, session.result, session.onboarding, originalChoices]);

  if (!liveResult || !session.onboarding) return null;

  const result = liveResult;
  const top = result.matches[0];

  const radarData = [
    { axis: "Cognitive", value: top.cognitiveFit },
    { axis: "Emotional", value: top.emotionalFit },
    { axis: "Lifestyle", value: top.lifestyleFit },
    { axis: "Meaning", value: top.meaningFit },
    { axis: "Opportunity", value: top.opportunityFit },
    { axis: "Burnout resilience", value: 100 - top.burnoutWarning },
  ];

  const profileSummary = synthesizeNarrative(result.traits);

  function startOver() {
    resetSession();
    setSession({ answers: {} });
    navigate({ to: "/" });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function share() {
    if (!session.onboarding) return;
    const token = encodeShare({ v: 2, o: session.onboarding, a: session.answers });
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/results?s=${token}`
      : `/results?s=${token}`;
    const text = `My top Aequitas match is ${top.specialty.name} (${top.compatibility}%).`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "My Aequitas result", text, url });
        return;
      } catch { /* fallthrough to copy */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("Share link copied to clipboard.");
    } catch {
      flash(url);
    }
  }

  function doSave() {
    if (!session.onboarding) return;
    const run = saveRun(saveName, session.onboarding, session.answers, result);
    setShowSave(false);
    setSaveName("");
    flash(`Saved as “${run.name}”.`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-6 sm:px-10 pt-12 lg:pt-20 pb-10"
      >
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Your verdict</span>
        <h1 className="text-4xl lg:text-6xl font-serif mt-4 leading-tight max-w-3xl text-balance">
          Your path of <span className="italic">highest alignment.</span>
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
          {profileSummary}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={startOver} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border hover:bg-muted text-sm font-medium transition-colors">
            <RefreshCw className="size-4" /> Retake
          </button>
          <button onClick={share} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border hover:bg-muted text-sm font-medium transition-colors">
            <Share2 className="size-4" /> Share
          </button>
          <button onClick={() => setShowSave(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border hover:bg-muted text-sm font-medium transition-colors">
            <Bookmark className="size-4" /> Save run
          </button>
          <button onClick={() => setShowRefine((v) => !v)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${showRefine ? "bg-brand text-brand-foreground" : "bg-card border border-border hover:bg-muted"}`}>
            <SlidersHorizontal className="size-4" /> Refine
          </button>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-soft text-brand text-sm font-medium">
            <Sparkles className="size-4" /> Confidence {result.confidence}%
          </span>
          {session.onboarding.geographicIntent && session.onboarding.geographicIntent !== "undecided" && (
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-calm-soft text-calm text-sm font-medium">
              <Globe2 className="size-4" /> {GEO_INTENT_LABEL[session.onboarding.geographicIntent]}
            </span>
          )}
        </div>
      </motion.section>

      {/* Refine panel */}
      {showRefine && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-6xl mx-auto px-6 sm:px-10 mb-10"
        >
          <div className="rounded-3xl border border-brand/30 bg-brand-soft/30 p-8">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-serif text-xl flex items-center gap-2"><SlidersHorizontal className="size-5 text-brand" /> Refine your priorities</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Nudge these dimensions to stress-test the model. The matches re-score live — useful for "what if I weight family less / income more".
                </p>
              </div>
              {Object.keys(tweaks).length > 0 && (
                <button onClick={() => setTweaks({})} className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:bg-muted shrink-0">Reset</button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-5">
              {REFINEABLE.map(({ trait, label }) => {
                const v = tweaks[trait] ?? result.traits[trait] ?? 0.5;
                return (
                  <div key={trait}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-foreground/80">{label}</span>
                      <span className="tabular-nums text-xs text-muted-foreground">{Math.round(v * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0} max={100}
                      value={Math.round(v * 100)}
                      onChange={(e) => setTweaks((t) => ({ ...t, [trait]: Number(e.target.value) / 100 }))}
                      className="w-full accent-brand"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      {/* Top match hero */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-7 rounded-3xl bg-brand text-brand-foreground p-10 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_120%,white,transparent_60%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-6 mb-10">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-70 mb-2">Top match</div>
                  <h2 className="text-4xl lg:text-5xl font-serif">{top.specialty.name}</h2>
                  <p className="text-sm opacity-70 mt-2 max-w-md">{top.specialty.blurb}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-6xl font-serif leading-none">{top.compatibility}<span className="text-2xl">%</span></div>
                  <div className="text-[10px] uppercase tracking-[0.22em] opacity-70 mt-1">Match</div>
                </div>
              </div>
              <p className="text-base lg:text-lg leading-relaxed opacity-90 max-w-xl">
                {top.reasonsFor[0] ?? "Strong alignment with this field's cognitive and emotional demands."}
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-3 mt-8">
              <Stat label="Lifestyle" value={top.lifestyleFit} />
              <Stat label="Meaning" value={top.meaningFit} />
              <Stat label="Cognitive fit" value={top.cognitiveFit} />
              <Stat label="Burnout risk" value={top.burnoutWarning} inverse />
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-8 min-h-[420px] flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Six-axis alignment</div>
            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="oklch(0.92 0.008 265)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.45 0.02 265)", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="value" stroke="oklch(0.48 0.16 274)" fill="oklch(0.48 0.16 274)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Tensions + Regret Risk */}
      {(result.tensions.length > 0 || result.regretRisk.score > 25) && (
        <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10 grid lg:grid-cols-2 gap-6">
          {result.tensions.length > 0 && (
            <div className="rounded-3xl border border-orange-200/40 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/15 p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="size-5 text-warning" />
                <h3 className="font-serif text-xl">Tensions in your profile</h3>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed text-foreground/80">
                {result.tensions.map((t) => (
                  <li key={t} className="flex gap-3"><span className="text-warning mt-1">—</span><span>{t}</span></li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Compass className="size-5 text-brand" />
                <h3 className="font-serif text-xl">Regret risk</h3>
              </div>
              <span className={`text-3xl font-serif ${result.regretRisk.score > 60 ? "text-warning" : result.regretRisk.score > 35 ? "text-foreground" : "text-calm"}`}>
                {result.regretRisk.score}%
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 mb-4">{result.regretRisk.verdict}</p>
            {result.regretRisk.signals.length > 0 && (
              <ul className="space-y-2 text-xs text-muted-foreground">
                {result.regretRisk.signals.map((s) => (
                  <li key={s.flag} className="flex gap-2"><span>•</span><span>{s.note}</span></li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Meaning breakdown */}
      {result.meaningBreakdown.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
          <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="size-5 text-brand" />
              <h3 className="font-serif text-xl">Your meaning source</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Where you derive meaning quietly shapes which specialty you'll still love at 50.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.meaningBreakdown.map((m, i) => (
                <div key={m.source} className="flex items-center gap-3 rounded-2xl bg-brand-soft/40 px-4 py-3">
                  <span className="text-2xl font-serif text-brand w-7">{i + 1}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{MEANING_LABEL[m.source as MeaningSource]}</div>
                    <div className="h-1 mt-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${m.weight}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Thrives / struggles */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10 grid md:grid-cols-2 gap-6">
        <Panel tone="positive" title="You thrive in…" items={top.specialty.thrives} />
        <Panel tone="warn" title="You may struggle with…" items={top.specialty.struggles} />
      </section>

      {/* Career paths for top match */}
      {top.specialty.careerPaths.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
          <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <Compass className="size-5 text-brand" />
              <h3 className="font-serif text-xl">Possible career paths within {top.specialty.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Your specialty is only half the answer. Here are realistic trajectories given your archetype choices.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {top.specialty.careerPaths.map((p) => {
                const matchesArch = (session.onboarding!.careerArchetypes ?? []).some((a) => p.archetypes.includes(a));
                return (
                  <div key={p.label} className={`rounded-2xl border p-5 ${matchesArch ? "border-brand bg-brand-soft/30" : "border-border bg-background"}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-medium">{p.label}</h4>
                      {matchesArch && <span className="text-[10px] uppercase tracking-wider text-brand font-semibold shrink-0">Matches you</span>}
                    </div>
                    {p.note && <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{p.note}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.archetypes.slice(0, 3).map((a) => (
                        <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {CAREER_ARCHETYPE_LABEL[a as CareerArchetype]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Opportunity outlook */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
        <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Globe2 className="size-5 text-brand" />
            <h3 className="font-serif text-xl">Opportunity outlook</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Specialty economics differ wildly by region. These are realistic indicators, not promises.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <OutlookBar label="Egypt private" value={top.specialty.egyptPrivatePotential * 10} />
            <OutlookBar label="GCC demand" value={top.specialty.gccDemand * 10} />
            <OutlookBar label="UK pathway" value={top.specialty.ukMigrationFriendliness * 10} />
            <OutlookBar label="Remote potential" value={top.specialty.remoteWorkPotential * 10} />
            <OutlookBar label="AI disruption" value={top.specialty.aiDisruptionRisk * 10} tone="warn" />
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
        <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="size-5 text-brand" />
            <h3 className="font-serif text-xl">How this specialty feels over time</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Many specialties look excellent at year 5 and brutal at 45. Others are the opposite. Plan for both.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={top.specialty.lifecycle}>
                <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="oklch(0.55 0.02 265)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="oklch(0.55 0.02 265)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => `${v}%`}
                  labelFormatter={(y) => `Year ${y}`}
                />
                <Line type="monotone" dataKey="lifestyle" stroke="oklch(0.62 0.09 195)" strokeWidth={2.5} dot={{ r: 4 }} name="Lifestyle" />
                <Line type="monotone" dataKey="fulfillment" stroke="oklch(0.48 0.16 274)" strokeWidth={2.5} dot={{ r: 4 }} name="Fulfillment" />
                <Line type="monotone" dataKey="financial" stroke="oklch(0.72 0.15 55)" strokeWidth={2.5} dot={{ r: 4 }} name="Financial" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            <Legend color="oklch(0.62 0.09 195)" label="Lifestyle" />
            <Legend color="oklch(0.48 0.16 274)" label="Fulfillment" />
            <Legend color="oklch(0.72 0.15 55)" label="Financial" />
          </div>
        </div>
      </section>

      {/* Day in life / trade-offs / realities */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
        <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-brand mb-2">A day in the life</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{top.specialty.dayInLife}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-brand mb-2">Hidden trade-offs</div>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                {top.specialty.downsides.map((d) => <li key={d}>— {d}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-brand mb-2">Realities</div>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>Training: {top.specialty.trainingYears}</li>
                <li>Income band: {"$".repeat(top.specialty.incomeBand)}</li>
                <li>Call burden: {bar(top.specialty.callBurden)}</li>
                <li>Family-friendly: {bar(top.specialty.familyFriendly)}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Runner-ups */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-16">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-2xl lg:text-3xl font-serif">Your other strong matches</h3>
          <span className="text-xs text-muted-foreground">Top 5 of {ENRICHED_SPECIALTIES.length} specialties</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {result.matches.slice(1).map((m) => <MatchCard key={m.specialty.id} match={m} />)}
        </div>
      </section>

      {/* Avoid */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-16">
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="size-5 text-destructive" />
            <h3 className="text-xl font-serif">Specialties to think twice about</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mb-6">
            Based on your profile, these fields show meaningful friction with your cognitive style, emotional resilience, or lifestyle priorities.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {result.avoid.map((m) => (
              <div key={m.specialty.id} className="rounded-2xl bg-card border border-border p-5">
                <div className="text-xs text-muted-foreground mb-1">{m.compatibility}% match</div>
                <h4 className="font-serif text-lg">{m.specialty.name}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {m.reasonsAgainst[0] ?? "Significant trait mismatch."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term predictions */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-16 grid md:grid-cols-3 gap-6">
        <PredictionCard title="Burnout risk" value={`${top.burnoutWarning}%`} body="Likelihood of emotional exhaustion in this field over 10 years, given your resilience profile." warn={top.burnoutWarning > 60} />
        <PredictionCard title="Decision confidence" value={`${result.confidence}%`} body="How consistent your answers were across categories. Higher = clearer fit." />
        <PredictionCard title="Long-term fulfillment" value={top.compatibility > 80 ? "High" : top.compatibility > 65 ? "Moderate" : "Mixed"} body="Projected match between this specialty's daily realities and the life you said you want." />
      </section>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 mt-16 flex flex-wrap justify-center gap-3">
        <button onClick={startOver} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-brand-foreground font-medium hover:opacity-90 transition-opacity">
          Retake the assessment <ArrowRight className="size-4" />
        </button>
        <Link to="/saved" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border hover:bg-muted font-medium transition-colors">
          <Bookmark className="size-4" /> Saved runs
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border hover:bg-muted font-medium transition-colors">
          Back to home
        </Link>
      </div>

      {/* Save dialog */}
      {showSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setShowSave(false)}>
          <div className="bg-card rounded-3xl border border-border p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl mb-1">Save this run</h3>
            <p className="text-sm text-muted-foreground mb-5">Give it a name so you can find it later or compare it against future runs.</p>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={`e.g. "Before PGY-1 — ${new Date().toLocaleDateString()}"`}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              onKeyDown={(e) => e.key === "Enter" && doSave()}
            />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowSave(false)} className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={doSave} className="px-5 py-2 rounded-full bg-brand text-brand-foreground text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-5 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-lg">
          <Link2 className="size-4" /> {toast}
        </div>
      )}

      <SiteFooter />
    </div>
  );
}


function Stat({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  const tone = inverse
    ? value > 70 ? "bg-warning" : value > 45 ? "bg-warning/70" : "bg-white/60"
    : "bg-white/80";
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-2">{label}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-serif">{value}<span className="text-sm opacity-70">%</span></span>
      </div>
      <div className="h-1 rounded-full bg-white/15 overflow-hidden">
        <div className={`h-full ${tone} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Panel({ tone, title, items }: { tone: "positive" | "warn"; title: string; items: string[] }) {
  const cls = tone === "positive" ? "bg-calm-soft/60 border-calm/20" : "bg-orange-50/60 dark:bg-orange-950/20 border-orange-200/40 dark:border-orange-900/20";
  const iconCls = tone === "positive" ? "text-calm" : "text-warning";
  const Icon = tone === "positive" ? Check : X;
  return (
    <div className={`rounded-3xl border p-8 ${cls}`}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">{title}</div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-sm leading-relaxed">
            <Icon className={`size-4 mt-0.5 shrink-0 ${iconCls}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchCard({ match }: { match: SpecialtyMatch }) {
  const m = match;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-brand font-semibold tracking-[0.18em] uppercase">{m.compatibility}% match</div>
          <h4 className="text-xl font-serif mt-1">{m.specialty.name}</h4>
        </div>
        <div className="text-xs text-muted-foreground text-right">{m.specialty.trainingYears}</div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.specialty.blurb}</p>
      <div className="space-y-2">
        <Bar label="Lifestyle" value={m.lifestyleFit} />
        <Bar label="Meaning" value={m.meaningFit} />
        <Bar label="Opportunity" value={m.opportunityFit} />
        <Bar label="Burnout risk" value={m.burnoutWarning} tone="warn" />
      </div>
    </div>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${tone === "warn" ? "bg-warning" : "bg-brand"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function OutlookBar({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-serif">{Math.round(value / 10)}</span>
        <span className="text-xs text-muted-foreground">/ 10</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${tone === "warn" ? "bg-warning" : "bg-brand"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function PredictionCard({ title, value, body, warn }: { title: string; value: string; body: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{title}</div>
      <div className={`text-3xl font-serif mb-3 ${warn ? "text-warning" : ""}`}>{value}</div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function bar(n: number) {
  return "▮".repeat(n) + "▯".repeat(5 - n);
}

function synthesizeNarrative(traits: Record<string, number | undefined>): string {
  const parts: string[] = [];
  if ((traits.empathy ?? 0.5) > 0.7) parts.push("a deeply empathic mind");
  if ((traits.analytical ?? 0.5) > 0.75) parts.push("a strong analytical engine");
  if ((traits.procedural ?? 0.5) > 0.75) parts.push("a craftsman's procedural drive");
  if ((traits.lifestyle_balance ?? 0.5) > 0.75) parts.push("a clear commitment to balance");
  if ((traits.identity_career ?? 0.5) > 0.8) parts.push("a career that is part of your identity");
  if ((traits.stamina ?? 0.5) > 0.75) parts.push("high stamina for intensity");
  if ((traits.uncertainty_tolerance ?? 0.5) > 0.75) parts.push("comfort with ambiguity");
  if ((traits.death_comfort ?? 0.5) < 0.35) parts.push("low tolerance for proximity to mortality");
  const lead = parts.length
    ? `Your profile shows ${parts.slice(0, 3).join(", ")}.`
    : "Your profile shows a balanced cognitive and emotional baseline across categories.";
  return `${lead} Below is what that means for the medical life you can sustainably build.`;
}
