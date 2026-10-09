import { useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import type { Specialty } from "@/lib/types";
import { licensingTracks } from "@/lib/licensing";

const KEY = "vocare_license_progress_v1";

export function LicensingTracker({ specialty }: { specialty: Specialty }) {
  const tracks = licensingTracks(specialty);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(tracks[1].region);

  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) ?? "{}")); } catch { /* ignore */ }
  }, []);

  function toggle(k: string) {
    const next = { ...done, [k]: !done[k] };
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  const track = tracks.find((t) => t.region === open)!;
  const key = (exam: string) => `${specialty.id}:${open}:${exam}`;
  const count = track.steps.filter((s) => done[key(s.exam)]).length;

  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 mt-10">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="hud-tag text-monitor">Licensing tracker</div>
        <h2 className="font-serif text-2xl sm:text-3xl mt-2">Your exam roadmap for {specialty.name}</h2>
        <div className="mt-5 flex flex-wrap gap-2" role="tablist">
          {tracks.map((t) => (
            <button
              key={t.region}
              role="tab"
              aria-selected={open === t.region}
              onClick={() => setOpen(t.region)}
              className={`min-h-11 px-4 rounded-full border text-sm transition-colors ${open === t.region ? "border-monitor bg-monitor/10 text-monitor" : "border-border hover:bg-muted"}`}
            >
              {t.region}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <a href={track.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline text-muted-foreground">
            {track.body} <ExternalLink className="size-3.5" />
          </a>
          <span className="font-mono tabular text-xs text-muted-foreground">{count}/{track.steps.length} done</span>
        </div>
        <ol className="mt-4 space-y-2">
          {track.steps.map((s, i) => {
            const k = key(s.exam);
            return (
              <li key={k}>
                <button onClick={() => toggle(k)} aria-pressed={!!done[k]} className="w-full text-left flex gap-3 rounded-xl border border-border bg-background/70 p-4 hover:bg-muted/50 transition-colors">
                  <span className={`size-6 shrink-0 rounded-full border grid place-items-center text-xs font-mono ${done[k] ? "bg-vitals text-background border-vitals" : "border-border"}`}>
                    {done[k] ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span>
                    <span className={`block text-sm font-medium ${done[k] ? "line-through text-muted-foreground" : ""}`}>{s.exam}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{s.note}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted-foreground mt-4">Tap a step to mark it done; progress stays on this device. Requirements change, so confirm with the official body before booking.</p>
      </div>
    </section>
  );
}
