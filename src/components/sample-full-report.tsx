import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { score } from "@/lib/scoring";
import { ENRICHED_SPECIALTIES } from "@/lib/enrichment";
import { CAREER_ARCHETYPE_LABEL, GEO_INTENT_LABEL, MEANING_LABEL } from "@/lib/types";
import type { AssessmentResult, Choice, OnboardingData, SpecialtyMatch, Trait, TraitScores } from "@/lib/types";

const PRIORITIES: { trait: Trait; label: string }[] = [
  { trait: "lifestyle_balance", label: "Lifestyle balance need" },
  { trait: "family_priority", label: "Family priority" },
  { trait: "income_priority", label: "Income priority" },
  { trait: "stamina", label: "Stamina / schedule tolerance" },
  { trait: "death_comfort", label: "Comfort with mortality" },
  { trait: "ambition", label: "Ambition" },
  { trait: "identity_career", label: "Career as identity" },
  { trait: "procedural", label: "Procedural drive" },
];

function Section({ id, label, title, children }: { id: string; label: string; title: string; children: ReactNode }) {
  return <section id={id} className="border-t border-border pt-8 sm:pt-10 mt-10 sm:mt-14">
    <p className="font-mono text-xs text-monitor mb-2">{label}</p>
    <h2 className="font-serif text-2xl sm:text-3xl leading-tight mb-6">{title}</h2>
    {children}
  </section>;
}

function Metric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return <div className="min-w-0">
    <div className="flex justify-between gap-3 text-sm mb-2"><span className="text-muted-foreground">{label}</span><span className="font-mono shrink-0">{value}%</span></div>
    <svg viewBox="0 0 100 3" preserveAspectRatio="none" className="h-1.5 w-full rounded-sm" aria-hidden="true">
      <rect width="100" height="3" className="fill-muted" />
      <rect width={Math.max(0, Math.min(100, value))} height="3" className={warning ? "fill-warning" : "fill-brand"} />
    </svg>
  </div>;
}

