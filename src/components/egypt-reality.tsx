import { AlertTriangle, Lock } from "lucide-react";
import type { Specialty } from "@/lib/types";
import { egyptReality } from "@/lib/egypt-reality";

export function EgyptRealityCard({ specialty }: { specialty: Specialty }) {
  const r = egyptReality(specialty);
  const rows: [string, string][] = [
    ["University residency (نيابة الجامعة)", r.universityEntry],
    ["Egyptian Fellowship (الزمالة)", r.fellowshipAccess],
    ["Private clinic capital (رأس مال العيادة)", `${r.capexRange} · Tier ${r.capexTier}`],
    ["What you need to buy", r.capexItems],
    ["Market", r.saturation],
    ["How patients reach you", r.patientFlow],
    ["Migration route", r.migration],
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="hud-tag text-monitor">Egypt reality matrix</div>
        <h2 className="font-serif text-2xl sm:text-3xl mt-2">{specialty.name} in the Egyptian system</h2>
        <dl className="mt-6 grid sm:grid-cols-2 gap-3">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-background/70 p-4">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="text-sm mt-1 leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground mt-4">Indicative estimates to guide questions for seniors, not official figures.</p>
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
