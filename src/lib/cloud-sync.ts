// Best-effort cloud sync for signed-in users.
// Local-first: localStorage stays the source of truth in the browser; cloud
// is the cross-device mirror. All calls are safe no-ops when signed out or
// when the network fails.

import { supabase } from "@/integrations/supabase/client";
import { listSaved, type SavedRun } from "@/lib/saved";
import type { OnboardingData } from "@/lib/types";
import { getAuthUser } from "@/lib/auth";

const SAVED_KEY = "aequitas:saved:v1";

function writeAll(runs: SavedRun[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SAVED_KEY, JSON.stringify(runs.slice(0, 50))); } catch { /* noop */ }
}

export async function pushRun(run: SavedRun) {
  const user = getAuthUser();
  if (!user) return;
  await supabase.from("saved_runs").upsert({
    user_id: user.id,
    local_id: run.id,
    name: run.name,
    saved_at: new Date(run.savedAt).toISOString(),
    payload: run as any,
  }, { onConflict: "user_id,local_id" });
}

export async function deleteRun(localId: string) {
  const user = getAuthUser();
  if (!user) return;
  await supabase.from("saved_runs").delete().eq("user_id", user.id).eq("local_id", localId);
}

export async function pullRuns(): Promise<SavedRun[]> {
  const user = getAuthUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("saved_runs")
    .select("local_id, name, saved_at, payload")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => r.payload as SavedRun).filter(Boolean);
}

/** Merge local + cloud runs (cloud wins on id collision), persist, and return the merged list. */
export async function syncSavedRuns(): Promise<SavedRun[]> {
  const user = getAuthUser();
  const local = listSaved();
  if (!user) return local;
  const remote = await pullRuns();
  const byId = new Map<string, SavedRun>();
  for (const r of local) byId.set(r.id, r);
  for (const r of remote) byId.set(r.id, r); // remote wins
  const merged = Array.from(byId.values()).sort((a, b) => b.savedAt - a.savedAt);
  writeAll(merged);
  // Push any local-only runs up
  const remoteIds = new Set(remote.map((r) => r.id));
  await Promise.all(local.filter((r) => !remoteIds.has(r.id)).map(pushRun));
  return merged;
}

export async function pushOnboarding(onboarding: OnboardingData) {
  const user = getAuthUser();
  if (!user) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    onboarding: onboarding as any,
  }, { onConflict: "id" });
}

export async function pullOnboarding(): Promise<OnboardingData | null> {
  const user = getAuthUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("onboarding").eq("id", user.id).maybeSingle();
  return (data?.onboarding as OnboardingData | null) ?? null;
}
