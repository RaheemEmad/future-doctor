import { AlertTriangle, Lock } from "lucide-react";
import type { GradeStanding, Specialty } from "@/lib/types";
import { egyptReality, gradeNote, MOHP_SOURCE } from "@/lib/egypt-reality";

export function EgyptRealityCard({ specialty, grade }: { specialty: Specialty; grade?: GradeStanding | "" }) {
  const r = egyptReality(specialty);
  const gn = gradeNote(specialty, grade);
  const m = r.mohp;
  const rows: [string, string][] = [
    [
      "MOHP residency cutoff, May 2025 (نيابات الصحة)",
      m
        ? `Typical hospital needed ${m.median.toLocaleString()} total score. Easiest ${m.min.toLocaleString()}, hardest ${m.max.toLocaleString()} across ${m.sites} hospital${m.sites > 1 ? "s" : ""} (${m.ar}).`
        : "Not offered as a separate track in the May 2025 basic round.",
    ],
    ["MOHP entry rules", r.shortage ? "Official shortage specialty (تخصص ملح): open after 6 months of takleef and a minimum grade of good." : "Standard track: at least 1 year of takleef and very good overall and in the subject."],
    ["University residency (نيابة الجامعة)", r.universityEntry],
    ["Egyptian Fellowship (الزمالة)", r.fellowshipAccess],
    ["Private clinic capital, estimate (رأس مال العيادة)", `${r.capexRange} · Tier ${r.capexTier}`],
    ["What you need to buy", r.capexItems],
    ["Market", r.saturation],
    ["How patients reach you", r.patientFlow],
    ["Master or Fellowship (الماجستير أم الزمالة)", `${r.postgrad.pick}. ${r.postgrad.why}`],
    ["First private income (أول دخل من العيادة)", `${r.privateRamp.label}, ${r.privateRamp.age}. ${r.privateRamp.why}`],
    ["Migration route", r.migration],
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="hud-tag text-monitor">Egypt reality matrix</div>
        <h2 className="font-serif text-2xl sm:text-3xl mt-2">{specialty.name} in the Egyptian system</h2>
        {gn && <p className="mt-4 rounded-xl border border-monitor/40 bg-monitor/5 p-4 text-sm leading-relaxed"><span className="hud-tag text-monitor block mb-1">Your grade check</span>{gn}</p>}
        <dl className="mt-6 grid sm:grid-cols-2 gap-3">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-background/70 p-4">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="text-sm mt-1 leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Cutoffs and entry rules come from the official{" "}
          <a href={MOHP_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline">{MOHP_SOURCE.label}</a>.
          Scores are your cumulative total (المجموع التراكمي) and vary by university scale. Clinic capital, market, postgraduate track, income timing and migration rows are Vocare estimates, not official figures.
        </p>
      </div>
    </section>
  );
}

/** Free teaser: shows the conflict, locks the resolution. */
export function ConflictTeaser({
  specialty,
  tension,
  regret,
  unlocked,
}: {
  specialty: Specialty;
  tension?: string;
  regret: number;
  unlocked: boolean;
}) {
  if (unlocked) return null;
  const r = egyptReality(specialty);
  const body =
    tension ??
    (regret > 35
      ? `Your answers carry a ${regret}% regret risk for ${specialty.name}. Something you value may be squeezed in the hard years.`
      : `${specialty.name} fits your profile, but entry is "${r.universityEntry.toLowerCase()}" and clinic capital is ${r.capexRange}.`);
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
      <div className="rounded-3xl border border-warning/40 bg-warning/5 p-6 sm:p-8">
        <div className="hud-tag text-warning inline-flex items-center gap-2">
          <AlertTriangle className="size-3.5" /> Decision friction detected
        </div>
        <p className="font-serif text-xl sm:text-2xl mt-3 leading-snug">{body}</p>
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {["How to resolve this conflict", "Adjacent fields that keep what you love", "Your Egypt entry, clinic and migration plan"].map((t) => (
            <div key={t} className="flex gap-2 rounded-xl border border-border bg-background/70 p-3 text-sm">
              <Lock className="size-4 mt-0.5 text-muted-foreground shrink-0" /> {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Side by side Egypt comparison for the top matches. */
export function DifferentialGrid({ specialties }: { specialties: Specialty[] }) {
  const rs = specialties.map((s) => ({ s, r: egyptReality(s) }));
  const rows: [string, (x: (typeof rs)[number]) => string][] = [
    ["MOHP typical cutoff", ({ r }) => (r.mohp ? r.mohp.median.toLocaleString() : "Not listed")],
    ["Entry rule", ({ r }) => (r.shortage ? "Shortage: 6 months, good" : "Standard: 1 year, very good")],
    ["Clinic capital", ({ r }) => r.capexRange],
    ["First private income", ({ r }) => `${r.privateRamp.label} (${r.privateRamp.age})`],
    ["Best postgrad track", ({ r }) => r.postgrad.pick],
    ["Call burden", ({ s }) => `${s.callBurden}/5`],
    ["Gulf / UK demand", ({ s }) => `${s.gccDemand}/10 · ${s.ukMigrationFriendliness}/10`],
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm tabular">
        <thead className="bg-muted/50 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="p-3">Metric</th>{rs.map(({ s }) => <th key={s.id} className="p-3">{s.name}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(([k, f]) => (
            <tr key={k} className="border-t border-border">
              <td className="p-3 text-muted-foreground">{k}</td>
              {rs.map((x) => <td key={x.s.id} className="p-3">{f(x)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
