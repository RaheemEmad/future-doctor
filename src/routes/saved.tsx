import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Compass, GitCompare, Trash2 } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { deleteSaved, listSaved, type SavedRun } from "@/lib/saved";
import { loadSession, saveSession } from "@/lib/session";
import { score, aggregateTraits } from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved runs — Aequitas" },
      { name: "description", content: "Review, reload, and compare your saved assessments." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => { setRuns(listSaved()); }, []);

  function toggle(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? s : [...s, id]);
  }

  function reload(run: SavedRun) {
    const answers = run.answers;
    const choices = Object.entries(answers).map(([qid, idx]) => {
      const q = QUESTIONS.find((x) => x.id === qid);
      return q?.choices[idx];
    }).filter(Boolean) as any[];
    const traits = aggregateTraits(choices);
    const result = score(traits, run.onboarding, choices);
    const current = loadSession();
    saveSession({ ...current, onboarding: run.onboarding, answers, result });
    navigate({ to: "/results" });
  }

  function remove(id: string) {
    deleteSaved(id);
    setRuns(listSaved());
    setSelected((s) => s.filter((x) => x !== id));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 sm:px-10 pt-10 lg:pt-14"
      >
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">Your library</span>
        <h1 className="text-4xl lg:text-5xl font-serif mt-4 leading-tight max-w-3xl text-balance">
          Saved runs &amp; comparisons.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Save assessments to revisit, refine, and compare side-by-side as your priorities evolve.
        </p>
      </motion.section>

      {runs.length === 0 ? (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-10 mb-20">
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <Bookmark className="size-7 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-5">No saved runs yet. Complete an assessment and save the result.</p>
            <Link to="/onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-brand-foreground text-sm font-medium">
              Begin Assessment
            </Link>
          </div>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-8 mb-16">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{runs.length} saved · pick up to 3 to compare</p>
            <button
              disabled={selected.length < 2}
              onClick={() => navigate({ to: "/compare", search: { ids: selected.join(",") } as any })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-brand-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <GitCompare className="size-4" /> Compare {selected.length || ""}
            </button>
          </div>

          <ul className="space-y-3">
            {runs.map((r) => {
              const checked = selected.includes(r.id);
              return (
                <li key={r.id} className={`rounded-2xl border p-5 flex items-center gap-4 transition ${checked ? "border-brand bg-brand-soft/30" : "border-border bg-card"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(r.id)} className="size-4 accent-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-serif text-lg truncate">{r.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(r.savedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      Top: <span className="text-foreground font-medium">{r.topMatchName}</span> · {r.topMatchScore}% · confidence {r.confidence}% · regret risk {r.regretRisk}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => reload(r)} className="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:bg-muted transition">
                      Open
                    </button>
                    <button onClick={() => remove(r.id)} className="text-xs p-1.5 rounded-full text-muted-foreground hover:text-warning transition" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 rounded-2xl bg-brand-soft/40 p-6 flex items-center gap-4">
            <Compass className="size-5 text-brand shrink-0" />
            <p className="text-sm text-foreground/80">
              Tip: re-take after big life changes (marriage, child, exam result, off-service rotation). Your meaning sources and lifestyle weights shift faster than you think.
            </p>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
