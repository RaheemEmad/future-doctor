import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Share2, AlertTriangle, Sparkles, Check, X } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { loadSession, resetSession } from "@/lib/session";
import type { SpecialtyMatch } from "@/lib/types";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your results — Aequitas" },
      { name: "description", content: "Your personalized medical specialty compatibility profile." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    if (!session.result) {
      navigate({ to: "/" });
    }
  }, [session.result, navigate]);

  if (!session.result) return null;

  const { result } = session;
  const top = result.matches[0];

  const radarData = useMemo(
    () => [
      { axis: "Cognitive", value: top.cognitiveFit },
      { axis: "Emotional", value: top.emotionalFit },
      { axis: "Lifestyle", value: top.lifestyleFit },
      { axis: "Burnout resilience", value: 100 - top.burnoutWarning },
      { axis: "Overall fit", value: top.compatibility },
    ],
    [top],
  );

  const profileSummary = useMemo(() => synthesizeNarrative(result.traits), [result.traits]);

  function startOver() {
    resetSession();
    setSession({ answers: {} });
    navigate({ to: "/" });
  }

  function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "My Aequitas result",
        text: `My top specialty match is ${top.specialty.name} (${top.compatibility}%)`,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.href : "");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Cinematic header */}
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
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-soft text-brand text-sm font-medium">
            <Sparkles className="size-4" /> Confidence {result.confidence}%
          </span>
        </div>
      </motion.section>

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
              <Stat label="Emotional fit" value={top.emotionalFit} />
              <Stat label="Cognitive fit" value={top.cognitiveFit} />
              <Stat label="Burnout risk" value={top.burnoutWarning} inverse />
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-8 min-h-[420px] flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Trait alignment</div>
            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="oklch(0.92 0.008 265)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.45 0.02 265)", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="You"
                    dataKey="value"
                    stroke="oklch(0.48 0.16 274)"
                    fill="oklch(0.48 0.16 274)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Thrives / struggles */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10 grid md:grid-cols-2 gap-6">
        <Panel
          tone="positive"
          title="You thrive in…"
          items={top.specialty.thrives}
        />
        <Panel
          tone="warn"
          title="You may struggle with…"
          items={top.specialty.struggles}
        />
      </section>

      {/* Specialty deep dive */}
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
                {top.specialty.downsides.map((d) => (
                  <li key={d}>— {d}</li>
                ))}
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
          <span className="text-xs text-muted-foreground">Top 5 of 40 specialties</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {result.matches.slice(1).map((m) => (
            <MatchCard key={m.specialty.id} match={m} />
          ))}
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
        <PredictionCard
          title="Burnout risk"
          value={`${top.burnoutWarning}%`}
          body="Likelihood of emotional exhaustion in this field over 10 years, given your resilience profile."
          warn={top.burnoutWarning > 60}
        />
        <PredictionCard
          title="Decision confidence"
          value={`${result.confidence}%`}
          body="How consistent your answers were across categories. Higher = clearer fit."
        />
        <PredictionCard
          title="Long-term fulfillment"
          value={top.compatibility > 80 ? "High" : top.compatibility > 65 ? "Moderate" : "Mixed"}
          body="Projected match between this specialty's daily realities and the life you said you want."
        />
      </section>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 mt-16 flex flex-wrap justify-center gap-3">
        <button onClick={startOver} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-brand-foreground font-medium hover:opacity-90 transition-opacity">
          Retake the assessment <ArrowRight className="size-4" />
        </button>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border hover:bg-muted font-medium transition-colors">
          Back to home
        </Link>
      </div>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  const display = inverse ? value : value;
  const tone = inverse
    ? value > 70 ? "bg-warning" : value > 45 ? "bg-warning/70" : "bg-white/60"
    : "bg-white/80";
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-2">{label}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-serif">{display}<span className="text-sm opacity-70">%</span></span>
      </div>
      <div className="h-1 rounded-full bg-white/15 overflow-hidden">
        <div className={`h-full ${tone} rounded-full`} style={{ width: `${display}%` }} />
      </div>
    </div>
  );
}

function Panel({ tone, title, items }: { tone: "positive" | "warn"; title: string; items: string[] }) {
  const cls = tone === "positive"
    ? "bg-calm-soft/60 border-calm/20"
    : "bg-orange-50/60 dark:bg-orange-950/20 border-orange-200/40 dark:border-orange-900/20";
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
        <div className="text-xs text-muted-foreground text-right">
          {m.specialty.trainingYears}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.specialty.blurb}</p>
      <div className="space-y-2">
        <Bar label="Lifestyle" value={m.lifestyleFit} />
        <Bar label="Emotional" value={m.emotionalFit} />
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
        <div
          className={`h-full rounded-full ${tone === "warn" ? "bg-warning" : "bg-brand"}`}
          style={{ width: `${value}%` }}
        />
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
