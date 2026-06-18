import { useEffect, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; loading: boolean };

let state: AuthState = { user: null, loading: true };
const listeners = new Set<() => void>();
let initialized = false;

function emit() { for (const l of listeners) l(); }

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  // Hydrate from current session, then keep state in sync.
  supabase.auth.getSession().then(({ data }) => {
    state = { user: data.session?.user ?? null, loading: false };
    emit();
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    state = { user: session?.user ?? null, loading: false };
    emit();
  });
}

export function useAuth(): AuthState {
  useEffect(ensureInit, []);
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
    () => ({ user: null, loading: true }),
  );
}

export function getAuthUser(): User | null {
  return state.user;
}
