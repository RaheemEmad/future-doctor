import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Cloud, CloudOff, Compass, Download, GitCompare, Link2, Trash2, Upload } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { deleteSaved, listSaved, type SavedRun } from "@/lib/saved";
import { loadSession, saveSession } from "@/lib/session";
import { score, aggregateTraits } from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";
import { encodeShare } from "@/lib/share";
import { useAuth } from "@/lib/auth";
import { syncSavedRuns } from "@/lib/cloud-sync";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Library — Vocare" },
      { name: "description", content: "Review, reload, and compare your saved assessments." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SavedPage,
});

const STORAGE_KEY = "aequitas:saved:v1";

function SavedPage() {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { setRuns(listSaved()); }, []);

  // Pull cloud runs whenever the user signs in (or on first mount if already signed in).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setSyncing(true);
    syncSavedRuns()
      .then((merged) => { if (!cancelled) { setRuns(merged); setToast("Synced from your account."); } })
      .catch(() => { if (!cancelled) setToast("Could not reach the cloud. Showing local runs."); })
      .finally(() => { if (!cancelled) setSyncing(false); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

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

  async function copyShareLink(run: SavedRun) {
    const token = encodeShare({ o: run.onboarding, a: run.answers, v: 2 });
    const url = `${window.location.origin}/results?s=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Share link copied — anyone with it can re-open this run.");
    } catch {
      window.prompt("Copy this share link", url);
    }
  }

  function exportAll() {
    const blob = new Blob([JSON.stringify({ v: 1, exportedAt: Date.now(), runs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocare-saved-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast("Exported. Keep this file as your backup.");
  }

  function triggerImport() { fileInputRef.current?.click(); }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming: SavedRun[] = Array.isArray(parsed) ? parsed : (parsed.runs ?? []);
      if (!Array.isArray(incoming) || incoming.length === 0) throw new Error("empty");
      // merge by id (incoming wins on conflict)
      const map = new Map<string, SavedRun>();
      for (const r of [...runs, ...incoming]) {
        if (r && typeof r.id === "string") map.set(r.id, r);
      }
      const merged = Array.from(map.values()).sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, 20)));
      setRuns(merged);
      setToast(`Imported ${incoming.length} run${incoming.length === 1 ? "" : "s"}.`);
    } catch {
      setToast("Could not read that file. Expected a Vocare export JSON.");
    } finally {
      e.target.value = "";
    }
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
          Save assessments to revisit, refine, and compare side by side as your priorities evolve.
        </p>

        <div className="mt-5 rounded-2xl border border-border bg-card/60 p-4 flex items-start gap-3 max-w-3xl">
          {user ? <Cloud className="size-4 text-brand shrink-0 mt-0.5" /> : <CloudOff className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {user ? (
              <>
                Signed in as <strong className="text-foreground">{user.email}</strong>. Your saved runs and onboarding answers sync to your account. {syncing && <em>Syncing…</em>}
              </>
            ) : (
              <>
                Saved runs live only in <strong className="text-foreground">this browser</strong>. To sync across devices, <Link to="/auth" className="underline hover:text-foreground">sign in with a magic link</Link>. You can still copy a <em>share link</em> per run, or use <em>Export</em> for a backup file. See the <Link to="/privacy" className="underline hover:text-foreground">privacy page</Link> for details.
              </>
            )}
          </p>
        </div>

      </motion.section>

      {runs.length === 0 ? (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-8 mb-20">
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <Bookmark className="size-7 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-5">No saved runs on this device yet.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-brand-foreground text-sm font-medium">
                Begin Assessment
              </Link>
              <button onClick={triggerImport} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-medium hover:bg-muted">
                <Upload className="size-4" /> Import a backup file
              </button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto px-6 sm:px-10 mt-8 mb-16">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">{runs.length} saved · pick up to 3 to compare</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={exportAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs font-medium hover:bg-muted">
                <Download className="size-3.5" /> Export all
              </button>
              <button onClick={triggerImport} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-xs font-medium hover:bg-muted">
                <Upload className="size-3.5" /> Import
              </button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
              <button
                disabled={selected.length < 2}
                onClick={() => navigate({ to: "/compare", search: { ids: selected.join(",") } as any })}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand text-brand-foreground text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <GitCompare className="size-3.5" /> Compare {selected.length || ""}
              </button>
            </div>
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
                    <button onClick={() => copyShareLink(r)} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:bg-muted transition" title="Copy share link">
                      <Link2 className="size-3.5" /> Share link
                    </button>
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-foreground text-background text-sm shadow-lg">
          {toast}
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
