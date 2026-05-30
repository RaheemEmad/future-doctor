import type { AssessmentResult, OnboardingData } from "./types";

const KEY = "aequitas:saved:v1";

export type SavedRun = {
  id: string;
  name: string;
  savedAt: number;
  onboarding: OnboardingData;
  answers: Record<string, number>;
  // Snapshot of essentials so the list view doesn't need to re-score
  topMatchId: string;
  topMatchName: string;
  topMatchScore: number;
  confidence: number;
  regretRisk: number;
};

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage; } catch { return null; }
}

export function listSaved(): SavedRun[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedRun[];
    return Array.isArray(arr) ? arr.sort((a, b) => b.savedAt - a.savedAt) : [];
  } catch { return []; }
}

export function saveRun(
  name: string,
  onboarding: OnboardingData,
  answers: Record<string, number>,
  result: AssessmentResult,
): SavedRun {
  const run: SavedRun = {
    id: `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Run ${new Date().toLocaleDateString()}`,
    savedAt: Date.now(),
    onboarding,
    answers,
    topMatchId: result.matches[0]?.specialty.id ?? "",
    topMatchName: result.matches[0]?.specialty.name ?? "—",
    topMatchScore: result.matches[0]?.compatibility ?? 0,
    confidence: result.confidence,
    regretRisk: result.regretRisk.score,
  };
  const all = listSaved();
  all.unshift(run);
  storage()?.setItem(KEY, JSON.stringify(all.slice(0, 20)));
  return run;
}

export function deleteSaved(id: string) {
  const all = listSaved().filter((r) => r.id !== id);
  storage()?.setItem(KEY, JSON.stringify(all));
}

export function getSaved(id: string): SavedRun | undefined {
  return listSaved().find((r) => r.id === id);
}