function ItemList({ items }: { items: string[] }) {
  return <ul className="space-y-3 text-sm leading-relaxed list-disc pl-5 marker:text-monitor">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function Breakdown({ match }: { match: SpecialtyMatch }) {
  return <div className="space-y-5">
    {match.breakdown.map((channel) => <div key={channel.channel} className="border-b border-border pb-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-2">
        <h4 className="font-medium">{channel.label}</h4>
        <span className="text-xs text-muted-foreground">Weight {channel.weight}% · Fit {channel.fit}%</span>
        <span className="font-mono text-sm text-brand sm:ml-auto">+{channel.contribution.toFixed(1)} pts</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">{channel.explanation}</p>
    </div>)}
    {match.penalties.length > 0 && <div>
      <h4 className="font-medium mb-3">Penalties applied</h4>
      {match.penalties.map((penalty) => <p key={penalty.label} className="text-sm mb-3"><span className="text-warning font-mono">−{penalty.points} pts</span> <strong>{penalty.label}.</strong> {penalty.reason}</p>)}
    </div>}
    <p className="text-sm text-muted-foreground">Base composite {match.baseScore}%. Total penalties {match.penalties.reduce((sum, penalty) => sum + penalty.points, 0)} points. Final compatibility {match.compatibility}% after the model's adjustments and rounding.</p>
  </div>;
}

export function SampleFullReport({ original, onboarding, choices, responses }: {
  original: AssessmentResult; onboarding: OnboardingData; choices: Choice[];
  responses: { id: string; prompt: string; answer: string }[];
}) {
  const [tweaks, setTweaks] = useState<TraitScores>({});
  const [refining, setRefining] = useState(false);
  const result = useMemo(() => Object.keys(tweaks).length ? score({ ...original.traits, ...tweaks }, onboarding, choices) : original, [original, onboarding, choices, tweaks]);
  const top = result.matches[0];
  if (!top) return null;
  const specialty = top.specialty;
  const runner = result.matches[1];
  const radar = [
    { axis: "Cognitive", value: top.cognitiveFit }, { axis: "Emotional", value: top.emotionalFit },
    { axis: "Lifestyle", value: top.lifestyleFit }, { axis: "Meaning", value: top.meaningFit },
    { axis: "Opportunity", value: top.opportunityFit }, { axis: "Burnout resilience", value: 100 - top.burnoutWarning },
  ];
  const outlook: [string, number][] = [["Egypt private", specialty.egyptPrivatePotential], ["GCC demand", specialty.gccDemand], ["UK pathway", specialty.ukMigrationFriendliness], ["Remote potential", specialty.remoteWorkPotential], ["AI disruption", specialty.aiDisruptionRisk]];

  return <>
    <nav aria-label="Sample report sections" className="flex flex-wrap gap-x-5 gap-y-2 py-5 border-y border-border mt-8 text-sm">
      {[["profile", "Profile"], ["alignment", "Top match"], ["reasoning", "Score reasoning"], ["risks", "Risks & meaning"], ["paths", "Career paths"], ["outlook", "Opportunity"], ["timeline", "Timeline"], ["matches", "Other matches"], ["refine", "Refine"]].map(([id, label]) => <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center text-brand underline-offset-4 hover:underline">{label}</a>)}
    </nav>

    <Section id="profile" label="01 · PHYSICIAN IDENTITY" title="Meet Layla, our illustrative intern">
      <p className="text-muted-foreground max-w-3xl leading-relaxed mb-6">Layla is a fictional PGY-1 in Cairo. She values family time and ongoing patient relationships, prefers predictable outpatient work, and is open to practising in the Gulf. This report is calculated from the example answers below using the same scoring model as the assessment. It is not a real student's story or a testimonial.</p>
      <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        {[["Stage", onboarding.stage], ["Current country", onboarding.country], ["Geographic intent", onboarding.geographicIntent ? GEO_INTENT_LABEL[onboarding.geographicIntent] : "Undecided"], ["Work life balance", `${onboarding.workLifeBalance}/5`], ["Willingness to sacrifice", `${onboarding.willingnessToSacrifice}/5`], ["Financial priority", `${onboarding.financialPriority}/5`]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground mb-1">{label}</dt><dd className="font-medium">{value}</dd></div>)}
      </dl>
      <p className="text-sm mt-6"><span className="text-muted-foreground">Career identities: </span>{onboarding.careerArchetypes.map((archetype) => CAREER_ARCHETYPE_LABEL[archetype]).join(", ")}</p>
    </Section>

    <Section id="alignment" label="02 · COMPATIBILITY" title="The medical life with the strongest alignment">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <p className="font-mono text-xs text-monitor mb-3">{Object.keys(tweaks).length ? "REFINED EXAMPLE" : "TOP MATCH"}</p>
          <div className="flex flex-wrap items-baseline gap-4"><h3 className="font-serif text-3xl">{specialty.name}</h3><span className="font-mono text-4xl text-brand">{top.compatibility}%</span></div>
          <p className="text-muted-foreground mt-4 mb-6">{specialty.blurb}</p>
          <div className="grid sm:grid-cols-2 gap-5">{radar.map((axis) => <Metric key={axis.axis} label={axis.axis} value={axis.value} />)}</div>
          {runner && <p className="mt-6 text-sm text-muted-foreground">{specialty.name} ranks {top.compatibility - runner.compatibility} points ahead of {runner.specialty.name} ({runner.compatibility}%). A close score is a reason to explore both, not rule one out.</p>}
        </div>
        <div className="h-80 min-w-0" role="img" aria-label="Six-axis alignment radar chart; exact values are listed beside it">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar} margin={{ top: 25, right: 45, bottom: 25, left: 45 }}>
              <PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.16} strokeWidth={2} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>

    <Section id="reasoning" label="03 · SCORE REASONING" title={`Why ${top.compatibility}% for ${specialty.name}`}>
      <p className="text-muted-foreground max-w-3xl mb-6">Compatibility is a weighted model score, not a probability of success. Each channel below connects the example's preferences to the specialty's demands.</p>
      <Breakdown match={top} />
      <div className="grid md:grid-cols-2 gap-8 mt-8"><div><h3 className="font-medium mb-4">What aligns with these answers</h3><ItemList items={top.reasonsFor} /></div><div><h3 className="font-medium mb-4">Where the fit is less comfortable</h3>{top.reasonsAgainst.length ? <ItemList items={top.reasonsAgainst} /> : <p className="text-sm text-muted-foreground">No major friction was flagged by this model. That does not mean the specialty has no trade-offs.</p>}</div></div>
    </Section>

    <Section id="risks" label="04 · SUSTAINABILITY & VALUES" title="Tensions, regret signals and sources of meaning">
      <div className="grid md:grid-cols-2 gap-8">
        <div><h3 className="font-medium mb-4">Tensions in the profile</h3>{result.tensions.length ? <ItemList items={result.tensions} /> : <p className="text-sm text-muted-foreground">No major competing priorities were flagged in this example.</p>}</div>
        <div><h3 className="font-medium mb-4">Regret risk indicator <span className="font-mono text-brand">{result.regretRisk.score}%</span></h3><p className="text-sm mb-4">{result.regretRisk.verdict}</p>{result.regretRisk.signals.length > 0 && <ItemList items={result.regretRisk.signals.map((signal) => signal.note)} />}</div>
      </div>
      <h3 className="font-medium mt-8 mb-5">Sources of meaning</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{result.meaningBreakdown.map((meaning) => <Metric key={meaning.source} label={MEANING_LABEL[meaning.source]} value={meaning.weight} />)}</div>
      <p className="text-xs text-muted-foreground mt-6">Regret and burnout scores are model indicators, not validated predictions of an individual's future mental health.</p>
    </Section>

    <Section id="realities" label="05 · DAILY PRACTICE" title={`Life within ${specialty.name}`}>
      <div className="grid md:grid-cols-2 gap-8 mb-8"><div><h3 className="font-medium mb-4">You thrive in</h3><ItemList items={specialty.thrives} /></div><div><h3 className="font-medium mb-4">You may struggle with</h3><ItemList items={specialty.struggles} /></div></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div><h3 className="font-medium mb-4">A day in the life</h3><p className="text-sm text-muted-foreground leading-relaxed">{specialty.dayInLife}</p></div>
        <div><h3 className="font-medium mb-4">Hidden trade-offs</h3><ItemList items={specialty.downsides} /></div>
        <div><h3 className="font-medium mb-4">Training and work realities</h3><dl className="space-y-3 text-sm">{[["Training", specialty.trainingYears], ["Income band", `${specialty.incomeBand}/5`], ["Call burden", `${specialty.callBurden}/5`], ["Family friendly", `${specialty.familyFriendly}/5`]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}</dl></div>
      </div>
    </Section>

    <Section id="paths" label="06 · CAREER TRAJECTORIES" title="Possible paths within the specialty">
      <div className="grid md:grid-cols-2 gap-4">{specialty.careerPaths.map((path) => {
        const aligned = onboarding.careerArchetypes.some((archetype) => path.archetypes.includes(archetype));
        return <article key={path.label} className={`border rounded-lg p-5 ${aligned ? "border-brand/40 bg-brand-soft/30" : "border-border bg-card"}`}>
          <h3 className="font-medium mb-2">{path.label}</h3>{aligned && <p className="font-mono text-xs text-brand mb-3">ALIGNS WITH CHOSEN IDENTITIES</p>}
          {path.note && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{path.note}</p>}
          <p className="text-xs text-muted-foreground">{path.archetypes.map((archetype) => CAREER_ARCHETYPE_LABEL[archetype]).join(" · ")}</p>
        </article>;
      })}</div>
    </Section>

    <Section id="outlook" label="07 · REGIONAL OPPORTUNITY" title="Egypt, migration and the future of work">
      <p className="text-muted-foreground mb-6 max-w-3xl">These relative indicators describe the specialty, not guaranteed income, job offers or eligibility to migrate. Higher means more potential, except AI disruption where higher means more exposure to change.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">{outlook.map(([label, value]) => <div key={label}><p className="text-sm text-muted-foreground mb-2">{label}</p><p className="font-mono text-2xl">{value}<span className="text-sm text-muted-foreground"> /10</span></p></div>)}</div>
    </Section>

    <Section id="timeline" label="08 · LONG TERM LIFE FIT" title="How this specialty feels over time">
      <p className="text-muted-foreground mb-6 max-w-3xl">An illustrative specialty-level trajectory across years of practice. These curves are model assumptions, not a forecast of Layla's earnings or wellbeing.</p>
      <div className="h-72 sm:h-80 min-w-0" role="img" aria-label="Career timeline chart with lifestyle, fulfillment and financial indicators">
        <ResponsiveContainer width="100%" height="100%"><LineChart data={specialty.lifecycle} margin={{ left: -20, right: 15, top: 10, bottom: 10 }}>
          <XAxis dataKey="year" tickFormatter={(year) => `Yr ${year}`} stroke="var(--muted-foreground)" fontSize={12} /><YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip contentStyle={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }} labelFormatter={(year) => `Year ${year}`} />
          <Line dataKey="lifestyle" name="Lifestyle" stroke="var(--calm)" strokeWidth={2} isAnimationActive={false} />
          <Line dataKey="fulfillment" name="Fulfillment" stroke="var(--brand)" strokeWidth={2} isAnimationActive={false} />
          <Line dataKey="financial" name="Financial" stroke="var(--warning)" strokeWidth={2} isAnimationActive={false} />
        </LineChart></ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-5 text-sm mt-4"><span className="text-calm">● Lifestyle</span><span className="text-brand">● Fulfillment</span><span className="text-foreground">● Financial</span></div>
      <div className="overflow-x-auto mt-6"><table className="w-full text-sm text-left"><caption className="sr-only">Exact career timeline indicators out of 100</caption><thead><tr className="border-b border-border">{["Year", "Lifestyle", "Fulfillment", "Financial"].map((label) => <th key={label} className="py-3 pr-3 font-medium">{label}</th>)}</tr></thead><tbody>{specialty.lifecycle.map((point) => <tr key={point.year} className="border-b border-border"><th className="py-3 font-medium">{point.year}</th><td>{point.lifestyle}</td><td>{point.fulfillment}</td><td>{point.financial}</td></tr>)}</tbody></table></div>
    </Section>

    <Section id="matches" label="09 · ALTERNATIVE SPECIALTIES" title="Other strong matches">
      <p className="text-sm text-muted-foreground mb-6">Top {result.matches.length} of {ENRICHED_SPECIALTIES.length} specialties, including the leading match above.</p>
      <div className="grid md:grid-cols-2 gap-4">{result.matches.slice(1).map((match) => <article key={match.specialty.id} className="rounded-lg border border-border bg-card p-5 sm:p-6 min-w-0">
        <p className="font-mono text-sm text-brand mb-2">{match.compatibility}% compatibility</p><h3 className="font-serif text-xl mb-3">{match.specialty.name}</h3>
        <p className="text-sm text-muted-foreground mb-5">{match.specialty.blurb}</p><p className="text-xs text-muted-foreground mb-4">Training: {match.specialty.trainingYears}</p>
        <div className="space-y-4"><Metric label="Lifestyle" value={match.lifestyleFit} /><Metric label="Meaning" value={match.meaningFit} /><Metric label="Opportunity" value={match.opportunityFit} /><Metric label="Burnout risk indicator" value={match.burnoutWarning} warning /></div>
        <details className="mt-5 border-t border-border pt-3"><summary className="cursor-pointer text-brand text-sm min-h-11 py-3">Why {match.compatibility}%?</summary><div className="pt-4"><Breakdown match={match} /><h4 className="font-medium mt-5 mb-3">Reasons for this match</h4><ItemList items={match.reasonsFor} />{match.reasonsAgainst.length > 0 && <><h4 className="font-medium mt-5 mb-3">Friction to explore</h4><ItemList items={match.reasonsAgainst} /></>}</div></details>
      </article>)}</div>
      <h3 className="font-serif text-2xl mt-10 mb-6">Specialties to think twice about</h3>
      <div className="grid md:grid-cols-3 gap-5">{result.avoid.map((match) => <article key={match.specialty.id} className="border-l-2 border-destructive/40 pl-5"><p className="font-mono text-sm text-muted-foreground">{match.compatibility}% compatibility</p><h4 className="font-medium mt-2 mb-3">{match.specialty.name}</h4><ItemList items={match.reasonsAgainst.length ? match.reasonsAgainst : ["Lower alignment with the example profile."]} /></article>)}</div>
    </Section>

    <Section id="predictions" label="10 · DECISION INDICATORS" title="A sustainability snapshot">
      <div className="grid sm:grid-cols-3 gap-8">{[["Burnout risk indicator", `${top.burnoutWarning}%`, "Relative strain between this profile and the specialty's demands."], ["Decision confidence", `${result.confidence}%`, "A model indicator based on how separated the top compatibility scores are, not a certainty rating."], ["Long term fulfillment", top.compatibility > 80 ? "High" : top.compatibility > 65 ? "Moderate" : "Mixed", "The model's overall alignment with the stated life priorities."]].map(([label, value, description]) => <div key={label}><h3 className="text-sm text-muted-foreground mb-3">{label}</h3><p className="font-mono text-3xl mb-3">{value}</p><p className="text-sm text-muted-foreground">{description}</p></div>)}</div>
    </Section>

    <Section id="refine" label="11 · PRIORITY REFINEMENT" title="Explore a different balance of priorities">
      <div className="flex flex-wrap gap-3 mb-5"><Button variant="outline" className="min-h-11" onClick={() => setRefining((open) => !open)}><SlidersHorizontal />{refining ? "Close refinement" : "Refine example priorities"}</Button>{Object.keys(tweaks).length > 0 && <Button variant="ghost" className="min-h-11" onClick={() => setTweaks({})}><RotateCcw />Reset example</Button>}</div>
      {refining && <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">{PRIORITIES.map(({ trait, label }) => <div key={trait}><div className="flex justify-between text-sm mb-2"><span>{label}</span><span className="font-mono">{Math.round((result.traits[trait] ?? 0.5) * 100)}%</span></div><Slider aria-label={label} min={0} max={100} step={1} value={[Math.round((result.traits[trait] ?? 0.5) * 100)]} onValueChange={([value]) => { if (value !== undefined) setTweaks((current) => ({ ...current, [trait]: value / 100 })); }} className="min-h-11" /></div>)}</div>}
    </Section>

    <Section id="answers" label="12 · EXAMPLE INPUTS" title="The answers behind this report">
      <details><summary className="cursor-pointer text-brand min-h-11 py-3">View all {responses.length} example answers</summary><ol className="divide-y divide-border mt-4">{responses.map((response, index) => <li key={response.id} className="py-5"><p className="font-medium text-sm">{index + 1}. {response.prompt}</p><p className="text-sm text-muted-foreground mt-2">{response.answer}</p></li>)}</ol></details>
      <div className="mt-8 py-6 border-y border-border"><p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">Vocare offers an initial perspective, not a decision you should depend on alone. Explore rotations, speak with practising doctors and a career adviser, and verify current training and migration requirements.</p><div className="flex flex-wrap gap-3 mt-4"><Button asChild variant="link" className="min-h-11 px-0"><Link to="/methodology">Methodology <ArrowRight /></Link></Button><Button asChild variant="link" className="min-h-11"><Link to="/sources">Credibility & sources <ArrowRight /></Link></Button></div></div>
    </Section>
  </>;
}